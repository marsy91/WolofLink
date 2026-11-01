// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Organisations whose paid period or pilot ends soon (or has ended), for the owner console. */
import type { OrgRow } from "./owner";

export interface Renewal {
  org: OrgRow;
  /** Whole days until paid_until; negative once it has passed. */
  daysLeft: number;
}

export function renewalsDue(orgs: OrgRow[], now: Date, windowDays = 30): Renewal[] {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return orgs
    .filter((o) => o.status === "active" && o.plan !== "free" && o.paid_until)
    .map((org) => {
      const [y, m, d] = org.paid_until!.slice(0, 10).split("-").map(Number);
      return { org, daysLeft: Math.round((Date.UTC(y!, m! - 1, d!) - today) / 864e5) };
    })
    .filter((r) => r.daysLeft <= windowDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function renewalLabel(daysLeft: number): string {
  if (daysLeft < 0) return `ended ${-daysLeft} day${daysLeft === -1 ? "" : "s"} ago`;
  if (daysLeft === 0) return "ends today";
  return `ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
}
