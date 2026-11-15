// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { ageOn, canCreateAccount, isAdult, isBirthDate, todayIso } from "./age";

const today = new Date(2026, 10, 15); // 15 November 2026

describe("date of birth", () => {
  it("accepts only real past dates", () => {
    expect(isBirthDate("2000-02-29", today)).toBe(true);
    expect(isBirthDate("2001-02-29", today)).toBe(false);
    expect(isBirthDate("2026-11-16", today)).toBe(false);
    expect(isBirthDate("1899-12-31", today)).toBe(false);
    expect(isBirthDate("15/11/2000", today)).toBe(false);
    expect(isBirthDate(undefined, today)).toBe(false);
    expect(todayIso(today)).toBe("2026-11-15");
  });

  it("works out the age, counting the birthday itself", () => {
    expect(ageOn("2008-11-15", today)).toBe(18);
    expect(ageOn("2008-11-16", today)).toBe(17);
    expect(ageOn("2013-11-15", today)).toBe(13);
  });

  it("lets 13s and over create an account and 18s and over use adult features", () => {
    expect(canCreateAccount("2013-11-15", today)).toBe(true);
    expect(canCreateAccount("2013-11-16", today)).toBe(false);
    expect(isAdult("2008-11-15", today)).toBe(true);
    expect(isAdult("2008-11-16", today)).toBe(false);
    expect(isAdult(undefined, today)).toBe(false);
  });
});

describe("stored date of birth", () => {
  it("keeps a real date and drops anything else", async () => {
    const { emptyProgress, migrate } = await import("./progress");
    const base = { ...emptyProgress(0), profile: { id: "x", name: "Awa", uiLang: "fr" as const, target: "wo" as const, goal: "regular" as const, createdAt: 0, guest: true as const } };
    expect(migrate({ ...base, profile: { ...base.profile, birthDate: "2000-05-01" } }).profile?.birthDate).toBe("2000-05-01");
    expect(migrate({ ...base, profile: { ...base.profile, birthDate: "2000-13-01" } }).profile?.birthDate).toBeUndefined();
    expect(migrate(base).profile?.birthDate).toBeUndefined();
  });
});
