// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * In-app navigation helpers. Inside the phone app, a plain web link (<a href>) or a
 * page reload restarts the app at the home screen, so screens must always move with
 * the app's own router. Going to the screen you are already on (rematch, play again,
 * practise again) doesn't reload it either, so those restart the screen in place.
 */
"use client";

import { useEffect, useState } from "react";

const RESTART = "woloflink:restart";

/** Path of a link without its query or hash, always ending in "/". */
export function pathOf(href: string): string {
  const path = href.split(/[?#]/)[0] ?? "";
  return path.endsWith("/") ? path : `${path}/`;
}

/** True when a link points at the screen that is already showing. */
export function isSameScreen(href: string, currentPath: string): boolean {
  return pathOf(href) === pathOf(currentPath);
}

/**
 * Goes to `href` with the app's router; if that is the screen already showing, puts
 * the new address in place and restarts the screen (see useRestartKey).
 */
export function goTo(router: { replace: (href: string) => void }, href: string) {
  if (typeof window !== "undefined" && isSameScreen(href, window.location.pathname)) {
    window.history.replaceState(null, "", href);
    window.dispatchEvent(new Event(RESTART));
    return;
  }
  router.replace(href);
}

/** A number that goes up each time the screen is asked to restart: use it as a `key`. */
export function useRestartKey(): number {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const bump = () => setRun((n) => n + 1);
    window.addEventListener(RESTART, bump);
    return () => window.removeEventListener(RESTART, bump);
  }, []);
  return run;
}
