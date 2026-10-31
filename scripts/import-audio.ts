// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Imports voice recordings into the app.
 *
 *   npm run audio:import -- path/to/recordings   (default: ./audio-in)
 *
 * Each file must be named after its id from the recording script, e.g.
 * `g.salaam.wav` or `story-taxi.3.m4a`. With ffmpeg installed, files are
 * trimmed of leading/trailing silence, loudness-normalised and converted to
 * mono 96 kbps MP3; without it, .mp3 files are copied as they are.
 * Results go to public/audio/wo/ and src/content/audio-manifest.json.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import manifestJson from "../src/content/audio-manifest.json";
import { audioLines } from "./audio-lines";

const SOURCE = process.argv[2] ?? "audio-in";
const OUT_DIR = "public/audio/wo";
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
mkdirSync(OUT_DIR, { recursive: true });

const imported: string[] = [];
const unknown: string[] = [];
const skipped: string[] = [];

for (const file of readdirSync(SOURCE).sort()) {
  if (!AUDIO_EXT.test(file)) continue;
  const id = file.replace(AUDIO_EXT, "");
  if (!known.has(id)) {
    unknown.push(file);
    continue;
  }
  const input = path.join(SOURCE, file);
  const output = path.join(OUT_DIR, `${id}.mp3`);
  if (hasFfmpeg) {
    // Trim silence at both ends, normalise loudness, mono 44.1 kHz MP3.
    const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1";
    execFileSync(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-i", input, "-ac", "1", "-ar", "44100",
        "-af", `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11`,
        "-codec:a", "libmp3lame", "-b:a", "96k", output],
      { stdio: "inherit" },
    );
  } else if (/\.mp3$/i.test(file)) {
    copyFileSync(input, output);
  } else {
    skipped.push(file);
    continue;
  }
  manifest[id] = `audio/wo/${id}.mp3`;
  imported.push(id);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync("src/content/audio-manifest.json", JSON.stringify(sorted, null, 2) + "\n");

const missing = [...known.keys()].filter((id) => !sorted[id]);
console.log(`Imported ${imported.length} recording(s)${hasFfmpeg ? " (trimmed, normalised, MP3)" : " (copied; install ffmpeg to convert)"}.`);
if (unknown.length) console.warn(`Unknown file names (check against the recording script):\n  ${unknown.join("\n  ")}`);
if (skipped.length) console.warn(`Skipped (need ffmpeg to convert):\n  ${skipped.join("\n  ")}`);
console.log(`Coverage: ${known.size - missing.length}/${known.size} lines have recordings.`);
console.log("Next: npm run audio:script (marks recorded lines) and rebuild the app.");
