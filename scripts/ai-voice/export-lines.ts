// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Writes every line to voice as JSON for generate.py. Usage: npx tsx scripts/ai-voice/export-lines.ts <out.json> */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { audioLines } from "../audio-lines";

const out = process.argv[2] ?? "ai-voice-work/lines.json";
mkdirSync(path.dirname(out), { recursive: true });
const lines = audioLines();
writeFileSync(out, JSON.stringify(lines, null, 1));
console.log(`Wrote ${lines.length} lines to ${out}`);
