// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
// Sends a push notification to a friend after a nudge or a duel, through Firebase
// Cloud Messaging (FCM HTTP v1). Runs on Supabase Edge Functions (Deno).
//
// The app calls it right after the action. The function checks, with the
// service role, that the caller really did that action in the last few minutes,
// so nobody can use it to send arbitrary notifications.
//
// Secret (Supabase → Edge Functions → Secrets), never in the repo:
//   FCM_SERVICE_ACCOUNT = the Firebase service-account JSON (whole file contents)
// Deploy: supabase functions deploy notify-friend
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type Lang = "en" | "fr" | "es" | "de" | "it";
const TEXT: Record<string, Record<Lang, [string, string]>> = {
  nudge: {
    en: ["{name} nudged you 👋", "Time for some Wolof!"],
    fr: ["{name} vous relance 👋", "C'est l'heure du wolof !"],
    es: ["{name} te ha dado un toque 👋", "¡Hora de practicar wolof!"],
    de: ["{name} hat dich angestupst 👋", "Zeit für Wolof!"],
    it: ["{name} ti ha stimolato 👋", "È ora di un po' di wolof!"],
  },
  duel: {
    en: ["⚔️ {name} challenged you!", "Answer within 3 days to win trophies."],
    fr: ["⚔️ {name} vous défie !", "Répondez sous 3 jours pour gagner des trophées."],
    es: ["⚔️ ¡{name} te ha retado!", "Responde en 3 días para ganar trofeos."],
    de: ["⚔️ {name} fordert dich heraus!", "Antworte innerhalb von 3 Tagen und gewinne Trophäen."],
    it: ["⚔️ {name} ti ha sfidato!", "Rispondi entro 3 giorni per vincere trofei."],
  },
  result: {
    en: ["⚔️ {name} played your duel", "See who won."],
    fr: ["⚔️ {name} a joué votre duel", "Découvrez qui a gagné."],
    es: ["⚔️ {name} ha jugado tu duelo", "Mira quién ha ganado."],
    de: ["⚔️ {name} hat dein Duell gespielt", "Sieh nach, wer gewonnen hat."],
    it: ["⚔️ {name} ha giocato la tua sfida", "Scopri chi ha vinto."],
  },
};

// ── FCM access token from the service account (RS256-signed JWT) ─────────────
let cached: { token: string; until: number } | null = null;
const b64url = (data: ArrayBuffer | string) =>
  btoa(typeof data === "string" ? data : String.fromCharCode(...new Uint8Array(data)))
    .replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

async function accessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  if (cached && cached.until > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claims}.${b64url(sig)}` }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const body = await res.json();
  cached = { token: body.access_token, until: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return cached.token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "unauthorized" });
  const saRaw = Deno.env.get("FCM_SERVICE_ACCOUNT");
  if (!saRaw) return json(200, { sent: 0, reason: "push not configured" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: who } = await asCaller.auth.getUser();
  const me = who.user?.id;
  if (!me) return json(401, { error: "unauthorized" });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let body: { kind?: string; id?: string; to?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  const recent = new Date(Date.now() - 3 * 60_000).toISOString();
  let recipient: string | null = null;
  let link = "/friends/";
  const kind = body.kind ?? "";

  if (kind === "nudge" && body.to) {
    const { data } = await admin.from("nudges").select("id").eq("from_user", me).eq("to_user", body.to).gte("created_at", recent).limit(1);
    if (data?.length) recipient = body.to;
  } else if (kind === "duel" && body.id) {
    const { data } = await admin.from("duels").select("opponent").eq("id", body.id).eq("challenger", me).eq("status", "waiting").gte("created_at", recent).maybeSingle();
    if (data) {
      recipient = data.opponent;
      link = `/duel/?id=${body.id}`;
    }
  } else if (kind === "result" && body.id) {
    const { data } = await admin.from("duels").select("challenger").eq("id", body.id).eq("opponent", me).eq("status", "done").gte("finished_at", recent).maybeSingle();
    if (data) recipient = data.challenger;
  }
  if (!recipient || !TEXT[kind]) return json(200, { sent: 0 });

  const [{ data: sender }, { data: tokens }] = await Promise.all([
    admin.from("friend_profiles").select("display_name").eq("user_id", me).maybeSingle(),
    admin.from("push_tokens").select("token, lang").eq("user_id", recipient),
  ]);
  if (!tokens?.length) return json(200, { sent: 0 });

  const sa = JSON.parse(saRaw);
  const bearer = await accessToken(sa);
  let sent = 0;
  for (const t of tokens) {
    const lang = (["en", "fr", "es", "de", "it"].includes(t.lang) ? t.lang : "en") as Lang;
    const [title, text] = TEXT[kind][lang];
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token: t.token,
          notification: { title: title.replace("{name}", sender?.display_name ?? "WolofLink"), body: text },
          data: { link },
          android: { priority: "high", notification: { channel_id: "friends" } },
        },
      }),
    });
    if (res.ok) sent++;
    // 404 = the app was uninstalled or the token expired: forget it.
    else if (res.status === 404) await admin.from("push_tokens").delete().eq("token", t.token);
  }
  return json(200, { sent });
});
