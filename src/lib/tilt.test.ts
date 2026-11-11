// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { tiltFrom, tiltFromOrientation } from "./tilt";

describe("tilt", () => {
  const box = { left: 100, top: 300, width: 100, height: 100 };
  it("is level at the centre and leans towards the finger, never past ±1", () => {
    expect(tiltFrom(150, 350, box, 400, 800)).toEqual([0, 0]);
    expect(tiltFrom(250, 350, box, 400, 800)[0]).toBeCloseTo(0.5);
    expect(tiltFrom(150, 150, box, 400, 800)[1]).toBeCloseTo(-0.5);
    expect(tiltFrom(5000, -5000, box, 400, 800)).toEqual([1, -1]);
  });
  it("reads the phone's tilt, treating a normal holding angle as level", () => {
    expect(tiltFromOrientation(0, 45)).toEqual([0, 0]);
    expect(tiltFromOrientation(15, 60)).toEqual([0.5, 0.5]);
    expect(tiltFromOrientation(-90, 180)).toEqual([-1, 1]);
    expect(tiltFromOrientation(null, null)).toEqual([0, 0]);
  });
});
