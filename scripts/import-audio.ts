// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Imports voice recordings into the app.
 *
 *   npm run audio:import -- path/to/recordings        (default: ./audio-in)
 *   npm run audio:import -- path/to/clips --ai        (AI-generated voice)
 *
 * Each file must be named after its id from the recording script, e.g.
 * `g.salaam.wav` or `story-taxi.3.m4a`. With ffmpeg installed, files are
 * trimmed of leading/trailing silence, loudness-normalised and converted to
 * mono MP3; without it, .mp3 files are copied as they are.
 *
 * Human recordings go to public/audio/wo/ and replace any AI clip of the same
 * line. AI clips (--ai) go to public/audio/wo-ai/, so the app can label them,
 * and never replace a human recording. src/content/audio-manifest.json maps
 * each line id to its clip.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import manifestJson from "../src/content/audio-manifest.json";
import { audioLines } from "./audio-lines";

const args = process.argv.slice(2);
const AI = args.includes("--ai");
const SOURCE = args.find((a) => !a.startsWith("--")) ?? "audio-in";
const HUMAN_DIR = "audio/wo";
const AI_DIR = "audio/wo-ai";
const DIR = AI ? AI_DIR : HUMAN_DIR;
const AUDIO_EXT = /\.(wav|mp3|m4a|aac|ogg|opus|flac|webm)$/i;

if (!existsSync(SOURCE)) {
  console.error(`No folder "${SOURCE}". Put recordings there or pass a folder: npm run audio:import -- <folder>`);
  process.exit(1);
}

const hasFfmpeg = (() => {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

const known = new Map(audioLines().map((l) => [l.id, l]));
const manifest: Record<string, string> = { ...(manifestJson as Record<string, string>) };
mkdirSync(path.join("public", DIR), { recursive: true });

const imported: string[] = [];
const unknown: string[] = [];
const skipped: string[] = [];
const keptHuman: string[] = [];

for (const file of readdirSync(SOURCE).sort()) {
  if (!AUDIO_EXT.test(file)) continue;
  const id = file.replace(AUDIO_EXT, "");
  if (!known.has(id)) {
    unknown.push(file);
    continue;
  }
  if (AI && manifest[id]?.startsWith(`${HUMAN_DIR}/`)) {
    keptHuman.push(id);
    continue;
  }
  const input = path.join(SOURCE, file);
  const clip = `${DIR}/${id}.mp3`;
  const output = path.join("public", clip);
  if (hasFfmpeg) {
    // Trim silence at both ends, normalise loudness, mono 44.1 kHz MP3 (64 kbps is plenty for speech).
    const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1";
    execFileSync(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-i", input, "-ac", "1", "-ar", "44100",
        "-af", `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11`,
        "-codec:a", "libmp3lame", "-b:a", "64k", output],
      { stdio: "inherit" },
    );
  } else if (/\.mp3$/i.test(file)) {
    copyFileSync(input, output);
  } else {
    skipped.push(file);
    continue;
  }
  // A human recording replaces the AI clip of the same line.
  if (!AI) rmSync(path.join("public", AI_DIR, `${id}.mp3`), { force: true });
  manifest[id] = clip;
  imported.push(id);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync("src/content/audio-manifest.json", JSON.stringify(sorted, null, 2) + "\n");

const missing = [...known.keys()].filter((id) => !sorted[id]);
const human = Object.values(sorted).filter((f) => f.startsWith(`${HUMAN_DIR}/`)).length;
console.log(
  `Imported ${imported.length} ${AI ? "AI clip(s)" : "recording(s)"}` +
    `${hasFfmpeg ? " (trimmed, normalised, MP3)" : " (copied; install ffmpeg to convert)"}.`,
);
if (keptHuman.length) console.log(`Kept ${keptHuman.length} human recording(s) instead of the AI clip.`);
if (unknown.length) console.warn(`Unknown file names (check against the recording script):\n  ${unknown.join("\n  ")}`);
if (skipped.length) console.warn(`Skipped (need ffmpeg to convert):\n  ${skipped.join("\n  ")}`);
console.log(
  `Coverage: ${known.size - missing.length}/${known.size} lines have audio ` +
    `(${human} human recording(s), ${known.size - missing.length - human} AI).`,
);
console.log("Next: npm run audio:script (marks recorded lines) and rebuild the app.");
