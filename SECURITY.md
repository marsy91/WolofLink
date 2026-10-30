# Security policy

## Reporting a vulnerability

Please report security problems **privately** to the repository owner via
GitHub (a private security advisory on this repository, or a direct message).
Do not open a public issue. Include steps to reproduce and the app version
(Settings → About). We aim to acknowledge reports within 5 working days.

## What the app does today

- No analytics and no advertising SDKs.
- Without an account, progress, an optional first name and settings are stored
  only on the device (`localStorage` inside the app's private WebView storage).
- **Optional accounts (Supabase):** sign-in uses one-time email codes, so there
  are no passwords to leak. The only table, `progress`, has row-level security
  so each user can read and write only their own row (`supabase/migrations`);
  `anon` has no access. Account deletion runs in an Edge Function that verifies
  the caller's own token before using the service-role key, which never leaves
  Supabase (`supabase/functions/delete-account`).
- The app ships only the public URL and anon (publishable) key.
- Auth sessions are kept in the app's private WebView storage. Moving them to
  the OS keystore (Keychain / Android Keystore via a secure-storage plugin) is
  a planned hardening step; until then, a rooted/jailbroken device could read
  the session token of its own user.
- Android permissions: `INTERNET` (Capacitor default; the app works offline),
  `VIBRATE` (haptics), `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` and
  `WAKE_LOCK` (the optional daily reminder). The restricted
  `SCHEDULE_EXACT_ALARM` permission is explicitly removed.
- Release builds are minified, obfuscated and resource-shrunk (R8).

## Rules for contributors

1. **No secrets in the app.** Anything in `src/`, `public/` or the native
   projects ships to users and can be extracted. API keys, service-role keys
   and signing material belong on a server or in CI secrets.
2. **Signing keys stay offline.** `android/keystore.properties`, `*.jks` and
   `*.keystore` are git-ignored. Back up the upload key in two safe places and
   enrol in Google Play App Signing.
3. **Premium content and purchase checks live on the server** once a paid tier
   exists. Never gate paid features only in client code.
4. **Backend rules:** every new table gets row-level security before it is
   used; never expose the service-role key to the client; keep size limits and
   type checks in the database (see the `progress` constraints); add Play
   Integrity / App Attest checks before any endpoint that grants value
   (purchases, leaderboards).
5. **Dependencies:** run `npm audit` before each release and keep Dependabot
   and GitHub secret scanning enabled on the repository.
6. **Access:** two-factor authentication on GitHub, Google Play Console, App
   Store Connect and any backend; review collaborators regularly.
