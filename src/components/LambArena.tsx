// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useId, useMemo, type ReactNode } from "react";
import { seeded } from "@/lib/engine";

/**
 * Wrestling (làmb) duels: an original illustration, not any real wrestler or event.
 * A crouched wrestler in a loincloth (ngemb) with a headband and arm bands, drawn facing
 * right and lit from the top left. `flip` turns him to face left.
 */
export function Wrestler({
  cloth,
  trim,
  skin = "#5a3a26",
  size = 96,
  flip = false,
  fallen = false,
}: {
  cloth: string;
  trim: string;
  skin?: string;
  size?: number;
  flip?: boolean;
  /** Thrown out of the circle. */
  fallen?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 120 138"
      aria-hidden
      className={`wrestler block overflow-visible ${fallen ? "wrestler-fallen" : ""}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id={`k${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.35" stopColor={skin} stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.4" stopColor={cloth} stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* Shadow on the sand */}
      <ellipse cx="58" cy="134" rx="40" ry="4" fill="#000" opacity="0.18" />
      {/* Back leg */}
      <path d="M52 90 L34 110 L24 132" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="22" cy="133" rx="8" ry="3.5" fill={skin} />
      {/* Front leg */}
      <path d="M62 92 L78 112 L86 132" fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="90" cy="133" rx="8" ry="3.5" fill={skin} />
      {/* Torso, leaning in */}
      <path d="M44 94 C40 74 56 50 80 44 L98 52 C92 70 78 88 70 96 Z" fill={skin} />
      <path d="M44 94 C40 74 56 50 80 44 L98 52 C92 70 78 88 70 96 Z" fill={`url(#k${id})`} />
      {/* Back arm (behind), reaching for the grip */}
      <path d="M80 54 L100 70 L114 68" fill="none" stroke={skin} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {/* Head and headband */}
      <circle cx="100" cy="38" r="11" fill={skin} />
      <circle cx="100" cy="38" r="11" fill={`url(#k${id})`} />
      <path d="M89.5 35 C95 32 105 32 110.5 35" fill="none" stroke={trim} strokeWidth="3.5" strokeLinecap="round" />
      {/* Front arm, gripping */}
      <path d="M90 52 L108 62 L120 56" fill="none" stroke={skin} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arm band */}
      <path d="M95 52 L101 57" stroke={trim} strokeWidth="5" strokeLinecap="round" />
      {/* Loincloth (ngemb) with its knot and a hanging end */}
      <path d="M40 86 L72 92 L70 106 L38 100 Z" fill={cloth} />
      <path d="M40 86 L72 92 L70 106 L38 100 Z" fill={`url(#c${id})`} />
      <path d="M40 87 L72 93" stroke={trim} strokeWidth="2.5" />
      <path d="M46 99 C44 108 40 114 36 118 L44 117 C48 112 51 106 52 100 Z" fill={cloth} />
      {/* Small leather amulets on a cord at the waist */}
      <circle cx="56" cy="97" r="2.6" fill="#7a4a1c" />
      <circle cx="63" cy="98.5" r="2.6" fill="#7a4a1c" />
    </svg>
  );
}

/** Evening at the arena behind every duel screen: warm sky, floodlights, the crowd, the sand. */
export function ArenaScene({ children, lowEnd = false }: { children: ReactNode; lowEnd?: boolean }) {
  const dust = useMemo(() => {
    const rng = seeded(17);
    return Array.from({ length: lowEnd ? 5 : 14 }, () => ({
      left: rng() * 100,
      bottom: 6 + rng() * 26,
      delay: rng() * 6,
      duration: 5 + rng() * 5,
      size: 2 + rng() * 3,
    }));
  }, [lowEnd]);
  return (
    <div className="arena-scene relative min-h-dvh overflow-hidden text-night">
      <div aria-hidden className="arena-sky absolute inset-0" />
      <div aria-hidden className="arena-lights absolute inset-x-0 top-0 h-64" />
      <div aria-hidden className={`arena-crowd absolute inset-x-0 ${lowEnd ? "" : "anim-crowd"}`} />
      <div aria-hidden className="arena-bunting absolute inset-x-0" />
      <div aria-hidden className="arena-sand absolute inset-x-0 bottom-0" />
      {dust.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="duel-spark arena-dust absolute rounded-full"
          style={{ left: `${s.left}%`, bottom: `${s.bottom}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * The sand circle with the two wrestlers locked together. `balance` runs from -1 (I am at the
 * edge) to +1 (they are); past ±1 the loser is thrown out. While the friend's answers are
 * hidden, they show as a dark shape.
 */
export function LambRing({
  balance,
  label,
  hiddenOpponent = false,
  size = 92,
}: {
  balance: number;
  label: string;
  hiddenOpponent?: boolean;
  size?: number;
}) {
  const b = Math.max(-1.4, Math.min(1.4, balance));
  const theyFell = b > 1;
  const iFell = b < -1;
  // The pair slides across the circle; a throw then happens at the edge, inside the screen.
  const shift = `${Math.max(-1, Math.min(1, b)) * 26}%`;
  return (
    <div className="relative h-44 w-full" role="img" aria-label={label}>
      <div aria-hidden className="lamb-ring absolute inset-x-[4%] bottom-1 h-20 rounded-[50%]" />
      <div aria-hidden className="lamb-ring-inner absolute inset-x-[12%] bottom-4 h-14 rounded-[50%]" />
      <div className="lamb-pair absolute bottom-3 left-1/2 flex items-end" style={{ transform: `translateX(calc(-50% + ${shift}))` }}>
        <span className={`-mr-6 ${iFell ? "lamb-thrown-left" : "anim-strain"}`}>
          <Wrestler cloth="#c2502f" trim="#f2c14e" size={size} fallen={iFell} />
        </span>
        <span className={`${theyFell ? "lamb-thrown-right" : "anim-strain"} ${hiddenOpponent ? "lamb-shadow" : ""}`}>
          <Wrestler cloth="#7b3f8c" trim="#ffffff" skin="#4a2e1e" size={size} flip fallen={theyFell} />
        </span>
      </div>
    </div>
  );
}
