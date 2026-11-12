# Dictionary expansion plan: from 526 to 10,000 entries

**Goal:** the most complete, trustworthy free Wolof–English–French dictionary, in the app and on
woloflink.com, with every entry checked by native speakers and every source recorded.

**Today:** 526 distinct Wolof entries (450 course words and phrases, 194 phrasebook phrases, some
shared), each with audio and translations in five languages.

## The rule that keeps it ours

Existing dictionaries are protected by copyright, and some open data is "share-alike" (it would
force our whole dictionary under the same licence). So:

1. **Sources give us word lists and a way to check**, never copied definitions or examples.
2. **Native editors write every definition and example sentence themselves**, in the official CLAD
   spelling, under the contributor agreement (`docs/team/contributor-agreement-DRAFT.md`), so
   WolofLink owns the result.
3. **Every entry records where its headword came from** and who wrote and reviewed it.

## Stages

| Stage | Entries | Covers | When |
|---|---|---|---|
| 1 · Core | 2,000 | Everything A1–A2 needs, plus the most frequent words | Months 1–3 |
| 2 · Broad | 5,000 | B1 vocabulary, work, health, faith, farming, fishing, city life | Months 4–8 |
| 3 · Reference | 10,000 | B2, idioms, proverbs, loanwords in real use, Gambian forms | Months 9–15 |

Order within each stage: most frequent words first (from frequency counts, see "Corpora"), then by
topic to fill gaps in the course and the planned units 25–54.

## What an entry contains

| Field | Example | Notes |
|---|---|---|
| Headword (CLAD spelling) | *jox* | Required |
| Part of speech | verb | Noun entries also give the class marker (*b-, g-, j-, k-, l-, m-, s-, w-*) |
| Meanings | to give | English, French; Spanish, German, Italian follow (Claude drafts, editor checks) |
| Forms | plural, verb with extensions (*joxe, joxaat*) | Where useful |
| Examples | 1–2 original sentences with translation | Written by the editor, never copied |
| Audio | native recording | From the in-app recorder for invited speakers |
| Gambian form | (if different) | Optional, marked "Gambia" |
| Wolofal | (Arabic-script spelling) | Optional, stage 3 |
| Level | A1 / A2 / B1 / B2 | Links the dictionary to the level map |
| Source of headword | e.g. Kobès 1875, p. 112; frequency list | Required |
| Written by / reviewed by | editor, reviewer | Required, credited publicly |

## Sources and how each may be used

Licences were checked in November 2026. Check again before importing anything.

| Source | Licence (as found) | Use |
|---|---|---|
| **Kobès, *Dictionnaire volof-français*, 1875** (Mission catholique) | Public domain (19th century) | Candidate headwords and senses; old spelling must be converted to CLAD by the editor. Find a scan first. |
| **Kobès & Abiven, *Dictionnaire volof-français*, Dakar 1923** | Probably public domain: needs O. Abiven's death date (public domain in the UK/EU if he died before 1956) | Same as above, once confirmed |
| **Dard, *Dictionnaire français-wolof*, 1825/1855** | Public domain | Historical check only (very old forms) |
| **PanLex** database snapshots | Snapshot page and README say CC0; the licence page says CC BY-NC-SA | Candidate translations **only after PanLex confirms CC0 in writing** |
| **Tatoeba** sentences | CC BY 2.0 FR (credit each sentence's author) | Example ideas and checks; if a sentence is used, credit it |
| Wiktionary (and kaikki.org extracts) | CC BY-SA | Check only; **do not copy** (share-alike) |
| Universal Dependencies Wolof treebank | CC BY-SA 4.0 | Check only; frequency counts from it are facts and can guide order |
| Diouf, *Dictionnaire wolof-français*, 2003; Fal, Santos & Doneux, 1990 | Copyright | Check spelling and meaning; never copy |
| Senego online dictionary | Copyright | Check only |
| Peace Corps "Practical Course in Wolof" (1980) | Written under contract, needs authorisation | Not used |
| "jolof" dataset (Hugging Face, labelled MIT) | Built from dictionary data of unclear origin | Not used |

### Corpora (to decide which words come first)

Word-frequency counts are facts, not copies, so they can be computed from texts we may read but
not republish. Candidates: the Wolof Bible (eBible.org, spelling reference already used),
SENCORPUS (French–Wolof, check its terms), a 123,000-sentence French–Wolof corpus (arXiv
2305.00606, check where it is hosted and its licence), and Wolof news sites. Only the counts are
kept, never the texts.

## Workflow (per batch of 200 headwords)

1. **Candidates:** Claude builds the batch from frequency counts, public-domain dictionaries and
   gaps in the course, with the source of each headword. No Wolof is invented: headwords come from
   sources, and anything unclear is flagged.
2. **Editor (native, linguist):** confirms or corrects the spelling (CLAD), writes meanings in
   French and English, and writes 1–2 example sentences. Spreadsheet, like the units 25–54 workbook.
3. **Reviewer (second native speaker):** checks a full batch; disagreements are noted in the sheet.
4. **Import:** a script (like `content:merge`) validates the sheet: required fields, CLAD
   characters, duplicates. Claude adds the Spanish, German and Italian translations for the editor
   to spot-check.
5. **Audio:** recorded by invited speakers in the app; until then the entry shows "audio coming".
6. **Publish:** in the app dictionary and as public pages on woloflink.com (one page per word,
   searchable in English and French).

## Cost and time (estimate)

At about 30 entries an hour for writing (with examples) and 100 an hour for review:

| Stage | Editor hours | Reviewer hours | At £12/hour |
|---|---|---|---|
| 1 · 2,000 | ~65 | ~20 | ~£1,000 |
| 2 · 5,000 (+3,000) | ~100 | ~30 | ~£1,550 |
| 3 · 10,000 (+5,000) | ~165 | ~50 | ~£2,600 |

Recording audio is extra (about 120–150 entries an hour per speaker).

## Quality and credibility

- Reviewers credited by name on a public "Our reviewers" page.
- A public "How we check" page: sources, the two-reviewer rule, the CLAD spelling.
- Corrections from learners (Report a problem, feedback) go to the editor queue and are answered.
- Every entry shows when it was last checked.

## First steps

1. Find and save scans of Kobès 1875 and 1923; find O. Abiven's death date (Spiritan archives).
2. Email PanLex to confirm the CC0 licence of the snapshots.
3. Compute a frequency list (counts only) and draft batch 1 (200 headwords) for the editor.
4. Agree the rate and a 200-entry paid trial with the Wolof specialist (as for the review).
