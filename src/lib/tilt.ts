// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * A light "3D" feel without a 3D engine: elements registered here get two CSS
 * variables, --px and --py (-1…1), that follow the finger or mouse (relative to the
 * element) and, when nothing is touching, the tilt of the phone. CSS uses them to
 * turn characters in perspective, move their eyes and shift scene layers by depth.
 * Nothing runs when the phone asks for reduced motion.
 */
"use client";

import { useEffect, type RefObject } from "react";

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/** Where a point is relative to a box's centre, as -1…1 of half the screen. */
export function tiltFrom(pointX: number, pointY: number, box: { left: number; top: number; width: number; height: number }, screenW: number, screenH: number): [number, number] {
  return [clamp((pointX - (box.left + box.width / 2)) / (screenW / 2)), clamp((pointY - (box.top + box.height / 2)) / (screenH / 2))];
}

/** Phone tilt (degrees) as -1…1: held upright at about 45° counts as level. */
export function tiltFromOrientation(gamma: number | null, beta: number | null): [number, number] {
  return [clamp((gamma ?? 0) / 30), clamp(((beta ?? 45) - 45) / 30)];
}

const els = new Set<HTMLElement>();
let pointer: { x: number; y: number } | null = null;
let lean: [number, number] = [0, 0];
let frame = 0;

function apply() {
  frame = 0;
  for (const el of els) {
    const [x, y] = pointer ? tiltFrom(pointer.x, pointer.y, el.getBoundingClientRect(), window.innerWidth, window.innerHeight) : lean;
    el.style.setProperty("--px", x.toFixed(3));
    el.style.setProperty("--py", y.toFixed(3));
  }
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(apply);
};
const onMove = (e: PointerEvent) => {
  pointer = { x: e.clientX, y: e.clientY };
  schedule();
};
const onEnd = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") pointer = null;
  schedule();
};
const onLean = (e: DeviceOrientationEvent) => {
  const next = tiltFromOrientation(e.gamma, e.beta);
  if (Math.abs(next[0] - lean[0]) < 0.02 && Math.abs(next[1] - lean[1]) < 0.02) return;
  lean = next;
  if (!pointer) schedule();
};

function start() {
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  window.addEventListener("pointerup", onEnd, { passive: true });
  window.addEventListener("pointercancel", onEnd, { passive: true });
  window.addEventListener("deviceorientation", onLean, { passive: true });
}
function stop() {
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerdown", onMove);
  window.removeEventListener("pointerup", onEnd);
  window.removeEventListener("pointercancel", onEnd);
  window.removeEventListener("deviceorientation", onLean);
  pointer = null;
}

/** Makes an element follow the finger and the phone's tilt through --px / --py. */
export function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window.matchMedia !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!els.size) start();
    els.add(el);
    return () => {
      els.delete(el);
      if (!els.size) stop();
    };
  }, [ref]);
}
