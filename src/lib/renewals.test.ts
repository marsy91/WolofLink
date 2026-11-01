// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import type { OrgRow } from "./owner";
import { renewalLabel, renewalsDue } from "./renewals";

const org = (id: string, plan: OrgRow["plan"], paid_until: string | null, status: OrgRow["status"] = "active"): OrgRow => ({
  id, name: id, join_code: "X", status, plan, seats: null, paid_until, notes: null, members: 0, admins: 0, created_at: "2026-01-01",
});

describe("renewals", () => {
  it("lists paid plans and pilots ending within 30 days, most urgent first", () => {
    const now = new Date(2026, 10, 1, 15, 0);
    const due = renewalsDue(
      [
        org("soon", "paid", "2026-11-20"),
        org("late", "paid", "2026-10-25"),
        org("pilot", "pilot", "2026-11-01"),
        org("far", "paid", "2027-03-01"),
        org("free", "free", "2026-11-05"),
        org("none", "paid", null),
        org("off", "paid", "2026-11-03", "suspended"),
      ],
      now,
    );
    expect(due.map((r) => [r.org.id, r.daysLeft])).toEqual([
      ["late", -7],
      ["pilot", 0],
      ["soon", 19],
    ]);
  });

  it("words the time left", () => {
    expect(renewalLabel(-1)).toBe("ended 1 day ago");
    expect(renewalLabel(0)).toBe("ends today");
    expect(renewalLabel(12)).toBe("ends in 12 days");
  });
});
