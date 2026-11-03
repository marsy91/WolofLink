# Google Play Console: answer sheet (WolofLink 0.22.0)

Follow it top to bottom. Screen names can differ slightly from what Google shows today; the
meaning is the same. Everything below matches the app as built (Supporter switched off).
If you later switch Supporter on, use the "Since 0.23.0" part of `privacy-answers.md`.

Do this on a **laptop**: Play Console is awkward on a phone.

---

## 0. Before you start

- **Account type.** A *personal* account must run a **closed test with at least 12 testers for
  14 days in a row** before it can publish. An *organisation* account (needs a D-U-N-S number)
  usually skips that. Pick personal unless you have a registered company. The console shows
  the current number, which Google may change.
- Have ready: a government ID, a card for the one-off $25 fee, a phone and an email you can
  verify, and the file **WolofLink-0.22.0.aab**.
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
   > The whole learning experience (lessons, dialogues, dictionary, practice, Survival Wolof,
   > holidays calendar) works with no account and no login. Optional features use an optional
   > account with an emailed one-time code: Friends, duels, team codes for organisations, and
   > voice recording for native speakers we invite. They are not needed to review the app.

   If Google asks for test login details, send me what it says and we'll work out the right way.
3. **Ads:** **No**, the app contains no ads.
4. **Content rating:** start the questionnaire, email `support@woloflink.com`, category
   **"Reference, news or educational"**. Answers:
   - Violence, sexual content, profanity, drugs, gambling, fear: **No** to everything.
   - Users can interact or exchange content: **Yes** (friend codes, duels and 👋 nudges; names
     chosen by users; no free-text chat). Shares location: **No**. Digital purchases: **No** (for now).
   - Expected result: Everyone / PEGI 3 with a "users interact" note.
5. **Target audience and content:**
   - Age groups: **13–15, 16–17, 18 and over**. Do not tick anything under 13.
   - "Does your app appeal to children?": **No**.
   - Ticking under-13 would trigger the Families policy, which the app isn't built for
     (accounts, friends and recordings).
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
**Is all of the user data collected by your app encrypted in transit?** → **Yes**
**Do you provide a way for users to request that their data is deleted?** → **Yes**
**Account deletion link:** `https://woloflink.com/delete-account` (also in the app: Profile → Account → Delete account)
**Account creation:** users can create an account → method **email with a one-time code**.

For every row: **Shared: No** (Supabase and Firebase work on our behalf as service providers,
which Google does not count as sharing) · **Processed ephemerally: No**.

| Category → type | Optional? | Why |
|---|---|---|
| Personal info → **Email address** | Optional (only with an account) | Account management |
| Personal info → **Name** (display name shown to friends and team admins, and credit name for voice contributors) | Optional | App functionality |
| App activity → **App interactions** (progress, XP, streak, duels, trophies) | Optional (only with an account) | App functionality |
| App activity → **Other user-generated content** (notes in problem reports) | Optional | App functionality |
| App info and performance → **Other app performance data** (which word was reported, app version and language) | Optional | App functionality |
| Audio → **Voice or sound recordings** (only native speakers we invite; learners are never recorded) | Optional | App functionality |
| Device or other IDs (the push token, only if friend notifications are turned on) | Optional | App functionality |

Not collected: location, contacts, photos, files, calendar, messages, health, web browsing,
financial info, advertising data. **Do not** tick "Financial info → Purchase history" until
Supporter is switched on.

Security practices: encrypted in transit **Yes**; deletion **Yes**; independent security
review **No**; committed to the Families policy **No**.

## 5. Create the closed test (Test and release → Testing → Closed testing)

1. **Create track** → name it "Testers" (or use the default). 
2. **Countries:** add the United Kingdom, France, Senegal and anywhere your testers live.
3. **Testers → Create email list** → paste at least **12 Gmail addresses** (Google accounts only;
   friends and family with Android phones are fine) → save. Tick the list.
4. Note the **opt-in link** (Testers tab → "Copy link"). Send it to every tester. **Each one must
   open it, tap "Become a tester", and install the app from the Play Store.** The 14-day clock needs
   them opted in and staying opted in.
5. **Create new release** → accept **Play App Signing** → upload **WolofLink-0.22.0.aab**.
6. Release name: `0.22.0`. Release notes (paste):

   ```
   <en-GB>
   First test release of WolofLink: 20 units of Wolof, audio for every line, dictionary,
   Survival Wolof, Senegal holidays, friends and duels. Please try it and tell us what
   to fix: use "Report a problem" on any word.
   </en-GB>
   <fr-FR>
   Première version de test de WolofLink : 20 unités de wolof, audio pour chaque phrase,
   dictionnaire, Wolof de survie, fêtes du Sénégal, amis et duels. Dites-nous ce qu'il faut
   corriger avec « Signaler un problème » sur n'importe quel mot.
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
- A **missing account-deletion link**. Provided.
- **Screenshots that aren't of the app.** All 8 are real screens.
- **Claims** such as "native-speaker audio" before it's true. The listing says it isn't, and the
  voices only become real recordings as invited speakers record them.
