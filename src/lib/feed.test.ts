// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import type { Entry, Lesson } from "@/content/types";
import { phrasebook } from "@/content/phrasebook";
import { continueLesson, dailyOrder, dayNumber, feedPosts } from "./feed";

const e = (id: string): Entry => ({ id, wo: id, tr: { en: id } }) as Entry;
const cats = [
  { id: "a", phrases: [e("a1"), e("a2"), e("a3")] },
  { id: "b", phrases: [e("b1")] },
  { id: "c", phrases: [e("c1"), e("c2")] },
];

describe("feed", () => {
  it("keeps the same order all day and changes it the next day", () => {
    const items = Array.from({ length: 30 }, (_, i) => i);
    expect(dailyOrder(items, 100)).toEqual(dailyOrder(items, 100));
    expect(dailyOrder(items, 100)).not.toEqual(dailyOrder(items, 101));
    expect([...dailyOrder(items, 100)].sort((x, y) => x - y)).toEqual(items);
  });

  it("changes day at local midnight", () => {
    const evening = new Date(2026, 10, 11, 23, 59).getTime();
    const morning = new Date(2026, 10, 12, 0, 1).getTime();
    expect(dayNumber(morning) - dayNumber(evening)).toBe(1);
  });

  it("shows every phrase once and alternates situations", () => {
    const posts = feedPosts(cats, 5);
    expect(posts.map((p) => p.entry.id).sort()).toEqual(["a1", "a2", "a3", "b1", "c1", "c2"]);
    // The first round takes one phrase from each situation.
    expect(new Set(posts.slice(0, 3).map((p) => p.categoryId)).size).toBe(3);
  });

  it("filters to one situation", () => {
    expect(feedPosts(cats, 5, "c").every((p) => p.categoryId === "c")).toBe(true);
    expect(feedPosts(cats, 5, "zzz")).toEqual([]);
  });

  it("uses the real phrasebook", () => {
    const posts = feedPosts(phrasebook, 9);
    expect(posts.length).toBe(phrasebook.reduce((n, c) => n + c.phrases.length, 0));
  });

  it("continues with the next open lesson, then the next one to level up", () => {
    const lessons = [{ id: "l1" }, { id: "l2" }, { id: "l3" }] as Lesson[];
    const times: Record<string, number> = { l1: 1 };
    const open = (id: string) => id !== "l3";
    expect(continueLesson(lessons, (id) => times[id] ?? 0, open)?.id).toBe("l2");
    times.l2 = 3;
    expect(continueLesson(lessons, (id) => times[id] ?? 0, open)?.id).toBe("l1");
    times.l1 = 3;
    expect(continueLesson(lessons, (id) => times[id] ?? 0, open)).toBeNull();
  });
});

describe("feed themes", () => {
  it("Lac Rose and Gorée use the feed; the others keep the path", async () => {
    const { layoutFor, THEME_IDS } = await import("./themes");
    expect(layoutFor("lacrose")).toBe("feed");
    expect(layoutFor("goree")).toBe("feed");
    expect(THEME_IDS.filter((id) => layoutFor(id) === "feed").sort()).toEqual(["goree", "lacrose"]);
    expect(layoutFor(undefined)).toBe("path");
  });
});
