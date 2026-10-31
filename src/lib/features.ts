// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Build-time feature switches, set in .env.production (see README, "Launch
 * configuration"). They are baked into the app when it is built.
 *
 * - NEXT_PUBLIC_PREMIUM=on   paid Premium: units 4+ need a subscription.
 *                            Off (default): every unit is free and no purchase
 *                            screens or store SDK are used.
 * - NEXT_PUBLIC_ACCOUNTS=off hides the optional account and cloud sync, even
 *                            when the Supabase settings are present.
 * - NEXT_PUBLIC_CIRCLE=on    shows the Circle tab (a demo ranking with sample
 *                            learners until real circles exist).
 */
export const PREMIUM_ENABLED = process.env.NEXT_PUBLIC_PREMIUM === "on";

export const ACCOUNTS_ENABLED =
  process.env.NEXT_PUBLIC_ACCOUNTS !== "off" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const CIRCLE_ENABLED = process.env.NEXT_PUBLIC_CIRCLE === "on";
