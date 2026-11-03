# Store privacy answers

Keep these in sync with `src/app/privacy/page.tsx`, `SECURITY.md` and the build
switches in `.env.production` (README, "Launch configuration").

## Builds with accounts off (0.6–0.9: Premium, accounts and Circle switched off)

This build has no accounts, no purchases, no ads, no analytics and no network
requests for user data: everything stays on the device.

### Google Play — Data safety form

- **Does your app collect or share any of the required user data types?** No.
- **Is all of the user data collected by your app encrypted in transit?** Not
  applicable (no data is collected).
- **Do you provide a way for users to request that their data is deleted?** Not
  applicable; learners can wipe their progress in the app (Settings → Reset all
  progress) or by uninstalling.

Other declarations:
- **Ads:** No.
- **App access:** All functionality is available without special access (no login).
- **Target audience:** 13+ is the simplest choice (the app is suitable for all
  ages, but choosing under-13 audiences triggers the Families policy review).
- **Content rating:** answer "No" to violence, sexual content, profanity, drugs,
  gambling and user interaction; an education app normally gets PEGI 3 / Everyone.
- **Privacy policy URL:** https://woloflink.com/privacy

### Apple App Store — App Privacy

"Data Not Collected".

---

## Builds with accounts on (0.10 and later) and/or Premium on

Use these answers for 0.10 and later (accounts on). Leave out the purchase row while
`NEXT_PUBLIC_PREMIUM` is off.

### Google Play — Data safety form

**Does your app collect or share any of the required user data types?** Yes.

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Personal info → **Email address** | Yes | No | Optional (only if the user creates an account) | Account management |
| App activity → **Other user-generated content / in-app actions** (learning progress, settings) | Yes | No | Optional (only with an account) | App functionality |
| Financial info → **Purchase history** | Yes | No | Optional (only if the user buys Premium) | App functionality (checking the subscription, via RevenueCat) |

- **Encrypted in transit:** Yes (HTTPS to Supabase).
- **Users can request deletion:** Yes, in the app (Profile → Account → Delete
  account). Web link for deletion requests:
  https://woloflink.com/delete-account
- **Data shared with third parties:** None. Supabase is a service provider
  (processor), which Play does not count as sharing.
- **Organisations:** when a learner joins one with a team code, its admins see the
  chosen name and a progress summary (XP, lessons, streak, last active). This is
  sharing with other users the learner chose, not with third parties; the learner
  can leave at any time.
- **Account creation:** "Users can create an account" → method: email with
  one-time code. **Account deletion** is available in the app (required by Play
  since accounts exist).

Other declarations: no ads; all features work without login (App access); the
target-audience and content-rating answers are unchanged.

### Apple App Store — App Privacy

**Data Linked to You** (not used for tracking):
- Contact Info → Email Address — App Functionality
- User Content → Other User Content (learning progress) — App Functionality
- Purchases → Purchase History — App Functionality (only with Premium)

No tracking, so no App Tracking Transparency prompt. Apple requires in-app
account deletion when sign-up exists — implemented (Profile → Account).

## Before you change any of this

Adding analytics, crash reporting, purchases, ads, social features (public
names, friends, leaderboards) or speech recognition that uploads audio changes
these answers and the privacy policy.

## Since 0.13.0 (problem reports, holiday calendar): include these at launch

0.13.0 is the launch build, so add these to Data safety along with the answers above:

- **App activity → Other user-generated content: Collected.** Optional, not
  shared, purpose: App functionality. (The optional note in a problem report.)
- **App info and performance → Other app performance data: Collected.**
  Optional, not shared, purpose: App functionality. (Which word was reported,
  the kind of problem, app version and language.)
- Reports can be sent without an account; they are linked to the account
  when the learner is signed in, and deleted with it (the link is cleared).
- The holiday calendar only downloads public dates; it sends nothing about
  the learner.

## Since 0.17.0 (community voice recordings)

The app now declares the microphone permission, used only on the recording
screen for invited contributors. Add to Data safety:

- **Audio → Voice or sound recordings: Collected.** Optional, not shared with
  third parties, purpose: App functionality. Only from invited contributors
  who accept the recording terms; learners are never recorded.
- Recordings are deleted with the contributor's account, or on request
  (support@woloflink.com).
- The automatic check runs in the owner's GitHub Actions account; it reads the
  clip and writes the result back, and keeps nothing.

## Since 0.18.0 (friends)

- **Personal info → Name: Collected** (already declared for accounts). The
  friend display name is shown only to people who exchanged codes with the
  learner; optional; purpose: App functionality.
- **App activity → Other actions** (weekly XP, streak, last practice shown to
  friends): already collected for sync; now also shown to friends. Not shared
  with third parties.
- No public profiles, no search, no messaging between users (nudges only).

## Since 0.21.0 (friend notifications)

- **Device or other IDs: Collected** (the push token) when the learner turns on
  friend notifications. Optional; purpose: App functionality. Shared with
  Google (Firebase Cloud Messaging) only to deliver the notification, as a
  service provider.
- The retention numbers in the owner console are totals from data already
  collected for sync; nothing new is collected for them.

## Since 0.23.0 (team roles, announcements, remote switches)

- **Nothing new is collected from learners.** Team members the owner invites
  (admin, support, reviewer, analyst) can see, depending on role, data that is
  already declared (account email, progress, reports). They work for WolofLink
  under a confidentiality agreement, so Google does not count this as sharing.
- Announcements and remote switches are read by the app without an account and
  contain no personal data.
- Approval requests store the team member who asked, the account or
  organisation concerned and a short reason; they stay in the private console.

## Since 0.23.0 (optional Supporter subscription)

Only when `NEXT_PUBLIC_SUPPORTER=on` ships (docs/sales/supporter-setup.md):

- **Financial info → Purchase history: Collected.** Not shared with third
  parties except RevenueCat, our service provider, which checks the
  subscription; optional; purpose: App functionality.
- **Device or other IDs** (already declared for notifications): RevenueCat
  also receives an anonymous app user ID, or the account ID when signed in.
- Play Console → App content → store listing: **In-app purchases: Yes.** Contains
  ads: No.
- Payments are processed by Google Play; the app never sees card details.
