// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import type { Entry } from "@/content/types";
import { AI_CLIP_DIR, audioSourceFor, clipFor } from "./audio";

const entry = (audio?: string): Entry => ({
  id: "test.entry",
  wo: "Jërëjëf",
  tr: { en: "Thank you", fr: "Merci", es: "Gracias", de: "Danke", it: "Grazie" },
  ...(audio ? { audio } : {}),
});

describe("audio sources", () => {
  it("labels AI clips separately from human recordings", () => {
    expect(audioSourceFor(entry(`${AI_CLIP_DIR}test.entry.mp3`))).toBe("ai");
    expect(audioSourceFor(entry("audio/wo/test.entry.mp3"))).toBe("recording");
  });

  it("falls back to no clip when an entry has none", () => {
    expect(clipFor(entry())).toBeUndefined();
    // No browser speech engine in the test environment.
    expect(audioSourceFor(entry())).toBe("none");
  });
});
