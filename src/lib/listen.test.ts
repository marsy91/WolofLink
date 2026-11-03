// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { LISTEN_STEPS, MAX_PLAYLIST, listenPlaylist, nextPosition } from "./listen";

const card = (lastSeen: number) => ({ box: 1, due: 0, right: 1, wrong: 0, lastSeen });

describe("listening mode", () => {
  it("plays learned words, most recent first, and skips unknown ids", () => {
    const srs = { "g.salaam": card(1), "g.fi": card(5), gone: card(9) };
    expect(listenPlaylist("learned", { srs })).toEqual(["g.fi", "g.salaam"]);
  });
  it("plays every line of a unit once", () => {
    const unit = course.units[0]!;
    const list = listenPlaylist(unit.id, { srs: {} });
    expect(new Set(list).size).toBe(list.length);
    expect(list.length).toBeLessThanOrEqual(MAX_PLAYLIST);
    expect(list[0]).toBe(unit.lessons[0]!.entries[0]);
    expect(listenPlaylist("nope", { srs: {} })).toEqual([]);
  });
  it("walks the steps of a line, then the next line, and loops or stops", () => {
    expect(nextPosition(0, 0, 3, false)).toEqual({ line: 0, step: 1 });
    expect(nextPosition(0, LISTEN_STEPS.length - 1, 3, false)).toEqual({ line: 1, step: 0 });
    expect(nextPosition(2, LISTEN_STEPS.length - 1, 3, false)).toBeNull();
    expect(nextPosition(2, LISTEN_STEPS.length - 1, 3, true)).toEqual({ line: 0, step: 0 });
    expect(nextPosition(0, LISTEN_STEPS.length - 1, 0, true)).toBeNull();
  });
});
