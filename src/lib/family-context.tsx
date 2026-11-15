// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * FamilyProvider: loads and saves the family slot on top of the main store.
 * Switching profiles replaces the main store progress with the chosen member's
 * progress (they swap: the one in use goes back into `others`).
 *
 * All family data stays on this phone. The main learner (no `member` field) is
 * the only profile that uses the cloud account; others are local-only.
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Family, addCrown, addMember, emptyFamily, loadFamily, newMember, parseFamily, removeMember, saveFamily, switchTo, type AddProblem } from "./family";
import { type FamilyLevel } from "./family";
import { useStore } from "./store";
import type { Progress } from "./progress";

interface FamilyCtx {
  family: Family;
  /** Switch to a waiting family member. Returns false if the id is unknown. */
  switchProfile: (id: string) => boolean;
  /**
   * Add a new family member. Returns "name" for a blank name, "full" if at
   * the limit, or "ok" on success.
   */
  addProfile: (opts: { name: string; level: FamilyLevel; avatar: string }) => "ok" | AddProblem;
  /** Remove a waiting member (never the one in use or the main learner). */
  removeProfile: (id: string) => void;
  /** Record a Family Làmb Night title. */
  giveCrown: (id: string) => void;
}

const Ctx = createContext<FamilyCtx | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { progress, replace, ready } = useStore();
  const activeId = progress.profile?.id;

  // Start empty so the first client render matches the pre-built page, then load the saved
  // family once the store is ready and again whenever the active profile changes (a switch).
  const [family, setFamily] = useState<Family>(emptyFamily);
  useEffect(() => {
    if (!ready) return;
    void Promise.resolve().then(() => setFamily(loadFamily(activeId)));
  }, [ready, activeId]);

  const persist = useCallback((f: Family) => {
    setFamily(f);
    saveFamily(f);
  }, []);

  const switchProfile = useCallback(
    (id: string): boolean => {
      const result = switchTo(progress, family, id);
      if (!result) return false;
      persist(result.family);
      replace(result.active);
      return true;
    },
    [progress, family, persist, replace],
  );

  const addProfile = useCallback(
    (opts: { name: string; level: FamilyLevel; avatar: string }): "ok" | AddProblem => {
      const member = newMember(progress.profile!, opts, crypto.randomUUID());
      const result = addMember(progress, family, member);
      if (typeof result === "string") return result;
      persist(result);
      return "ok";
    },
    [progress, family, persist],
  );

  const removeProfile = useCallback(
    (id: string) => {
      persist(removeMember(family, id));
    },
    [family, persist],
  );

  const giveCrown = useCallback(
    (id: string) => {
      persist(addCrown(family, id));
    },
    [family, persist],
  );

  const value = useMemo<FamilyCtx>(
    () => ({ family, switchProfile, addProfile, removeProfile, giveCrown }),
    [family, switchProfile, addProfile, removeProfile, giveCrown],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFamily(): FamilyCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFamily must be used inside FamilyProvider");
  return ctx;
}

/** Reload from storage when the raw stored data changes (e.g. in another tab). */
export function parseFamilyFromStorage(raw: string | null, activeId?: string): Family {
  try {
    return parseFamily(raw ? JSON.parse(raw) : null, activeId);
  } catch {
    return emptyFamily();
  }
}

/** Progress with the given id from the family, or null. */
export function findMemberProgress(family: Family, id: string): Progress | null {
  return family.others.find((p) => p.profile?.id === id) ?? null;
}
