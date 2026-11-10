// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useId, useMemo, type ReactNode } from "react";
import { seeded } from "@/lib/engine";
import { ROUNDS } from "@/lib/duels";

/**
 * A painted Senegalese pirogue, shaded so it reads as a lit 3D boat: a curved hull
 * with a highlight and shadow, painted triangles, a sail and a foam wake.
 */
export function Pirogue({ hull, trim, size = 64, wake = false }: { hull: string; trim: string; size?: number; wake?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" aria-hidden className="pirogue block overflow-visible">
      <defs>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.25" stopColor={hull} />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hull} />
          <stop offset="1" stopColor={hull} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7e0" />
          <stop offset="1" stopColor="#e9c46a" />
        </linearGradient>
      </defs>
      {wake ? (
        <g className="wake" opacity="0.8">
          <ellipse cx="6" cy="52" rx="10" ry="2.2" fill="#e8fbff" />
          <ellipse cx="-12" cy="54" rx="8" ry="1.6" fill="#e8fbff" opacity="0.6" />
          <ellipse cx="-26" cy="55" rx="6" ry="1.2" fill="#e8fbff" opacity="0.35" />
        </g>
      ) : null}
      {/* Reflection */}
      <path d="M12 50 C24 58 76 58 88 50 Z" fill={`url(#b${id})`} opacity="0.35" />
      {/* Sail and mast */}
      <path d="M50 44 L50 4 L76 34 Z" fill={`url(#s${id})`} />
      <path d="M50 46 L50 2" stroke="#2b1d12" strokeWidth="2.2" strokeLinecap="round" />
      {/* Hull */}
      <path d="M4 26 C10 44 28 50 50 50 C72 50 90 44 96 26 C80 38 20 38 4 26 Z" fill={`url(#h${id})`} />
      <path d="M8 30 C24 41 76 41 92 30" fill="none" stroke={trim} strokeWidth="3.5" strokeLinecap="round" />
      {/* Painted triangles along the side */}
      <path d="M24 40 l5 -6 l5 6 Z M40 42 l5 -6 l5 6 Z M56 42 l5 -6 l5 6 Z M72 40 l5 -6 l5 6 Z" fill="#fff" opacity="0.85" />
      <path d="M4 26 C20 36 80 36 96 26" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
    </svg>
  );
}

/** A sunny day at sea behind every duel screen: sky, sun, drifting clouds, moving waves and bubbles. */
export function DuelScene({ children, lowEnd = false }: { children: ReactNode; lowEnd?: boolean }) {
  const sparks = useMemo(() => {
    const rng = seeded(11);
    return Array.from({ length: lowEnd ? 6 : 16 }, () => ({
      left: rng() * 100,
      bottom: 10 + rng() * 40,
      delay: rng() * 6,
      duration: 5 + rng() * 5,
      size: 2 + rng() * 3,
    }));
  }, [lowEnd]);
  return (
    <div className="duel-scene relative min-h-dvh overflow-hidden text-night">
      <div aria-hidden className="duel-sky absolute inset-0" />
      <div aria-hidden className={`duel-stars absolute inset-x-0 top-0 h-1/2 ${lowEnd ? "" : "anim-twinkle"}`} />
      <div aria-hidden className="duel-glow absolute inset-x-0 top-0 h-56" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[34%]">
        {[
          { cls: "wave-far", d: 22, fill: "#5cc8e0" },
          { cls: "wave-mid", d: 14, fill: "#33b0d0" },
          { cls: "wave-near", d: 9, fill: "#1592b6" },
        ].map((w, i) => (
          <svg
            key={w.cls}
            className={`duel-wave absolute left-0 h-24 w-[200%] ${lowEnd && i < 2 ? "" : "anim-wave"}`}
            style={{ bottom: `${(2 - i) * 18}%`, animationDuration: `${w.d}s` }}
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
          >
            <path d="M0 20 Q25 8 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20 V40 H0 Z" fill={w.fill} />
            <path d="M0 20 Q25 8 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20" fill="none" stroke="#ffffff" strokeOpacity={0.5 + i * 0.15} strokeWidth="1" />
          </svg>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#1592b6]" />
      </div>
      {sparks.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="duel-spark absolute rounded-full"
          style={{ left: `${s.left}%`, bottom: `${s.bottom}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * The race: your pirogue sails with each answer (further for faster right answers);
 * the friend's appears for the results. Buoys mark the end of each round.
 */
export function DuelRace({
  mine,
  theirs,
  label,
}: {
  /** 0–1 along the course. */
  mine: number;
  /** 0–1, or null to hide the friend's boat. */
  theirs: number | null;
  label: string;
}) {
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const pos = (x: number, w: number) => `calc(${clamp(x) * 100}% - ${clamp(x) * w}px)`;
  return (
    <div className="relative h-24 w-full" role="img" aria-label={label}>
      <div aria-hidden className="race-lane absolute inset-x-0 bottom-3 h-1.5 rounded-full" />
      {ROUNDS.slice(1).map(([start]) => (
        <span key={start} aria-hidden className="race-buoy absolute bottom-2 h-4 w-4 -translate-x-1/2 rounded-full" style={{ left: `${(start / 10) * 100}%` }} />
      ))}
      <span aria-hidden className="race-finish absolute right-0 bottom-1 h-10 w-2 rounded-sm" />
      {theirs !== null ? (
        <span aria-hidden className="race-boat anim-bob absolute bottom-9 opacity-90" style={{ left: pos(theirs, 54) }}>
          <Pirogue hull="#7b3f8c" trim="#f2c14e" size={54} wake />
        </span>
      ) : null}
      <span aria-hidden className="race-boat anim-bob absolute bottom-3" style={{ left: pos(mine, 64) }}>
        <Pirogue hull="#c2502f" trim="#f2c14e" wake />
      </span>
    </div>
  );
}
