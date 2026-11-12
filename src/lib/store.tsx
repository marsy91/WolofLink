// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UiLang } from "@/content/types";
import { detectLang, t as translateKey, tWolof, type UiKey } from "@/i18n";
import { emptyProgress, refreshDrops, type Progress } from "./progress";
import { localRepo, type ProgressRepo } from "./storage";

interface Store {
  /** False until progress has been read from storage (always false during prerender). */
  ready: boolean;
  progress: Progress;
  lang: UiLang;
  /** Set when the last write failed, so screens can warn the learner. */
  saveError: boolean;
  /** Apply a local change; stamps `updatedAt` so sync knows this copy is newer. */
  update: (fn: (p: Progress) => Progress) => void;
  /** Replace progress wholesale without re-stamping it (used after a cloud merge). */
  replace: (p: Progress) => void;
  reset: () => void;
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Interface language used before a profile exists (onboarding). */
  setDraftLang: (lang: UiLang) => void;
  /** The language being learned: Wolof, or English/French for Wolof speakers (then the interface is in Wolof). */
  target: "wo" | "en" | "fr";
  /** Language being learned, chosen during onboarding before the profile exists. */
  setDraftTarget: (target: "wo" | "en" | "fr") => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, repo = localRepo }: { children: ReactNode; repo?: ProgressRepo }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => emptyProgress(0));
  const [draftLang, setDraftLang] = useState<UiLang>("en");
  const [draftTarget, setDraftTarget] = useState<"wo" | "en" | "fr">("wo");
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    // Hydrate once on the client; static prerendering never touches storage.
    // Reading storage must wait for the client, so this one-off sync is intended.
    const stored = repo.load();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(refreshDrops(stored ?? emptyProgress(), Date.now()));
    setDraftLang(detectLang());
    setReady(true);
  }, [repo]);

  useEffect(() => {
    // Persist every change; surface write failures (quota, blocked storage) to the UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) setSaveError(!repo.save(progress));
  }, [ready, progress, repo]);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => setProgress((p) => ({ ...fn(p), updatedAt: Date.now() })),
    [],
  );
  const replace = useCallback((p: Progress) => setProgress(p), []);
  const reset = useCallback(() => {
    repo.clear();
    setProgress(emptyProgress());
  }, [repo]);

  const lang = progress.profile?.uiLang ?? draftLang;
  const target = progress.profile?.target ?? draftTarget;
  const wolofUi = target !== "wo";

  useEffect(() => {
    document.documentElement.lang = wolofUi ? "wo" : lang;
  }, [lang, wolofUi]);

  const value = useMemo<Store>(
    () => ({
      ready,
      progress,
      lang,
      saveError,
      update,
      replace,
      reset,
      setDraftLang,
      target,
      setDraftTarget,
      t: (key, vars) => (wolofUi ? tWolof(key, vars) : translateKey(lang, key, vars)),
    }),
    [ready, progress, lang, target, wolofUi, saveError, update, replace, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

/** Re-render periodically so timers (drop refill, streak day) stay current. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
