// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COUNTRY_CENTRES, COUNTRY_CODES, countriesByName, countryName, flag, isLand, LAND_ROWS, MAP_COLS, MAP_ROWS, project } from "@/content/world";
import { cachedWorld, dotLevel, goalPercent, parseWorld, topContributors } from "./world";

const sample = {
  week_start: "2026-11-09",
  week_xp: 6200,
  goal: 5000,
  active: 41,
  members: 37,
  countries: [
    { c: "SN", n: 20, xp: 3000 },
    { c: "IT", n: 9, xp: 1500 },
    { c: "FR", n: 5, xp: 0 },
    { c: "ZZ", n: 4, xp: 99 },
    { c: "GB", n: 0, xp: 10 },
  ],
  other: { countries: 2, n: 3, xp: 40 },
};

describe("world data", () => {
  it("matches the country list in the database", () => {
    const dir = join(__dirname, "../../supabase/migrations");
    const file = readdirSync(dir).sort().filter((f) => f.endsWith("_world.sql")).at(-1)!;
    const sql = readFileSync(join(dir, file), "utf8");
    const start = sql.indexOf("function private.valid_country");
    const block = sql.slice(start, sql.indexOf("]);", start));
    const inDb = [...block.matchAll(/'([A-Z]{2})'/g)].map((m) => m[1]).sort();
    expect(inDb).toEqual([...COUNTRY_CODES].sort());
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length);
  });

  it("has a land grid of the right size and centres inside the map", () => {
    expect(LAND_ROWS).toHaveLength(MAP_ROWS);
    for (const row of LAND_ROWS) expect(row).toMatch(new RegExp(`^[0-9a-f]{${MAP_COLS / 4}}$`));
    for (const [code, [lon, lat]] of COUNTRY_CENTRES) {
      expect(COUNTRY_CODES, code).toContain(code);
      expect(Math.abs(lon)).toBeLessThanOrEqual(180);
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
    }
    // Dakar's region is on land, the middle of the Atlantic is not.
    const sn = project(...COUNTRY_CENTRES.get("SN")!);
    expect(isLand(Math.floor(sn.x), Math.floor(sn.y))).toBe(true);
    const sea = project(-35, 20);
    expect(isLand(Math.floor(sea.x), Math.floor(sea.y))).toBe(false);
    expect(isLand(-1, 0)).toBe(false);
    expect(isLand(0, MAP_ROWS)).toBe(false);
  });

  it("names countries in the interface language and makes flags", () => {
    expect(flag("SN")).toBe("🇸🇳");
    expect(flag("x")).toBe("🌍");
    expect(countryName("SN", "fr")).toMatch(/Sénégal/);
    expect(countryName("DE", "de")).toBe("Deutschland");
    const fr = countriesByName("fr");
    expect(fr).toHaveLength(COUNTRY_CODES.length);
    expect(fr.indexOf("DE")).toBeLessThan(fr.indexOf("SN"));
  });
});

describe("world summary", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps only known countries with learners", () => {
    const s = parseWorld(sample)!;
    expect(s.countries.map((c) => c.c)).toEqual(["SN", "IT", "FR"]);
    expect(s.goal).toBe(5000);
    expect(s.other).toEqual({ countries: 2, n: 3, xp: 40 });
    expect(parseWorld({ paused: true })).toBeNull();
    expect(parseWorld({ week_start: "soon" })).toBeNull();
    expect(parseWorld(null)).toBeNull();
    expect(parseWorld({ week_start: "2026-11-09", goal: -4, week_xp: "x" })).toMatchObject({ goal: 1, weekXp: 0, countries: [] });
  });

  it("works out the goal, the top countries and dot sizes", () => {
    const s = parseWorld(sample)!;
    expect(goalPercent(s)).toBe(124);
    expect(goalPercent({ weekXp: 0, goal: 0 })).toBe(0);
    expect(topContributors(s)).toEqual([
      { c: "SN", xp: 3000, share: 48 },
      { c: "IT", xp: 1500, share: 24 },
    ]);
    expect([dotLevel(3), dotLevel(10), dotLevel(50), dotLevel(500)]).toEqual([1, 2, 3, 4]);
  });

  it("reads the offline copy safely", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    expect(cachedWorld()).toBeNull();
    store.set("woloflink.world.v1", "not json");
    expect(cachedWorld()).toBeNull();
    store.set("woloflink.world.v1", JSON.stringify({ data: sample, savedAt: 5 }));
    expect(cachedWorld()?.summary.weekXp).toBe(6200);
    expect(cachedWorld()?.savedAt).toBe(5);
  });
});
