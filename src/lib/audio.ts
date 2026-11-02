// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Pronunciation audio.
 *
 * Order of preference:
 *  1. A clip: `entry.audio`, or the id's file in
 *     src/content/audio-manifest.json (written by `npm run audio:import`).
 *     Human recordings live in audio/wo/; AI-generated clips (Adia TTS by
 *     CONCREE, Apache-2.0) live in audio/wo-ai/, so recordings can replace them.
 *  2. The device text-to-speech engine. No mainstream engine ships a Wolof
 *     voice, so we use French, whose spelling-to-sound rules are closest to
 *     Wolof's Latin orthography. The UI labels this as a computer voice.
 *
 * On Android/iOS the native TTS plugin is used, because the Android WebView
 * does not implement the Web Speech API.
 */
import { Capacitor } from "@capacitor/core";
import audioManifest from "@/content/audio-manifest.json";
import type { Entry } from "@/content/types";

export type AudioSource = "recording" | "ai" | "tts" | "none";

/** Folder of AI-generated clips (human recordings in audio/wo/ take their place). */
export const AI_CLIP_DIR = "audio/wo-ai/";

const TTS_LANG = "fr-FR";
let currentClip: HTMLAudioElement | null = null;

const manifest = audioManifest as Record<string, string>;

/**
 * Community voices (approved native-speaker recordings, src/lib/voices.ts):
 * entry id → storage path, plus a resolver that returns a playable URL (cached
 * on the device after the first download). They take priority over clips.
 */
let communityVoices = new Map<string, string>();
let resolveVoice: ((path: string) => Promise<string | null>) | null = null;
export function setCommunityVoices(voices: Map<string, string>, resolver: (path: string) => Promise<string | null>) {
  communityVoices = voices;
  resolveVoice = resolver;
}
export function hasCommunityVoice(entryId: string): boolean {
  return communityVoices.has(entryId);
}
const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

/** Path under /public of the recorded clip for an entry, if one exists. */
export function clipFor(entry: Entry): string | undefined {
  return entry.audio ?? manifest[entry.id];
}

const clipSource = (clip: string): AudioSource => (clip.startsWith(AI_CLIP_DIR) ? "ai" : "recording");

/** True when at least one line uses an AI clip (the About section then credits the voice). */
export const hasAiClips = Object.values(manifest).some((clip) => clip.startsWith(AI_CLIP_DIR));

export function audioSourceFor(entry: Entry): AudioSource {
  if (communityVoices.has(entry.id)) return "recording";
  const clip = clipFor(entry);
  if (clip) return clipSource(clip);
  if (Capacitor.isNativePlatform()) return "tts";
  if (typeof window !== "undefined" && "speechSynthesis" in window) return "tts";
  return "none";
}

export async function playEntry(entry: Entry, { slow = false } = {}): Promise<AudioSource> {
  stopAudio();
  const voicePath = communityVoices.get(entry.id);
  if (voicePath && resolveVoice) {
    try {
      // A slow network shouldn't delay the sound: after 2.5 s use the bundled clip (the download still finishes and is cached).
      const url = await withTimeout(resolveVoice(voicePath), 2500);
      if (url) {
        const audio = new Audio(url);
        currentClip = audio;
        audio.playbackRate = slow ? 0.7 : 1;
        await audio.play();
        return "recording";
      }
    } catch {
      // Fall back to the bundled clip.
    }
  }
  const clip = clipFor(entry);
  if (clip) {
    try {
      currentClip = new Audio(`/${clip}`);
      currentClip.playbackRate = slow ? 0.7 : 1;
      await currentClip.play();
      return clipSource(clip);
    } catch {
      // Missing or blocked clip: fall through to TTS.
    }
  }
  return speak(entry.wo, slow);
}

async function speak(text: string, slow: boolean): Promise<AudioSource> {
  const rate = slow ? 0.55 : 0.85;
  if (Capacitor.isNativePlatform()) {
    try {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
      await TextToSpeech.speak({ text, lang: TTS_LANG, rate, category: "playback" });
      return "tts";
    } catch {
      return "none";
    }
  }
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return "none";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = TTS_LANG;
  utterance.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("fr"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return "tts";
}

export function stopAudio() {
  currentClip?.pause();
  currentClip = null;
  if (Capacitor.isNativePlatform()) {
    void import("@capacitor-community/text-to-speech").then(({ TextToSpeech }) => TextToSpeech.stop()).catch(() => {});
  } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Short original feedback tones synthesised on the fly (no audio assets). */
let ctx: AudioContext | null = null;
export function playTone(kind: "correct" | "wrong" | "complete") {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const notes = { correct: [660, 880], wrong: [300, 220], complete: [523, 659, 784] }[kind];
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      const start = ctx!.currentTime + i * 0.1;
      osc.type = kind === "wrong" ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  } catch {
    // Audio is optional.
  }
}
