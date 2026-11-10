// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { ROUNDS } from "@/lib/duels";

/** A painted pirogue (fishing canoe), drawn inline so it costs nothing to load. */
export function Pirogue({ hull, stripe, size = 56 }: { hull: string; stripe: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 80 44" aria-hidden className="block">
      <path d="M8 6 C14 30 28 34 40 34 C52 34 66 30 72 6 C60 20 20 20 8 6 Z" fill={hull} />
      <path d="M14 15 C26 25 54 25 66 15" fill="none" stroke={stripe} strokeWidth="4" strokeLinecap="round" />
      <path d="M20 23 C30 29 50 29 60 23" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M40 30 L40 2 L60 22 Z" fill="var(--color-sun)" stroke="var(--color-night)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M40 34 L40 2" stroke="var(--color-night)" strokeWidth="2" />
    </svg>
  );
}

/**
 * The race along the waves: your pirogue moves with each answer (further for faster
 * right answers); the friend's appears for the results. Round markers sit between rounds.
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
  const pos = (x: number) => `calc(${Math.min(1, Math.max(0, x)) * 100}% - ${Math.min(1, Math.max(0, x)) * 56}px)`;
  return (
    <div className="relative h-20 w-full" role="img" aria-label={label}>
      <svg className="absolute inset-x-0 bottom-1 h-5 w-full" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden>
        <path d="M0 10 Q 12.5 2 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10 V20 H0 Z" fill="var(--color-sea)" opacity="0.25" />
        <path d="M0 10 Q 12.5 2 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10" fill="none" stroke="var(--color-sea)" strokeWidth="1.5" />
      </svg>
      {ROUNDS.slice(1).map(([start]) => (
        <span key={start} aria-hidden className="absolute bottom-1 h-6 w-0.5 rounded bg-sand-3" style={{ left: `${(start / 10) * 100}%` }} />
      ))}
      <span aria-hidden className="absolute right-0 bottom-1 h-8 w-1 rounded bg-night" />
      {theirs !== null ? (
        <span aria-hidden className="race-boat anim-bob absolute bottom-7 opacity-85" style={{ left: pos(theirs) }}>
          <Pirogue hull="var(--color-dusk)" stripe="var(--color-sea)" size={50} />
        </span>
      ) : null}
      <span aria-hidden className="race-boat anim-bob absolute bottom-2" style={{ left: pos(mine) }}>
        <Pirogue hull="var(--color-clay)" stripe="var(--color-sun)" />
      </span>
    </div>
  );
}
