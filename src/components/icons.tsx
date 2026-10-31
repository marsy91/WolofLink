// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Original WolofLink icon set: 24×24, round 2px strokes, `currentColor`.
 * Decorative by default; pass `title` to expose an accessible name.
 */
import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string; size?: number };

function Svg({ title, size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Lessons: a winding route with two stops. */
export const IconPath = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 19c0-3.5 3-4.5 6-5.5s6-2 6-5.5" strokeDasharray="0.1 3.2" />
    <circle cx="6" cy="19.5" r="2" fill="currentColor" />
    <path d="M18 3.5c-1.9 0-3 1.4-3 2.9C15 8.6 18 11 18 11s3-2.4 3-4.6c0-1.5-1.1-2.9-3-2.9Z" />
  </Svg>
);

/** Practice: two arrows chasing each other round a circle. */
export const IconLoop = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.5 12A7.5 7.5 0 0 1 7 17.6" />
    <path d="M4.5 12A7.5 7.5 0 0 1 17 6.4" />
    <path d="M17.5 3v3.6h-3.6M6.5 21v-3.6h3.6" />
  </Svg>
);

/** League: three podium blocks. */
export const IconPodium = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 21V9h6v12M3 21v-7h6M15 21v-5h6v5M2 21h20" />
    <path d="m12 3 .9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 5.1l2-.3Z" />
  </Svg>
);

/** Profile: a figure inside a rounded frame. */
export const IconProfile = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="6" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 18.5c1-2.4 2.8-3.5 5-3.5s4 1.1 5 3.5" />
  </Svg>
);

/** Streak: a rising sun over the horizon. */
export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 17a5.5 5.5 0 0 1 11 0" />
    <path d="M2 17h20M12 4.5v3M4.6 9.6l2 1.6M19.4 9.6l-2 1.6M5 21h14" />
  </Svg>
);

/** Lives: a water drop. */
export const IconDrop = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p}>
    <path
      d="M12 3.2s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z"
      fill={filled ? "currentColor" : "none"}
    />
    {filled ? <path d="M9.5 14.5a2.6 2.6 0 0 0 2 2.4" stroke="white" strokeOpacity={0.7} /> : null}
  </Svg>
);

/** XP: a four-point spark. */
export const IconSpark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5c.8 4.6 2.9 6.7 7.5 7.5-4.6.8-6.7 2.9-7.5 7.5-.8-4.6-2.9-6.7-7.5-7.5 4.6-.8 6.7-2.9 7.5-7.5Z" />
    <path d="M19 17.5v4M17 19.5h4" />
  </Svg>
);

/** Audio: a speaker with sound waves. */
export const IconSpeaker = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
  </Svg>
);

/** Slow playback: a snail. */
export const IconSnail = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 18h13.5a4.5 4.5 0 0 0 0-9 4.5 4.5 0 0 0-4.5 4.5 2 2 0 0 0 4 0" />
    <path d="M3 18c0-2 1-3 2.5-3M19.5 9.6 21 6M17.4 9 17.6 5.2" />
  </Svg>
);

/** Settings: three sliders. */
export const IconSliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
    <circle cx="15" cy="6" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Svg>
);

/** Achievements: a rosette with ribbons. */
export const IconRosette = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="m9 14.3-1.5 7.2 4.5-2.5 4.5 2.5-1.5-7.2" />
    <path d="m12 6.2.85 1.7 1.9.3-1.4 1.3.35 1.9-1.7-.9-1.7.9.35-1.9-1.4-1.3 1.9-.3Z" />
  </Svg>
);

export const IconMic = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="3" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.5v.01" />
  </Svg>
);

/** Lesson levels: three linked rings. */
export const IconRings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7" cy="12" r="4" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="12" r="4" />
  </Svg>
);

/** Stories: an open book with a speech mark. */
export const IconBook = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5ZM12 6.5v13" />
    <path d="M6.5 9.5h2.5M6.5 12.5h2.5M15 9.5h2.5" />
  </Svg>
);

/** Premium: a faceted gem. */
export const IconGem = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 4h11L21 9l-9 11L3 9Z" />
    <path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
  </Svg>
);

/** Streak shield: a shield with a small sun. */
export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z" />
    <path d="M9 14a3 3 0 0 1 6 0M12 8.5v1.5M8.6 10.3l1 .8M15.4 10.3l-1 .8" />
  </Svg>
);

/** Reminders: a bell. */
export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15ZM10 21h4" />
  </Svg>
);

/** Keyboard (accent bar label). */
export const IconKeyboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="3" />
    <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9" />
  </Svg>
);

/* ── Unit and badge glyphs ─────────────────────────────────────────────── */

export const GlyphWave = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 13V6.5a1.5 1.5 0 0 1 3 0V12M11.5 11V5a1.5 1.5 0 0 1 3 0v6M14.5 11V6.5a1.5 1.5 0 0 1 3 0v7a7 7 0 0 1-12.4 4.4L3.6 15a1.5 1.5 0 0 1 2.3-1.9l2.6 2.4" />
    <path d="M19.5 3.5c.9.6 1.5 1.4 1.8 2.5M3 7.5c.2-1.1.7-2 1.5-2.6" />
  </Svg>
);

export const GlyphFamily = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7.5" cy="7" r="2.5" />
    <circle cx="16.5" cy="7" r="2.5" />
    <circle cx="12" cy="13" r="2" />
    <path d="M3 19c.4-3 2-5 4.5-5 1 0 1.8.3 2.4.8M21 19c-.4-3-2-5-4.5-5-1 0-1.8.3-2.4.8M8.5 21c.4-2 1.7-3.2 3.5-3.2s3.1 1.2 3.5 3.2" />
  </Svg>
);

/** Counting: a tally of five. */
export const GlyphCount = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 5v14M10 5v14M14 5v14M18 5v14M3.5 16.5l17-9" />
  </Svg>
);

export const GlyphBowl = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12.5h18a9 9 0 0 1-18 0ZM8 21h8" />
    <path d="M9 9c-.8-1 .8-2 0-3.3M12.5 9c-.8-1 .8-2 0-3.3M16 9c-.8-1 .8-2 0-3.3" />
  </Svg>
);

export const GlyphCompass = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </Svg>
);

export const GlyphClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
);

export const GlyphChat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1v3l3.5-3H14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    <path d="M16 8h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-3.5-3H12a2 2 0 0 1-1.7-1" />
  </Svg>
);

export const GlyphSprout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21v-9M12 12c0-3.5-2.5-6-7-6 0 4 2.5 6 7 6ZM12 14c0-3.5 2.5-6.5 7-6.5 0 4.2-2.5 6.5-7 6.5Z" />
    <path d="M7 21h10" />
  </Svg>
);

/** Health: a heart with a pulse line. */
export const GlyphHeart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
    <path d="M7 12h2.5l1.2-2.2 2 4.2 1.3-2h3" />
  </Svg>
);

/** Work: a briefcase. */
export const GlyphBriefcase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18M11 13v2h2v-2" />
  </Svg>
);

/** Home: a house with a door. */
export const GlyphHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </Svg>
);

/** Culture: a sabar-style drum. */
export const GlyphDrum = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="6.5" rx="6" ry="2.5" />
    <path d="M6 6.5 8 20h8l2-13.5M8.6 10.5l6.8 4M15.4 10.5l-6.8 4" />
    <path d="M17 3 21 1.5" />
  </Svg>
);

export const UNIT_GLYPHS = {
  wave: GlyphWave,
  family: GlyphFamily,
  count: GlyphCount,
  bowl: GlyphBowl,
  spark: IconSpark,
  compass: GlyphCompass,
  clock: GlyphClock,
  chat: GlyphChat,
  heart: GlyphHeart,
  briefcase: GlyphBriefcase,
  home: GlyphHome,
  drum: GlyphDrum,
} as const;

export const BADGE_GLYPHS = {
  path: IconPath,
  wave: GlyphWave,
  count: GlyphCount,
  bowl: GlyphBowl,
  drop: (p: IconProps) => <IconDrop {...p} filled />,
  sun: IconSun,
  sprout: GlyphSprout,
  loop: IconLoop,
  compass: GlyphCompass,
  chat: GlyphChat,
  ring: IconRings,
  book: IconBook,
} as const;
