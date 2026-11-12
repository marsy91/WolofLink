// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Announcements and remote off-switches set in the owner console. Read without an
 * account, cached for offline use. A switch can only pause a feature the build
 * already has; when offline the last known state applies (default: all on).
 * Opt-in switches (OPT_IN_KEYS) work the other way: off until the owner switches
 * them on, and off whenever the app has not heard otherwise.
 */
"use client";

import { useEffect, useState } from "react";
import type { Translations } from "@/content/types";
import { getCloud } from "./cloud";

export const SWITCH_KEYS = ["friends", "duels", "voices", "supporter", "reports", "community", "feedback", "world"] as const;
export type SwitchKey = (typeof SWITCH_KEYS)[number];
export const OPT_IN_KEYS = ["nearby", "bot_duels"] as const;
export type OptInKey = (typeof OPT_IN_KEYS)[number];

export interface Announcement {
  id: string;
  title: Translations;
  message: Translations | null;
}
export interface Notices {
  announcements: Announcement[];
  off: SwitchKey[];
  on: OptInKey[];
}

const KEY = "woloflink.notices.v1";
const DISMISSED = "woloflink.notices.dismissed.v1";
const MAX_AGE_MS = 60 * 60 * 1000;
const EMPTY: Notices = { announcements: [], off: [], on: [] };

const tr = (v: unknown): Translations | null =>
  v && typeof v === "object" && typeof (v as Translations).en === "string" && (v as Translations).en ? (v as Translations) : null;

/** Validates whatever the server (or the cache) returned. */
export function parseNotices(raw: unknown): Notices {
  if (!raw || typeof raw !== "object") return EMPTY;
  const r = raw as { announcements?: unknown; off?: unknown; on?: unknown };
  const announcements: Announcement[] = [];
  for (const a of Array.isArray(r.announcements) ? (r.announcements as Record<string, unknown>[]) : []) {
    const title = tr(a?.title);
    if (title && typeof a.id === "string") announcements.push({ id: a.id, title, message: tr(a.message) });
  }
  const off = (Array.isArray(r.off) ? r.off : []).filter((k): k is SwitchKey => (SWITCH_KEYS as readonly unknown[]).includes(k));
  const on = (Array.isArray(r.on) ? r.on : []).filter((k): k is OptInKey => (OPT_IN_KEYS as readonly unknown[]).includes(k));
  return { announcements: announcements.slice(0, 3), off, on };
}

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let shared: Promise<Notices> | null = null;

function load(): Promise<Notices> {
  if (shared) return shared;
  shared = (async () => {
    const cached = readJson(KEY) as { fetchedAt?: number; notices?: unknown } | null;
    const fromCache = parseNotices(cached?.notices);
    const cloud = getCloud();
    if (!cloud || (cached?.fetchedAt && Date.now() - cached.fetchedAt < MAX_AGE_MS)) return fromCache;
    try {
      const notices = parseNotices(await cloud.rpc<unknown>("app_notices"));
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ fetchedAt: Date.now(), notices }));
      } catch {
        // Fine without a cache.
      }
      return notices;
    } catch {
      return fromCache;
    }
  })();
  return shared;
}

/** For tests. */
export function resetNoticesForTests() {
  shared = null;
}

export function useNotices(): Notices {
  return useNoticesState() ?? EMPTY;
}

/** Like useNotices, but undefined until the notices have been read (cache or server). */
export function useNoticesState(): Notices | undefined {
  const [notices, setNotices] = useState<Notices | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void load().then((n) => alive && setNotices(n));
    return () => {
      alive = false;
    };
  }, []);
  return notices;
}

/** True when the owner has paused this feature for everyone. */
export function useSwitchOff(key: SwitchKey): boolean {
  return useNotices().off.includes(key);
}

/** True only when the owner has switched this feature on (off by default and offline). */
export function useSwitchOn(key: OptInKey): boolean {
  return useNotices().on.includes(key);
}

export function dismissedIds(): string[] {
  const v = readJson(DISMISSED);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function dismiss(id: string) {
  try {
    window.localStorage.setItem(DISMISSED, JSON.stringify([...dismissedIds().filter((x) => x !== id), id].slice(-30)));
  } catch {
    // It just shows again next time.
  }
}
