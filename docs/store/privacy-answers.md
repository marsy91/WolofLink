# Store privacy answers (WolofLink 0.3.x)

Keep these in sync with `src/app/privacy/page.tsx` and `SECURITY.md`. They
describe the current offline-only app; revisit them before adding accounts,
analytics, crash reporting, ads or purchases.

## Google Play — Data safety form

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Not applicable (no data is collected or transmitted) |
| Do you provide a way for users to request that their data is deleted? | Data never leaves the device; Settings → Reset all progress or uninstalling deletes it |
| Data shared with third parties | None |
| Privacy policy URL | `https://<your-domain>/privacy/` (the web build's `/privacy` page) |

Notes for reviewers:
- The optional first name and progress are stored only on-device and are never
  transmitted, so under Play's definitions they are not "collected".
- Text-to-speech uses the device's system TTS engine.

Other Play Console declarations:
- **Ads:** No ads.
- **App access:** All functionality is available without login.
- **Target audience:** choose your intended ages. If you include under-13s,
  the Families policy applies (no ads SDKs and no data collection are already
  true today).
- **Content rating questionnaire:** educational; no violence, gambling, user
  interaction or sharing of location.
- **Permissions:** `POST_NOTIFICATIONS` (optional daily reminder),
  `VIBRATE`, `RECEIVE_BOOT_COMPLETED` / `WAKE_LOCK` (re-schedule the reminder
  after a restart). No exact-alarm permission.

## Apple App Store — App Privacy ("nutrition label")

- **Data Not Collected.**
- Privacy policy URL: same as above.
- No tracking (no App Tracking Transparency prompt needed).

## Before you change any of this

Adding any of the following changes the answers above and the privacy policy:
accounts or sign-in, cloud sync, analytics, crash reporting (e.g. Sentry,
Crashlytics), in-app purchases, ads, speech recognition that sends audio to a
server, or a contact/support form.
