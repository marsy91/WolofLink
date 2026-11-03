## What changed (plain language)
<!-- One or two sentences the owner can read on a phone. -->

## Why

## How to check it
<!-- Steps, or screenshots of the screens that changed. -->

## Checks (tick every box, or say why not)
- [ ] `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass (results pasted below)
- [ ] `bash scripts/ci/check-secrets.sh` passes, and no secret or key is in this change
- [ ] Every new text is in all five languages (en, fr, es, de, it)
- [ ] Tests added or updated for the logic I changed

## Does it touch any of these? (the owner must approve these)
- [ ] **New personal data** collected or shown (privacy page and `docs/store/privacy-answers.md` updated)
- [ ] **Database**: new migration file with row-level security and a test in `supabase/tests/` (not applied; the owner applies it)
- [ ] **Wolof text**: listed below, and the pull request is labelled `wolof-content`
- [ ] **Payments, accounts, signing, release settings, `.github/`, `android/`**
- [ ] None of the above

## New Wolof for native-speaker review
<!-- List every new or changed Wolof word/phrase with its meaning, or write "none". -->

## Test results
```
(paste the output of the four commands)
```
