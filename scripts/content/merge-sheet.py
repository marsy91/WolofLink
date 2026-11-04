# Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"""Merge the native writer's filled-in spreadsheet into unit data files.

Usage:
  python3 scripts/content/merge-sheet.py <sheet.xlsx> [--units 25-39] [--final] [--words dictionary-words.txt]

Reads docs/content-plan/units-25-54.json (English and French prompts, no Wolof) and the sheet
(column "Wolof (à remplir)"), then writes src/content/units-data/<unit>.json and refreshes
src/content/units-data/index.ts. New units are always written with "draft": true, so learners
never see them until a pull request removes that flag.

Spanish, German and Italian fields are written as "TODO" for Claude to fill in; --final fails
if any are left. --words points to a plain list of known Wolof words (one per line, kept outside
the repo) so unfamiliar words are listed for the reviewer. Exits non-zero on blocking problems.
"""
import json, os, re, sys, unicodedata

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PLAN = f"{REPO}/docs/content-plan/units-25-54.json"
OUT = f"{REPO}/src/content/units-data"
GLYPHS = ["chat", "compass", "heart", "briefcase", "home", "drum", "robe", "bird", "question", "run", "spark", "clock", "wave", "family", "count", "bowl"]
TONES = ["sun", "clay", "sea", "dusk"]
# Letters used in CLAD Wolof (plus apostrophe, hyphen and the punctuation of sentences).
ALLOWED = re.compile(r"^[A-Za-zÀ-ÿñŋÑŊ0-9 '’\-.,;:?!¿¡…«»()]+$")
LANGS = ["en", "fr", "es", "de", "it"]


def nfc(s):
    return unicodedata.normalize("NFC", str(s or "")).strip()


def words(s):
    return [w.lower().strip("-'’") for w in re.findall(r"[A-Za-zÀ-ÿñŋÑŊ'’\-]+", s) if w.strip("-'’")]


def read_sheet(path):
    from openpyxl import load_workbook
    ws = load_workbook(path, data_only=True)["À traduire"]
    rows = list(ws.iter_rows(values_only=True))
    head = [str(c or "").strip() for c in rows[0]]
    col = {name: i for i, name in enumerate(head)}
    wo_col = next(i for n, i in col.items() if n.lower().startswith("wolof"))
    comment_col = next((i for n, i in col.items() if n.lower().startswith("commentaire")), None)
    got = {}
    for r in rows[1:]:
        if r[0]:
            got[str(r[0]).strip()] = (nfc(r[wo_col]), nfc(r[comment_col]) if comment_col is not None else "")
    return got


def parse_range(spec, plan):
    if not spec:
        return {u["unit"] for u in plan}
    a, b = (int(x) for x in spec.split("-"))
    return {f"u{n}" for n in range(a, b + 1)}


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    sheet = args[0]
    final = "--final" in args
    units_spec = args[args.index("--units") + 1] if "--units" in args else None
    known = None
    if "--words" in args:
        known = {w.strip().lower() for w in open(args[args.index("--words") + 1], encoding="utf-8") if w.strip()}

    plan = json.load(open(PLAN, encoding="utf-8"))
    wanted = parse_range(units_spec, plan)
    sheet_rows = read_sheet(sheet)
    errors, warnings, unknown = [], [], {}
    os.makedirs(OUT, exist_ok=True)
    written = []

    for idx, u in enumerate(plan):
        if u["unit"] not in wanted:
            continue
        uid = u["unit"]
        todo = lambda en, fr: {"en": en, "fr": fr, "es": "TODO", "de": "TODO", "it": "TODO"}

        def wo_of(item_id):
            wo, note = sheet_rows.get(item_id, ("", ""))
            if not wo:
                errors.append(f"{item_id}: no Wolof written")
            elif not ALLOWED.match(wo):
                errors.append(f"{item_id}: unusual characters in '{wo}'")
            else:
                for w in words(wo):
                    if known is not None and w not in known:
                        unknown.setdefault(w, []).append(item_id)
            if note:
                warnings.append(f"{item_id}: writer's comment: {note}")
            return wo

        lessons = []
        for l in u["lessons"]:
            items, seen = [], {}
            for it in l["items"]:
                wo = wo_of(it["id"])
                key = wo.lower()
                if wo and key in seen:
                    errors.append(f"{it['id']}: same Wolof as {seen[key]} in this lesson ('{wo}')")
                seen[key] = it["id"]
                items.append({"id": it["id"], "wo": wo, "tr": todo(it["en"], it["fr"])})
            lessons.append({"id": l["id"], "title": todo(l["title"]["en"], l["title"]["fr"]),
                            "tip": todo(u["focus"]["en"], u["focus"]["fr"]), "items": items})
        d = u["dialogue"]
        story = {
            "id": d["id"], "title": todo(d["title"]["en"], d["title"]["fr"]),
            "lines": [{"speaker": ln["speaker"], "wo": wo_of(ln["id"]), "tr": todo(ln["en"], ln["fr"])} for ln in d["lines"]],
            "questions": [],  # three comprehension questions are written when the unit is imported
        }
        src = {"id": uid, "glyph": GLYPHS[idx % len(GLYPHS)], "tone": TONES[idx % len(TONES)], "draft": True,
               "title": todo(u["title"]["en"], u["title"]["fr"]), "lessons": lessons, "story": story}
        json.dump(src, open(f"{OUT}/{uid}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        written.append(uid)

    # Index of every unit file present, in numeric order.
    files = sorted((f[:-5] for f in os.listdir(OUT) if re.fullmatch(r"u\d+\.json", f)), key=lambda x: int(x[1:]))
    lines = ["// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.",
             "// Generated by scripts/content/merge-sheet.py. Units here are drafts until their \"draft\" flag is removed.",
             'import { unitFromSource, type UnitSource } from "../unit-source";']
    lines += [f'import {f} from "./{f}.json";' for f in files]
    lines += ["", "export const dataUnitModules = ["]
    lines += [f"  unitFromSource({f} as unknown as UnitSource)," for f in files]
    lines += ["];", ""]
    open(f"{OUT}/index.ts", "w", encoding="utf-8").write("\n".join(lines))

    if final:
        left = [uid for uid in written if "TODO" in open(f"{OUT}/{uid}.json", encoding="utf-8").read()]
        if left:
            errors.append(f"translations still marked TODO in: {', '.join(left)}")
        for uid in written:
            if not json.load(open(f"{OUT}/{uid}.json"))["story"]["questions"]:
                errors.append(f"{uid}: dialogue has no comprehension questions yet")

    print(f"wrote {len(written)} unit file(s): {', '.join(written)}")
    for w in warnings:
        print("note:", w)
    if unknown:
        print(f"{len(unknown)} word(s) not in the known-word list (for the reviewer):")
        for w, ids in sorted(unknown.items()):
            print(f"  {w}  ({', '.join(ids[:3])})")
    for e in errors:
        print("ERROR:", e)
    sys.exit(1 if errors else 0)


main()
