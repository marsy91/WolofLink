// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Account state and background sync. Sync runs when the learner signs in, when
 * the app comes back to the foreground, and a few seconds after local changes.
 * Everything keeps working offline; a failed sync is retried on the next
 * trigger.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CloudError, getCloud, type CloudErrorKind, type CloudUser } from "./cloud";
import { useStore } from "./store";
import { syncOnce } from "./sync";

export type SyncStatus = "idle" | "syncing" | "error";

interface Account {
  /** False when this build has no cloud configuration. */
  available: boolean;
  /** Undefined while the saved session is being restored. */
  user: CloudUser | null | undefined;
  status: SyncStatus;
  lastSyncedAt: number | null;
  sendCode: (email: string) => Promise<CloudErrorKind | null>;
  verifyCode: (email: string, code: string) => Promise<CloudErrorKind | null>;
  syncNow: () => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<CloudErrorKind | null>;
}

const AccountContext = createContext<Account | null>(null);

const PUSH_DELAY_MS = 3000;
const LAST_SYNC_KEY = "woloflink.lastSync";

const kindOf = (e: unknown): CloudErrorKind => (e instanceof CloudError ? e.kind : "unknown");

function readLastSync(): number | null {
  try {
    const v = window.localStorage.getItem(LAST_SYNC_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const cloud = getCloud();
  const { ready, progress, replace } = useStore();
  const [user, setUser] = useState<CloudUser | null | undefined>(cloud ? undefined : null);
  const [status, setStatus] = useState<SyncStatus>("idle");
  // Only shown after the store is ready, so reading storage here can't cause a hydration mismatch.
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() =>
    typeof window === "undefined" ? null : readLastSync(),
  );

  // Refs so async work always sees current values without re-subscribing.
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  const syncing = useRef<Promise<boolean> | null>(null);
  /** updatedAt of the copy we last reconciled with the cloud. */
  const syncedVersion = useRef<number | null>(null);

  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!cloud) return false;
    if (syncing.current) return syncing.current;
    const run = (async () => {
      setStatus("syncing");
      try {
        const before = progressRef.current;
        const { progress: merged } = await syncOnce(before, cloud);
        // Keep changes made while the request was in flight; they sync next round.
        if (progressRef.current === before) replace(merged);
        syncedVersion.current = merged.updatedAt;
        const now = Date.now();
        setLastSyncedAt(now);
        try {
          window.localStorage.setItem(LAST_SYNC_KEY, String(now));
        } catch {
          // Display-only value.
        }
        setStatus("idle");
        return true;
      } catch {
        setStatus("error");
        return false;
      } finally {
        syncing.current = null;
      }
    })();
    syncing.current = run;
    return run;
  }, [cloud, replace]);

  // Restore the saved session and follow sign-in / sign-out.
  useEffect(() => {
    if (!cloud) return;
    let alive = true;
    void cloud.getUser().then((u) => alive && setUser(u));
    const off = cloud.onAuthChange((u) => setUser(u));
    return () => {
      alive = false;
      off();
    };
  }, [cloud]);

  const signedIn = !!user;

  // Sync on sign-in (once local progress is loaded) and when the app returns to the foreground.
  useEffect(() => {
    if (!signedIn || !ready) return;
    void syncNow();
    const onVisible = () => document.visibilityState === "visible" && void syncNow();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [signedIn, ready, syncNow]);

  // Push local changes shortly after they happen.
  useEffect(() => {
    if (!signedIn || !ready || syncedVersion.current === progress.updatedAt) return;
    const id = window.setTimeout(() => void syncNow(), PUSH_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [signedIn, ready, progress.updatedAt, syncNow]);

  const value = useMemo<Account>(
    () => ({
      available: !!cloud,
      user,
      status,
      lastSyncedAt,
      syncNow,
      async sendCode(email) {
        if (!cloud) return "unknown";
        try {
          await cloud.sendCode(email.trim());
          return null;
        } catch (e) {
          return kindOf(e);
        }
      },
      async verifyCode(email, code) {
        if (!cloud) return "unknown";
        try {
          setUser(await cloud.verifyCode(email.trim(), code));
          return null;
        } catch (e) {
          return kindOf(e);
        }
      },
      async signOut() {
        if (!cloud) return;
        await cloud.signOut();
        syncedVersion.current = null;
        setUser(null);
      },
      async deleteAccount() {
        if (!cloud) return "unknown";
        try {
          await cloud.deleteAccount();
          syncedVersion.current = null;
          setUser(null);
          return null;
        } catch (e) {
          return kindOf(e);
        }
      },
    }),
    [cloud, user, status, lastSyncedAt, syncNow],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): Account {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount must be used inside <AccountProvider>");
  return account;
}
