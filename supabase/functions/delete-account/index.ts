// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
// Deletes the calling learner's account. Their progress row is removed by the
// foreign key's ON DELETE CASCADE. Runs on Supabase Edge Functions (Deno).
//
// Deploy: supabase functions deploy delete-account
// The service-role key is provided by Supabase as an environment variable and
// never leaves the server.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "unauthorized" });

  const url = Deno.env.get("SUPABASE_URL")!;
  // Verify the caller with their own token, so a learner can only delete themselves.
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await asCaller.auth.getUser();
  if (error || !data.user) return json(401, { error: "unauthorized" });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return json(500, { error: "delete_failed" });

  return json(200, { deleted: true });
});
