# Content plan: units 25–54 (A2–B1)

`units-25-54.json` is the course plan for the next 30 units: titles, grammar focus,
two lessons of 10 items each and a 6-line dialogue per unit, in English and French,
with fixed ids (`u25.1.01`, `u25.d.01`, …). **It contains no Wolof.**

## How the Wolof gets written and imported
1. A native Wolof writer (for example a linguistics student at UCAD) fills in the column
   "Wolof (à remplir)" of `WolofLink-redaction-wolof-unites-25-54.xlsx`, paid per half.
2. Merge it (units 25–39 first, then 40–54):
   `npm run content:merge -- sheet.xlsx --units 25-39 [--words known-words.txt]`
   This writes `src/content/units-data/<unit>.json` and the index, and always sets `"draft": true`.
   It stops on empty cells, duplicate Wolof in a lesson and unusual characters, and lists words
   that are not in the known-word list (for the reviewer).
3. Claude then fills in the Spanish, German and Italian fields (`"TODO"`), writes three
   comprehension questions per dialogue, and runs `npm run content:merge -- sheet.xlsx --final`,
   which fails until none are left.
4. Audio: `scripts/ai-voice/` voices the new lines; `npm run audio:import -- <dir> --ai`.
5. The app builds the lessons and exercises itself (`src/content/unit-source.ts`, tested).
6. **Draft units are not in normal builds.** They only appear when built with
   `NEXT_PUBLIC_DRAFT_UNITS=on` (for testers). After a second native speaker approves a unit,
   a pull request removes its `"draft": true`; that pull request is what releases it. A test
   fails if a draft unit is ever in the learners' course.

## Why not import an existing course book
The main Senegal course found online ("Practical Course in Wolof", Peace Corps, 1980)
was written **under contract** and says copies need the Peace Corps' authorisation, so
it can't be treated as public domain. The other files are Gambian Wollof (different
spelling) or unreadable scans. Open datasets (Universal Dependencies, speech corpora)
are not learner courses and some are share-alike.
