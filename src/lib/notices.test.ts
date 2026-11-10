// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { parseNotices } from "./notices";

describe("parseNotices", () => {
  it("keeps valid announcements and known switches only", () => {
    const n = parseNotices({
      announcements: [{ id: "a", title: { en: "Hello" }, message: null }, { id: "b", title: { fr: "no en" } }, { title: { en: "no id" } }],
      off: ["duels", "everything", 3],
    });
    expect(n.announcements.map((a) => a.id)).toEqual(["a"]);
    expect(n.off).toEqual(["duels"]);
  });
  it("treats junk as nothing announced and everything on", () => {
    for (const junk of [null, undefined, "x", 5, { announcements: "no", off: {} }]) {
      expect(parseNotices(junk)).toEqual({ announcements: [], off: [], on: [] });
    }
  });
  it("opt-in features are on only when the server says so", () => {
    expect(parseNotices({ on: ["nearby", "everything"] }).on).toEqual(["nearby"]);
    expect(parseNotices({ off: ["nearby"] }).on).toEqual([]);
    expect(parseNotices({ off: ["nearby"] }).off).toEqual([]);
    expect(parseNotices({}).on).toEqual([]);
  });
  it("shows at most three announcements", () => {
    const many = Array.from({ length: 6 }, (_, i) => ({ id: String(i), title: { en: "T" } }));
    expect(parseNotices({ announcements: many }).announcements).toHaveLength(3);
  });
});
