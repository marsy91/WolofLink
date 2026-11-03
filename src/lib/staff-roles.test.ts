// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { isConsoleRole, mustRequest, tabsFor } from "./staff-roles";

describe("staff roles", () => {
  it("only the owner sees the team tab", () => {
    expect(tabsFor("owner")).toContain("team");
    for (const r of ["admin", "reviewer", "support", "analyst"] as const) expect(tabsFor(r)).not.toContain("team");
  });
  it("analysts and reviewers never see people or the log", () => {
    for (const r of ["analyst", "reviewer"] as const) {
      expect(tabsFor(r)).not.toContain("people");
      expect(tabsFor(r)).not.toContain("log");
    }
  });
  it("deleting always needs the owner's approval unless the owner does it", () => {
    expect(mustRequest("owner", "delete account")).toBe(false);
    expect(mustRequest("admin", "delete account")).toBe(true);
    expect(mustRequest("admin", "delete organisation")).toBe(true);
    expect(mustRequest("admin", "suspend account")).toBe(false);
    expect(mustRequest("support", "suspend account")).toBe(true);
  });
  it("no role means no tabs", () => expect(tabsFor(null)).toEqual([]));
  it("recognises valid roles only", () => {
    expect(isConsoleRole("support")).toBe(true);
    expect(isConsoleRole("root")).toBe(false);
    expect(isConsoleRole(null)).toBe(false);
  });
});
