// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Owner console calls. Each one is a database function that checks, on the
 * server, that the signed-in account is the owner (private.owners) and logs
 * the action (supabase/migrations/*_owner_console.sql). The UI only decides
 * whether to show the console; it grants nothing.
 */
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "./account";
import { getCloud } from "./cloud";

export interface Overview {
  learners: number;
  new7: number;
  active7: number;
  suspended: number;
  organisations: number;
  members: number;
}

export interface OrgRow {
  id: string;
  name: string;
  join_code: string;
  status: "active" | "suspended";
  plan: "pilot" | "free" | "paid";
  seats: number | null;
  paid_until: string | null;
  notes: string | null;
  members: number;
  admins: number;
  created_at: string;
}

export interface MemberRow {
  user_id: string;
  email: string;
  display_name: string;
  role: "member" | "admin";
  joined_at: string;
  xp: number;
  lessons: number;
  last_active: string | null;
}

export interface PersonRow {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  suspended: boolean;
  xp: number;
  lessons: number;
  last_active: string | null;
  organisations: string | null;
  is_owner: boolean;
}

export interface ReportRow {
  id: number;
  created_at: string;
  entry_id: string;
  problem: "spelling" | "translation" | "audio" | "other";
  comment: string | null;
  ui_lang: string | null;
  app_version: string | null;
  status: "open" | "fixed" | "dismissed";
  from_account: boolean;
}

export interface MissedRow {
  entry_id: string;
  learners: number;
  right_total: number;
  wrong_total: number;
  miss_rate: number;
}

export interface AuditRow {
  at: string;
  action: string;
  detail: Record<string, unknown>;
}

function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const cloud = getCloud();
  if (!cloud) return Promise.reject(new Error("accounts are switched off in this build"));
  return cloud.rpc<T>(fn, args);
}

export const owner = {
  overview: () => call<Overview>("owner_overview"),
  organisations: () => call<OrgRow[]>("owner_organisations"),
  createOrganisation: (name: string, plan: OrgRow["plan"], seats: number | null) =>
    call<{ id: string; join_code: string }[]>("owner_create_organisation", { org_name: name, org_plan: plan, org_seats: seats }),
  updateOrganisation: (o: Pick<OrgRow, "id" | "name" | "status" | "plan" | "seats" | "paid_until" | "notes">) =>
    call<void>("owner_update_organisation", {
      org: o.id,
      org_name: o.name,
      org_status: o.status,
      org_plan: o.plan,
      org_seats: o.seats,
      org_paid_until: o.paid_until || null,
      org_notes: o.notes,
    }),
  newCode: (org: string) => call<string>("owner_new_code", { org }),
  deleteOrganisation: (org: string) => call<void>("owner_delete_organisation", { org }),
  members: (org: string) => call<MemberRow[]>("owner_members", { org }),
  addMember: (org: string, email: string, name: string, role: MemberRow["role"]) =>
    call<void>("owner_add_member", { org, member_email: email, member_name: name, member_role: role }),
  setRole: (org: string, member: string, role: MemberRow["role"]) =>
    call<void>("owner_set_role", { org, member, member_role: role }),
  removeMember: (org: string, member: string) => call<void>("owner_remove_member", { org, member }),
  people: (search: string) => call<PersonRow[]>("owner_people", { search }),
  setSuspended: (member: string, suspend: boolean) => call<void>("owner_set_suspended", { member, suspend }),
  deleteAccount: (member: string) => call<void>("owner_delete_account", { member }),
  audit: () => call<AuditRow[]>("owner_audit", { max_rows: 100 }),
  reports: (status: "open" | "all") => call<ReportRow[]>("owner_reports", { report_status: status, max_rows: 200 }),
  setReportStatus: (id: number, status: ReportRow["status"]) => call<void>("owner_set_report_status", { report: id, new_status: status }),
  missedWords: (minAttempts: number) => call<MissedRow[]>("owner_missed_words", { min_attempts: minAttempts, max_rows: 50 }),
  setHolidayDate: (holiday: string, year: number, day: string, confirmed: boolean) =>
    call<void>("owner_set_calendar_date", { holiday, yr: year, holiday_day: day, is_confirmed: confirmed }),
  clearHolidayDate: (holiday: string, year: number) => call<void>("owner_clear_calendar_date", { holiday, yr: year }),
};

/** True once the server confirms the signed-in account is the owner. */
export function useIsOwner(): boolean {
  const { user } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  const userId = user?.id ?? null;
  useEffect(() => {
    let alive = true;
    if (!userId) {
      void Promise.resolve().then(() => alive && setIsOwner(false));
      return;
    }
    call<boolean>("owner_check")
      .then((ok) => alive && setIsOwner(ok === true))
      .catch(() => alive && setIsOwner(false));
    return () => {
      alive = false;
    };
  }, [userId]);
  return isOwner;
}
