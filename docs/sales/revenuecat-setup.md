# RevenueCat: WolofLink Pro (paywall, Customer Center, test store)

How purchases work in the app, and the one-time setup in Google Play and RevenueCat.
The app checks one entitlement, **`woloflink_pro`**, sold as three products:

| Product ID | Type | RevenueCat package |
|---|---|---|
| `monthly` | Subscription, monthly base plan | Monthly (`$rc_monthly`) |
| `yearly` | Subscription, yearly base plan | Annual (`$rc_annual`) |
| `lifetime` | One-time purchase (in-app product) | Lifetime (`$rc_lifetime`) |

What Pro unlocks depends on the build switch in `.env.production`: `NEXT_PUBLIC_PREMIUM=on`
(paid units and dialogues) or `NEXT_PUBLIC_SUPPORTER=on` (everything stays free; badge and
unlimited drops). Both read the same entitlement. With both off, the store code never loads.

## How it is built (for whoever maintains the code)

WolofLink is a web app inside a Capacitor Android shell. RevenueCat's **native Android SDK**
(`com.revenuecat.purchases:purchases`, Kotlin) runs inside the app through two official
Capacitor plugins:

- `@revenuecat/purchases-capacitor`: configure, customer info, offerings, purchase, restore.
- `@revenuecat/purchases-capacitor-ui`: the RevenueCat **Paywall** and **Customer Center**
  (native Jetpack Compose screens).

`android/app/build.gradle` pins the native SDK to **11.2.1** (`purchases` and `purchases-ui`);
the plugins are compiled against 11.0.x and Gradle resolves the higher version. There is no
separate Kotlin setup in `MainActivity`: the SDK must be configured **once**, and the plugin
does that. Configuring it again in Kotlin would create two clients fighting over the same
purchases.

The code is in `src/lib/billing.ts` (store calls, error handling, entitlement check),
`src/lib/premium-context.tsx` (app-wide Pro state, offline cache) and
`src/app/premium/page.tsx` (the screen). Practices it follows:

- **Configure once, lazily:** the SDK is configured the first time anything needs the store.
- **Identify with the account:** `logIn(userId)` when the learner signs in, `logOut()` when
  they sign out, so Pro follows them to a new phone. Anonymous otherwise.
- **Entitlements, not products:** the app only asks "is `woloflink_pro` active?", so prices,
  products and offers can change in the dashboard without an app update.
- **Offerings, not hard-coded IDs:** plans come from the *current offering*; the paywall is
  the one attached to it in the dashboard.
- **Live updates:** a customer-info listener switches Pro on or off as soon as RevenueCat knows
  (renewal, refund, expiry), and the last status is cached for offline use.
- **Errors:** cancel is never shown as an error. Pending payments (cash or slow cards, common
  in Senegal) say "waiting for approval". Network, store, "already owned" and "not allowed"
  each get a clear message. Nothing is charged on failure.
- **Customer Center** for subscribers: manage, cancel, restore or ask for help, without
  leaving the app. If it can't open, the app points to Google Play subscriptions.
- **Fallback:** if the paywall can't open (none configured, or offline), the screen shows the
  app's own plan list with the same products.

## 1. Google Play Console (merchant account first, it takes days)

1. **Setup → Payments profile:** create the merchant account (name, address, bank, tax).
2. **Monetize with Play → Products → Subscriptions → Create subscription:**
   - Product ID **`monthly`**, base plan *Monthly*, auto-renewing, grace period on. Activate.
   - Product ID **`yearly`**, base plan *Yearly*, auto-renewing, grace period on. Activate.
3. **Monetize with Play → Products → In-app products → Create product:**
   Product ID **`lifetime`**, a one-time purchase. Activate.
4. **Setup → License testing:** add your Gmail and your testers, to buy without being charged.

## 2. RevenueCat dashboard (app.revenuecat.com)

1. Project "WolofLink", **Android app** `app.woloflink.learn`, connected to Google Play with a
   service account (RevenueCat shows the steps). The service-account key is uploaded **in
   RevenueCat only**; it is secret, never send it to anyone or put it in the code.
2. **Product catalog → Products:** import `monthly`, `yearly` and `lifetime`.
3. **Entitlements:** create **`woloflink_pro`** (exactly this name) and attach all three.
4. **Offerings:** the **default** offering, made *current*, with three packages:
   Monthly → `monthly`, Annual → `yearly`, Lifetime → `lifetime`.
5. **Paywalls:** build a paywall for the default offering (pick a template, add the WolofLink
   colours, translate it into French, Spanish, German and Italian), then publish it.
   Without a published paywall the app falls back to its own plan list.
6. **Customer Center:** turn it on (Tools → Customer Center) and set the support email
   `support@woloflink.com`. Optional: a "Why are you cancelling?" survey.
7. **API keys:** copy the **public Google Play key** (`goog_…`). It is safe to give to Claude;
   it goes in `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY`.

The **Test Store** (already set up: key `test_MncDhbZXedQHjyYlxrwMoCJxAuU`) mirrors these
products with simulated purchases. Add the same `monthly`, `yearly`, `lifetime` products,
entitlement and offering under the Test Store app so the test build matches.

## 3. Testing with the Test Store (no Google Play needed, no money)

RevenueCat **crashes release builds on purpose** when they use a test key, Google Play
testing tracks included. So the test key is only for a **debug APK** sent directly:

```
NEXT_PUBLIC_REVENUECAT_TEST_STORE=on   # only for this build
NEXT_PUBLIC_SUPPORTER=on               # or NEXT_PUBLIC_PREMIUM=on
npm run build && npx cap sync android && (cd android && ./gradlew assembleDebug)
```

A purchase opens a RevenueCat test dialog with "successful / failed / cancel" buttons. Test
subscriptions renew every few minutes (a month ≈ 5 minutes), five times, then expire, which is
handy for checking renewals and expiry. A test in `src/lib/billing.test.ts` fails if
`.env.production` ever ships with the switch on.

## 4. Going live (Claude does the code part)

Send Claude the `goog_…` key and say which model to switch on (Premium or Supporter).
Claude sets the key and switch, builds the signed bundle, and updates:

- **Data safety:** Financial info → Purchase history (collected, not shared, app functionality;
  RevenueCat is a service provider). `docs/store/privacy-answers.md`.
- **Store listing:** In-app purchases: **Yes**.
- The in-app terms and privacy pages, which already describe RevenueCat.

Then test with a licence-tester Gmail on the Play internal test track: buy, see Pro switch on,
open **Manage subscription** (Customer Center), restore on a second phone.
