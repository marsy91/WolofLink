// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Friends and the weekly ranking (supabase/migrations/*_friends.sql). Needs an account. */
import { CloudError, getCloud } from "./cloud";
import { notifyFriend } from "./push";

export interface FriendCard {
  display_name: string;
  friend_code: string;
}

export interface BoardRow {
  user_id: string;
  display_name: string;
  week_xp: number;
  streak: number;
  last_active: string | null;
  is_me: boolean;
  /** Won in duels (older servers may not send it). */
  trophies?: number;
}

function cloud() {
  const c = getCloud();
  if (!c) throw new Error("accounts are switched off in this build");
  return c;
}

export const friends = {
  myCard: async () => (await cloud().rpc<FriendCard[]>("my_friend_card"))?.[0] ?? null,
  setName: async (name: string) => (await cloud().rpc<FriendCard[]>("set_friend_name", { name }))?.[0] ?? null,
  /** Returns the friend's name; a wrong code comes back empty (the server counts wrong guesses). */
  add: async (code: string) => {
    const name = await cloud().rpc<string | null>("add_friend", { code: normaliseCode(code) });
    if (!name) throw new CloudError("unknown_code", "unknown code");
    return name;
  },
  remove: (friend: string) => cloud().rpc<void>("remove_friend", { friend }),
  board: async () => (await cloud().rpc<BoardRow[]>("friends_board")) ?? [],
  nudge: async (friend: string) => {
    await cloud().rpc<void>("nudge_friend", { friend });
    notifyFriend("nudge", { to: friend });
  },
  myNudges: async () => (await cloud().rpc<{ from_name: string; sent_at: string }[]>("my_nudges")) ?? [],
};

/** Codes are 8 letters/digits; people type them with spaces, dashes or in lower case. */
export function normaliseCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

/** "AB12 CD34": easier to read out or type. */
export function formatCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)} ${code.slice(4)}` : code;
}

/** Ranks with ties sharing a place (1, 2, 2, 4). */
export function ranks(rows: { week_xp: number }[]): number[] {
  return rows.map((r, i) => (i > 0 && rows[i - 1]!.week_xp === r.week_xp ? -1 : i + 1)).map((rank, i, all) => {
    let j = i;
    while (all[j] === -1) j--;
    return all[j]!;
  });
}
