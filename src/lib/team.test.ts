// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import {
  activeWithin,
  certificateMembers,
  csvCell,
  csvFileName,
  sortTeam,
  teamCsv,
  teamStats,
  toAdminOrg,
  toMember,
  type TeamMember,
} from "./team";

const NOW = Date.UTC(2026, 10, 11, 12);
const day = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

const member = (over: Partial<TeamMember>): TeamMember => ({
  userId: "u", name: "A", role: "member", joinedAt: day(30), xp: 0, lessons: 0, streak: 0, lastActive: null, ...over,
});

const LABELS = {
  name: "Name", role: "Role", joined: "Joined", xp: "XP", lessons: "Lessons", streak: "Streak",
  lastActive: "Last practised", admin: "Admin", member: "Member",
};

describe("team dashboard", () => {
  it("maps server rows safely", () => {
    expect(toAdminOrg({ org_id: "o", org_name: "NGO", join_code: "ABCD2345", plan: "weird", seats: null, paid_until: null, members: 3, team_active: true }))
      .toEqual({ orgId: "o", name: "NGO", joinCode: "ABCD2345", plan: "pilot", seats: null, paidUntil: null, members: 3, teamActive: true });
    expect(toMember({ user_id: "u", display_name: "Awa", role: "admin", joined_at: day(1), xp: 5, lessons: 2, streak: 1, last_active: null }).role).toBe("admin");
  });

  it("counts who practised this week", () => {
    const team = [member({ lastActive: day(1), lessons: 4 }), member({ lastActive: day(9), lessons: 1 }), member({ lessons: 0 })];
    expect(activeWithin(team[0], NOW)).toBe(true);
    expect(activeWithin(team[1], NOW)).toBe(false);
    expect(teamStats(team, NOW)).toEqual({ members: 3, activeThisWeek: 1, totalLessons: 5, averageLessons: 1.7 });
    expect(teamStats([], NOW).averageLessons).toBe(0);
  });

  it("sorts by name, lessons or most recent practice", () => {
    const team = [member({ name: "Bea", lessons: 2, lastActive: day(5) }), member({ name: "Ali", lessons: 9, lastActive: null }), member({ name: "Cy", lessons: 2, lastActive: day(0) })];
    expect(sortTeam(team, "name").map((m) => m.name)).toEqual(["Ali", "Bea", "Cy"]);
    expect(sortTeam(team, "lessons").map((m) => m.name)).toEqual(["Ali", "Bea", "Cy"]);
    expect(sortTeam(team, "recent").map((m) => m.name)).toEqual(["Cy", "Bea", "Ali"]);
  });

  it("quotes CSV cells and defuses spreadsheet formulas in names", () => {
    expect(csvCell("Awa")).toBe("Awa");
    expect(csvCell('Moussa "Mo", Dakar')).toBe('"Moussa ""Mo"", Dakar"');
    expect(csvCell("=HYPERLINK(\"x\")")).toBe("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csvCell("+221 77")).toBe("'+221 77");
    expect(csvCell("@cmd")).toBe("'@cmd");
    expect(csvCell(null)).toBe("");
    expect(csvCell(12)).toBe("12");
  });

  it("exports the team without internal ids", () => {
    const csv = teamCsv([member({ userId: "secret-id", name: "Awa Diop", role: "admin", joinedAt: "2026-10-01T09:00:00Z", xp: 120, lessons: 6, streak: 3, lastActive: "2026-11-10T08:00:00Z" })], LABELS);
    expect(csv.startsWith("﻿Name,Role,Joined,XP,Lessons,Streak,Last practised\r\n")).toBe(true);
    expect(csv).toContain("Awa Diop,Admin,2026-10-01,120,6,3,2026-11-10\r\n");
    expect(csv).not.toContain("secret-id");
  });

  it("makes a tidy file name", () => {
    expect(csvFileName("Écoles & Santé Sénégal", NOW)).toBe("ecoles-sante-senegal-team-2026-11-11.csv");
    expect(csvFileName("!!!", NOW)).toBe("team-team-2026-11-11.csv");
  });

  it("gives certificates only to members who finished a lesson", () => {
    const team = [member({ name: "Zed", lessons: 3 }), member({ name: "Amy", lessons: 0 }), member({ name: "Bo", lessons: 1 })];
    expect(certificateMembers(team).map((m) => m.name)).toEqual(["Bo", "Zed"]);
  });
});
