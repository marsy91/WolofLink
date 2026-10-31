// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Writes the voice-actor recording script:
 *   docs/audio/recording-script.csv  (spreadsheet; one row per file)
 *   docs/audio/recording-script.md   (printable, grouped by unit)
 * Run: npm run audio:script
 */
import { mkdirSync, writeFileSync } from "node:fs";
import manifest from "../src/content/audio-manifest.json";
import { audioLines } from "./audio-lines";

const lines = audioLines();
// Only human recordings count as done; AI clips (audio/wo-ai/) are placeholders to replace.
const done = Object.fromEntries(
  Object.entries(manifest as Record<string, string>).filter(([, file]) => file.startsWith("audio/wo/")),
);
mkdirSync("docs/audio", { recursive: true });

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
const header = ["#", "file", "wolof", "english", "french", "type", "speaker", "unit", "lesson", "note", "recorded"];
const csv = [
  header.join(","),
  ...lines.map((l, i) =>
    [
      String(i + 1),
      `${l.id}.mp3`,
      l.wolof,
      l.english,
      l.french,
      l.kind,
      l.speaker ?? "",
      l.unit,
      l.lesson,
      l.note ?? "",
      done[l.id] ? "yes" : "",
    ]
      .map(csvCell)
      .join(","),
  ),
].join("\r\n");
// BOM so Excel opens the Wolof letters (ë, ñ, ŋ…) correctly.
writeFileSync("docs/audio/recording-script.csv", "﻿" + csv + "\r\n");

const md: string[] = [
  "# WolofLink recording script",
  "",
  `${lines.length} recordings (${lines.filter((l) => done[l.id]).length} done). Read [README.md](README.md) first.`,
  "",
  "Save each recording with the exact **file** name shown. Read the Wolof only; the translations are there so you know the meaning.",
  "",
];
let unit = "";
let lesson = "";
lines.forEach((l, i) => {
  if (l.unit !== unit) {
    unit = l.unit;
    md.push(`## ${unit}`, "");
  }
  if (l.lesson !== lesson) {
    lesson = l.lesson;
    md.push(`### ${lesson}`, "", "| # | File | Wolof | Meaning | ✓ |", "|---|---|---|---|---|");
  }
  const wolof = l.speaker ? `*${l.speaker}:* ${l.wolof}` : l.wolof;
  md.push(`| ${i + 1} | \`${l.id}.mp3\` | **${wolof}** | ${l.english} / ${l.french} | ${done[l.id] ? "✓" : ""} |`);
  const next = lines[i + 1];
  if (!next || next.lesson !== l.lesson) md.push("");
});
writeFileSync("docs/audio/recording-script.md", md.join("\n"));

const counts = lines.reduce<Record<string, number>>((n, l) => ({ ...n, [l.kind]: (n[l.kind] ?? 0) + 1 }), {});
console.log(`Wrote ${lines.length} lines to docs/audio/recording-script.{csv,md}`, counts);
