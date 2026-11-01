// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Online holiday dates. The owner confirms or corrects dates in the owner
 * console; the app reads them (no account needed), keeps a copy on the device
 * and falls back to the built-in estimates in src/content/calendar.ts when
 * offline or when accounts are switched off in a build.
 */
"use client";

import { useEffect, useState } from "react";
import type { DateOverrides } from "@/content/calendar";
import { getCloud } from "./cloud";

const KEY = "woloflink.calendar.v1";
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

interface Cached {
  fetchedAt: number;
  overrides: DateOverrides;
}

export interface CalendarRow {
  holiday_id: string;
  year: number;
  day: string;
  confirmed: boolean;
}

export function rowsToOverrides(rows: CalendarRow[]): DateOverrides {
  const out: DateOverrides = {};
  for (const r of rows) {
    if (typeof r.holiday_id !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.day)) continue;
    out[`${r.holiday_id}:${r.year}`] = { date: r.day, confirmed: r.confirmed === true };
  }
  return out;
}

function readCache(): Cached | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    const c = raw ? (JSON.parse(raw) as Cached) : null;
    return c && typeof c.fetchedAt === "number" && c.overrides && typeof c.overrides === "object" ? c : null;
  } catch {
    return null;
  }
}

function writeCache(c: Cached) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // The built-in estimates still work.
  }
}

/** Fetches confirmed dates; resolves to the cached copy (or {}) when offline. */
export async function loadOverrides({ force = false } = {}): Promise<DateOverrides> {
  const cached = readCache();
  const cloud = getCloud();
  if (!cloud || (!force && cached && Date.now() - cached.fetchedAt < MAX_AGE_MS)) return cached?.overrides ?? {};
  try {
    const rows = await cloud.rpc<CalendarRow[]>("calendar_dates_current");
    const overrides = rowsToOverrides(rows ?? []);
    writeCache({ fetchedAt: Date.now(), overrides });
    return overrides;
  } catch {
    return cached?.overrides ?? {};
  }
}

/** Cached overrides right away, then fresh ones when the network answers. */
export function useDateOverrides(): DateOverrides {
  const [overrides, setOverrides] = useState<DateOverrides>({});
  useEffect(() => {
    let alive = true;
    const cached = readCache();
    void Promise.resolve().then(() => {
      if (alive && cached) setOverrides(cached.overrides);
    });
    void loadOverrides().then((o) => alive && setOverrides(o));
    return () => {
      alive = false;
    };
  }, []);
  return overrides;
}
