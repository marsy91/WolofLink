# Google Play Console: answer sheet (WolofLink 0.26.4)

Follow it top to bottom. Screen names can differ slightly from what Google shows today; the
meaning is the same. Everything below matches the 0.26.4 build: accounts **on**, friend notifications **on**,
Supporter and Premium **off**, "nearby" **off** in the owner console. If you switch Supporter
or "nearby" on later, use the matching part of `privacy-answers.md` and update Data safety
**before** switching it on.

Do this on a **laptop**: Play Console is awkward on a phone.

---

## 0. Before you start

- **Account type.** A *personal* account must run a **closed test with at least 12 testers for
  14 days in a row** before it can publish. An *organisation* account (needs a D-U-N-S number)
  usually skips that. Pick personal unless you have a registered company. The console shows
  the current number, which Google may change.
- Have ready: a government ID, a card for the one-off $25 fee, a phone and an email you can
  verify, and the file **WolofLink-0.26.4.aab**.
- Developer name shown on the store: **WolofLink** (or your name).

## 1. Create the app (Home → Create app)

| Field | Answer |
|---|---|
| App name | WolofLink: Learn Wolof |
| Default language | English (United Kingdom) en-GB |
| App or game | App |
| Free or paid | **Free** (it cannot be changed to paid later; optional purchases inside the app are still possible) |
| Declarations | Tick the Developer Program Policies and US export laws boxes |

## 2. "Set up your app" tasks (Dashboard), with the answers

1. **Privacy policy:** `https://woloflink.com/privacy`
2. **App access:** choose **"All or some functionality is restricted"**, then add one instruction:
   > The whole learning experience (lessons, dialogues, role-play, dictionary, practice,
   > hands-free listening, Survival Wolof, holidays calendar, feedback form) works with no
   > account and no login. Optional features use an optional account with an emailed one-time
   > code: friends, duels, city leagues for adults, team codes for organisations, and voice
   > recording for native speakers we invite. They are not needed to review the app.

   If Google asks for test login details, send me what it says and we'll work out the right way.
3. **Ads:** **No**, the app contains no ads.
4. **Content rating:** start the questionnaire, email `support@woloflink.com`, category
   **"Reference, news or educational"**. Answers:
   - Violence, sexual content, profanity, drugs, gambling, fear: **No** to everything.
   - Users can interact or exchange content: **Yes**. Friend codes and QR codes, friend
     requests, duels and 👋 nudges, display names chosen by users, and city leagues where
     **adults** (self-confirmed 18+) see each other's display names. No free-text chat
     between users. Block and report are in the app; reports reach the owner console.
   - Shares the user's location: **No** (a city is picked from a list; no GPS).
   - Digital purchases: **No** (for now). Unrestricted internet access: **No**.
   - Expected result: Everyone / PEGI 3 with a "Users interact" note.
5. **Target audience and content:**
   - Age groups: **13–15, 16–17, 18 and over**. Do not tick anything under 13.
   - "Does your app appeal to children?": **No**.
   - Ticking under-13 would trigger the Families policy, which the app isn't built for
     (accounts, friends, leagues and recordings). Teenagers can use the app; the safety
     rules already in place: leagues and friend requests between strangers are adults-only,
     under-18s add friends only in person (code or QR), social handles are adults-only and
     never shown to under-18s, and anyone reported as under 18 is hidden until reviewed.
6. **Data safety:** see section 4.
7. **Government apps:** No. **Financial features:** none. **Health:** none of the options. **News app:** No.
8. **Advertising ID:** the app does **not** use it. Answer **No**.
9. **Select an app category and provide contact details** (Store settings):
   - Category: **Education**. Tags: Language learning, Education.
   - Email `support@woloflink.com`, website `https://woloflink.com`. Phone is optional.

## 3. Main store listing (Grow → Store presence → Main store listing)

Copy the texts from **`docs/store/listing.md`**, in all five languages (add French, Spanish,
German and Italian under "Translations"; they fit the length limits).

- **App icon:** `public/icon-512.png` (512×512)
- **Feature graphic:** `docs/store/feature-graphic.png` (1024×500)
- **Phone screenshots:** upload all 8 from `docs/store/screenshots/` (1080×1920); at least 2 are required
- Leave tablet and Chromebook screenshots empty.

## 4. Data safety (App content → Data safety)

**Does your app collect or share any of the required user data types?** → **Yes**
**Is all of the user data collected by your app encrypted in transit?** → **Yes** (HTTPS)
**Do you provide a way for users to request that their data is deleted?** → **Yes**
**Account deletion link:** `https://woloflink.com/delete-account` (also in the app: Profile → Account → Delete account).
⚠️ That web page must be live before you submit; Google opens it.
**Account creation:** users can create an account → method **email with a one-time code**.

For every row: **Shared: No** (Supabase and Firebase work on our behalf as service providers,
which Google does not count as sharing) · **Processed ephemerally: No** · **Optional**
(nothing below is required to use the app).

| Category → data type | What it is in WolofLink | Purposes to tick |
|---|---|---|
| Personal info → **Name** | Display name shown to friends, team admins and (adults only) city leagues; credit name for voice contributors | App functionality |
| Personal info → **Email address** | Account email; shown to the owner with feedback only if the learner ticks "you can reply to me" | Account management, Developer communications |
| Personal info → **Other info** | Home city picked from a list, friend requests, blocks, reports about other users | App functionality; Fraud prevention, security, and compliance |
| App activity → **App interactions** | Progress, XP, streak, duels, crowns and trophies, words seen in duels | App functionality |
| App activity → **Other user-generated content** | Notes in problem reports; feedback messages and star ratings | App functionality |
| App info and performance → **Other app performance data** | App version, app language, which word was reported, which screen feedback came from | App functionality |
| Audio → **Voice or sound recordings** | Only native speakers we invite who accept the recording terms; learners are never recorded | App functionality |
| Device or other IDs | Push token, only if friend notifications are turned on | App functionality |
| App activity → **Other actions** *(only if the form asks separately)* | Wrong friend-code attempts, counted for one day to stop guessing | Fraud prevention, security, and compliance |

**Not collected:** location (the city is chosen from a list), contacts, photos and videos, files,
calendar, messages, health, web browsing, financial info, advertising ID.

Things that stay on the phone and are therefore **not collected** in Google's sense:
- **Camera:** only used to scan a friend's QR code; frames are never saved or uploaded.
- **Microphone in speaking exercises:** the learner's voice is played back on the phone next to
  the model and then thrown away; it is never uploaded.
- **Offline feedback queue:** messages wait in local storage until they can be sent.

**Do not** tick "Financial info → Purchase history" until Supporter is switched on.

Security practices: encrypted in transit **Yes**; users can request deletion **Yes**;
independent security review **No**; committed to the Families policy **No**.

### Permissions Google will ask about
| Permission | Answer |
|---|---|
| Microphone (`RECORD_AUDIO`) | Speaking exercises (on-device only) and recording by invited voice contributors |
| Camera | Scanning a friend's QR code; optional, asked only when tapping Scan |
| Notifications | Friend notifications (duels, nudges); asked only when turned on |

## 5. Create the closed test (Test and release → Testing → Closed testing)

1. **Create track** → name it "Testers" (or use the default). 
2. **Countries:** add the United Kingdom, France, Senegal, the Gambia, Mauritania and anywhere your testers live.
3. **Testers → Create email list** → paste at least **12 Gmail addresses** (Google accounts only;
   friends and family with Android phones are fine) → save. Tick the list.
4. Note the **opt-in link** (Testers tab → "Copy link"). Send it to every tester. **Each one must
   open it, tap "Become a tester", and install the app from the Play Store.** The 14-day clock needs
   them opted in and staying opted in.
5. **Create new release** → accept **Play App Signing** → upload **WolofLink-0.26.4.aab**.
6. Release name: `0.26.4`. Release notes (paste):

   ```
   <en-GB>
   First test release of WolofLink: Wolof lessons with audio, dialogues and role-play,
   dictionary, Survival Wolof, Senegal holidays, friends and duels. Please tell us what
   to fix: Profile → Send feedback, or "Report a problem" on any word.
   </en-GB>
   <fr-FR>
   Première version de test de WolofLink : leçons de wolof avec audio, dialogues et jeux de
   rôle, dictionnaire, Wolof de survie, fêtes du Sénégal, amis et duels. Dites-nous ce qu'il
   faut corriger : Profil → Donner votre avis, ou « Signaler un problème » sur un mot.
   </fr-FR>
   ```
7. **Review release → Start rollout to closed testing.** Google reviews it first (hours to a
   few days). Fix anything the console flags (usually a missing section in step 2).
8. Check the **Pre-launch report** a day later (Testing → Pre-launch report) for crashes.

## 6. After 14 days: apply for production

Dashboard → **Apply for production** asks a few questions. Suggested answers (edit to be true):

- **How did you recruit testers?** Friends, family and language learners, plus people who
  work or travel in Senegal.
- **How did testers engage?** They completed lessons, used the dictionary, practised
  duels, and reported mistakes in the Wolof through the in-app "Report a problem" button.
- **What did you change from feedback?** (List 2–3 real fixes, for example spelling
  corrections from the native-speaker review.)
- **Is the app ready for production?** Yes: reviewed by native speakers, privacy policy and
  data safety complete, no ads.

Then create a **Production** release with the final .aab (higher version number), choose
countries, and roll out. Free apps are available in Senegal automatically if you add it.

## 7. Things Google often rejects

- A **privacy policy** that doesn't match Data safety. Yours is aligned; keep both in step.
- A **missing account-deletion link**. The address is in section 4; make sure the page is live.
- **Data safety that misses a feature.** Before switching on "nearby", Supporter or anything
  new in the owner console, update section 4 first.
- **Screenshots that aren't of the app.** All 8 are real screens. Retake them if the design
  changes before production, so the store matches the app.
- **Claims** such as "native-speaker audio" before it's true. The listing says it isn't, and the
  voices only become real recordings as invited speakers record them.
