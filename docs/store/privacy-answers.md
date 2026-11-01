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

## Update for 1.1 (problem reports, holiday calendar)

When the 1.1 build with "Report a problem" ships, update Data safety:

- **App activity → Other user-generated content: Collected.** Optional, not
  shared, purpose: App functionality. (The optional note in a problem report.)
- **App info and performance → Other app performance data: Collected.**
  Optional, not shared, purpose: App functionality. (Which word was reported,
  the kind of problem, app version and language.)
- Reports can be sent without an account; they are linked to the account
  when the learner is signed in, and deleted with it (the link is cleared).
- The holiday calendar only downloads public dates; it sends nothing about
  the learner.
