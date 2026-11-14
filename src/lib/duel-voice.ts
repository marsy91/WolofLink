// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Voice swap in two-way duels (supabase/migrations/*_duel_voices.sql). In a duel between a
 * Wolof learner and a Wolof speaker, each player may record one of the duel's words in the
 * language they speak well; the other hears it and guesses which word it was. The server
 * enforces every safety rule (adults, friends, two-way, one word from the duel, deletion).
 */
import { course } from "@/content/course";
import { isReverseTarget, learnText, reverseCourse, type LearnTarget, type ReverseTarget } from "@/content/reverse";
import { getCloud } from "./cloud";
import { seeded, shuffle } from "./engine";

/** Longest clip (the server also caps the size at 60 KB). */
export const VOICE_MAX_MS = 4000;
export const VOICE_MAX_BYTES = 60 * 1024;

/** Voice swap only happens when exactly one of the two is learning Wolof. */
export const isTwoWay = (mine: LearnTarget, theirs: LearnTarget | null) => !!theirs && (mine === "wo") !== (theirs === "wo");

/** The language you record in: Wolof speakers record Wolof; learners record what their partner learns. */
export function spokenLang(mine: LearnTarget, theirs: LearnTarget): LearnTarget {
  return mine === "wo" ? theirs : "wo";
}

/** The duel word each player records: different words, the same on both phones. */
export function voiceEntryFor(seed: number, entries: readonly string[], role: "challenger" | "opponent"): string {
  const order = shuffle([...entries], seeded(seed ^ 0x701ce));
  return order[role === "challenger" ? 0 : 1] ?? entries[0]!;
}

/** How a duel word is written in a language (what the speaker reads out). */
export function wordIn(entryId: string, lang: LearnTarget): string {
  const entry = course.entries[entryId];
  if (!entry) return entryId;
  if (lang === "wo") return entry.wo;
  const reversed = reverseCourse(lang as ReverseTarget).entries[`${lang}:${entryId}`];
  return reversed?.wo ?? learnText(entry.tr[lang] ?? entry.tr.en, entry.wo);
}

/** Four choices for "what did they say?": the word and three other words from the duel, written in the clip's language. */
export function listenChoices(entryId: string, entries: readonly string[], lang: LearnTarget, seed: number): { id: string; label: string }[] {
  const others = shuffle(
    entries.filter((e) => e !== entryId),
    seeded(seed ^ 0xea5),
  );
  const seen = new Set([wordIn(entryId, lang).toLowerCase()]);
  const picked: string[] = [];
  for (const o of others) {
    const label = wordIn(o, lang).toLowerCase();
    if (seen.has(label)) continue;
    seen.add(label);
    picked.push(o);
    if (picked.length === 3) break;
  }
  return shuffle([entryId, ...picked], seeded(seed ^ 0xc0ffee)).map((id) => ({ id, label: wordIn(id, lang) }));
}

/** The base64 text of a recording (what the server stores). */
export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** A playable address for a clip received as base64. */
export function base64ToUrl(b64: string, mime: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

/** The kinds of audio the server accepts. */
export function voiceMime(blobType: string): "audio/webm" | "audio/ogg" | "audio/mp4" {
  return blobType.includes("mp4") || blobType.includes("aac") ? "audio/mp4" : blobType.includes("ogg") ? "audio/ogg" : "audio/webm";
}

export interface DuelClip {
  entryId: string;
  lang: LearnTarget;
  mime: string;
  b64: string;
}

function cloud() {
  const c = getCloud();
  if (!c) throw new Error("accounts are switched off in this build");
  return c;
}

export const duelVoice = {
  send: async (duel: string, entry: string, lang: LearnTarget, blob: Blob) => {
    if (blob.size > VOICE_MAX_BYTES) throw new Error("too long");
    const audio = await blobToBase64(blob);
    await cloud().rpc<void>("send_duel_voice", { duel, entry, lang, mime: voiceMime(blob.type), audio });
  },
  get: async (duel: string): Promise<DuelClip | null> => {
    const rows = await cloud().rpc<{ entry_id: string; lang: string; mime: string; audio: string }[]>("get_duel_voice", { duel });
    const r = rows?.[0];
    if (!r || !(r.lang === "wo" || isReverseTarget(r.lang))) return null;
    return { entryId: r.entry_id, lang: r.lang as LearnTarget, mime: r.mime, b64: r.audio };
  },
  waiting: async () => (await cloud().rpc<{ duel_id: string; speaker_name: string }[]>("my_duel_voices")) ?? [],
  report: async (duel: string, note?: string) => {
    await cloud().rpc<void>("report_duel_voice", { duel, note: note ?? null });
  },
};
