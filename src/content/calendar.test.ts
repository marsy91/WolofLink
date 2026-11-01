// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { rowsToOverrides } from "@/lib/holidays";
import { reminderItems } from "@/lib/holiday-text";
import { HOLIDAYS, dateIn, easterSunday, upcoming } from "./calendar";
import { course } from "./course";
import { UI_LANGS } from "./types";

const at = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!, 10, 0);
};

describe("holiday calendar", () => {
  it("has unique ids, full translations and real course words", () => {
    expect(new Set(HOLIDAYS.map((h) => h.id)).size).toBe(HOLIDAYS.length);
    for (const h of HOLIDAYS) {
      for (const lang of UI_LANGS) {
        expect(h.title[lang], `${h.id}.title.${lang}`).toBeTruthy();
        expect(h.about[lang], `${h.id}.about.${lang}`).toBeTruthy();
      }
      for (const id of h.words) expect(course.entries[id], `${h.id} word ${id}`).toBeDefined();
      if (h.kind === "lunar") {
        expect(h.expected?.length, h.id).toBeGreaterThanOrEqual(4);
        for (const d of h.expected!) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("calculates Easter", () => {
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
    expect(easterSunday(2028)).toBe("2028-04-16");
    expect(dateIn(HOLIDAYS.find((h) => h.id === "whit-monday")!, 2027)?.date).toBe("2027-05-17");
    expect(dateIn(HOLIDAYS.find((h) => h.id === "ascension")!, 2027)?.date).toBe("2027-05-06");
  });

  it("lists upcoming dates soonest first, with statuses", () => {
    const list = upcoming(at("2026-11-01"));
    expect(list[0]!.holiday.id).toBe("all-saints");
    expect(list[0]!.daysAway).toBe(0);
    expect(list[1]!.holiday.id).toBe("christmas");
    expect(list.map((o) => o.daysAway)).toEqual([...list.map((o) => o.daysAway)].sort((a, b) => a - b));
    const tabaski = list.find((o) => o.holiday.id === "tabaski")!;
    expect(tabaski.date).toBe("2027-05-17");
    expect(tabaski.status).toBe("expected");
    expect(list.every((o) => o.daysAway <= 366)).toBe(true);
  });

  it("shows Ramadan as under way during the month", () => {
    const list = upcoming(at("2027-02-20"));
    const ramadan = list.find((o) => o.holiday.id === "ramadan")!;
    expect(ramadan.ongoing).toBe(true);
    expect(list[0]!.holiday.id).toBe("ramadan");
  });

  it("applies dates confirmed online", () => {
    const overrides = rowsToOverrides([
      { holiday_id: "tabaski", year: 2027, day: "2027-05-18", confirmed: true },
      { holiday_id: "bad", year: 2027, day: "not a date", confirmed: true },
    ]);
    expect(Object.keys(overrides)).toEqual(["tabaski:2027"]);
    const tabaski = upcoming(at("2026-11-01"), overrides).find((o) => o.holiday.id === "tabaski")!;
    expect(tabaski).toMatchObject({ date: "2027-05-18", status: "confirmed" });
  });

  it("builds reminder texts in the interface language", () => {
    const items = reminderItems(upcoming(at("2026-11-01")), "fr");
    expect(items.find((i) => i.date === "2026-11-01")).toBeUndefined();
    expect(items.find((i) => i.date === "2026-12-25")?.title).toBe("Demain : Noël");
    expect(items.find((i) => i.date === "2027-05-17")?.title).toBe("Prévu demain : Tabaski (Aïd el-Kébir)");
  });
});
