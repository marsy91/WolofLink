// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Recorder and reviewer status for the signed-in account (supabase/migrations/*_voices.sql). */
"use client";

import { useCallback, useEffect, useState } from "react";
import { dictionary, survivalSection } from "@/content/dictionary";
import type { Entry } from "@/content/types";
import { useAccount } from "./account";
import { getCloud } from "./cloud";

export interface RecorderStatus {
  isRecorder: boolean;
  canApprove: boolean;
  consented: boolean;
  displayName: string | null;
  approved: number;
  waiting: number;
  /** False until the server has answered (or there is no account). */
  loaded: boolean;
}

const NONE: RecorderStatus = { isRecorder: false, canApprove: false, consented: false, displayName: null, approved: 0, waiting: 0, loaded: false };

export function useRecorderStatus(): [RecorderStatus, () => void] {
  const { user } = useAccount();
  const userId = user?.id ?? null;
  const [status, setStatus] = useState<RecorderStatus>(NONE);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    const cloud = getCloud();
    if (!userId || !cloud) {
      void Promise.resolve().then(() => alive && setStatus({ ...NONE, loaded: user !== undefined }));
      return;
    }
    cloud
      .rpc<{ is_recorder: boolean; can_approve: boolean; consented: boolean; display_name: string | null; approved: number; waiting: number }[]>("my_recorder")
      .then((rows) => {
        const r = rows?.[0];
        if (alive && r)
          setStatus({
            isRecorder: !!r.is_recorder,
            canApprove: !!r.can_approve,
            consented: !!r.consented,
            displayName: r.display_name,
            approved: r.approved ?? 0,
            waiting: r.waiting ?? 0,
            loaded: true,
          });
      })
      .catch(() => alive && setStatus({ ...NONE, loaded: true }));
    return () => {
      alive = false;
    };
  }, [userId, user, tick]);
  return [status, useCallback(() => setTick((n) => n + 1), [])];
}

/** Recording order: Survival Wolof first, then everything else in the dictionary. */
export const RECORDING_ORDER: Entry[] = (() => {
  const seen = new Set<string>();
  return [...survivalSection.entries, ...dictionary].filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
})();

/** The next lines to record: not done by this recorder and without an approved voice yet. */
export function nextLines(done: { entry_id: string; mine: boolean; approved: boolean }[], skipped: Set<string>): Entry[] {
  const skip = new Set(done.filter((d) => d.mine || d.approved).map((d) => d.entry_id));
  return RECORDING_ORDER.filter((e) => !skip.has(e.id) && !skipped.has(e.id));
}

/** Best supported recording format in this browser/WebView. */
export function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"]) {
    if (MediaRecorder.isTypeSupported?.(m)) return m;
  }
  return "";
}

export const extFor = (mime: string) => (mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm");
export const safeName = (id: string) => id.replace(/[^a-zA-Z0-9._-]/g, "_");
