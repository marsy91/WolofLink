// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { rowsToSeasons } from "@/lib/seasons";
import { activeSeason, type CustomSeason } from "./seasons";

const at = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!, 12, 0);
};

describe("seasonal themes", () => {
  it("is quiet on an ordinary day", () => {
    expect(activeSeason(at("2026-11-10"))).toBeNull();
  });
  it("follows the holiday dates", () => {
    expect(activeSeason(at("2027-02-09"))?.look).toBe("ramadan");
    expect(activeSeason(at("2027-03-01"))?.look).toBe("ramadan");
    expect(activeSeason(at("2027-03-10"))).toMatchObject({ look: "festive", key: "holiday:korite:2027" });
    expect(activeSeason(at("2027-05-15"))?.key).toBe("holiday:tabaski:2027");
    expect(activeSeason(at("2027-04-04"))?.look).toBe("flag");
    expect(activeSeason(at("2027-04-05"))?.look).toBeUndefined();
    expect(activeSeason(at("2026-12-31"))?.key).toBe("holiday:new-year:2027");
  });
  it("moves with a date the owner corrected", () => {
    const overrides = { "tabaski:2027": { date: "2027-05-20", confirmed: true } };
    expect(activeSeason(at("2027-05-15"), overrides)).toBeNull();
    expect(activeSeason(at("2027-05-19"), overrides)?.key).toBe("holiday:tabaski:2027");
  });
  it("puts the owner's events first", () => {
    const ev: CustomSeason = {
      id: "e1",
      look: "sport",
      starts_on: "2027-05-10",
      ends_on: "2027-05-18",
      title: { en: "Sports week" },
      message: null,
    };
    expect(activeSeason(at("2027-05-17"), {}, [ev])).toMatchObject({ key: "event:e1", look: "sport" });
    expect(activeSeason(at("2027-05-19"), {}, [ev])?.key).toBe("holiday:tabaski:2027");
  });
  it("ignores malformed online rows", () => {
    const rows = rowsToSeasons([
      { id: "a", look: "sport", starts_on: "2027-01-01", ends_on: "2027-01-02", title: { en: "OK" }, message: null },
      { id: "b", look: "rainbow", starts_on: "2027-01-01", ends_on: "2027-01-02", title: { en: "Bad look" } },
      { id: "c", look: "sport", starts_on: "2027-01-01", ends_on: "2027-01-02", title: { fr: "Pas d'anglais" } },
      { id: 4, look: "sport", starts_on: "2027-01-01", ends_on: "2027-01-02", title: { en: "Bad id" } },
    ]);
    expect(rows.map((r) => r.id)).toEqual(["a"]);
  });
});
