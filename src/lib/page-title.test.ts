// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { APP_TITLE, pageTitle } from "./page-title";

describe("pageTitle", () => {
  it("adds the app name after the heading", () => {
    expect(pageTitle("Practice")).toBe("Practice — WolofLink");
  });
  it("tidies whitespace and keeps a heading that already names the app", () => {
    expect(pageTitle("  Holidays \n in Senegal ")).toBe("Holidays in Senegal — WolofLink");
    expect(pageTitle("Privacy policy — WolofLink")).toBe("Privacy policy — WolofLink");
  });
  it("falls back to the default for no heading or a very long one", () => {
    expect(pageTitle(null)).toBe(APP_TITLE);
    expect(pageTitle("")).toBe(APP_TITLE);
    expect(pageTitle("x".repeat(120))).toBe(APP_TITLE);
  });
});
