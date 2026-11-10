// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Game sound effects for duels, made on the phone with Web Audio: no sound files, so
 * they add nothing to the app's size. Callers check Settings → Sound first.
 */

export type Sfx = "tick" | "go" | "clang" | "crown" | "cheer" | "whoosh";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, start: number, length: number, peak: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

function noise(c: AudioContext, start: number, length: number, peak: number, from: number, to: number) {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * length), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + length);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + length * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(start);
  src.stop(start + length);
}

/** Plays one effect; silently does nothing where audio isn't available. */
export function playSfx(kind: Sfx) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + 0.01;
  try {
    switch (kind) {
      case "tick":
        tone(c, 880, t, 0.08, 0.12, "square");
        break;
      case "go":
        noise(c, t, 0.35, 0.25, 400, 2400);
        tone(c, 1175, t + 0.05, 0.3, 0.12, "triangle");
        break;
      case "whoosh":
        noise(c, t, 0.3, 0.18, 1800, 300);
        break;
      case "clang":
        // Inharmonic partials sound like struck metal.
        for (const [f, p] of [[520, 0.16], [1310, 0.09], [2160, 0.05]] as const) tone(c, f, t, 0.6, p, "sine");
        noise(c, t, 0.08, 0.15, 3000, 3000);
        break;
      case "crown":
        tone(c, 1047, t, 0.35, 0.12, "triangle");
        tone(c, 1568, t + 0.08, 0.45, 0.1, "triangle");
        break;
      case "cheer":
        noise(c, t, 1.2, 0.12, 600, 1400);
        [523, 659, 784, 1047].forEach((f, i) => tone(c, f, t + i * 0.09, 0.4, 0.1, "triangle"));
        break;
    }
  } catch {
    // Sound is optional.
  }
}

/** Fewer particles and effects on budget phones (few cores or little memory). */
export function isLowEnd(nav: { hardwareConcurrency?: number; deviceMemory?: number } | undefined = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { deviceMemory?: number })): boolean {
  if (!nav) return true;
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 2;
}
