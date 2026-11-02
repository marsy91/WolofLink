// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { audioSourceFor, hasCommunityVoice, setCommunityVoices } from "./audio";
import { RECORDING_ORDER, extFor, nextLines, safeName } from "./recorder";
import { credits, rowsToVoices } from "./voices";

const uid = "11111111-2222-3333-4444-555555555555";

describe("community voices", () => {
  it("keeps only well-formed rows from the server", () => {
    const rows = rowsToVoices([
      { entry_id: "g.salaam", path: `${uid}/g.salaam-1.webm`, recorder: "Awa", approved_at: "2026-11-02T10:00:00Z" },
      { entry_id: "g.bad", path: "../etc/passwd", recorder: "x" },
      { entry_id: 5, path: `${uid}/x.webm` },
    ]);
    expect(rows.map((r) => r.entry_id)).toEqual(["g.salaam"]);
  });

  it("credits contributors by number of lines", () => {
    const rows = rowsToVoices([
      { entry_id: "a", path: `${uid}/a.webm`, recorder: "Awa" },
      { entry_id: "b", path: `${uid}/b.webm`, recorder: "Moussa" },
      { entry_id: "c", path: `${uid}/c.webm`, recorder: "Awa" },
      { entry_id: "d", path: `${uid}/d.webm`, recorder: "" },
    ]);
    expect(credits(rows)).toEqual([
      ["Awa", 2],
      ["Moussa", 1],
    ]);
  });

  it("marks a line with an approved voice as a recording", () => {
    const e = course.entries["g.salaam"]!;
    expect(audioSourceFor(e)).toBe("ai");
    setCommunityVoices(new Map([["g.salaam", `${uid}/g.salaam-1.webm`]]), async () => null);
    expect(hasCommunityVoice("g.salaam")).toBe(true);
    expect(audioSourceFor(e)).toBe("recording");
    setCommunityVoices(new Map(), async () => null);
  });
});

describe("recording queue", () => {
  it("starts with Survival Wolof and lists every line once", () => {
    expect(new Set(RECORDING_ORDER.map((e) => e.id)).size).toBe(RECORDING_ORDER.length);
    expect(RECORDING_ORDER.length).toBeGreaterThan(400);
  });
  it("skips lines already done, approved or skipped", () => {
    const [a, b, c, d] = RECORDING_ORDER;
    const next = nextLines(
      [
        { entry_id: a!.id, mine: true, approved: false },
        { entry_id: b!.id, mine: false, approved: true },
        { entry_id: c!.id, mine: false, approved: false },
      ],
      new Set([d!.id]),
    );
    expect(next[0]!.id).toBe(c!.id);
    expect(next.some((e) => [a!.id, b!.id, d!.id].includes(e.id))).toBe(false);
  });
  it("makes safe file names", () => {
    expect(safeName("story:meet:3")).toBe("story_meet_3");
    expect(extFor("audio/webm")).toBe("webm");
    expect(extFor("audio/mp4")).toBe("m4a");
  });
});
