// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { kindOf, problemOf, sdkKeyFor, statusOf } from "./billing";
import { ENTITLEMENT } from "./premium";

describe("billing", () => {
  it("checks the woloflink_pro entitlement", () => {
    expect(ENTITLEMENT).toBe("woloflink_pro");
  });

  it("reads plan kinds from the package type, then from our product ids", () => {
    expect(kindOf("ANNUAL", "anything")).toBe("annual");
    expect(kindOf("CUSTOM", "yearly")).toBe("annual");
    expect(kindOf(undefined, "woloflink_pro:monthly")).toBe("monthly");
    expect(kindOf(undefined, "lifetime")).toBe("lifetime");
    expect(kindOf(undefined, "something")).toBe("other");
    expect(kindOf(undefined, null)).toBe("other");
  });

  it("turns RevenueCat errors into messages, and never treats a cancel as a failure", () => {
    expect(problemOf({ code: "1" })).toBe("cancelled");
    expect(problemOf({ code: "0", userCancelled: true })).toBe("cancelled");
    expect(problemOf({ code: "20" })).toBe("pending");
    expect(problemOf({ code: "10" })).toBe("network");
    expect(problemOf({ code: "35" })).toBe("network");
    expect(problemOf({ code: "6" })).toBe("alreadyOwned");
    expect(problemOf({ code: "3" })).toBe("notAllowed");
    expect(problemOf({ code: "2" })).toBe("store");
    expect(problemOf({ code: 99 })).toBe("unknown");
    expect(problemOf(null)).toBe("unknown");
  });

  it("reads the current plan from customer info", () => {
    const info = (active: Record<string, unknown>) => ({ entitlements: { active }, managementURL: "https://play.google.com/store/account/subscriptions" }) as never;
    expect(statusOf(info({})).active).toBe(false);
    expect(statusOf(info({ premium: { isActive: true } })).active).toBe(false);
    const yearly = statusOf(info({ woloflink_pro: { isActive: true, willRenew: true, productIdentifier: "yearly", expirationDate: "2027-01-01T00:00:00Z" } }));
    expect(yearly).toEqual({
      active: true,
      productId: "yearly",
      kind: "annual",
      willRenew: true,
      expires: "2027-01-01T00:00:00Z",
      managementUrl: "https://play.google.com/store/account/subscriptions",
    });
    const lifetime = statusOf(info({ woloflink_pro: { isActive: true, willRenew: false, productIdentifier: "lifetime", expirationDate: null } }));
    expect(lifetime.kind).toBe("lifetime");
    expect(lifetime.expires).toBeNull();
  });

  it("uses the Test Store key only when the test switch is on", () => {
    const env = { NEXT_PUBLIC_REVENUECAT_TEST_KEY: "test_abc", NEXT_PUBLIC_REVENUECAT_ANDROID_KEY: "goog_real" };
    expect(sdkKeyFor("android", env)).toBe("goog_real");
    expect(sdkKeyFor("android", { ...env, NEXT_PUBLIC_REVENUECAT_TEST_STORE: "on" })).toBe("test_abc");
    expect(sdkKeyFor("android", { NEXT_PUBLIC_REVENUECAT_TEST_KEY: "test_abc" })).toBeUndefined();
    expect(sdkKeyFor("web", env)).toBeUndefined();
  });

  it("release builds never ship with the Test Store switch on", async () => {
    const { readFileSync } = await import("node:fs");
    const prod = readFileSync(new URL("../../.env.production", import.meta.url), "utf8");
    expect(prod).toMatch(/^NEXT_PUBLIC_REVENUECAT_TEST_STORE=off$/m);
  });
});
