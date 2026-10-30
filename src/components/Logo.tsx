// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * WolofLink mark: two linked speech bubbles under a small sun, on deep indigo.
 * The same geometry is rendered to PNG app icons by scripts/make-icons.mjs.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <clipPath id="wl-tile">
          <rect width="120" height="120" rx="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#wl-tile)">
        <rect width="120" height="120" fill="#1d2550" />
        <g transform="translate(0 6)">
        <circle cx="93" cy="29" r="15" fill="#f2a93b" />
        <path d="M32 22h28a14 14 0 0 1 14 14v12a14 14 0 0 1-14 14H40l-14 11 3-11.4A14 14 0 0 1 18 48V36a14 14 0 0 1 14-14Z" fill="#d0612f" />
        <path
          d="M60 44h28a14 14 0 0 1 14 14v12a14 14 0 0 1-3 8.6l3 10.4-12.6-5H60a14 14 0 0 1-14-14V58a14 14 0 0 1 14-14Z"
          fill="#fbf3e6"
          stroke="#1d2550"
          strokeWidth="4"
        />
        <circle cx="62" cy="64" r="4.2" fill="#1d2550" />
        <circle cx="74" cy="64" r="4.2" fill="#1d2550" />
        <circle cx="86" cy="64" r="4.2" fill="#1d2550" />
        </g>
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className ?? ""}`}>
      Wolof<span className="text-clay">Link</span>
    </span>
  );
}
