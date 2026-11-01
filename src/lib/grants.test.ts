// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { NO_GRANTS, rowToGrants } from "./grants";

describe("account grants", () => {
  const now = Date.parse("2026-11-01T12:00:00Z");
  it("reads the server row", () => {
    expect(rowToGrants(undefined, now)).toEqual(NO_GRANTS);
    expect(rowToGrants({ unlock_all: true, premium: true, premium_until: null, source: "owner" }, now)).toEqual({
      unlockAll: true,
      premium: true,
      premiumUntil: null,
      source: "owner",
    });
  });
  it("turns Premium off after its end date", () => {
    const g = rowToGrants({ unlock_all: false, premium: true, premium_until: "2026-10-31T00:00:00Z", source: "granted" }, now);
    expect(g.premium).toBe(false);
    const h = rowToGrants({ unlock_all: false, premium: true, premium_until: "2026-12-01T00:00:00Z", source: "granted" }, now);
    expect(h.premium).toBe(true);
  });
  it("ignores unknown sources", () => {
    expect(rowToGrants({ unlock_all: false, premium: false, premium_until: null, source: "hacker" }, now).source).toBe("none");
  });
});
