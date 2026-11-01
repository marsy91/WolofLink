// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The seasonal theme to show now: built-in holiday seasons plus events the owner
 * schedules online (read without an account, cached for offline use).
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { activeSeason, isLook, type ActiveSeason, type CustomSeason } from "@/content/seasons";
import type { Translations } from "@/content/types";
import { getCloud } from "./cloud";
import { useDateOverrides } from "./holidays";
import { useNow, useStore } from "./store";

const KEY = "woloflink.seasons.v1";
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

interface Cached {
  fetchedAt: number;
  events: CustomSeason[];
}

const tr = (v: unknown): Translations | null =>
  v && typeof v === "object" && typeof (v as Translations).en === "string" && (v as Translations).en ? (v as Translations) : null;

export function rowsToSeasons(rows: unknown[]): CustomSeason[] {
  const out: CustomSeason[] = [];
  for (const r of rows as Record<string, unknown>[]) {
    const title = tr(r.title);
    if (!title || !isLook(r.look) || typeof r.id !== "string") continue;
    if (typeof r.starts_on !== "string" || typeof r.ends_on !== "string") continue;
    out.push({ id: r.id, look: r.look, starts_on: r.starts_on, ends_on: r.ends_on, title, message: tr(r.message) });
  }
  return out;
}

function readCache(): Cached | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    const c = raw ? (JSON.parse(raw) as Cached) : null;
    return c && Array.isArray(c.events) ? c : null;
  } catch {
    return null;
  }
}

async function loadEvents(): Promise<CustomSeason[]> {
  const cached = readCache();
  const cloud = getCloud();
  if (!cloud || (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS)) return cached?.events ?? [];
  try {
    const events = rowsToSeasons((await cloud.rpc<unknown[]>("season_events_current")) ?? []);
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ fetchedAt: Date.now(), events }));
    } catch {
      // Built-in seasons still work.
    }
    return events;
  } catch {
    return cached?.events ?? [];
  }
}

/** The active season, or null (also null when the learner switched seasonal themes off). */
export function useSeason(): ActiveSeason | null {
  const { progress } = useStore();
  const enabled = progress.settings.seasonal !== false;
  const now = useNow(10 * 60_000);
  const overrides = useDateOverrides();
  const [events, setEvents] = useState<CustomSeason[]>([]);
  useEffect(() => {
    let alive = true;
    const cached = readCache();
    void Promise.resolve().then(() => alive && cached && setEvents(cached.events));
    void loadEvents().then((e) => alive && setEvents(e));
    return () => {
      alive = false;
    };
  }, []);
  // Re-evaluate once a day is enough; `now` ticks every 10 minutes.
  const day = new Date(now).toDateString();
  return useMemo(
    () => (enabled ? activeSeason(new Date(now), overrides, events) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, day, overrides, events],
  );
}
