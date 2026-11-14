// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { course } from "@/content/course";
import { pickDuelEntries } from "./duels";
import { blobToBase64, isTwoWay, listenChoices, spokenLang, voiceEntryFor, voiceMime, wordIn } from "./duel-voice";
import { emptyProgress } from "./progress";

describe("voice swap", () => {
  it("only happens in two-way duels", () => {
    expect(isTwoWay("wo", "en")).toBe(true);
    expect(isTwoWay("fr", "wo")).toBe(true);
    expect(isTwoWay("wo", "wo")).toBe(false);
    expect(isTwoWay("en", "fr")).toBe(false);
    expect(isTwoWay("wo", null)).toBe(false);
  });

  it("each player records in the language they speak well", () => {
    expect(spokenLang("wo", "en")).toBe("en");
    expect(spokenLang("fr", "wo")).toBe("wo");
  });

  it("gives the two players different duel words, the same on both phones", () => {
    for (let seed = 1; seed < 30; seed++) {
      const ids = pickDuelEntries(emptyProgress(0), seed);
      const a = voiceEntryFor(seed, ids, "challenger");
      const b = voiceEntryFor(seed, ids, "opponent");
      expect(ids).toContain(a);
      expect(ids).toContain(b);
      expect(a).not.toBe(b);
      expect(voiceEntryFor(seed, ids, "challenger")).toBe(a);
    }
  });

  it("writes words in each language and offers four distinct choices", () => {
    const id = Object.keys(course.entries)[0]!;
    expect(wordIn(id, "wo")).toBe(course.entries[id]!.wo);
    expect(wordIn(id, "en")).not.toMatch(/[()]/);
    for (let seed = 1; seed < 20; seed++) {
      const ids = pickDuelEntries(emptyProgress(0), seed);
      for (const lang of ["wo", "en", "fr"] as const) {
        const target = voiceEntryFor(seed, ids, "opponent");
        const c = listenChoices(target, ids, lang, seed);
        expect(c.map((x) => x.id)).toContain(target);
        expect(new Set(c.map((x) => x.label.toLowerCase())).size).toBe(c.length);
        expect(c.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("encodes recordings for the server", async () => {
    expect(await blobToBase64(new Blob([new Uint8Array([104, 105])]))).toBe("aGk=");
    expect(voiceMime("audio/webm;codecs=opus")).toBe("audio/webm");
    expect(voiceMime("audio/mp4")).toBe("audio/mp4");
    expect(voiceMime("audio/ogg")).toBe("audio/ogg");
  });
});
