// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Persistence boundary. The app only talks to `ProgressRepo`, so a cloud
 * implementation (Supabase, Firebase…) can replace or wrap the local one
 * without changing screens or game rules.
 */
import { migrate, type Progress } from "./progress";

export interface ProgressRepo {
  load(): Progress | null;
  /** Returns false when the write failed (quota, private mode, blocked storage). */
  save(progress: Progress): boolean;
  clear(): void;
}

const KEY = "woloflink.progress.v1";

export const localRepo: ProgressRepo = {
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? migrate(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
  save(progress) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(progress));
      return true;
    } catch {
      return false;
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // Nothing to clear if storage is unavailable.
    }
  },
};
