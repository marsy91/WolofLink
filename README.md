# WolofLink

> **Proprietary — all rights reserved.** See [LICENSE](LICENSE), [SECURITY.md](SECURITY.md)
> and the in-app privacy policy (`/privacy`, source in `src/app/privacy/page.tsx`).

A mobile-first app for learning **Wolof** from English, French, Spanish, German or Italian.
It's built with Next.js + TypeScript + Tailwind and wrapped with Capacitor, so one codebase
produces the web app, the Android app (APK/AAB) and the iOS app.

Everything here is original: code, course content, UI, icons, logo and colours. No other
app's assets, content or code were used.

```
woloflink/
├── src/
│   ├── app/                 Routes (static export): welcome, learn, lesson/[id], review,
│   │                        practice, league, profile, settings
│   ├── components/          LessonPlayer, exercise views, UI kit, icons, logo
│   ├── content/             Course model (types.ts); one file per unit in units/ (vocabulary + lessons)
│   ├── i18n/                UI strings: en (source of truth), fr, es, de, it
│   └── lib/
│       ├── engine.ts        Builds exercises from specs, checks answers (pure, tested)
│       ├── session.ts       Lesson state machine: drops, retries, accuracy, XP (pure, tested)
│       ├── progress.ts      XP, streaks, drops, spaced repetition, achievements (pure, tested)
│       ├── review.ts        Builds review sessions from due cards
│       ├── storage.ts       Persistence boundary (localStorage today)
│       ├── store.tsx        React provider around progress + storage
│       ├── audio.ts         Recorded clip → device TTS fallback; feedback tones
│       └── speech.ts        Speech-recognition interface (placeholder)
├── android/  ios/           Native Capacitor projects (committed)
├── assets/                  Source icon/splash PNGs for @capacitor/assets
└── scripts/make-icons.mjs   Renders the logo into all icon/splash sources
```

## Run it

```bash
cd woloflink
npm install
npm run dev          # http://localhost:3000
npm test             # engine, progress and content-integrity tests
npm run lint && npm run typecheck
npm run build        # static export into out/
```

## Build the Android app

You need JDK 21 and the Android SDK (platform 36). Point `ANDROID_HOME` at the SDK, or put
`sdk.dir=/path/to/sdk` in `android/local.properties`.

```bash
npm run android:apk
# → android/app/build/outputs/apk/debug/app-debug.apk
```

**Install on a phone for testing:** copy the APK to the phone, open it, and allow
"Install unknown apps" for your file manager or browser when Android asks. Or connect the
phone with USB debugging on and run `adb install -r app-debug.apk`.

To open it in Android Studio: `npx cap open android`.

Release builds (`assembleRelease` / `bundleRelease`) are minified, obfuscated and
resource-shrunk with R8. Capacitor ships keep rules for its plugins;
`android/app/proguard-rules.pro` keeps the JavaScript bridge, and
`res/raw/keep.xml` keeps resources looked up by name (the notification icon). After
changing native plugins, check a release build on a real device before uploading.

### Launch configuration

Three build switches in `.env.production` (read by `src/lib/features.ts`, fixed when the
app is built) decide what a store build contains. The 0.6 launch build ships everything
free:

| Switch | Launch value | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_PREMIUM` | `off` | `off`: every unit and dialogue is free, the Premium screen and links are hidden and the store SDK never loads. `on`: units 4 and up need Premium (set up RevenueCat and the store products first; see "Premium" below). |
| `NEXT_PUBLIC_ACCOUNTS` | `off` | Hides the optional account and cloud sync even though the Supabase settings are present. Turn it back on once the sign-in emails show the 6-digit code (Supabase → Authentication → Emails: put `{{ .Token }}` in the *Magic Link* and *Confirm signup* templates). |
| `NEXT_PUBLIC_CIRCLE` | `off` | The Circle tab is a demo ranking with sample learners; keep it off in store builds. |

The privacy policy page shows its account and purchase sections only when those features
are on, so it always matches the build. Update the Data safety answers
(`docs/store/privacy-answers.md`) whenever you change a switch.

### Publishing to Google Play

1. Create an upload key once, and keep it safe and out of git:
   `keytool -genkeypair -v -keystore woloflink-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
2. Create `android/keystore.properties` (it's gitignored):
   ```
   storeFile=/absolute/path/woloflink-upload.jks
   storePassword=…
   keyAlias=upload
   keyPassword=…
   ```
3. Raise `versionCode` (and `versionName`) in `android/app/build.gradle` for each release.
4. `npm run build && npx cap sync android && cd android && ./gradlew bundleRelease`
   → `android/app/build/outputs/bundle/release/app-release.aab`
5. In the Play Console, create the app (package `app.woloflink.learn`), enrol in Play App
   Signing, then upload the AAB to the internal testing track first. You also need: a privacy
   policy URL, the Data safety form, a content rating, a 512×512 icon (`public/icon-512.png`),
   a feature graphic and screenshots. Ready-made answers for the Data safety form and
   Apple's privacy label are in `docs/store/privacy-answers.md`. The privacy policy URL is
   the `/privacy/` page of the deployed web build (any static host works: Netlify,
   Vercel, Cloudflare Pages).

### Publishing to the App Store

iOS builds need a Mac with Xcode and an Apple Developer account.

```bash
npm run build && npx cap sync ios && npx cap open ios
```

In Xcode, set your Team under *Signing & Capabilities*, then *Product → Archive* and upload
to App Store Connect / TestFlight. Icons and splash screens are already generated in
`ios/App/App/Assets.xcassets`.

### Changing the icon

Edit the artwork in `scripts/make-icons.mjs` (and `src/components/Logo.tsx` to match), then
run `npm run icons`. That regenerates every Android/iOS icon and splash, plus the web icons.

## How the app works

- **Onboarding.** Target language (Wolof, preselected), then interface language, daily goal
  (10/20/30/50 XP) and an optional name. This creates a local *guest* profile.
- **Path.** 17 units, 47 lessons, 380 words and phrases, plus 4 dialogues. Lesson cards
  unlock one after another. All free in the launch build; with Premium on, units 1–3 are
  free and the rest need Premium.
  1. Greetings · Introductions · Small talk
  2. Numbers 1–10 · Bigger numbers and prices · Thousands and money
  3. Food and drink · At the market · Meals and cooking
  4. Family · Friends and family · Describing people
  5. Everyday verbs · Past, future and feelings · Questions and requests
  6. Around town · Directions · Getting around
  7. Days of the week · Telling time · Plans and seasons
  8. Getting by · Teraanga: guests and meals · Feelings and opinions
  9. The body · At the doctor
  10. Jobs · At school
  11. Around the house · Daily routine
  12. Celebrations · Music and proverbs
- **Lessons.** 12 exercises each, from 10 types: Wolof→meaning, meaning→Wolof, picture
  choice, listening, tap-the-words, fill in the blank, matching pairs, speaking
  (self-checked), typing the Wolof, and typing what you hear. A missed exercise is queued
  again at the end of the lesson. The results screen lists the mistakes.
- **Levels.** Each lesson has 3 levels (`harden()` in `engine.ts`). Level 2 swaps
  recognition for recall, and level 3 makes you type. XP rises 5 per level. Typing
  forgives missing accents or one slip in a longer word, then shows the exact spelling. An
  accent bar adds à é ë ó ñ ŋ.
- **Dialogues.** Units 1, 3, 6 and 8 end with an original dialogue (tap a
  line to hear it, translations optional), followed by comprehension questions. Stories
  unlock when the unit's lessons are done (route `/dialogue/<id>`). In code they are
  still called `story` (the `Story` type and `unit.story`); add one with the `line()` and
  `question()` helpers.
- **Drops** are the lives. You have 5. Each wrong answer in a lesson spills one, and one
  comes back every 30 minutes. Reviews never cost drops and refill one when finished.
- **Streak** is shown as a rising sun. Your first finished session of a day extends it;
  missing a full day resets it, unless you have a **sun shield**. You earn one shield for
  every 7 days in a row (max 2), and it covers one missed day automatically.
- **Daily reminder** (Android/iOS): one local notification at a time you choose, in the
  interface language (`src/lib/native.ts`). The restricted exact-alarm permission is
  removed from the manifest, since a reminder doesn't need to-the-minute timing.
- **Haptics:** vibration on right and wrong answers and on completion, with a toggle in
  Settings. Lesson and story completion also show a short confetti burst, which is
  skipped when reduced motion is on.
- **Spaced repetition** uses Leitner boxes with 0/1/2/4/8/16-day intervals. A miss goes back
  to box 0 and is due again straight away. The Practice tab reviews due cards first, then
  recent mistakes.
- **Achievements** are 12 original badges (First Steps, Teranga Greeter, Counting to Fukk,
  Ceebu Chef, Clear Water, Three Sunrises, Baobab Sprout, Second Look, Long Road,
  Full Teraanga, Third Ring, Keen Ear).
- **Circle** (route `/circle`) is a clearly labelled demo weekly XP ranking with sample
  learners until accounts exist.
- **Accessibility:** colour pairs meet WCAG AA, the body font is Atkinson Hyperlegible, and
  every control works from the keyboard. Number keys pick answers and Enter checks or
  continues. There are ARIA roles and labels, the app follows reduced-motion settings, and
  safe-area insets are respected on notched phones.

## For organisations (NGOs, embassies, field staff)

- **Survival Wolof** (`src/content/survival.ts`): the 100 course words and phrases to
  know first, in 8 themes. A Dictionary filter (🆘) and a Practice-tab drill (`/survival`,
  12 random items per session, no drops spent).
- **Culture and etiquette** (unit 17): greeting the right way, Ramadan and prayer, being a
  good guest.
- **Pocket phrasebook**: the Survival 100 with a pronunciation key and etiquette notes,
  two A4 pages per language. `npx tsx scripts/print/pocket-phrasebook.ts` writes
  `docs/print/pocket-phrasebook-<lang>.html`; open one and print or "Save as PDF".
  Ready-made PDFs are in `docs/print/`.

## Add or extend lessons

Each unit lives in `src/content/units/uN-name.ts` and exports its `entries` and its `unit`.

1. Add vocabulary to the unit's `entries`. Translations go in the order English, French,
   Spanish, German, Italian:
   ```ts
   entry("p.yaay", "yaay", ["mother", "mère", "madre", "Mutter", "madre"], { pic: "👩‍🍼" })
   ```
   `tokens` overrides how a phrase splits into tiles, and `note` (same five-language order)
   adds a tip shown after answering.
2. Add a lesson to the unit's `lessons`: a unique `id`, a `title` and `tip`, the `entries` it
   teaches (used for wrong options), and 8–12 `exercises`:
   ```ts
   { type: "pick_meaning", entry: "p.yaay" }
   { type: "build", entry: "p.phrase", distractors: ["xale", "baay"] }
   { type: "fill_blank", entry: "p.phrase", blank: 1, options: ["yaay", "baay", "xale"] }
   { type: "match", entries: ["p.yaay", "p.baay", "p.xale", "p.mag"] }
   ```
   A new unit is a new file, added to `unitModules` in `src/content/entries.ts`.
3. Run `npm test`. `content.test.ts` fails if a lesson points at a missing entry, an entry
   id is duplicated or never used, a blank isn't among its options, a matching exercise has
   two identical sides, a lesson has fewer than 8 or more than 12 exercises, or a
   translation is missing. New lessons are prerendered automatically by
   `generateStaticParams`.

Have a native Wolof speaker review all content before release. The phrases use
standard CLAD spelling and common Dakar usage, but regional variation is real.

## Add or change translations

- UI strings: `src/i18n/en.ts` is the source of truth. Add the key there, then to `fr`, `es`,
  `de` and `it`. TypeScript and the tests both fail if a dictionary is missing a key.
- Course translations sit on each entry/lesson (`tr`, `title`, `tip`, `note`). Only `en` is
  required by the type; anything missing falls back to English at runtime.
- A new interface language means adding its code to `UI_LANGS` in `content/types.ts`, a
  dictionary in `src/i18n/`, and a line in `LANG_NAMES`/`LANG_FLAGS`.

## Audio and speech

- **AI voice (now):** every word, phrase, dialogue line and phrasebook entry has a clip made
  with [Adia TTS](https://huggingface.co/CONCREE/Adia_TTS) by **CONCREE** (Apache 2.0),
  credited in Settings → About and in [NOTICE](NOTICE). The clips are in
  `public/audio/wo-ai/`; the app doesn't label them in lessons. How they were made,
  their automatic quality check and the lines a native speaker should check first are in
  [docs/audio/ai-voice-report.md](docs/audio/ai-voice-report.md); the generator is in
  [scripts/ai-voice/](scripts/ai-voice/).
- **Native recordings (preferred):** see [docs/audio/README.md](docs/audio/README.md).
  - `npm run audio:script` writes the voice actor's script, with every word, phrase and
    dialogue line and its file name: `docs/audio/recording-script.csv` / `.md`, currently
    505 lines. Only human recordings get a ✓.
  - `npm run audio:import -- <folder>` trims, normalises and converts the files (ffmpeg),
    copies them to `public/audio/wo/` and records them in
    `src/content/audio-manifest.json`. A human recording replaces the AI clip of that line,
    so you can import in batches. (`-- <folder> --ai` imports AI clips instead; it never
    replaces a human recording.)
  - Slow playback uses `playbackRate`. A test checks that every manifest entry has a file.
- **Fallback:** a line with no clip is read by the device's text-to-speech with a French
  voice, the closest spelling-to-sound match, labelled as a computer voice. On Android/iOS
  this uses the native TTS engine (`@capacitor-community/text-to-speech`), because the
  Android WebView has no Web Speech API.
- **Speaking:** exercises are self-checked today. To score pronunciation, implement
  `SpeechChecker` in `src/lib/speech.ts` (for example with a hosted Wolof ASR model) and
  return it from `getSpeechChecker()`. The speak view already calls that interface. Native
  capture will need the `RECORD_AUDIO` permission on Android and `NSMicrophoneUsageDescription`
  on iOS.

## Accounts and cloud sync (Supabase)

Accounts are optional. The app works fully offline, and if a build has no Supabase
settings, account features are hidden.

**How it works**
- **Sign-in:** the learner types an email and receives a 6-digit code. There are no
  passwords and no deep links, so it works the same in the browser and the native apps
  (`src/app/account/page.tsx`).
- **Sync:** `src/lib/account.tsx` syncs on sign-in, when the app returns to the
  foreground, and 3 seconds after any local change. Offline changes sync on the next
  successful round.
- **Merging:** `src/lib/merge.ts` combines the two copies field by field, so progress
  from two devices is never lost:
  - Lessons, dialogues, XP per day, review cards and badges are combined.
  - Profile, settings, drops and the recent-mistakes list come from the most recently
    changed copy.
  - Tests are in `merge.test.ts` and `sync.test.ts`.
- **Backend boundary:** `src/lib/cloud.ts` is the only file that talks to Supabase, so
  the backend can be swapped.
- **Leaving:** signing out keeps progress on the device. *Delete account* removes the
  account and the cloud copy through the `delete-account` Edge Function. *Reset all
  progress* in Settings signs out first, so the cloud copy isn't merged straight back.

**One-time setup**
1. Create a project at [supabase.com](https://supabase.com). Pick an EU region if most
   learners are in Europe (GDPR).
2. Database: run `supabase/migrations/20261030000000_progress.sql`, either in the
   dashboard's SQL editor or with `supabase db push`. It creates the `progress` table with
   row-level security.
3. Authentication → Sign In / Providers → Email: keep it enabled, and set the OTP length
   to **6**.
4. Authentication → Emails → **Magic Link** template: replace the link with the code,
   e.g. `<h2>Your WolofLink code</h2><p>{{ .Token }}</p>`. Without `{{ .Token }}`,
   learners receive a link instead of a code.
5. Authentication → Emails → SMTP: set up a custom SMTP provider (Resend, Postmark,
   Brevo…). Supabase's built-in mailer is limited to a few emails per hour and is only for
   testing.
6. Deploy account deletion: `supabase functions deploy delete-account`. It uses the
   service-role key that Supabase injects on the server.
7. Put the project URL and the anon / publishable key (Project Settings → API) in
   `.env.production`, which is committed because both values are public. For local
   overrides, copy `.env.example` to `.env.local`.
8. Rebuild: `npm run build && npx cap sync`. The values are baked into the build.

## Notifications and paid version

- **Push reminders:** daily reminders already use local notifications. Server-sent push
  (FCM/APNs) would need `@capacitor/push-notifications`.
## Premium (in-app purchases)

> **Switched off in the 0.6 launch build** (`NEXT_PUBLIC_PREMIUM=off`): every unit is free.
> Everything below applies once you set it to `on`.

**What it gives:** units 1–3 (9 lessons and their dialogue) are free. **Premium** unlocks
every unit and dialogue, plus unlimited drops.
- **Gating rules:** `src/lib/premium.ts`, tested in `premium.test.ts`.
- **Screens:** the upgrade screen is `/premium`, and the terms page `/terms` is required by
  the stores for subscriptions.

**How it works:** purchases go through **RevenueCat** (`src/lib/billing.ts`).
- RevenueCat wraps Google Play Billing and StoreKit, validates receipts on its servers, and
  tracks a `premium` entitlement.
- When a learner is signed in, purchases are linked to their account id, so Premium follows
  them to other devices. **Restore purchases** is on the upgrade screen.
- Until a key is configured, the upgrade screen says Premium isn't available yet. On the
  web it's always unavailable.

**One-time setup**
1. **Google Play Console** (once the app is uploaded to a testing track): create a
   subscription `woloflink_premium` with monthly and yearly base plans. Optionally add a
   one-time product `woloflink_premium_lifetime`. Do the same in App Store Connect later.
2. **RevenueCat** (free tier):
   - Create a project and add the Android app (package `app.woloflink.learn`) with its Play
     service-account credentials.
   - Create an entitlement with the id **`premium`** and attach the products.
   - Create a **current offering** with Monthly, Annual and (optionally) Lifetime packages.
3. Put the public SDK keys in `.env.production`:
   `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` (and `_IOS_KEY` later). These keys are meant to
   ship inside apps; never add RevenueCat secret keys.
4. Rebuild, upload to the internal testing track, and buy with a **license-tester** account
   (no real charge).

**Suggested prices:** $4.99/month, $29.99/year, $59 lifetime, with lower local prices for
Senegal and The Gambia (the Play Console can set prices per country).

**Testing builds:** `NEXT_PUBLIC_FREE_UNITS=12 npm run build` makes every unit free in a
local build, so automated tests can play all lessons. Never set it for store builds.

## Brand

- **Name:** WolofLink. Other original options: *Jàng* (learn/read), *Wax* (speak),
  *Teranga Talk*, *Nopp* (ear), *Dégg* (understand/hear). Run a trademark search before
  committing to one.
- **Mark:** two linked speech bubbles (clay and sand) under a small saffron sun, on deep
  indigo. There is no mascot.
- **Palette:** night `#1d2550`, sand `#fbf3e6`, clay `#b9481f`, saffron `#f2a93b`,
  sea `#0f6e72`, dusk `#7a3b69`, berry `#b3261e`.
- **Type:** Bricolage Grotesque for display, Atkinson Hyperlegible for body text.
- **Motifs:** a geometric woven-band pattern on unit banners. Religious and sacred symbols
  are deliberately avoided.

## Product research note

No reverse-engineering or app inspection was done. The REA tool wasn't connected to the
session, and no third-party app was analysed. So there are no SEEN, INFERRED or UNKNOWN
findings to report. The features follow widely used, generic learning-app patterns: lesson
paths, XP, streaks, lives, spaced repetition and mixed exercise types.
