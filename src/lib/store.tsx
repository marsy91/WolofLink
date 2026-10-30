// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UiLang } from "@/content/types";
import { detectLang, t as translateKey, type UiKey } from "@/i18n";
import { emptyProgress, refreshDrops, type Progress } from "./progress";
import { localRepo, type ProgressRepo } from "./storage";

interface Store {
  /** False until progress has been read from storage (always false during prerender). */
  ready: boolean;
  progress: Progress;
  lang: UiLang;
  /** Set when the last write failed, so screens can warn the learner. */
  saveError: boolean;
  update: (fn: (p: Progress) => Progress) => void;
  reset: () => void;
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Interface language used before a profile exists (onboarding). */
  setDraftLang: (lang: UiLang) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, repo = localRepo }: { children: ReactNode; repo?: ProgressRepo }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => emptyProgress(0));
  const [draftLang, setDraftLang] = useState<UiLang>("en");
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

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress((p) => fn(p)), []);
  const reset = useCallback(() => {
    repo.clear();
    setProgress(emptyProgress());
  }, [repo]);

  const lang = progress.profile?.uiLang ?? draftLang;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Store>(
    () => ({
      ready,
      progress,
      lang,
      saveError,
      update,
      reset,
      setDraftLang,
      t: (key, vars) => translateKey(lang, key, vars),
    }),
    [ready, progress, lang, saveError, update, reset],
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
