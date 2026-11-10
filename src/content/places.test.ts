// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { areaName, areasOf, CITIES, COMPASS_AREAS } from "./places";

const CITY_RE = /^[a-z][a-z-]{1,30}$/;
const AREA_RE = /^[a-z][a-z-]{1,30}\/[a-z0-9][a-z0-9-]{1,40}$/;

describe("places", () => {
  it("every city and area id passes the database's format checks", () => {
    for (const c of CITIES) {
      expect(c.id, c.id).toMatch(CITY_RE);
      for (const a of areasOf(c.id)) expect(a).toMatch(AREA_RE);
    }
  });

  it("matches the city list in the community migration", () => {
    const dir = join(__dirname, "../../supabase/migrations");
    const file = readdirSync(dir).find((f) => f.endsWith("_community.sql"))!;
    const sql = readFileSync(join(dir, file), "utf8");
    const block = sql.slice(sql.indexOf("private.valid_city"), sql.indexOf("]);", sql.indexOf("private.valid_city")));
    const inDb = [...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]).sort();
    expect(inDb).toEqual(CITIES.map((c) => c.id).sort());
  });

  it("has no duplicate ids and names areas", () => {
    expect(new Set(CITIES.map((c) => c.id)).size).toBe(CITIES.length);
    expect(areasOf("dakar")).toContain("dakar/plateau");
    expect(areaName("dakar/plateau")).toBe("Plateau");
    expect(areasOf("thies")).toEqual(COMPASS_AREAS.map((a) => `thies/${a}`));
    expect(areaName("thies/north")).toBeNull();
    expect(areasOf("atlantis")).toEqual([]);
  });
});
