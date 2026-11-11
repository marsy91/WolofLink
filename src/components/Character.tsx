// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useId } from "react";

/**
 * Friendly animated people for dialogues and lessons: original drawings (inline SVG,
 * no image files) of the course's speakers. They blink, bob gently, move their mouth
 * while their line plays (tilting their head), wave hello, nod and hop when an answer
 * is right, and shake their head when it's wrong. All motion stops when the phone asks for reduced motion.
 */

export type Mood = "idle" | "talking" | "happy" | "sad" | "wave";

interface Look {
  skin: string;
  skinShade: string;
  hair: string;
  /** Hair style: short coils, two puffs with a headband, a cap (kufi) or a headwrap. */
  style: "coils" | "puffs" | "kufi" | "wrap";
  accent: string;
  shirt: string;
  beard?: boolean;
  kid?: boolean;
}

const LOOKS: Record<string, Look> = {
  Awa: { skin: "#8a5536", skinShade: "#6f4229", hair: "#1c1310", style: "puffs", accent: "#f2b630", shirt: "#e0703f", kid: true },
  Lamine: { skin: "#7a4a2e", skinShade: "#5f3822", hair: "#17100c", style: "coils", accent: "#2fb36b", shirt: "#2f8fce", kid: true },
  Moodu: { skin: "#5e3a24", skinShade: "#47291a", hair: "#15100d", style: "kufi", accent: "#ffffff", shirt: "#3b7d4f", beard: true },
  Fatou: { skin: "#6b4127", skinShade: "#52301c", hair: "#140e0b", style: "wrap", accent: "#c2502f", shirt: "#7a3b69" },
};
const EXTRA: Look[] = [
  { skin: "#9a6240", skinShade: "#7c4c30", hair: "#1a120e", style: "coils", accent: "#f2b630", shirt: "#0f6e72" },
  { skin: "#734528", skinShade: "#58331d", hair: "#120c0a", style: "wrap", accent: "#2f8fce", shirt: "#f2b630" },
];

/** The look for a speaker's name (known course speakers, otherwise a stable pick). */
export function lookFor(name: string): Look {
  if (LOOKS[name]) return LOOKS[name]!;
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return EXTRA[h % EXTRA.length]!;
}

export function Character({ name, mood = "idle", size = 96, className = "" }: { name: string; mood?: Mood; size?: number; className?: string }) {
  const look = lookFor(name);
  const id = useId().replace(/:/g, "");
  const happy = mood === "happy" || mood === "wave";
  const sad = mood === "sad";
  return (
    <span className={`character inline-block ${mood === "happy" ? "anim-hop" : "anim-breathe"} ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 120 120" width={size} height={size} className="block overflow-visible">
        <defs>
          <radialGradient id={`face${id}`} cx="45%" cy="38%" r="65%">
            <stop offset="0" stopColor={look.skin} />
            <stop offset="1" stopColor={look.skinShade} />
          </radialGradient>
        </defs>
        {/* Shoulders and shirt */}
        <path d="M22 120 C24 96 40 88 60 88 C80 88 96 96 98 120 Z" fill={look.shirt} />
        <path d="M48 89 L60 101 L72 89" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" strokeLinejoin="round" />
        {/* Waving arm (behind the head) */}
        {mood === "wave" ? (
          <g className="wave-arm" style={{ transformOrigin: "92px 100px", transformBox: "view-box" }}>
            <path d="M88 102 C96 92 100 80 102 70" stroke={look.shirt} strokeWidth="11" strokeLinecap="round" fill="none" />
            <circle cx="103" cy="64" r="7.5" fill={look.skin} />
            <path d="M98 59 L97 54 M102 57 L102 51 M106 58 L107 53" stroke={look.skin} strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : null}
        <g className={`head head-${mood}`} style={{ transformOrigin: "60px 82px", transformBox: "view-box" }}>
        {/* Neck */}
        <rect x="52" y="76" width="16" height="14" rx="6" fill={look.skinShade} />
        {/* Back hair / wrap */}
        {look.style === "puffs" ? (
          <>
            <circle cx="30" cy="34" r="14" fill={look.hair} />
            <circle cx="90" cy="34" r="14" fill={look.hair} />
          </>
        ) : null}
        {look.style === "wrap" ? <path d="M30 40 C30 12 90 12 90 40 C96 44 98 30 92 20 C80 4 40 4 28 20 C22 30 24 44 30 40 Z" fill={look.accent} /> : null}
        {/* Ears */}
        <circle cx="34" cy="54" r="7" fill={look.skinShade} />
        <circle cx="86" cy="54" r="7" fill={look.skinShade} />
        {/* Face */}
        <ellipse cx="60" cy="52" rx={look.kid ? 25 : 24} ry={look.kid ? 27 : 29} fill={`url(#face${id})`} />
        {/* Front hair, caps and wraps */}
        {look.style === "coils" ? (
          <path d="M35 46 C33 26 46 18 60 18 C76 18 88 26 85 46 C82 36 74 31 60 31 C46 31 38 36 35 46 Z" fill={look.hair} />
        ) : null}
        {look.style === "puffs" ? (
          <>
            <path d="M36 44 C35 28 47 22 60 22 C73 22 85 28 84 44 C78 34 70 31 60 31 C50 31 42 34 36 44 Z" fill={look.hair} />
            <path d="M37 38 C46 30 74 30 83 38" fill="none" stroke={look.accent} strokeWidth="5" strokeLinecap="round" />
          </>
        ) : null}
        {look.style === "kufi" ? (
          <>
            <path d="M37 38 C37 22 83 22 83 38 Z" fill={look.accent} />
            <path d="M40 33 H80" stroke="#d9d9d9" strokeWidth="1.5" />
          </>
        ) : null}
        {look.style === "wrap" ? (
          <path d="M33 42 C34 24 86 24 87 42 C80 33 70 30 60 30 C50 30 40 33 33 42 Z" fill={look.accent} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
        ) : null}
        {/* Eyebrows */}
        <path d={sad ? "M43 42 L53 45 M77 42 L67 45" : "M43 44 Q48 41 53 44 M67 44 Q72 41 77 44"} stroke={look.hair} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* Eyes (blink) */}
        <g className="blink" style={{ transformOrigin: "60px 52px" }}>
          {happy ? (
            <path d="M43 53 Q48 47 53 53 M67 53 Q72 47 77 53" stroke="#1d1410" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            <>
              <ellipse cx="48" cy="52" rx="5" ry="5.6" fill="#ffffff" />
              <ellipse cx="72" cy="52" rx="5" ry="5.6" fill="#ffffff" />
              <circle cx="48.6" cy="52.8" r="3.2" fill="#2a1a12" />
              <circle cx="72.6" cy="52.8" r="3.2" fill="#2a1a12" />
              <circle cx="49.8" cy="51.4" r="1.1" fill="#ffffff" />
              <circle cx="73.8" cy="51.4" r="1.1" fill="#ffffff" />
            </>
          )}
        </g>
        {/* Cheeks */}
        <circle cx="42" cy="62" r="4" fill="#ff8a7a" opacity={happy ? 0.45 : 0.25} />
        <circle cx="78" cy="62" r="4" fill="#ff8a7a" opacity={happy ? 0.45 : 0.25} />
        {/* Nose */}
        <path d="M58 58 Q60 62 62 58" stroke={look.skinShade} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Beard */}
        {look.beard ? <path d="M40 62 C42 80 52 84 60 84 C68 84 78 80 80 62 C74 74 66 76 60 76 C54 76 46 74 40 62 Z" fill={look.hair} opacity="0.9" /> : null}
        {/* Mouth */}
        {mood === "talking" ? (
          <ellipse className="talk" cx="60" cy="68" rx="6" ry="4" fill="#5a1f1a" style={{ transformOrigin: "60px 68px" }} />
        ) : happy ? (
          <path d="M49 65 Q60 78 71 65 Z" fill="#5a1f1a" stroke="#5a1f1a" strokeWidth="1.5" strokeLinejoin="round" />
        ) : sad ? (
          <path d="M51 71 Q60 64 69 71" stroke="#5a1f1a" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M51 66 Q60 73 69 66" stroke="#5a1f1a" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
        {happy ? <path d="M53 67 H67" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" /> : null}
        </g>
      </svg>
    </span>
  );
}
