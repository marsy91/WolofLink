// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
// Renders the original WolofLink mark (see src/components/Logo.tsx) into the
// source PNGs that `@capacitor/assets` turns into Android/iOS icons and
// splash screens, plus web/PWA icons.  Run with `npm run icons`.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const NIGHT = "#1d2550";
const SUN = "#f2a93b";
const CLAY = "#d0612f";
const SAND = "#fbf3e6";

const bubbles = `
  <path d="M32 22h28a14 14 0 0 1 14 14v12a14 14 0 0 1-14 14H40l-14 11 3-11.4A14 14 0 0 1 18 48V36a14 14 0 0 1 14-14Z" fill="${CLAY}"/>
  <path d="M60 44h28a14 14 0 0 1 14 14v12a14 14 0 0 1-3 8.6l3 10.4-12.6-5H60a14 14 0 0 1-14-14V58a14 14 0 0 1 14-14Z" fill="${SAND}" stroke="${NIGHT}" stroke-width="4"/>
  <circle cx="62" cy="64" r="4.2" fill="${NIGHT}"/>
  <circle cx="74" cy="64" r="4.2" fill="${NIGHT}"/>
  <circle cx="86" cy="64" r="4.2" fill="${NIGHT}"/>`;

const sun = `<circle cx="93" cy="29" r="15" fill="${SUN}"/>`;

/** Full square icon (iOS and legacy Android apply their own mask). */
const full = (rx = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <clipPath id="c"><rect width="120" height="120" rx="${rx}"/></clipPath>
  <g clip-path="url(#c)"><rect width="120" height="120" fill="${NIGHT}"/><g transform="translate(0 6)">${sun}${bubbles}</g></g></svg>`;

// Android adaptive icons: @capacitor/assets already insets the foreground
// layer to the visible 72dp area, so the artwork only needs a margin for the
// launcher's mask (circle, squircle…). Scaled around its centre (60, 54).
const SCALE = 0.86;
const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <g transform="translate(60 60) scale(${SCALE}) translate(-60 -54)">${sun}${bubbles}</g></svg>`;
const bg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="${NIGHT}"/></svg>`;

const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="${NIGHT}"/>
  <g transform="translate(1066 1066) scale(5)">${full(30).replace(/<\/?svg[^>]*>/g, "")}</g></svg>`;

// Size the SVG to the target so it is rasterised crisply at that resolution.
const png = (svg, size) =>
  sharp(Buffer.from(svg.replace("<svg ", `<svg width="${size}" height="${size}" `))).png().toBuffer();

await mkdir("assets", { recursive: true });
await mkdir("public", { recursive: true });

const out = {
  "assets/icon-only.png": [full(0), 1024],
  "assets/icon-foreground.png": [fg, 1024],
  "assets/icon-background.png": [bg, 1024],
  "assets/splash.png": [splash, 2732],
  "assets/splash-dark.png": [splash, 2732],
  "public/icon-512.png": [full(0), 512],
  "public/icon-192.png": [full(0), 192],
  "public/apple-touch-icon.png": [full(0), 180],
  "public/favicon.png": [full(30), 64],
};

for (const [file, [svg, size]] of Object.entries(out)) {
  await writeFile(file, await png(svg, size));
  console.log("wrote", file);
}
await writeFile("public/icon.svg", full(30));
console.log("wrote public/icon.svg");
