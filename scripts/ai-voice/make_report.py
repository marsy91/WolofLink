# Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"""Write docs/audio/ai-voice-report.md from the generator's report.json.

usage: python make_report.py REPORT_JSON LINES_JSON OUT_MD
"""
import json
import sys
from collections import defaultdict

report = json.load(open(sys.argv[1]))
lines = {l["id"]: l for l in json.load(open(sys.argv[2]))}
out = sys.argv[3]

flagged = [r for r in report if r["flag"]]
ok = [r for r in report if not r["flag"]]
cers = sorted(r["cer"] for r in report if r["cer"] is not None)
median = cers[len(cers) // 2] if cers else 0
takes = sum(r["takes"] for r in report)

by_unit = defaultdict(list)
for r in flagged:
    by_unit[lines[r["id"]]["unit"]].append(r)

md = [
    "# AI voice report",
    "",
    "The Wolof audio in `public/audio/wo-ai/` was generated with",
    "[Adia TTS](https://huggingface.co/CONCREE/Adia_TTS) by **CONCREE** (Apache 2.0). It is a",
    "placeholder until native speakers record the course; a human recording imported with",
    "`npm run audio:import` replaces the AI clip of that line automatically.",
    "",
    "## How the clips were made",
    "",
    "- Each line is split into sentences; each sentence is generated separately (the model",
    "  drops words from multi-sentence input) and the sentences are joined with a short pause.",
    "- Every sentence gets one or more sampled takes. Each take is transcribed with a Wolof",
    "  speech-recognition model ([whisper-small-wolof](https://huggingface.co/M9and2M/whisper-small-wolof),",
    "  MIT) and scored by how far the transcript is from the text (character error rate,",
    "  ignoring accents and doubled letters), plus a check that its length is plausible.",
    "- Unclear sentences get more takes (up to 10); the best-scoring take is kept.",
    "- The generator is in `scripts/ai-voice/`; rerun it after changing course text.",
    "",
    "## Results",
    "",
    f"- **{len(report)} lines**, {takes} takes in total.",
    f"- **{len(ok)} lines passed** the automatic check; median error rate {median:.0%}.",
    f"- **{len(flagged)} lines are flagged** below: the best take still did not match the text",
    "  well, or its length looked wrong. They may be fine (the checker itself often misspells",
    "  short words), but have a native speaker listen to these first.",
    "",
    "The automatic check cannot judge accent, tone or naturalness. A native speaker should",
    "still listen to every line before the app is promoted as having native audio.",
    "",
    "## Flagged lines",
    "",
]
if not flagged:
    md.append("None.")
for unit, rows in by_unit.items():
    md += [f"### {unit}", "", "| File | Wolof | Heard by the checker | Error |", "|---|---|---|---|"]
    for r in rows:
        heard = r["asr"].replace("|", "/") or "—"
        err = f"{r['cer']:.0%}" if r["cer"] is not None else "missing"
        if not r.get("plausible", True) and r["cer"] is not None:
            err += ", length"
        md.append(f"| `{r['id']}.mp3` | **{r['wolof']}** | {heard} | {err} |")
    md.append("")
open(out, "w").write("\n".join(md).rstrip() + "\n")
print(f"{len(report)} lines, {len(flagged)} flagged -> {out}")
