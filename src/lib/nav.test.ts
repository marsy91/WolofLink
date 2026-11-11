// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isSameScreen, pathOf } from "./nav";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) && !/\.test\./.test(f) ? [p] : [];
  });
}

describe("navigation", () => {
  it("compares screens without their query", () => {
    expect(pathOf("/duel/?bot=easy")).toBe("/duel/");
    expect(pathOf("/duel")).toBe("/duel/");
    expect(isSameScreen("/duel/?bot=hard", "/duel/")).toBe(true);
    expect(isSameScreen("/review/", "/lesson/greet-1/")).toBe(false);
  });

  it("never uses a plain web link or a page reload for an in-app screen", () => {
    // Inside the phone app these restart the app at the home screen. Use <Link> or goTo().
    const bad: string[] = [];
    for (const f of files(join(__dirname, ".."))) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/<a\s[^>]*?href=(\{`|"|\{")\/(?!\/)|(^|[^.\w])location\.(href\s*=|assign\(|replace\()|location\.reload\(/g)) {
        bad.push(`${f.split("/src/")[1]}:${src.slice(0, m.index).split("\n").length}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
