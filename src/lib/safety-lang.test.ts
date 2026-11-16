// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { safetyLang } from "./safety-lang";

describe("language for the crash and not-found screens", () => {
  it("uses the language saved in the learner's progress first", () => {
    expect(safetyLang(JSON.stringify({ profile: { uiLang: "fr" } }), "de-DE")).toBe("fr");
  });

  it("falls back to the phone's language when nothing usable is saved", () => {
    expect(safetyLang(null, "es-ES")).toBe("es");
    expect(safetyLang(JSON.stringify({ profile: null }), "it")).toBe("it");
    expect(safetyLang(JSON.stringify({ profile: { uiLang: "xx" } }), "DE-at")).toBe("de");
  });

  it("survives damaged progress and unknown phone languages", () => {
    expect(safetyLang("{not json", "fr-SN")).toBe("fr");
    expect(safetyLang("null", "wo-SN")).toBe("en");
    expect(safetyLang(undefined, undefined)).toBe("en");
  });
});
