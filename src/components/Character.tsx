// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useId } from "react";

/**
 * Friendly animated people for dialogues and lessons, in an original soft
 * "storybook" style: painted light, warm hand-drawn outlines, big expressive eyes.
 * Drawn inline as SVG (no image files). They blink, breathe, tilt their head and
 * move their mouth while talking, wave hello, nod and hop when an answer is right
 * and shake their head when it's wrong; hair and headwraps follow a moment later
 * (secondary motion). All motion stops when the phone asks for reduced motion.
 */

export type Mood = "idle" | "talking" | "happy" | "sad" | "wave";

interface Look {
  skin: string;
  skinShade: string;
  skinLight: string;
  hair: string;
  /** Short coils, two puffs with a headband, a cap (kufi) or a headwrap. */
  style: "coils" | "puffs" | "kufi" | "wrap";
  accent: string;
  shirt: string;
  shirtShade: string;
  /** Wax-print dots on the shirt. */
  print: string;
  beard?: boolean;
  kid?: boolean;
}

const LOOKS: Record<string, Look> = {
  Awa: { skin: "#9a5f3c", skinShade: "#7a4529", skinLight: "#b8794f", hair: "#22160f", style: "puffs", accent: "#f4be3a", shirt: "#e8794a", shirtShade: "#c95e31", print: "#ffe2a6", kid: true },
  Lamine: { skin: "#86512f", skinShade: "#673b20", skinLight: "#a66a42", hair: "#1b120c", style: "coils", accent: "#3fbf78", shirt: "#3d9bd6", shirtShade: "#2a7cb5", print: "#d6efff", kid: true },
  Moodu: { skin: "#69412a", skinShade: "#4e2d1a", skinLight: "#85563a", hair: "#19110c", style: "kufi", accent: "#f7f3ea", shirt: "#4a8f5d", shirtShade: "#36704a", print: "#e6f4d6", beard: true },
  Fatou: { skin: "#774a2e", skinShade: "#5a341e", skinLight: "#946140", hair: "#170f0b", style: "wrap", accent: "#d4583a", shirt: "#8b4a7d", shirtShade: "#6e3763", print: "#f8d7ef" },
};
const EXTRA: Look[] = [
  { skin: "#a36a45", skinShade: "#835033", skinLight: "#bf8660", hair: "#1d140f", style: "coils", accent: "#f4be3a", shirt: "#1f8a8e", shirtShade: "#156b6e", print: "#d4f3f2" },
  { skin: "#7d4d2f", skinShade: "#5f371f", skinLight: "#9a6644", hair: "#150e0a", style: "wrap", accent: "#3d9bd6", shirt: "#f0b43a", shirtShade: "#cf9221", print: "#fff0c9" },
];

/** The look for a speaker's name (known course speakers, otherwise a stable pick). */
export function lookFor(name: string): Look {
  if (LOOKS[name]) return LOOKS[name]!;
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return EXTRA[h % EXTRA.length]!;
}

const LINE = "#3b2416";

export function Character({ name, mood = "idle", size = 96, className = "" }: { name: string; mood?: Mood; size?: number; className?: string }) {
  const look = lookFor(name);
  const id = useId().replace(/:/g, "");
  const happy = mood === "happy" || mood === "wave";
  const sad = mood === "sad";
  const ink = { stroke: LINE, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <span className={`character inline-block ${mood === "happy" ? "anim-hop" : "anim-breathe"} ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 120 120" width={size} height={size} className="block overflow-visible">
        <defs>
          <radialGradient id={`face${id}`} cx="42%" cy="34%" r="70%">
            <stop offset="0" stopColor={look.skinLight} />
            <stop offset="0.55" stopColor={look.skin} />
            <stop offset="1" stopColor={look.skinShade} />
          </radialGradient>
          <linearGradient id={`shirt${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={look.shirt} />
            <stop offset="1" stopColor={look.shirtShade} />
          </linearGradient>
          <radialGradient id={`blush${id}`}>
            <stop offset="0" stopColor="#ff8f7e" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ff8f7e" stopOpacity="0" />
          </radialGradient>
          <pattern id={`wax${id}`} width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="1.5" fill={look.print} opacity="0.75" />
          </pattern>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="60" cy="119" rx="34" ry="3.5" fill="#2b1a10" opacity="0.15" />

        {/* Waving arm (behind the body) */}
        {mood === "wave" ? (
          <g className="wave-arm" style={{ transformOrigin: "90px 102px", transformBox: "view-box" }}>
            <path d="M86 104 C95 94 99 82 101 72" stroke={look.shirtShade} strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M86 104 C95 94 99 82 101 72" stroke={look.shirt} strokeWidth="9" strokeLinecap="round" fill="none" />
            <circle cx="102" cy="66" r="7.5" fill={look.skin} {...ink} />
            <path d="M97 61 L96 56 M101.5 59 L101.5 53 M106 60 L107.5 55" stroke={look.skin} strokeWidth="3.2" strokeLinecap="round" />
          </g>
        ) : null}

        {/* Body: shirt with wax-print dots and a soft fold */}
        <path d="M21 121 C22 97 39 88 60 88 C81 88 98 97 99 121 Z" fill={`url(#shirt${id})`} {...ink} />
        <path d="M21 121 C22 97 39 88 60 88 C81 88 98 97 99 121 Z" fill={`url(#wax${id})`} />
        <path d="M34 108 C40 104 44 104 48 108" stroke={look.shirtShade} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M47 89 L60 100 L73 89" fill={look.skinShade} {...ink} />

        <g className={`head head-${mood}`} style={{ transformOrigin: "60px 84px", transformBox: "view-box" }}>
          {/* Neck */}
          <path d="M52 74 L52 90 Q60 94 68 90 L68 74 Z" fill={look.skinShade} />

          {/* Back hair / wrap tail (secondary motion) */}
          {look.style === "puffs" ? (
            <g className="hair-follow" style={{ transformOrigin: "60px 40px", transformBox: "view-box" }}>
              <circle cx="29" cy="33" r="14" fill={look.hair} {...ink} />
              <circle cx="91" cy="33" r="14" fill={look.hair} {...ink} />
              <path d="M22 28 Q27 22 33 24 M85 24 Q91 22 96 28" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          ) : null}
          {look.style === "wrap" ? (
            <g className="hair-follow" style={{ transformOrigin: "84px 24px", transformBox: "view-box" }}>
              <path d="M84 22 C98 16 104 24 100 34 C96 28 90 28 86 30 Z" fill={look.accent} {...ink} />
            </g>
          ) : null}

          {/* Ears */}
          <ellipse cx="34.5" cy="55" rx="6" ry="7.5" fill={look.skin} {...ink} />
          <ellipse cx="85.5" cy="55" rx="6" ry="7.5" fill={look.skin} {...ink} />

          {/* Face */}
          <path
            d={look.kid ? "M36 52 C36 30 47 24 60 24 C73 24 84 30 84 52 C84 68 74 80 60 80 C46 80 36 68 36 52 Z" : "M37 50 C37 29 48 22 60 22 C72 22 83 29 83 50 C83 69 73 82 60 82 C47 82 37 69 37 50 Z"}
            fill={`url(#face${id})`}
            {...ink}
          />

          {/* Front hair, cap or headwrap */}
          {look.style === "coils" ? (
            <path d="M35 47 C31 25 45 16 60 16 C76 16 89 25 85 47 C82 37 74 32 60 32 C46 32 38 37 35 47 Z" fill={look.hair} {...ink} />
          ) : null}
          {look.style === "puffs" ? (
            <>
              <path d="M36 45 C35 28 47 21 60 21 C73 21 85 28 84 45 C78 35 70 31 60 31 C50 31 42 35 36 45 Z" fill={look.hair} {...ink} />
              <path d="M37 38 C46 30 74 30 83 38" fill="none" stroke={look.accent} strokeWidth="5" strokeLinecap="round" />
            </>
          ) : null}
          {look.style === "kufi" ? (
            <>
              <path d="M37 38 C37 21 83 21 83 38 Z" fill={look.accent} {...ink} />
              <path d="M41 33 H79 M44 28 H76" stroke="#d8cdb8" strokeWidth="1.2" />
            </>
          ) : null}
          {look.style === "wrap" ? (
            <path d="M32 43 C32 18 88 18 88 43 C80 33 70 30 60 30 C50 30 40 33 32 43 Z" fill={look.accent} {...ink} />
          ) : null}
          {look.style === "wrap" ? <path d="M38 34 Q60 22 82 34" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none" /> : null}

          {/* Eyebrows */}
          <path d={sad ? "M42 41 Q47 43 52 45 M78 41 Q73 43 68 45" : "M42 44 Q47 40 52 43 M68 43 Q73 40 78 44"} stroke={look.hair} strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* Eyes: big, with two highlights; lids close to blink */}
          {happy ? (
            <path d="M42 53 Q47.5 46.5 53 53 M67 53 Q72.5 46.5 78 53" stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            <g className="blink" style={{ transformOrigin: "60px 53px", transformBox: "view-box" }}>
              <ellipse cx="47.5" cy="53" rx="5.8" ry="6.8" fill="#ffffff" {...ink} />
              <ellipse cx="72.5" cy="53" rx="5.8" ry="6.8" fill="#ffffff" {...ink} />
              <ellipse cx="48.2" cy="54" rx="4" ry="4.6" fill="#3a2214" />
              <ellipse cx="73.2" cy="54" rx="4" ry="4.6" fill="#3a2214" />
              <circle cx="49.8" cy="52" r="1.6" fill="#ffffff" />
              <circle cx="74.8" cy="52" r="1.6" fill="#ffffff" />
              <circle cx="46.8" cy="56" r="0.8" fill="#ffffff" opacity="0.8" />
              <circle cx="71.8" cy="56" r="0.8" fill="#ffffff" opacity="0.8" />
            </g>
          )}

          {/* Soft blush */}
          <ellipse cx="42" cy="63" rx="6" ry="4" fill={`url(#blush${id})`} opacity={happy ? 1 : 0.6} />
          <ellipse cx="78" cy="63" rx="6" ry="4" fill={`url(#blush${id})`} opacity={happy ? 1 : 0.6} />

          {/* Nose */}
          <path d="M57.5 59 Q60 63 62.5 59" stroke={look.skinShade} strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Beard */}
          {look.beard ? <path d="M40 62 C42 80 52 85 60 85 C68 85 78 80 80 62 C74 74 66 77 60 77 C54 77 46 74 40 62 Z" fill={look.hair} {...ink} /> : null}

          {/* Mouth */}
          {mood === "talking" ? (
            <g className="talk" style={{ transformOrigin: "60px 68px", transformBox: "view-box" }}>
              <ellipse cx="60" cy="68" rx="5.5" ry="4.2" fill="#6a2620" {...ink} />
              <ellipse cx="60" cy="70" rx="3" ry="1.4" fill="#e86f6a" />
            </g>
          ) : happy ? (
            <>
              <path d="M49 65 Q60 79 71 65 Z" fill="#6a2620" {...ink} />
              <path d="M53 72 Q60 76 67 72" fill="#e86f6a" />
            </>
          ) : sad ? (
            <path d="M52 71 Q60 65 68 71" stroke={LINE} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M52 66 Q60 72 68 66" stroke={LINE} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          )}
        </g>
      </svg>
    </span>
  );
}
