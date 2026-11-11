// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useRef, type ReactNode } from "react";
import { useTilt } from "@/lib/tilt";

/**
 * A soft, painted Senegalese backdrop for dialogues: warm sky with a gentle sun,
 * drifting clouds, a baobab on the hills, swaying grass and floating seeds.
 * The layers shift by depth as you move a finger or tilt the phone (parallax).
 * Original artwork drawn inline (no image files); calm when motion is reduced.
 */
export function StoryScene({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useTilt(root);
  return (
    <div ref={root} className={`story-scene relative overflow-hidden ${className}`}>
      <svg className="absolute inset-0 h-full w-full scale-110" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfe3f2" />
            <stop offset="0.55" stopColor="#f6e7c8" />
            <stop offset="1" stopColor="#f3d9a6" />
          </linearGradient>
          <radialGradient id="ss-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff4c2" />
            <stop offset="0.45" stopColor="#ffe08a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="200" fill="url(#ss-sky)" />
        <g className="ss-far">
        <circle cx="318" cy="58" r="46" fill="url(#ss-sun)" />
        <g className="ss-clouds" fill="#ffffff" opacity="0.85">
          <ellipse cx="80" cy="42" rx="34" ry="11" />
          <ellipse cx="102" cy="36" rx="20" ry="10" />
          <ellipse cx="232" cy="28" rx="28" ry="8" />
          <ellipse cx="250" cy="24" rx="15" ry="8" />
        </g>
        </g>
        <g className="ss-mid">
        {/* Far hills and a baobab */}
        <path d="M0 140 C60 118 120 124 180 134 C250 146 320 116 400 126 V200 H0 Z" fill="#e9c98f" />
        <g fill="#b08257" opacity="0.85">
          <path d="M92 132 C92 112 90 100 94 92 L102 92 C106 100 104 112 104 132 Z" />
          <path d="M98 94 C86 86 72 90 66 80 M98 94 C110 84 124 88 132 78 M98 92 C96 80 92 72 98 64 M98 92 C104 82 112 76 116 70" stroke="#b08257" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="66" cy="78" rx="12" ry="6" />
          <ellipse cx="132" cy="76" rx="13" ry="6" />
          <ellipse cx="98" cy="62" rx="12" ry="6" />
          <ellipse cx="117" cy="68" rx="9" ry="5" />
        </g>
        </g>
        <g className="ss-near">
        {/* Near ground */}
        <path d="M0 160 C80 150 160 156 240 162 C300 166 350 156 400 158 V200 H0 Z" fill="#dcb376" />
        {/* Grass tufts that sway */}
        {[24, 70, 150, 205, 262, 330, 372].map((x, i) => (
          <g key={x} className="ss-grass" style={{ transformOrigin: `${x}px 168px`, transformBox: "view-box", animationDelay: `${(i % 4) * 0.4}s` }}>
            <path d={`M${x} 170 C${x - 2} 160 ${x - 6} 154 ${x - 9} 150 M${x} 170 C${x + 1} 158 ${x + 2} 152 ${x + 1} 146 M${x} 170 C${x + 3} 160 ${x + 7} 155 ${x + 10} 152`} stroke="#8fa04f" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>
        ))}
        </g>
        {/* Floating seeds in the light */}
        {[60, 140, 210, 290, 350].map((x, i) => (
          <circle key={x} className="ss-seed" cx={x} cy={120} r="1.8" fill="#fffbe8" style={{ animationDelay: `${i * 1.3}s` }} />
        ))}
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
