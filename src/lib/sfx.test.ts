// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { isLowEnd, playSfx } from "./sfx";

describe("sfx", () => {
  it("does nothing (and never throws) without Web Audio", () => {
    for (const k of ["tick", "go", "clang", "crown", "cheer", "whoosh"] as const) expect(() => playSfx(k)).not.toThrow();
  });
  it("spots budget phones", () => {
    expect(isLowEnd({ hardwareConcurrency: 4, deviceMemory: 4 })).toBe(true);
    expect(isLowEnd({ hardwareConcurrency: 8, deviceMemory: 2 })).toBe(true);
    expect(isLowEnd({ hardwareConcurrency: 8, deviceMemory: 8 })).toBe(false);
    expect(isLowEnd({})).toBe(false);
    expect(isLowEnd(undefined)).toBe(true);
  });
});
