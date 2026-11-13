// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { REVIEWERS, reviewerNames } from "./reviewers";

describe("reviewer credits", () => {
  it("lists only finished, real entries", () => {
    for (const r of REVIEWERS) {
      expect(r.name.trim(), "name").not.toBe("");
      expect(r.name).not.toMatch(/[[\]]|name|nom/i);
      expect(r.covers.trim(), `${r.name}: what they reviewed`).not.toBe("");
      expect(r.completed, r.name).toMatch(/^20\d\d-(0[1-9]|1[0-2])$/);
    }
  });

  it("formats names with optional titles", () => {
    expect(reviewerNames([])).toBe("");
    expect(
      reviewerNames([
        { name: "Prof. Awa Diop", title: "linguist", covers: "Units 1–24", completed: "2026-11" },
        { name: "Moussa Sow", covers: "Wolof interface", completed: "2026-11" },
      ]),
    ).toBe("Prof. Awa Diop (linguist), Moussa Sow");
  });
});
