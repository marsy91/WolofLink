# iOS: getting through App Review

What the code already handles, and the steps only the owner can do.

## In the app already
- **Microphone and camera text** (`ios/App/App/Info.plist`): shown when iOS asks for permission.
  Without it the app crashes the first time someone records.
- **Encryption answer** (`ITSAppUsesNonExemptEncryption = false`): the app only uses standard
  HTTPS, so App Store Connect stops asking about export compliance on every upload.
- **Privacy manifest** (`ios/App/App/PrivacyInfo.xcprivacy`): no tracking; email, user ID,
  display name, learning progress and (for invited recorders only) voice recordings, all for app
  functionality. Keep it in step with the App Privacy answers in App Store Connect.
- **Account deletion** (Profile → Account → Delete account) and **report / block** on other
  learners.

## Push on iPhone (off until you do this)
Friend push is sent through Firebase, so iPhones need the Firebase setup too.
`NEXT_PUBLIC_PUSH_IOS` stays `off` until all of these are done; Android push is not affected.
1. Apple Developer → Keys → create an **APNs key** and upload it in Firebase → Project
   settings → Cloud Messaging → Apple app configuration.
2. Firebase → add an **iOS app** with bundle ID `app.woloflink.learn` and put
   `GoogleService-Info.plist` in `ios/App/App/` (add it to the App target in Xcode).
3. Xcode → App target → Signing & Capabilities → add **Push Notifications** (and Background
   Modes → Remote notifications if you want silent pushes).
4. Add the Firebase Messaging pod and pass the APNs token to Firebase, so the app gets an FCM
   token (the Capacitor plugin on its own returns the raw APNs token, which Firebase can't use).
   The `AppDelegate.swift` forwarding is already in place.
5. Set `NEXT_PUBLIC_PUSH_IOS=on` and test on a real iPhone through TestFlight.

## App Review login
Reviewers can't read the emailed sign-in code, so give them one fixed account.
1. Supabase → Authentication → Users → **Add user**, with an email you control (for example
   `appreview@woloflink.com`), "Auto confirm" ticked, and a password of **exactly 8 digits**
   (the code box only takes 8 digits). Give it no staff role and no organisation.
2. Set `NEXT_PUBLIC_REVIEW_EMAIL` to that email in `.env.production` and build.
3. In App Store Connect → App Review Information → Sign-in required: the email, and the 8 digits
   as the password. Add a note: "Enter the email, tap Send code (no email is sent for this
   account), then type the 8-digit password in the code box."

The same account works for Google Play's "App access" form.
Change the password after each review if you like; the code doesn't need to change.
