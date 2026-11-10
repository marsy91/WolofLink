// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { OPT_IN_KEYS, SWITCH_KEYS } from "@/lib/notices";
import { featureNotice, NOTICE_KEYS } from "./feature-notices";
import { UI_LANGS } from "./types";

describe("feature notices", () => {
  it("has a ready notice for every switch, in five languages, that fits an announcement", () => {
    expect([...NOTICE_KEYS].sort()).toEqual([...SWITCH_KEYS, ...OPT_IN_KEYS].sort());
    for (const key of NOTICE_KEYS) {
      for (const kind of ["back", "paused"] as const) {
        const n = featureNotice(key, kind)!;
        for (const lang of UI_LANGS) {
          expect(n.title[lang], `${key}.${kind}.${lang}`).toBeTruthy();
          expect(n.message[lang], `${key}.${kind}.${lang}`).toBeTruthy();
          expect(n.title[lang]!.length).toBeLessThanOrEqual(80);
        }
        expect(JSON.stringify(n.title).length).toBeLessThanOrEqual(800);
        expect(JSON.stringify(n.message).length).toBeLessThanOrEqual(2000);
      }
    }
    expect(featureNotice("unknown", "back")).toBeNull();
  });
});
