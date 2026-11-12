// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * WolofLink World: the map of learners by country and the shared weekly goal
 * (supabase/migrations/*_world.sql). Only totals come from the server; a country
 * appears once at least 3 learners chose it. The last summary is kept on the phone
 * so the screen works offline.
 */
import { COUNTRY_CODES } from "@/content/world";
import { getCloud } from "./cloud";

export interface WorldCountry {
  /** ISO code, e.g. "SN". */
  c: string;
  /** Learners who chose it. */
  n: number;
  /** XP they earned this week. */
  xp: number;
}

export interface WorldSummary {
  weekStart: string;
  weekXp: number;
  goal: number;
  /** Learners with an account who earned XP this week. */
  active: number;
  /** Learners who added a country. */
  members: number;
  countries: WorldCountry[];
  other: { countries: number; n: number; xp: number };
}

const KEY = "woloflink.world.v1";
const known = new Set(COUNTRY_CODES);
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

/** Validates what the server (or the cache) returned. null = paused or unreadable. */
export function parseWorld(raw: unknown): WorldSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.paused || typeof r.week_start !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.week_start)) return null;
  const other = (r.other && typeof r.other === "object" ? r.other : {}) as Record<string, unknown>;
  const countries = (Array.isArray(r.countries) ? r.countries : [])
    .map((x): WorldCountry | null => {
      const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      return typeof o.c === "string" && known.has(o.c) ? { c: o.c, n: int(o.n), xp: int(o.xp) } : null;
    })
    .filter((x): x is WorldCountry => !!x && x.n > 0);
  return {
    weekStart: r.week_start,
    weekXp: int(r.week_xp),
    goal: Math.max(1, int(r.goal)),
    active: int(r.active),
    members: int(r.members),
    countries,
    other: { countries: int(other.countries), n: int(other.n), xp: int(other.xp) },
  };
}

/** Share of the weekly goal reached, 0–100 (it can pass 100 when the goal is beaten). */
export function goalPercent(s: Pick<WorldSummary, "weekXp" | "goal">): number {
  return Math.floor((s.weekXp / Math.max(1, s.goal)) * 100);
}

/** Countries that earned XP this week, biggest share first, with their share of the total. */
export function topContributors(s: WorldSummary, max = 5): { c: string; xp: number; share: number }[] {
  const total = Math.max(1, s.weekXp);
  return s.countries
    .filter((x) => x.xp > 0)
    .sort((a, b) => b.xp - a.xp || a.c.localeCompare(b.c))
    .slice(0, max)
    .map((x) => ({ c: x.c, xp: x.xp, share: Math.min(100, Math.round((x.xp / total) * 100)) }));
}

/** Dot size on the map, by number of learners: 1 (a few) to 4 (many). */
export function dotLevel(n: number): 1 | 2 | 3 | 4 {
  return n >= 200 ? 4 : n >= 50 ? 3 : n >= 10 ? 2 : 1;
}

export function cachedWorld(): { summary: WorldSummary; savedAt: number } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as { data?: unknown; savedAt?: unknown } | null;
    const summary = parseWorld(raw?.data);
    return summary && typeof raw?.savedAt === "number" ? { summary, savedAt: raw.savedAt } : null;
  } catch {
    return null;
  }
}

function cloud() {
  const c = getCloud();
  if (!c) throw new Error("accounts are switched off in this build");
  return c;
}

export const world = {
  /** Fresh totals from the server, saved for offline use. Throws when offline. */
  summary: async (): Promise<WorldSummary | null> => {
    const raw = await cloud().rpc<unknown>("world_summary");
    const summary = parseWorld(raw);
    if (summary) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ data: raw, savedAt: Date.now() }));
      } catch {
        // Storage full or blocked: the screen still works online.
      }
    }
    return summary;
  },
  me: async () => (await cloud().rpc<string | null>("world_me")) ?? null,
  setCountry: (country: string | null) => cloud().rpc<void>("set_world_country", { country }),
};
