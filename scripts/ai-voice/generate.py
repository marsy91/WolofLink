# Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"""AI voice generator for WolofLink (see scripts/ai-voice/README.md).

Voice: CONCREE/Adia_TTS (Apache-2.0). Check: M9and2M/whisper-small-wolof (MIT).

Every sentence of every line gets a few sampled takes (several takes share one
batched model pass); each take is transcribed and scored by character error
rate against the text, plus a length sanity check. Sentences whose best take
is still unclear get more takes in later rounds. The run is resumable: every
take is logged to takes.jsonl and the best take of each sentence is kept in
segs/. At the end, lines are assembled (sentences joined by a short pause)
into lines/<id>.wav and report.json lists the scores.

usage: python generate.py LINES_JSON OUT_DIR [--batch 16] [--rounds 1,3,6]
       [--desc-tok t5|adia] [--ids a,b] [--limit n] [--accept 0.25] [--asr-bf16]
"""
import argparse
import json
import os
import re
import time
import unicodedata
import zlib

import warnings  # noqa: E402

warnings.filterwarnings("ignore")

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from scipy.signal import resample_poly  # noqa: E402
from transformers import AutoTokenizer, WhisperForConditionalGeneration, WhisperProcessor  # noqa: E402
from parler_tts import ParlerTTSForConditionalGeneration  # noqa: E402

DESC = "A clear and educational voice, with a flow adapted to learning"
FRAME_RATE = 86
PAUSE_S = 0.32
FLAG_CER = 0.35


def strip_marks(text: str) -> str:
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if not unicodedata.combining(c)).lower().replace("ŋ", "n")
    return re.sub(r"[^a-z0-9]+", "", t)


def fold(text: str) -> str:
    """Comparison form: no accents, no spaces, no doubled letters (ASR spells length loosely)."""
    return re.sub(r"(.)\1+", r"\1", strip_marks(text))


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
    return lev(r, h) / len(r) if r else 0.0


def sentences(text: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", text.strip()) if p.strip()]
    return parts or [text.strip()]


def prep(seg: str) -> str:
    s = seg.strip()
    if s[0] != "ŋ":  # capital Ŋ is not in the tokenizer's vocabulary
        s = s[0].upper() + s[1:]
    if not re.search(r"[.!?…]$", s):
        s += "."
    return s


def expected_s(seg: str) -> float:
    return 0.085 * len(strip_marks(seg)) + 0.35


def speech_span(audio: np.ndarray, sr: int) -> tuple[int, int]:
    win = int(sr * 0.02)
    frames = len(audio) // win
    if frames == 0:
        return 0, 0
    rms = np.sqrt(np.mean(audio[: frames * win].reshape(frames, win) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-12))
    on = np.where(db > -35)[0]
    if len(on) == 0 or rms.max() < 1e-4:
        return 0, 0
    return int(on[0] * win), int(min(len(audio), (on[-1] + 1) * win))


def plausible(dur: float, exp: float) -> bool:
    return 0.45 * exp <= dur <= 2.0 * exp + 0.6


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("lines")
    ap.add_argument("out")
    ap.add_argument("--batch", type=int, default=16)
    ap.add_argument("--rounds", default="1,3,6")
    ap.add_argument("--desc-tok", default="t5")
    ap.add_argument("--ids", default="")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--accept", type=float, default=0.25)
    ap.add_argument("--threads", type=int, default=4)
    ap.add_argument("--asr-bf16", action="store_true")
    ap.add_argument("--temperature", type=float, default=0.8)
    args = ap.parse_args()
    torch.set_num_threads(args.threads)

    lines = json.load(open(args.lines))
    if args.ids:
        want = args.ids.split(",")
        lines = [l for l in lines if l["id"] in set(want)]
    if args.limit:
        lines = lines[: args.limit]
    segs = []
    for line in lines:
        for j, s in enumerate(sentences(line["wolof"])):
            segs.append({"key": f"{line['id']}#{j}", "id": line["id"], "j": j, "text": s, "exp": expected_s(s)})
    rounds = [int(x) for x in args.rounds.split(",")]

    os.makedirs(os.path.join(args.out, "segs"), exist_ok=True)
    os.makedirs(os.path.join(args.out, "lines"), exist_ok=True)
    log_path = os.path.join(args.out, "takes.jsonl")
    tries: dict[str, list[dict]] = {s["key"]: [] for s in segs}
    best: dict[str, dict] = {}
    if os.path.exists(log_path):
        for row in open(log_path):
            t = json.loads(row)
            if t["key"] in tries:
                tries[t["key"]].append(t)
                if t.get("kept"):
                    best[t["key"]] = t

    t0 = time.time()
    model = ParlerTTSForConditionalGeneration.from_pretrained("CONCREE/Adia_TTS", torch_dtype=torch.bfloat16).eval()
    sr = model.config.sampling_rate
    ptok = AutoTokenizer.from_pretrained("CONCREE/Adia_TTS")
    dtok = AutoTokenizer.from_pretrained("google/flan-t5-large") if args.desc_tok == "t5" else ptok
    proc = WhisperProcessor.from_pretrained("M9and2M/whisper-small-wolof")
    asr = WhisperForConditionalGeneration.from_pretrained(
        "M9and2M/whisper-small-wolof", torch_dtype=torch.bfloat16 if args.asr_bf16 else torch.float32).eval()
    print(f"loaded in {time.time() - t0:.0f}s; {len(lines)} lines, {len(segs)} sentences; "
          f"{sum(len(v) for v in tries.values())} takes already logged", flush=True)

    def synth(texts: list[str], budget: int, seed: int) -> list[np.ndarray]:
        torch.manual_seed(seed)
        d = dtok([DESC] * len(texts), return_tensors="pt", padding=True)
        p = ptok([prep(t) for t in texts], return_tensors="pt", padding=True)
        with torch.inference_mode():
            out = model.generate(
                input_ids=d.input_ids, attention_mask=d.attention_mask,
                prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask,
                do_sample=True, temperature=args.temperature, top_k=50, repetition_penalty=1.2,
                max_new_tokens=budget, return_dict_in_generate=True,
            )
        audio = out.sequences.to(torch.float32).cpu().numpy()
        return [audio[i, : out.audios_length[i]].astype(np.float32) for i in range(len(texts))]

    def transcribe(clips: list[np.ndarray]) -> list[str]:
        a16 = [resample_poly(c, 2, 3).astype(np.float32) if len(c) > 160 else np.zeros(1600, np.float32)
               for c in clips]
        feats = proc(a16, sampling_rate=16000, return_tensors="pt").input_features.to(asr.dtype)
        with torch.inference_mode():
            ids = asr.generate(feats, max_new_tokens=48)
        return [t.strip() for t in proc.batch_decode(ids, skip_special_tokens=True)]

    def accepted(key: str) -> bool:
        b = best.get(key)
        return bool(b) and b["score"] <= args.accept

    with open(log_path, "a") as log:
        for r, _ in enumerate(rounds):
            target = sum(rounds[: r + 1])
            todo = [s for s in segs if not accepted(s["key"]) and len(tries[s["key"]]) < target]
            todo.sort(key=lambda s: s["exp"])
            items = [s for s in todo for _ in range(target - len(tries[s["key"]]))]
            nb = (len(items) + args.batch - 1) // args.batch
            print(f"round {r + 1}: {len(todo)} sentences, {len(items)} takes, {nb} batches", flush=True)
            for b in range(nb):
                t = time.time()
                group = items[b * args.batch: (b + 1) * args.batch]
                budget = min(1000, max(int(FRAME_RATE * (2.0 * s["exp"] + 0.95)) + 12 for s in group))
                seed = zlib.crc32(("|".join(s["key"] for s in group) + f"|{r}|{b}").encode())
                audios = synth([s["text"] for s in group], budget, seed)
                t_tts = time.time() - t
                spans = [speech_span(a, sr) for a in audios]
                clips = [a[x:y] for a, (x, y) in zip(audios, spans)]
                hyps = transcribe(clips)
                t_asr = time.time() - t - t_tts
                for k, (s, a, (x, y), hyp) in enumerate(zip(group, audios, spans, hyps)):
                    dur = (y - x) / sr
                    c = cer(s["text"], hyp)
                    ok = plausible(dur, s["exp"])
                    row = {"key": s["key"], "round": r, "seed": seed, "slot": k, "cer": round(c, 3),
                           "dur": round(dur, 2), "exp": round(s["exp"], 2), "plausible": ok, "asr": hyp,
                           "score": round(c + (0 if ok else 0.6), 3), "kept": False}
                    prev = best.get(s["key"])
                    if y > x and (prev is None or row["score"] < prev["score"]):
                        clip = a[max(0, x - int(0.06 * sr)): min(len(a), y + int(0.1 * sr))]
                        tmp = os.path.join(args.out, "segs", f".{s['key']}.wav")
                        sf.write(tmp, clip, sr, subtype="FLOAT")
                        os.replace(tmp, os.path.join(args.out, "segs", f"{s['key']}.wav"))
                        row["kept"] = True
                        best[s["key"]] = row
                    tries[s["key"]].append(row)
                    log.write(json.dumps(row, ensure_ascii=False) + "\n")
                log.flush()
                done = sum(1 for s in segs if accepted(s["key"]))
                print(f"  r{r + 1} batch {b + 1}/{nb} {time.time() - t:.0f}s (tts {t_tts:.0f}s, asr {t_asr:.0f}s) budget={budget} "
                      f"mean_cer={np.mean([float(cer(s['text'], h)) for s, h in zip(group, hyps)]):.2f} "
                      f"accepted={done}/{len(segs)} elapsed={(time.time() - t0) / 60:.0f}m", flush=True)

    report = []
    for line in lines:
        keys = [s for s in segs if s["id"] == line["id"]]
        pieces, rows = [], []
        for s in keys:
            path = os.path.join(args.out, "segs", f"{s['key']}.wav")
            if not os.path.exists(path):
                rows.append(None)
                continue
            audio, _ = sf.read(path, dtype="float32")
            if pieces:
                pieces.append(np.zeros(int(PAUSE_S * sr), np.float32))
            pieces.append(audio)
            rows.append(best.get(s["key"]))
        entry = {"id": line["id"], "wolof": line["wolof"], "takes": sum(len(tries[s["key"]]) for s in keys)}
        if pieces and all(rows):
            audio = np.concatenate(pieces)
            audio = audio / (float(np.max(np.abs(audio))) or 1.0) * 0.89
            sf.write(os.path.join(args.out, "lines", f"{line['id']}.wav"), audio, sr, subtype="PCM_16")
            entry.update({
                "cer": max(r["cer"] for r in rows),
                "plausible": all(r["plausible"] for r in rows),
                "asr": " | ".join(r["asr"] for r in rows),
            })
            entry["flag"] = entry["cer"] > FLAG_CER or not entry["plausible"]
        else:
            entry.update({"cer": None, "plausible": False, "asr": "", "flag": True, "missing": True})
        report.append(entry)
    json.dump(report, open(os.path.join(args.out, "report.json"), "w"), ensure_ascii=False, indent=1)
    cers = [e["cer"] for e in report if e["cer"] is not None]
    print(f"done in {(time.time() - t0) / 60:.0f}m: {len(report)} lines, mean cer {np.mean(cers):.3f}, "
          f"flagged {sum(e['flag'] for e in report)}", flush=True)


if __name__ == "__main__":
    main()
