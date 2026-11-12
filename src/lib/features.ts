// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Build-time feature switches, set in .env.production (see README, "Launch
 * configuration"). They are baked into the app when it is built.
 *
 * - NEXT_PUBLIC_PREMIUM=on   paid Premium: units 4+ need a subscription.
 *                            Off (default): every unit is free and no purchase
 *                            screens or store SDK are used.
 * - NEXT_PUBLIC_SUPPORTER=on optional "Supporter" subscription: every unit stays free for
 *                            everyone; supporters get a badge and unlimited drops. Needs
 *                            RevenueCat and the store subscriptions (docs/sales/supporter-setup.md).
 *                            Ignored when NEXT_PUBLIC_PREMIUM is on (paywall wins).
 * - NEXT_PUBLIC_ACCOUNTS=off hides the optional account and cloud sync, even
 *                            when the Supabase settings are present.
 * - NEXT_PUBLIC_CIRCLE=on    shows the Circle tab (a demo ranking with sample
 *                            learners until real circles exist).
 */
export const PREMIUM_ENABLED = process.env.NEXT_PUBLIC_PREMIUM === "on";

export const SUPPORTER_ENABLED = process.env.NEXT_PUBLIC_SUPPORTER === "on" && !PREMIUM_ENABLED;

/** Either paid model is on: the store SDK loads and the purchase screen exists. */
export const PAID_ENABLED = PREMIUM_ENABLED || SUPPORTER_ENABLED;

export const ACCOUNTS_ENABLED =
  process.env.NEXT_PUBLIC_ACCOUNTS !== "off" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const CIRCLE_ENABLED = process.env.NEXT_PUBLIC_CIRCLE === "on";

/**
 * Push notifications for friends (duels, nudges). Needs Firebase: put
 * android/app/google-services.json in place and set NEXT_PUBLIC_PUSH=on, otherwise
 * Android would crash on registration. Off by default.
 */
export const PUSH_ENABLED = process.env.NEXT_PUBLIC_PUSH === "on";

/**
 * Wolof speakers learning English or French: the course in reverse with a Wolof interface
 * (src/content/reverse.ts, src/i18n/wo.ts). The Wolof is new and waits for a native-speaker
 * check (docs/wolof-review.md), so it ships off. Set NEXT_PUBLIC_WOLOF_SPEAKERS=on to show the
 * option on the first setup screen and in Settings.
 */
export const WOLOF_SPEAKERS_ENABLED = process.env.NEXT_PUBLIC_WOLOF_SPEAKERS === "on";
