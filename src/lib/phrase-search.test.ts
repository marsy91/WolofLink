// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { allPhrases, phrasebook, phraseSlug } from "@/content/phrasebook";
import { UI_LANGS } from "@/content/types";
import { fold, matchesPhrase, searchPhrases } from "./phrase-search";
import { emptyProgress, toggleSavedPhrase } from "./progress";

describe("phrasebook content", () => {
  it("is extensive, with unique ids and complete translations", () => {
    expect(phrasebook.length).toBeGreaterThanOrEqual(12);
    expect(allPhrases.length).toBeGreaterThanOrEqual(180);
    expect(new Set(allPhrases.map((p) => p.id)).size).toBe(allPhrases.length);
    for (const c of phrasebook) {
      expect(c.phrases.length, c.id).toBeGreaterThanOrEqual(5);
      for (const lang of UI_LANGS) expect(c.title[lang], `${c.id} ${lang}`).toBeTruthy();
      for (const p of c.phrases) {
        for (const lang of UI_LANGS) expect(p.tr[lang], `${p.id} ${lang}`).toBeTruthy();
        if (p.note) for (const lang of UI_LANGS) expect(p.note[lang], `${p.id} note ${lang}`).toBeTruthy();
      }
    }
  });

  it("derives stable, file-safe ids", () => {
    expect(phraseSlug("Na nga def?")).toBe("na-nga-def");
    expect(phraseSlug("Ñaata la?")).toBe("naata-la");
    expect(phraseSlug("Jàddal sa càmmoñ")).toBe("jaddal-sa-cammon");
    for (const p of allPhrases) expect(p.id).toMatch(/^pb\.[a-z]+\.[a-z0-9-]+$/);
  });
});

describe("phrase search", () => {
  const entry = { id: "x", wo: "Ñaata la?", tr: { en: "How much is it?", fr: "C'est combien ?" } };

  it("ignores accents, case and punctuation", () => {
    expect(fold("Jàmm rekk!")).toBe("jamm rekk");
    expect(matchesPhrase(entry, "naata", "en")).toBe(true);
    expect(matchesPhrase(entry, "ÑAATA", "en")).toBe(true);
  });

  it("matches the interface language and English, by word prefix", () => {
    expect(matchesPhrase(entry, "combi", "fr")).toBe(true);
    expect(matchesPhrase(entry, "how much", "fr")).toBe(true);
    expect(matchesPhrase(entry, "much how", "en")).toBe(true);
    expect(matchesPhrase(entry, "uch", "en")).toBe(false);
    expect(matchesPhrase(entry, "taxi", "en")).toBe(false);
  });

  it("finds real phrases", () => {
    expect(searchPhrases(allPhrases, "doctor", "en").length).toBeGreaterThanOrEqual(2);
    expect(searchPhrases(allPhrases, "médecin", "fr").length).toBeGreaterThanOrEqual(2);
    expect(searchPhrases(allPhrases, "ndox", "de").length).toBeGreaterThanOrEqual(2);
    expect(searchPhrases(allPhrases, "", "en")).toHaveLength(allPhrases.length);
  });

  it("stars and unstars phrases", () => {
    let p = toggleSavedPhrase(emptyProgress(), "pb.basics.waaw");
    p = toggleSavedPhrase(p, "pb.basics.deedeet");
    expect(p.savedPhrases).toEqual(["pb.basics.deedeet", "pb.basics.waaw"]);
    p = toggleSavedPhrase(p, "pb.basics.waaw");
    expect(p.savedPhrases).toEqual(["pb.basics.deedeet"]);
  });
});
