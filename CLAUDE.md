# WolofLink: rules for every Claude session

Read this first. WolofLink is a Wolof-learning app for Senegal (Next.js static export inside a
Capacitor Android app, Supabase backend, five interface languages: en, fr, es, de, it). The
owner approves every change. You work on a branch and open a pull request; you never merge it.

## Always, before you open a pull request
Run all four and paste the results in the pull request:

```
npm run typecheck && npm run lint && npm test && npm run build
bash scripts/ci/check-secrets.sh
```

## Never
1. **Never commit a secret.** No service-role keys, Firebase service-account files, keystores
   (`*.jks`), `keystore.properties`, SMTP or email passwords, RevenueCat secret keys, API keys.
   Only *public* keys belong in the repo (Supabase publishable key, RevenueCat public SDK key,
   `android/app/google-services.json`). If you see a secret anywhere, stop and tell the owner.
2. **Never push to `main`** and never merge your own pull request. Work on a branch named
   `team/<your-name>/<topic>`.
3. **Never build or upload a release,** change `versionCode`/`versionName`, or touch signing.
   The owner does releases.
4. **Never apply SQL to the live database.** Database changes go in as new files in
   `supabase/migrations/` (never edit one that has already merged). The owner applies them.
5. **Write Wolof carefully, and always list it.** Reuse existing entries first
   (`src/content/course.ts`, `src/content/dictionary.ts`). The owner allows Claude to write new
   Wolof (amended 12 November 2026) as long as it follows the spelling rules in
   `docs/wolof-review.md` (CLAD orthography) and the dictionary: check words against the
   existing entries and reputable references, choose words for their meaning in context, and
   prefer plain, everyday Senegalese Wolof. Any *new* Wolof, or a change to existing Wolof, must
   be listed in the pull request under "New Wolof for native-speaker review", and the pull
   request labelled `wolof-content`, so a native speaker can check it later.
6. **No trademarks or look-alikes.** No names, logos or art of other apps, games or events
   (for example the Olympics), and never name other language apps in text. Don't claim
   "native-speaker audio" unless a real recording is what plays.

## Owner-only areas
Changes to these are allowed in a pull request but need the owner's explicit approval, and
the pull request description must say so plainly: `supabase/`, `android/`, `.github/`,
`.env*`, `src/lib/cloud.ts`, `src/lib/billing.ts`, `src/lib/features.ts`,
`src/app/privacy/`, `src/app/terms/`, `SECURITY.md`, `docs/store/`, `LICENSE`.

## Rules for the code
- **Every visible text** goes in all five dictionaries (`src/i18n/en.ts`, `fr.ts`, `es.ts`,
  `de.ts`, `it.ts`). A test fails if the keys differ. Course entries need all five translations.
- **Database:** every new table has row-level security on and `revoke all` from
  public/anon/authenticated; learners reach data only through functions that check who is
  asking (copy the style of the `owner_*` functions). Add a self-cancelling test in
  `supabase/tests/` (see the existing ones).
- **Privacy:** anything that collects or shows new personal data must update
  `src/app/privacy/page.tsx` and `docs/store/privacy-answers.md`, and be called out in the
  pull request. No ads, no analytics, no tracking SDKs.
- **New features that depend on a service ship switched off** behind a switch in
  `src/lib/features.ts` (see `PUSH_ENABLED`, `SUPPORTER_ENABLED`).
- **Offline-first and light:** the app must keep working without a connection, run on budget
  phones, and stay small. Don't add heavy libraries without saying why.
- **Match the existing patterns:** screens use `TabScreen` and `useStore()`, text goes through
  `t("key")`, pure logic lives in `src/lib/` or `src/content/` with a test next to it.
  New files start with: `// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.`
- **Test what you change.** Add or update tests in the same pull request.

## Where things are
- `src/app/` screens · `src/components/` shared UI · `src/lib/` logic and backend calls
- `src/content/` course, dictionary, holidays, arenas, sounds · `src/i18n/` the five languages
- `supabase/migrations/`, `supabase/functions/`, `supabase/tests/` · `scripts/` tooling
- `docs/` store listing, sales, review notes, team guide (`docs/team/README.md`)

## Pull request description (the owner may read it on a phone)
Write it in plain language: what changed and why, what the owner should check, whether it
touches privacy/data/Wolof, and the test results. The template asks for this.
