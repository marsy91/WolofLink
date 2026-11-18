// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The browser/screen-reader title for a screen: its main heading plus the app name, so every
 * screen announces where it is. Falls back to the app's default title when there's no heading.
 */
export const APP_TITLE = "WolofLink — learn Wolof";
const SUFFIX = "WolofLink";

export function pageTitle(heading: string | null | undefined): string {
  const h = (heading ?? "").replace(/\s+/g, " ").trim();
  if (!h || h.length > 80) return APP_TITLE;
  return h.toLowerCase().includes(SUFFIX.toLowerCase()) ? h : `${h} — ${SUFFIX}`;
}
