// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Community voices: approved recordings by native speakers
 * (supabase/migrations/*_voices.sql). The list is read without an account and
 * cached; each clip is downloaded once and kept on the device, so it also plays
 * offline afterwards. Anything missing falls back to the bundled audio.
 */
"use client";

import { useEffect } from "react";
import { setCommunityVoices } from "./audio";
import { getCloud } from "./cloud";

const LIST_KEY = "woloflink.voices.v1";
const LIST_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const CACHE = "woloflink-voices-v1";

export interface VoiceRow {
  entry_id: string;
  path: string;
  recorder: string;
  approved_at: string | null;
}

interface Cached {
  fetchedAt: number;
  rows: VoiceRow[];
}

export function rowsToVoices(rows: unknown[]): VoiceRow[] {
  return (rows as Record<string, unknown>[])
    .filter((r) => typeof r.entry_id === "string" && typeof r.path === "string" && /^[0-9a-f-]{36}\//.test(r.path))
    .map((r) => ({
      entry_id: r.entry_id as string,
      path: r.path as string,
      recorder: typeof r.recorder === "string" ? r.recorder : "",
      approved_at: typeof r.approved_at === "string" ? r.approved_at : null,
    }));
}

function readList(): Cached | null {
  try {
    const raw = window.localStorage.getItem(LIST_KEY);
    const c = raw ? (JSON.parse(raw) as Cached) : null;
    return c && Array.isArray(c.rows) ? c : null;
  } catch {
    return null;
  }
}

export async function loadVoices(force = false): Promise<VoiceRow[]> {
  const cached = readList();
  const cloud = getCloud();
  if (!cloud || (!force && cached && Date.now() - cached.fetchedAt < LIST_MAX_AGE_MS)) return cached?.rows ?? [];
  try {
    const rows = rowsToVoices((await cloud.rpc<unknown[]>("community_voices")) ?? []);
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify({ fetchedAt: Date.now(), rows }));
    } catch {
      // Still works for this session.
    }
    return rows;
  } catch {
    return cached?.rows ?? [];
  }
}

const urls = new Map<string, string>();

/** A playable URL for a stored clip: memory, then the device cache, then a download. */
export async function voiceUrl(path: string): Promise<string | null> {
  const known = urls.get(path);
  if (known) return known;
  const key = `https://voices.woloflink.invalid/${path}`;
  let blob: Blob | null = null;
  try {
    if (typeof caches !== "undefined") {
      const hit = await (await caches.open(CACHE)).match(key);
      if (hit) blob = await hit.blob();
    }
  } catch {
    // No cache available: download each session.
  }
  if (!blob) {
    const cloud = getCloud();
    if (!cloud?.downloadFile) return null;
    blob = await cloud.downloadFile("recordings", path);
    try {
      if (typeof caches !== "undefined") await (await caches.open(CACHE)).put(key, new Response(blob));
    } catch {
      // Fine: it plays now, and downloads again next time.
    }
  }
  const url = URL.createObjectURL(blob);
  urls.set(path, url);
  return url;
}

/** Contributors to credit (name → number of approved lines). */
export function credits(rows: VoiceRow[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of rows) if (r.recorder) counts.set(r.recorder, (counts.get(r.recorder) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Mount once: loads the approved voices and hands them to the audio player. */
export function VoicesLoader() {
  useEffect(() => {
    let alive = true;
    const apply = (rows: VoiceRow[]) => alive && setCommunityVoices(new Map(rows.map((r) => [r.entry_id, r.path])), voiceUrl);
    const cached = readList();
    if (cached) apply(cached.rows);
    void loadVoices().then(apply);
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
