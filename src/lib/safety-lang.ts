// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Picks the interface language for the crash and "not found" screens without the app's store,
 * because those screens must still work when the store itself is what broke. Order: the
 * language saved in the learner's progress, then the phone's language, then English.
 */
import { UI_LANGS, type UiLang } from "@/content/types";

function isUiLang(v: unknown): v is UiLang {
  return typeof v === "string" && (UI_LANGS as readonly string[]).includes(v);
}

/** `saved` is the raw progress JSON from storage; `phone` is navigator.language. */
export function safetyLang(saved: string | null | undefined, phone: string | null | undefined): UiLang {
  if (saved) {
    try {
      const lang: unknown = (JSON.parse(saved) as { profile?: { uiLang?: unknown } } | null)?.profile?.uiLang;
      if (isUiLang(lang)) return lang;
    } catch {
      // Damaged progress: fall through to the phone's language.
    }
  }
  const prefix = phone?.slice(0, 2).toLowerCase();
  return isUiLang(prefix) ? prefix : "en";
}

/** Reads both from the browser; English on the server or if storage is blocked. */
export function readSafetyLang(): UiLang {
  if (typeof window === "undefined") return "en";
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem("woloflink.progress.v1");
  } catch {
    // Storage blocked: use the phone's language.
  }
  return safetyLang(saved, window.navigator?.language);
}
