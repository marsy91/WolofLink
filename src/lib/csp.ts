// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Content Security Policy for the app's pages (a <meta> tag, since the app is a
 * static export). It stops the page loading scripts, frames or plugins from
 * anywhere else and only lets it talk to its own files and the Supabase project.
 * Inline scripts stay allowed because the static export relies on them.
 */
export function contentSecurityPolicy(supabaseUrl: string | undefined): string {
  let cloud = "";
  try {
    if (supabaseUrl) {
      const u = new URL(supabaseUrl);
      if (u.protocol === "https:") cloud = ` ${u.origin} wss://${u.host}`;
    }
  } catch {
    /* no cloud */
  }
  const media = cloud ? ` ${cloud.trim().split(" ")[0]}` : "";
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `media-src 'self' data: blob:${media}`,
    `connect-src 'self'${cloud}`,
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
