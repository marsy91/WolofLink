# WolofLink

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
   a feature graphic and screenshots. The Data safety form is short: progress stays on the
   device, nothing is collected or shared.

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
- **Path.** 8 units with 2 lessons each (16 lessons, 163 words and phrases). Lesson
  cards unlock one after another:
  1. Greetings · Introductions
  2. Numbers 1–10 · Bigger numbers and prices
  3. Food and drink · At the market
  4. Family · Friends and family
  5. Everyday verbs · Past, future and feelings
  6. Around town · Directions
  7. Days of the week · Telling time
  8. Getting by · Teraanga: guests and meals
- **Lessons.** 12 exercises each, from 10 types: Wolof→meaning, meaning→Wolof, picture
  choice, listening, tap-the-words, fill in the blank, matching pairs, speaking
  (self-checked), typing the Wolof, and typing what you hear. A missed exercise is queued
  again at the end of the lesson. The results screen lists the mistakes.
- **Levels.** Each lesson has 3 levels (`harden()` in `engine.ts`). Level 2 swaps
  recognition for recall, and level 3 makes you type. XP rises 5 per level. Typing
  forgives missing accents or one slip in a longer word, then shows the exact spelling. An
  accent bar adds à é ë ó ñ ŋ.
- **Stories.** Units 1, 3, 6 and 8 end with an original dialogue (tap a
  line to hear it, translations optional), followed by comprehension questions. Stories
  unlock when the unit's lessons are done. Add one by giving a unit a `story` (see the
  `line()` and `question()` helpers).
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
  Full Teraanga, Third Ring, Storyteller).
- **League** is a clearly labelled demo with sample learners until accounts exist.
- **Accessibility:** colour pairs meet WCAG AA, the body font is Atkinson Hyperlegible, and
  every control works from the keyboard. Number keys pick answers and Enter checks or
  continues. There are ARIA roles and labels, the app follows reduced-motion settings, and
  safe-area insets are respected on notched phones.

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

- **Now:** no mainstream text-to-speech engine has a Wolof voice, so `audio.ts` reads Wolof
  with a French voice, the closest spelling-to-sound match. The UI labels this as a
  computer voice. On Android/iOS it uses the native TTS engine
  (`@capacitor-community/text-to-speech`), because the Android WebView has no Web Speech API.
- **Next:** record native speakers. Save files as `public/audio/wo/<entry-id>.mp3` (mono,
  44.1 kHz, about 64 kbps) and add `audio: "audio/wo/<entry-id>.mp3"` to each entry. Recorded
  clips take priority automatically, and slow playback uses `playbackRate`.
- **Speaking:** exercises are self-checked today. To score pronunciation, implement
  `SpeechChecker` in `src/lib/speech.ts` (for example with a hosted Wolof ASR model) and
  return it from `getSpeechChecker()`. The speak view already calls that interface. Native
  capture will need the `RECORD_AUDIO` permission on Android and `NSMicrophoneUsageDescription`
  on iOS.

## Accounts, sync and notifications later

- **Auth and cloud sync:** implement `ProgressRepo` (`load`/`save`/`clear`) against
  Supabase or Firebase, and pass it to `<StoreProvider repo={…}>`. `Profile.guest` is where
  linking a guest to a cloud account happens. All game rules are pure functions in
  `progress.ts`, so the server can reuse them.
- **Push reminders:** add `@capacitor/local-notifications` (works offline) or
  `@capacitor/push-notifications` with FCM/APNs. Streak and daily-goal data are already in
  `progress.ts`.
- **Paid version:** keep free content as it is, and gate extra units behind an entitlement
  check in `isUnlocked`, for example with RevenueCat or Google Play Billing / StoreKit.

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
