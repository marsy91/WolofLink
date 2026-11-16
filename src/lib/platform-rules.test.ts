// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { isReviewEmail, pushAllowedOn, reviewEmailFrom } from "./platform-rules";

describe("push per platform", () => {
  it("keeps iOS push off until its own switch is on", () => {
    expect(pushAllowedOn("android", true, false)).toBe(true);
    expect(pushAllowedOn("ios", true, false)).toBe(false);
    expect(pushAllowedOn("ios", true, true)).toBe(true);
  });

  it("never runs push when the main switch is off or on the web", () => {
    expect(pushAllowedOn("android", false, true)).toBe(false);
    expect(pushAllowedOn("ios", false, true)).toBe(false);
    expect(pushAllowedOn("web", true, true)).toBe(false);
  });
});

describe("App Review login", () => {
  it("is off when no review email is configured", () => {
    expect(reviewEmailFrom(undefined)).toBeNull();
    expect(reviewEmailFrom("   ")).toBeNull();
    expect(isReviewEmail("review@example.com", null)).toBe(false);
  });

  it("matches only the configured address, ignoring case and spaces", () => {
    const review = reviewEmailFrom(" Review@Example.com ");
    expect(review).toBe("review@example.com");
    expect(isReviewEmail("  REVIEW@example.com", review)).toBe(true);
    expect(isReviewEmail("someone@example.com", review)).toBe(false);
    expect(isReviewEmail("review@example.com.evil", review)).toBe(false);
  });
});
