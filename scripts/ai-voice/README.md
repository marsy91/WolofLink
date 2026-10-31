# AI voice generator

Generates the Wolof clips in `public/audio/wo-ai/` with
[Adia TTS](https://huggingface.co/CONCREE/Adia_TTS) by CONCREE (Apache 2.0) and checks
each take with [whisper-small-wolof](https://huggingface.co/M9and2M/whisper-small-wolof)
(MIT). Results and the lines to check by ear are in
[docs/audio/ai-voice-report.md](../../docs/audio/ai-voice-report.md).

Run it again after adding or changing Wolof text. It needs Python 3.11, about 6 GB of free
RAM and 3 GB of disk for the models. On a 4-core CPU the full course takes about an hour
and a half; a GPU is much faster. Lines that already have a human recording are never
replaced.

```bash
# 1. One-time setup (outside the repo is fine)
python3.11 -m venv ~/.venvs/wolof-tts
~/.venvs/wolof-tts/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch torchaudio
~/.venvs/wolof-tts/bin/pip install -r scripts/ai-voice/requirements.txt

# 2. Export the lines to voice
npx tsx scripts/ai-voice/export-lines.ts ai-voice-work/lines.json

# 3. Generate (resumable: run the same command again after an interruption)
~/.venvs/wolof-tts/bin/python scripts/ai-voice/generate.py ai-voice-work/lines.json ai-voice-work

# 4. Import into the app and refresh the report
npm run audio:import -- ai-voice-work/lines --ai
~/.venvs/wolof-tts/bin/python scripts/ai-voice/make_report.py \
  ai-voice-work/report.json ai-voice-work/lines.json docs/audio/ai-voice-report.md
npm test
```

To redo only some lines, pass `--ids id1,id2` to `generate.py` with a fresh output folder,
then import that folder's `lines/`. `ai-voice-work/` is ignored by git.
