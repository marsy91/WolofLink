// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Family play on one shared phone: every family member gets their own profile and progress.
 * The profile in use lives in the usual progress slot (src/lib/storage.ts); the others wait
 * in their own slot here. Nothing about family members ever leaves the phone: only the main
 * learner (the profile with no `member` field) can use the account, sync and online features.
 * Pure functions plus two small storage helpers; tested in family.test.ts.
 */
import { emptyProgress, migrate, type Profile, type Progress } from "./progress";

export const FAMILY_LEVELS = ["little", "kid", "grown"] as const;
export type FamilyLevel = (typeof FAMILY_LEVELS)[number];

/** Avatar colours (also the wrestler's loincloth in Family Làmb Night). */
export const AVATARS = ["#c2502f", "#7b3f8c", "#1f7a6d", "#d99a1e", "#2f5fb3", "#b8336a", "#4f7a28", "#3b3b58"] as const;

export const MAX_FAMILY = 8;
export const MAX_NAME = 24;

export interface Family {
  version: 1;
  /** Every profile except the one in use, newest last. */
  others: Progress[];
  /** Family Làmb Night titles won, by profile id. */
  crowns: Record<string, number>;
}

export const emptyFamily = (): Family => ({ version: 1, others: [], crowns: {} });

/** The level a profile plays at: the main learner counts as a grown-up. */
export const levelOf = (p: Profile | null | undefined): FamilyLevel => p?.member?.level ?? "grown";

/** A child's profile (5–12): online features stay off and grown-up screens ask for a grown-up. */
export const isChild = (p: Profile | null | undefined): boolean => !!p?.member && p.member.level !== "grown";

/** The phone's main learner: the only profile that can use the account and online features. */
export const isMain = (p: Profile | null | undefined): boolean => !!p && !p.member;

export const avatarOf = (p: Profile | null | undefined): string => {
  const a = p?.avatar;
  return a && (AVATARS as readonly string[]).includes(a) ? a : AVATARS[0];
};

/** Validates whatever storage held. Profiles without a valid profile are dropped, ids kept unique. */
export function parseFamily(raw: unknown, activeId?: string): Family {
  if (!raw || typeof raw !== "object") return emptyFamily();
  const r = raw as { version?: unknown; others?: unknown; crowns?: unknown };
  if (r.version !== 1) return emptyFamily();
  const seen = new Set(activeId ? [activeId] : []);
  const others: Progress[] = [];
  for (const item of Array.isArray(r.others) ? r.others : []) {
    const p = migrate(item);
    if (!p.profile || seen.has(p.profile.id)) continue;
    seen.add(p.profile.id);
    others.push(p);
  }
  const crowns: Record<string, number> = {};
  if (r.crowns && typeof r.crowns === "object") {
    for (const [k, v] of Object.entries(r.crowns as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && v > 0) crowns[k] = Math.min(9999, Math.floor(v));
    }
  }
  return { version: 1, others: others.slice(0, MAX_FAMILY - 1), crowns };
}

/** Everyone on the phone: the profile in use first, then the others in the order they were added. */
export function members(active: Progress, family: Family): Profile[] {
  return [active.profile, ...family.others.map((p) => p.profile)].filter((p): p is Profile => !!p);
}

export const cleanName = (name: string) => name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME);

/** A new family member's empty progress. They learn the same language, in the same interface language. */
export function newMember(
  base: Profile,
  { name, level, avatar }: { name: string; level: FamilyLevel; avatar: string },
  id: string,
  now = Date.now(),
): Progress {
  const p = emptyProgress(now);
  p.updatedAt = now;
  p.profile = {
    id,
    name: cleanName(name),
    uiLang: base.uiLang,
    target: base.target,
    goal: level === "grown" ? "regular" : "casual",
    createdAt: now,
    guest: true,
    avatar,
    member: { level },
  };
  return p;
}

export type AddProblem = "name" | "full";

/** Adds a member (they wait in `others` until someone switches to them). */
export function addMember(active: Progress, family: Family, member: Progress): Family | AddProblem {
  if (!member.profile?.name) return "name";
  if (members(active, family).length >= MAX_FAMILY) return "full";
  return { ...family, others: [...family.others, member] };
}

/** Removes a waiting member and their progress. The profile in use and the main learner can't be removed. */
export function removeMember(family: Family, id: string): Family {
  const crowns = { ...family.crowns };
  delete crowns[id];
  return { ...family, others: family.others.filter((p) => p.profile?.id !== id || isMain(p.profile)), crowns };
}

/** Switches profiles: the one in use goes back to wait, the chosen one comes out. Null if unknown. */
export function switchTo(active: Progress, family: Family, id: string): { family: Family; active: Progress } | null {
  const next = family.others.find((p) => p.profile?.id === id);
  if (!next || !active.profile) return null;
  const others = family.others.map((p) => (p === next ? active : p));
  return { family: { ...family, others }, active: next };
}

/** The main learner's profile, wherever it is. */
export function mainOf(active: Progress, family: Family): Profile | null {
  return members(active, family).find(isMain) ?? null;
}

/** Records a Family Làmb Night title. */
export function addCrown(family: Family, id: string): Family {
  return { ...family, crowns: { ...family.crowns, [id]: (family.crowns[id] ?? 0) + 1 } };
}

// ── Storage ──

const KEY = "woloflink.family.v1";

export function loadFamily(activeId?: string): Family {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parseFamily(JSON.parse(raw), activeId) : emptyFamily();
  } catch {
    return emptyFamily();
  }
}

/** False when the write failed (then nothing should change on screen). */
export function saveFamily(family: Family): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(family));
    return true;
  } catch {
    return false;
  }
}

export function clearFamily() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

// ── Screens that need the main learner or a grown-up ──

/** Online and account screens: only the main learner (family members' data never leaves the phone). */
export const MAIN_ONLY = ["/account/", "/friends/", "/friend/", "/world/", "/community/", "/feedback/", "/record/", "/voice-review/", "/owner/", "/premium/", "/team/", "/circle/"];
/** Screens a child needs a grown-up for. */
export const GROWN_UP = ["/settings/"];

/**
 * Whether switching from the profile in use to `target` needs the grown-up check: a child
 * moving to anyone else's profile, or anyone moving into a child's profile.
 */
export function switchNeedsGrownUp(active: Profile | null | undefined, target: Profile): boolean {
  return isChild(active) || isChild(target);
}

/** What a screen needs from the profile in use. Duels against a friend count as online; against the computer they don't. */
export function screenNeeds(path: string, search: string, profile: Profile | null | undefined): "main" | "grownup" | null {
  if (!profile?.member) return null;
  const p = path.endsWith("/") ? path : `${path}/`;
  if (MAIN_ONLY.some((r) => p.startsWith(r))) return "main";
  if (p.startsWith("/duel/") && !/[?&]bot=/.test(search)) return "main";
  if (isChild(profile) && GROWN_UP.some((r) => p.startsWith(r))) return "grownup";
  return null;
}
