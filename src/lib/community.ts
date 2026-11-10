// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Community: city leagues, learners near you, friend requests, friends-only profiles
 * with social handles, blocking and reporting (supabase/migrations/*_community.sql).
 * The server enforces every privacy rule; this file only calls it.
 */
import { getCloud } from "./cloud";

export interface CommunityMe {
  home_city: string | null;
  show_city: boolean;
  adult_confirmed: boolean;
  nearby_area: string | null;
  show_nearby: boolean;
  nearby_until: string | null;
}

export interface LeagueRow {
  user_id: string;
  display_name: string;
  week_xp: number;
  streak: number;
  is_me: boolean;
  is_friend: boolean;
  requested: boolean;
}

export type NearbyRow = Omit<LeagueRow, "is_me">;

export interface FriendRequest {
  id: number;
  from_user: string;
  from_name: string;
  created_at: string;
}

export const NETWORKS = ["instagram", "tiktok", "x", "snapchat"] as const;
export type Network = (typeof NETWORKS)[number];

export interface Handle {
  network: Network;
  handle: string;
  visible?: boolean;
}

export interface FriendProfile {
  display_name: string;
  week_xp: number;
  streak: number;
  xp_total: number;
  lessons: number;
  home_city: string | null;
  handles: Handle[];
}

export const REPORT_REASONS = ["harassment", "spam", "inappropriate name", "inappropriate handle", "underage", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

function cloud() {
  const c = getCloud();
  if (!c) throw new Error("accounts are switched off in this build");
  return c;
}

export const community = {
  me: async () => (await cloud().rpc<CommunityMe[]>("community_me"))?.[0] ?? null,
  setCommunity: (city: string | null, showCity: boolean, adult: boolean) =>
    cloud().rpc<void>("set_community", { city, show_city: showCity, adult }),
  setNearby: (area: string | null, show: boolean) => cloud().rpc<void>("set_nearby", { area, show }),
  league: async () => (await cloud().rpc<LeagueRow[]>("city_league")) ?? [],
  nearby: async () => (await cloud().rpc<NearbyRow[]>("nearby_learners")) ?? [],
  request: (target: string) => cloud().rpc<void>("send_friend_request", { target }),
  requests: async () => (await cloud().rpc<FriendRequest[]>("my_friend_requests")) ?? [],
  respond: (request: number, accept: boolean) => cloud().rpc<void>("respond_friend_request", { request, accept }),
  profile: async (friend: string) => (await cloud().rpc<FriendProfile[]>("friend_profile", { friend }))?.[0] ?? null,
  myHandles: async () => (await cloud().rpc<Handle[]>("my_handles")) ?? [],
  saveHandle: (network: Network, handle: string, visible: boolean) =>
    cloud().rpc<void>("save_handle", { network, handle: cleanHandle(handle), visible }),
  block: (target: string) => cloud().rpc<void>("block_user", { target }),
  unblock: (target: string) => cloud().rpc<void>("unblock_user", { target }),
  blocks: async () => (await cloud().rpc<{ user_id: string; display_name: string }[]>("my_blocks")) ?? [],
  report: (target: string, reason: ReportReason, note?: string) => cloud().rpc<void>("report_user", { target, reason, note: note ?? null }),
};

/** "@Moussa.Wolof " → "Moussa.Wolof"; the server applies the same rule. */
export function cleanHandle(input: string): string {
  return input.trim().replace(/^@/, "");
}

/** Letters, numbers, dots and underscores, 1–30 characters (or empty to remove). */
export function handleIsValid(input: string): boolean {
  const h = cleanHandle(input);
  return h === "" || /^[A-Za-z0-9._]{1,30}$/.test(h);
}

/** Link that opens the handle in its app or website. */
export function handleUrl(network: Network, handle: string): string {
  const h = encodeURIComponent(cleanHandle(handle));
  switch (network) {
    case "instagram":
      return `https://instagram.com/${h}`;
    case "tiktok":
      return `https://www.tiktok.com/@${h}`;
    case "x":
      return `https://x.com/${h}`;
    case "snapchat":
      return `https://www.snapchat.com/add/${h}`;
  }
}

/** Friend code carried by the in-person QR code: "WOLOFLINK:AB12CD34". */
export function qrPayload(code: string): string {
  return `WOLOFLINK:${code}`;
}

/** The friend code inside a scanned QR text, or null if it isn't one of ours. */
export function codeFromQr(text: string): string | null {
  const m = /^WOLOFLINK:([ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8})$/.exec(text.trim().toUpperCase());
  return m ? m[1]! : null;
}
