# Store privacy answers (WolofLink 0.5.x, with optional accounts and Premium)

Keep these in sync with `src/app/privacy/page.tsx` and `SECURITY.md`.
If a build ships **without** Supabase configured (no `.env.local`), accounts are
hidden and the 0.3.x answers apply instead: "No data collected".

## Google Play — Data safety form

**Does your app collect or share any of the required user data types?** Yes.

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Personal info → **Email address** | Yes | No | Optional (only if the user creates an account) | Account management |
| App activity → **Other user-generated content / in-app actions** (learning progress, settings) | Yes | No | Optional (only with an account) | App functionality |
| Financial info → **Purchase history** | Yes | No | Optional (only if the user buys Premium) | App functionality (checking the subscription, via RevenueCat) |

- **Encrypted in transit:** Yes (HTTPS to Supabase).
- **Users can request deletion:** Yes, in the app (Profile → Account → Delete
  account). Google also requires a **web link** for deletion requests: point it
  to a page that explains the in-app option and offers a contact address.
- **Data shared with third parties:** None. Supabase is a service provider
  (processor), which Play does not count as sharing.
- **Account creation:** "Users can create an account" → method: email with
  one-time code. **Account deletion** is available in the app (required by Play
  since accounts exist).

Other declarations: no ads; all features work without login (App access); the
target-audience and content-rating answers are unchanged.

## Apple App Store — App Privacy

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
