// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * The organisation admin dashboard (Team plan): the organisations you administer, your
 * team's progress, a CSV export and printable certificates.
 * Backend: supabase/migrations/20261116000000_org_team_plan.sql.
 * Learners only appear here after joining with the team code and agreeing to share a
 * progress summary (their chosen name, XP, lessons, streak and last practice).
 */
import { CloudError, getCloud } from "./cloud";

export interface AdminOrg {
  orgId: string;
  name: string;
  joinCode: string;
  plan: "pilot" | "free" | "paid";
  seats: number | null;
  paidUntil: string | null;
  members: number;
  /** Pilot or paid, not suspended and not past its paid-until date. */
  teamActive: boolean;
}

export interface TeamMember {
  userId: string;
  name: string;
  role: "member" | "admin";
  joinedAt: string;
  xp: number;
  lessons: number;
  streak: number;
  lastActive: string | null;
}

/** Thrown by loadTeam when the organisation's Team plan isn't active. */
export class TeamPlanInactive extends Error {}

function cloud() {
  const c = getCloud();
  if (!c) throw new Error("accounts are switched off in this build");
  return c;
}

type SummaryRow = {
  org_id: string; org_name: string; join_code: string; plan: string; seats: number | null;
  paid_until: string | null; members: number; team_active: boolean;
};
type ReportRow = {
  user_id: string; display_name: string; role: string; joined_at: string;
  xp: number; lessons: number; streak: number; last_active: string | null;
};

export function toAdminOrg(r: SummaryRow): AdminOrg {
  const plan = r.plan === "paid" || r.plan === "free" ? r.plan : "pilot";
  return {
    orgId: r.org_id, name: r.org_name, joinCode: r.join_code, plan, seats: r.seats ?? null,
    paidUntil: r.paid_until ?? null, members: r.members ?? 0, teamActive: !!r.team_active,
  };
}

export function toMember(r: ReportRow): TeamMember {
  return {
    userId: r.user_id, name: r.display_name, role: r.role === "admin" ? "admin" : "member", joinedAt: r.joined_at,
    xp: r.xp ?? 0, lessons: r.lessons ?? 0, streak: r.streak ?? 0, lastActive: r.last_active ?? null,
  };
}

/** The organisations the signed-in learner administers (empty for everyone else). */
export async function loadAdminOrgs(): Promise<AdminOrg[]> {
  return ((await cloud().rpc<SummaryRow[]>("org_admin_summary")) ?? []).map(toAdminOrg);
}

/** The team's progress. Throws TeamPlanInactive when the Team plan isn't active. */
export async function loadTeam(orgId: string): Promise<TeamMember[]> {
  try {
    return ((await cloud().rpc<ReportRow[]>("organisation_report", { org: orgId })) ?? []).map(toMember);
  } catch (e) {
    if (e instanceof CloudError && e.kind === "org_suspended") throw new TeamPlanInactive();
    throw e;
  }
}

const DAY = 24 * 60 * 60 * 1000;

/** Practised in the last `days` days. */
export function activeWithin(m: TeamMember, now: number, days = 7): boolean {
  return m.lastActive !== null && now - Date.parse(m.lastActive) <= days * DAY;
}

export interface TeamStats {
  members: number;
  activeThisWeek: number;
  totalLessons: number;
  averageLessons: number;
}

export function teamStats(members: TeamMember[], now: number): TeamStats {
  const totalLessons = members.reduce((s, m) => s + m.lessons, 0);
  return {
    members: members.length,
    activeThisWeek: members.filter((m) => activeWithin(m, now)).length,
    totalLessons,
    averageLessons: members.length ? Math.round((totalLessons / members.length) * 10) / 10 : 0,
  };
}

export type TeamSort = "name" | "lessons" | "recent";

export function sortTeam(members: TeamMember[], by: TeamSort): TeamMember[] {
  const list = [...members];
  if (by === "lessons") list.sort((a, b) => b.lessons - a.lessons || a.name.localeCompare(b.name));
  else if (by === "recent") list.sort((a, b) => (Date.parse(b.lastActive ?? "") || 0) - (Date.parse(a.lastActive ?? "") || 0));
  else list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/**
 * One CSV cell. Quotes when needed, and defuses spreadsheet formulas: names are typed by
 * learners, so a name starting with = + - @ (or a tab/return) is prefixed with an apostrophe.
 */
export function csvCell(value: string | number | null): string {
  let s = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export interface CsvLabels {
  name: string;
  role: string;
  joined: string;
  xp: string;
  lessons: string;
  streak: string;
  lastActive: string;
  admin: string;
  member: string;
}

/** The team as CSV (no internal ids), with a byte-order mark so spreadsheets read accents. */
export function teamCsv(members: TeamMember[], labels: CsvLabels): string {
  const day = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
  const rows = [
    [labels.name, labels.role, labels.joined, labels.xp, labels.lessons, labels.streak, labels.lastActive],
    ...sortTeam(members, "name").map((m) => [
      m.name, m.role === "admin" ? labels.admin : labels.member, day(m.joinedAt), m.xp, m.lessons, m.streak, day(m.lastActive),
    ]),
  ];
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/** A file name like "test-ngo-team-2026-11-11.csv". */
export function csvFileName(orgName: string, now: number): string {
  const slug = orgName.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return `${slug || "team"}-team-${new Date(now).toISOString().slice(0, 10)}.csv`;
}

/** Members who have done at least `min` lessons get a certificate. */
export function certificateMembers(members: TeamMember[], min = 1): TeamMember[] {
  return sortTeam(members.filter((m) => m.lessons >= min), "name");
}

export type SaveResult = "shared" | "downloaded" | "copied" | "failed";

interface SaveEnv {
  share?: (data: { files: File[]; title: string }) => Promise<void>;
  canShare?: (data: { files: File[] }) => boolean;
  native: boolean;
  download?: (blob: Blob, name: string) => void;
  copy?: (text: string) => Promise<void>;
}

function browserEnv(): SaveEnv {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const w = typeof window !== "undefined" ? (window as { Capacitor?: { isNativePlatform?: () => boolean } }) : undefined;
  return {
    share: nav?.share ? (d) => nav.share(d) : undefined,
    canShare: nav?.canShare ? (d) => nav.canShare(d) : undefined,
    native: !!w?.Capacitor?.isNativePlatform?.(),
    download: (blob, name) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    copy: nav?.clipboard ? (text) => nav.clipboard.writeText(text) : undefined,
  };
}

/**
 * Saves the CSV the best way the phone or browser allows: the share sheet (to email,
 * WhatsApp or Drive), a download in a browser, or the clipboard as a last resort.
 */
export async function saveCsv(csv: string, name: string, env: SaveEnv = browserEnv()): Promise<SaveResult> {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  if (env.share && typeof File !== "undefined") {
    const file = new File([blob], name, { type: "text/csv" });
    if (!env.canShare || env.canShare({ files: [file] })) {
      try {
        await env.share({ files: [file], title: name });
        return "shared";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return "failed";
      }
    }
  }
  if (!env.native && env.download) {
    env.download(blob, name);
    return "downloaded";
  }
  if (env.copy) {
    try {
      await env.copy(csv.replace(/^﻿/, ""));
      return "copied";
    } catch {
      // fall through
    }
  }
  return "failed";
}
