// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Access the owner gives an account (supabase/migrations/*_grants.sql): unlock
 * every lesson, and/or Premium. Read after sign-in and cached per account so it
 * keeps working offline. Like the Premium cache, this only opens content that is
 * already inside the app.
 */
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "./account";
import { getCloud } from "./cloud";

export interface Grants {
  unlockAll: boolean;
  premium: boolean;
  /** ISO date, or null for no end date. */
  premiumUntil: string | null;
  source: "owner" | "granted" | "organisation" | "none";
}

export const NO_GRANTS: Grants = { unlockAll: false, premium: false, premiumUntil: null, source: "none" };
const key = (userId: string) => `woloflink.grants.${userId}`;

interface Row {
  unlock_all: boolean;
  premium: boolean;
  premium_until: string | null;
  source: string;
}

export function rowToGrants(row: Row | undefined, now = Date.now()): Grants {
  if (!row) return NO_GRANTS;
  const until = row.premium_until;
  const premium = row.premium === true && (!until || Date.parse(until) > now);
  const source = (["owner", "granted", "organisation"] as const).find((s) => s === row.source) ?? "none";
  return { unlockAll: row.unlock_all === true, premium, premiumUntil: until, source };
}

function readCache(userId: string): Grants | null {
  try {
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return null;
    const g = JSON.parse(raw) as Grants;
    // Re-check the end date offline.
    const expired = g.premiumUntil && Date.parse(g.premiumUntil) <= Date.now();
    return expired ? { ...g, premium: false } : g;
  } catch {
    return null;
  }
}

function writeCache(userId: string, g: Grants) {
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(g));
  } catch {
    // Offline convenience only.
  }
}

/** The signed-in account's grants; nothing when signed out. */
export function useGrants(): Grants {
  const { user } = useAccount();
  const userId = user?.id ?? null;
  const [grants, setGrants] = useState<Grants>(NO_GRANTS);
  useEffect(() => {
    let alive = true;
    const cloud = getCloud();
    if (!userId || !cloud) {
      void Promise.resolve().then(() => alive && setGrants(NO_GRANTS));
      return;
    }
    const cached = readCache(userId);
    void Promise.resolve().then(() => alive && setGrants(cached ?? NO_GRANTS));
    cloud
      .rpc<Row[]>("my_grants")
      .then((rows) => {
        const g = rowToGrants(rows?.[0]);
        writeCache(userId, g);
        if (alive) setGrants(g);
      })
      .catch(() => {
        // Offline or not set up yet: keep the cached grants.
      });
    return () => {
      alive = false;
    };
  }, [userId]);
  return grants;
}
