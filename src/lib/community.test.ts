// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { cleanHandle, codeFromQr, handleIsValid, handleUrl, qrPayload } from "./community";

describe("community helpers", () => {
  it("cleans and validates social handles like the server", () => {
    expect(cleanHandle("  @moussa.wolof ")).toBe("moussa.wolof");
    expect(handleIsValid("@moussa_wolof")).toBe(true);
    expect(handleIsValid("")).toBe(true);
    expect(handleIsValid("bad handle!")).toBe(false);
    expect(handleIsValid("x".repeat(31))).toBe(false);
  });

  it("links handles to the right place", () => {
    expect(handleUrl("instagram", "@awa")).toBe("https://instagram.com/awa");
    expect(handleUrl("tiktok", "awa")).toBe("https://www.tiktok.com/@awa");
    expect(handleUrl("x", "awa")).toBe("https://x.com/awa");
    expect(handleUrl("snapchat", "awa")).toBe("https://www.snapchat.com/add/awa");
  });

  it("round-trips the friend code through the QR text and rejects anything else", () => {
    expect(codeFromQr(qrPayload("AB23CD45"))).toBe("AB23CD45");
    expect(codeFromQr("woloflink:ab23cd45")).toBe("AB23CD45");
    expect(codeFromQr("https://example.com")).toBeNull();
    expect(codeFromQr("WOLOFLINK:AB1")).toBeNull();
  });
});
