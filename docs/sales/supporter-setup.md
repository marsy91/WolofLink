# Supporter option: setup (about 45 minutes, one time)

Everything in WolofLink stays free. **Supporters** pay an optional subscription and get a
💛 badge, unlimited drops, and the good feeling of paying for native-speaker recordings and
new content. The code is built and switched **off** until the steps below are done.

Suggested prices (change freely): **£2.99 a month**, **£19.99 a year**.
Google keeps 15% of subscription revenue (under $1M a year). RevenueCat is free until about
$2,500 a month of revenue, then about 1%.

## 1. Google Play Console

1. **Set up payments:** Play Console → **Setup → Payments profile** (a merchant account: your
   name or company, address, bank account for payouts, tax details). Google verifies it,
   which can take a few days. Start this first.
2. Upload a release first. Subscriptions can only be created for an app that has uploaded a
   bundle containing the billing permission. The 0.22.0 bundle already has it
   (`com.android.vending.BILLING`).
3. **Monetize with Play → Products → Subscriptions → Create subscription:**
   - Product ID `supporter_monthly`, name "Supporter (monthly)", add a base plan: **Monthly**,
     auto-renewing, price £2.99, grace period on. Activate it.
   - Product ID `supporter_annual`, name "Supporter (yearly)", base plan **Yearly**, £19.99. Activate it.
   - Description to show buyers: "Keeps WolofLink free for everyone. You get a Supporter
     badge and unlimited drops."
4. **Licence testers:** Setup → **License testing** → add your own Gmail, so you can test a
   purchase without being charged.

## 2. RevenueCat (app.revenuecat.com, free account)

1. Create a project "WolofLink". Add an **Android app** with package name `app.woloflink.learn`.
2. Connect it to Google Play: RevenueCat shows steps to create a **service account** in Google
   Cloud and give it access in Play Console (Users and permissions). You upload that service
   account key **in RevenueCat's dashboard**. It is a secret: don't send it to Claude.
3. **Products:** add `supporter_monthly` and `supporter_annual`.
4. **Entitlements:** create one called exactly **`premium`** and attach both products. (The app
   checks this entitlement name.)
5. **Offerings:** open the **default** offering, add two packages: **Monthly** ($rc_monthly)
   with `supporter_monthly`, and **Annual** ($rc_annual) with `supporter_annual`. Make it
   the current offering.
6. **API keys:** copy the **public Android SDK key** (starts with `goog_`). It is meant to
   be inside the app, so it is safe to send to Claude.

## 3. Switch it on (Claude does this)

Send Claude the `goog_…` key and say "turn on Supporter". Claude sets, in `.env.production`:

```
NEXT_PUBLIC_SUPPORTER=on
NEXT_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…
```

builds a new signed bundle, and updates the store listing and Data safety answers.

## 4. Before you publish that release

- **Play Console → Data safety:** add **Financial info → Purchase history** (collected,
  not shared; purpose: app functionality; RevenueCat processes it as a service provider). See
  `docs/store/privacy-answers.md`, section "Since 0.23.0".
- **Store listing:** In-app purchases: **Yes** (optional Supporter subscription).
- Test with your licence-tester Gmail: Profile → the 💛 card → buy → the badge appears;
  then Profile → restore on a second phone.
- Refunds and cancellations are handled in Play Console; they show in RevenueCat.

## What supporters see

- Profile: a 💛 card ("Keep WolofLink free: become a supporter"), then a thank-you and a
  💛 Supporter badge next to their name; a 💛 beside their name in Friends.
- Unlimited drops: mistakes never stop a lesson.
- Everything else, including every lesson and dialogue, stays free for everyone.

## Not included yet (ideas, not promised in the app)

- Early access to new units for supporters.
- Showing a supporter's 💛 to their friends (it needs RevenueCat to tell our server).
- A one-off "Supporter forever" purchase.
