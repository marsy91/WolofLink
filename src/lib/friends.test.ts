// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { formatCode, normaliseCode, ranks } from "./friends";

describe("friends", () => {
  it("accepts codes typed loosely", () => {
    expect(normaliseCode("ab12 cd-34")).toBe("AB12CD34");
    expect(normaliseCode("  xyz9-8765  extra")).toBe("XYZ98765");
    expect(formatCode("AB12CD34")).toBe("AB12 CD34");
  });
  it("gives tied friends the same place", () => {
    expect(ranks([{ week_xp: 90 }, { week_xp: 50 }, { week_xp: 50 }, { week_xp: 10 }])).toEqual([1, 2, 2, 4]);
    expect(ranks([{ week_xp: 0 }, { week_xp: 0 }])).toEqual([1, 1]);
  });
});
