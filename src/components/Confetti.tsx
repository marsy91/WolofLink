// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useMemo } from "react";
import { seeded } from "@/lib/engine";

// Theme colours (they follow Settings → Theme).
const COLORS = ["var(--color-sun)", "var(--color-clay)", "var(--color-sea)", "var(--color-dusk)", "var(--color-night)"];

/** A one-shot burst of small diamonds and dots in the app palette (CSS only). */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const bits = useMemo(() => {
    const rng = seeded(7);
    return Array.from({ length: pieces }, (_, i) => ({
      left: rng() * 100,
      delay: rng() * 0.35,
      duration: 1.4 + rng() * 0.9,
      drift: (rng() - 0.5) * 120,
      spin: (rng() - 0.5) * 720,
      size: 6 + rng() * 6,
      color: COLORS[i % COLORS.length],
      round: rng() > 0.6,
    }));
  }, [pieces]);
  return (
    <div aria-hidden className="confetti pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              background: b.color,
              borderRadius: b.round ? "50%" : "2px",
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              "--drift": `${b.drift}px`,
              "--spin": `${b.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
