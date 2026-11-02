# Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"""Automatic check for community recordings (runs hourly in GitHub Actions).

For every recording with status 'new':
  - download it, convert to 16 kHz mono with ffmpeg;
  - reject obviously bad audio: too short/long for the line, or silent;
  - transcribe it with whisper-small-wolof (MIT) and compare with the line's text
    (character error rate, ignoring accents and doubled letters);
  - look for any word from the owner's blocked-word list in the transcript.
Clips that fail any test become 'flagged' with a reason; the rest go to 'review'.
Nothing becomes public here: a person still has to approve every clip.

Environment: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (GitHub secrets, never in the repo),
LINES_JSON (from scripts/review/export-lines.ts).
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

import requests

URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
MAX_CER = float(os.environ.get("VOICE_MAX_CER", "0.7"))


def strip_marks(text: str) -> str:
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if not unicodedata.combining(c)).lower().replace("ŋ", "n")
    return re.sub(r"[^a-z0-9 ]+", " ", t)


def fold(text: str) -> str:
    """Comparison form: no accents, spaces or doubled letters (ASR spells length loosely)."""
    return re.sub(r"(.)\1+", r"\1", strip_marks(text).replace(" ", ""))


def lev(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref: str, hyp: str) -> float:
    r, h = fold(ref), fold(hyp)
    return lev(r, h) / len(r) if r else 1.0


def blocked_hit(transcript: str, blocked: list[str]) -> str | None:
    words = strip_marks(transcript).split()
    joined = " " + " ".join(words) + " "
    for b in blocked:
        fb = " ".join(strip_marks(b).split())
        if not fb:
            continue
        # Whole words always; longer entries also inside words (e.g. compounds).
        if f" {fb} " in joined or (len(fb) >= 5 and fb.replace(" ", "") in joined.replace(" ", "")):
            return b
    return None


def get(path: str, **params):
    r = requests.get(f"{URL}{path}", headers=H, params=params, timeout=60)
    r.raise_for_status()
    return r


def update(rec_id: str, **fields):
    r = requests.patch(f"{URL}/rest/v1/recordings", headers={**H, "Content-Type": "application/json"},
                       params={"id": f"eq.{rec_id}", "status": "eq.new"}, data=json.dumps(fields), timeout=60)
    r.raise_for_status()


def pending() -> list[dict]:
    return get("/rest/v1/recordings", select="id,entry_id,path,duration_ms,mime", status="eq.new",
               order="created_at", limit="40").json()


def main() -> int:
    todo = pending()
    print(f"{len(todo)} new recording(s)")
    if "--count-only" in sys.argv:
        with open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a") as out:
            out.write(f"count={len(todo)}\n")
        return 0
    if not todo:
        return 0

    lines = {row["id"]: row["wo"] for row in json.load(open(os.environ["LINES_JSON"]))}
    blocked = [row["word"] for row in get("/rest/v1/blocked_words", select="word").json()]

    import numpy as np
    import soundfile as sf
    import torch
    from transformers import WhisperForConditionalGeneration, WhisperProcessor

    proc = WhisperProcessor.from_pretrained("M9and2M/whisper-small-wolof")
    asr = WhisperForConditionalGeneration.from_pretrained("M9and2M/whisper-small-wolof").eval()

    for rec in todo:
        text = lines.get(rec["entry_id"])
        if not text:
            update(rec["id"], status="flagged", flag="Unknown line (not in this version of the course)")
            continue
        with tempfile.TemporaryDirectory() as tmp:
            src, wav = os.path.join(tmp, "in"), os.path.join(tmp, "out.wav")
            with open(src, "wb") as f:
                f.write(get(f"/storage/v1/object/recordings/{rec['path']}").content)
            conv = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", wav])
            if conv.returncode != 0:
                update(rec["id"], status="flagged", flag="The file could not be read")
                continue
            audio, _ = sf.read(wav, dtype="float32")
        seconds = len(audio) / 16000
        rms = float(np.sqrt(np.mean(audio**2))) if len(audio) else 0.0
        longest = 1.5 + 0.14 * len(text)
        if seconds < 0.3 or rms < 0.003:
            update(rec["id"], status="flagged", flag="Silent or too short", auto_score=None)
            continue
        if seconds > longest:
            update(rec["id"], status="flagged", flag=f"Much longer than the line ({seconds:.1f}s, expected under {longest:.1f}s)")
            continue
        feats = proc(audio, sampling_rate=16000, return_tensors="pt").input_features
        with torch.inference_mode():
            ids = asr.generate(feats, max_new_tokens=96)
        heard = proc.batch_decode(ids, skip_special_tokens=True)[0].strip()
        score = round(cer(text, heard), 3)
        hit = blocked_hit(heard, blocked)
        if hit:
            update(rec["id"], status="flagged", flag="Contains a blocked word", transcript=heard, auto_score=score)
        elif score > MAX_CER:
            update(rec["id"], status="flagged", flag="Doesn't sound like the line", transcript=heard, auto_score=score)
        else:
            update(rec["id"], status="review", transcript=heard, auto_score=score)
        print(f"{rec['entry_id']}: {score} {'BLOCKED' if hit else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
