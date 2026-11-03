// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Which owner-console tabs each staff role sees. This only hides buttons; the
 * database is what really enforces it (private.role_allows in
 * supabase/migrations/20261103000000_staff_roles.sql).
 */
export type ConsoleRole = "owner" | "admin" | "reviewer" | "support" | "analyst";
export type StaffRole = Exclude<ConsoleRole, "owner">;
export const STAFF_ROLES: StaffRole[] = ["admin", "reviewer", "support", "analyst"];

export const ROLE_HELP: Record<StaffRole, string> = {
  admin: "Runs the console day to day, posts announcements and can pause features. Asks you to approve deleting accounts or organisations. Cannot give free access or manage the team.",
  reviewer: "Reads problem reports and missed words, and marks reports done.",
  support: "Looks up learners and organisations and handles problem reports. Asks you to approve any suspension or deletion.",
  analyst: "Sees the overview numbers and missed words only. No personal details.",
};

const ALL = ["overview", "orgs", "people", "billing", "voices", "reports", "words", "holidays", "themes", "notices", "requests", "log", "team"];
const TABS_BY_ROLE: Record<ConsoleRole, string[]> = {
  owner: ALL,
  admin: ALL.filter((t) => t !== "team"),
  reviewer: ["reports", "words"],
  support: ["overview", "orgs", "people", "reports", "requests"],
  analyst: ["overview", "words"],
};

/** Risky actions this role must ask the owner to approve (the two-person rule). */
export type RiskyAction = "delete account" | "suspend account" | "delete organisation";
export function mustRequest(role: ConsoleRole, action: RiskyAction): boolean {
  if (role === "owner") return false;
  if (role === "admin") return action !== "suspend account";
  return true;
}

export const tabsFor = (role: ConsoleRole | null): string[] => (role ? TABS_BY_ROLE[role] : []);
export const isConsoleRole = (v: unknown): v is ConsoleRole =>
  v === "owner" || (typeof v === "string" && (STAFF_ROLES as string[]).includes(v));
