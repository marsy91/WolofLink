// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Cloud backend boundary. The rest of the app talks to `CloudBackend`, so the
 * Supabase implementation below can be swapped (e.g. for Firebase) without
 * touching screens or the sync logic.
 *
 * Configuration comes from public build-time variables (see .env.example).
 * The anon key is designed to be public; every table is protected by
 * row-level security (supabase/migrations). Never put a service-role key here.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Progress } from "./progress";
import { ACCOUNTS_ENABLED } from "./features";

export interface CloudUser {
  id: string;
  email: string | null;
}

export interface RemoteProgress {
  data: unknown;
  updatedAt: string;
}

export type CloudErrorKind =
  | "invalid_email"
  | "invalid_code"
  | "rate_limited"
  | "network"
  | "unknown"
  /** Team code doesn't exist. */
  | "unknown_code"
  /** Organisation suspended by the owner. */
  | "org_suspended"
  /** Organisation has no free seats. */
  | "org_full"
  /** The server refused: not signed in, or not allowed (e.g. not the owner). */
  | "forbidden"
  | "not_found";

/** One organisation the signed-in learner belongs to. */
export interface Membership {
  orgId: string;
  orgName: string;
  role: "member" | "admin";
  displayName: string;
  joinedAt: string;
}

export class CloudError extends Error {
  constructor(
    public kind: CloudErrorKind,
    message: string,
  ) {
    super(message);
  }
}

export interface CloudBackend {
  getUser(): Promise<CloudUser | null>;
  onAuthChange(cb: (user: CloudUser | null) => void): () => void;
  /** Emails a one-time 6-digit code; creates the account on first use. */
  sendCode(email: string): Promise<void>;
  verifyCode(email: string, code: string): Promise<CloudUser>;
  signOut(): Promise<void>;
  pull(): Promise<RemoteProgress | null>;
  push(progress: Progress): Promise<void>;
  /** Permanently deletes the account and its cloud data (server-side function). */
  deleteAccount(): Promise<void>;
  /** Calls a database function (supabase/migrations); the server checks permissions. */
  rpc<T = unknown>(fn: string, args?: Record<string, unknown>): Promise<T>;
  myOrganisations(): Promise<Membership[]>;
  leaveOrganisation(orgId: string): Promise<void>;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function cloudConfig(): { url: string; anonKey: string } | null {
  if (!ACCOUNTS_ENABLED) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

function toError(e: unknown): CloudError {
  if (e instanceof CloudError) return e;
  const err = e as { status?: number; code?: string; message?: string; name?: string } | null;
  const message = err?.message ?? String(e);
  if (err?.status === 429 || /rate limit|too many requests/i.test(message)) return new CloudError("rate_limited", message);
  // Postgres error codes raised by the organisation and owner functions.
  if (err?.code === "P0002") return new CloudError(/unknown code/i.test(message) ? "unknown_code" : "not_found", message);
  if (err?.code === "55000") return new CloudError("org_suspended", message);
  if (err?.code === "54000") return new CloudError("org_full", message);
  if (err?.code === "42501") return new CloudError("forbidden", message);
  if (err?.code === "otp_expired" || /expired|invalid.*(otp|token)|token.*invalid/i.test(message))
    return new CloudError("invalid_code", message);
  if (/email.*invalid|invalid.*email/i.test(message)) return new CloudError("invalid_email", message);
  if (err?.name === "TypeError" || /fetch|network|failed to fetch/i.test(message)) return new CloudError("network", message);
  return new CloudError("unknown", message);
}

const userOf = (u: { id: string; email?: string | null } | null | undefined): CloudUser | null =>
  u ? { id: u.id, email: u.email ?? null } : null;

let backend: CloudBackend | null | undefined;

/** The configured backend, or null when this build has no cloud settings. */
export function getCloud(): CloudBackend | null {
  if (backend !== undefined) return backend;
  const config = cloudConfig();
  backend = config ? supabaseBackend(config.url, config.anonKey) : null;
  return backend;
}

function supabaseBackend(url: string, anonKey: string): CloudBackend {
  let client: Promise<SupabaseClient> | null = null;
  const sb = () =>
    (client ??= import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "woloflink.auth" },
      }),
    ));

  return {
    async getUser() {
      const { data } = await (await sb()).auth.getSession();
      return userOf(data.session?.user);
    },
    onAuthChange(cb) {
      let unsubscribe = () => {};
      void sb().then((c) => {
        const { data } = c.auth.onAuthStateChange((_event, session) => cb(userOf(session?.user)));
        unsubscribe = () => data.subscription.unsubscribe();
      });
      return () => unsubscribe();
    },
    async sendCode(email) {
      if (!EMAIL_RE.test(email)) throw new CloudError("invalid_email", "invalid email");
      try {
        const { error } = await (await sb()).auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (error) throw error;
      } catch (e) {
        throw toError(e);
      }
    },
    async verifyCode(email, code) {
      try {
        const { data, error } = await (await sb()).auth.verifyOtp({ email, token: code.trim(), type: "email" });
        if (error) throw error;
        const user = userOf(data.user);
        if (!user) throw new CloudError("invalid_code", "no user");
        return user;
      } catch (e) {
        throw toError(e);
      }
    },
    async signOut() {
      // Local scope: signs out this device only, and works offline.
      await (await sb()).auth.signOut({ scope: "local" });
    },
    async pull() {
      try {
        const c = await sb();
        const { data, error } = await c.from("progress").select("data, updated_at").maybeSingle();
        if (error) throw error;
        return data ? { data: data.data, updatedAt: data.updated_at as string } : null;
      } catch (e) {
        throw toError(e);
      }
    },
    async push(progress) {
      try {
        const c = await sb();
        const { data: session } = await c.auth.getSession();
        const id = session.session?.user.id;
        if (!id) throw new CloudError("unknown", "not signed in");
        const { error } = await c.from("progress").upsert({ user_id: id, data: progress });
        if (error) throw error;
      } catch (e) {
        throw toError(e);
      }
    },
    async rpc<T>(fn: string, args?: Record<string, unknown>) {
      try {
        const { data, error } = await (await sb()).rpc(fn, args ?? {});
        if (error) throw error;
        return data as T;
      } catch (e) {
        throw toError(e);
      }
    },
    async myOrganisations() {
      try {
        const c = await sb();
        const { data: session } = await c.auth.getSession();
        const uid = session.session?.user.id;
        if (!uid) return [];
        const { data, error } = await c
          .from("memberships")
          .select("org_id, role, display_name, joined_at, organisations(name)")
          .eq("user_id", uid);
        if (error) throw error;
        type Row = { org_id: string; role: string; display_name: string; joined_at: string; organisations: { name: string } | { name: string }[] | null };
        return ((data ?? []) as Row[]).map((r) => {
          const org = Array.isArray(r.organisations) ? r.organisations[0] : r.organisations;
          return {
            orgId: r.org_id,
            orgName: org?.name ?? "",
            role: r.role === "admin" ? "admin" : "member",
            displayName: r.display_name,
            joinedAt: r.joined_at,
          } satisfies Membership;
        });
      } catch (e) {
        throw toError(e);
      }
    },
    async leaveOrganisation(orgId) {
      try {
        const c = await sb();
        const { data: session } = await c.auth.getSession();
        const uid = session.session?.user.id;
        if (!uid) throw new CloudError("forbidden", "not signed in");
        const { error } = await c.from("memberships").delete().eq("org_id", orgId).eq("user_id", uid);
        if (error) throw error;
      } catch (e) {
        throw toError(e);
      }
    },
    async deleteAccount() {
      try {
        const c = await sb();
        const { error } = await c.functions.invoke("delete-account", { method: "POST" });
        if (error) throw error;
        await c.auth.signOut({ scope: "local" });
      } catch (e) {
        throw toError(e);
      }
    },
  };
}

/** Test hook: install a fake backend. */
export function setCloudForTests(fake: CloudBackend | null) {
  backend = fake;
}
