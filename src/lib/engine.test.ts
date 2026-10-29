import { describe, expect, it } from "vitest";
import { course, findLesson } from "@/content/course";
import { buildExercise, buildLesson, correctAnswerText, isCorrect, normalize, seeded, tokensOf } from "./engine";
import { buildReview } from "./review";
import { answer, next, startSession, accuracy, xpFor } from "./session";

const opts = (seed = 1) => ({ course, lang: "en" as const, rng: seeded(seed), pool: findLesson("greetings-1")!.lesson.entries });

describe("tokens and normalisation", () => {
  it("strips punctuation from tiles but keeps diacritics", () => {
    expect(tokensOf(course.entries["g.nanga"]!)).toEqual(["Na", "nga", "def"]);
    expect(normalize(" Neex  na! ")).toBe("neex na");
    expect(normalize("Jërëjëf")).not.toBe(normalize("Jerejef"));
  });
});

describe("buildExercise", () => {
  it("pick_meaning shows Wolof and offers 4 distinct translations including the answer", () => {
    const ex = buildExercise({ type: "pick_meaning", entry: "g.salaam" }, 0, opts());
    expect(ex.kind).toBe("choice");
    if (ex.kind !== "choice") return;
    expect(ex.prompt).toBe("Salaam aleekum");
    expect(ex.choices).toHaveLength(4);
    expect(new Set(ex.choices.map((c) => c.label)).size).toBe(4);
    expect(ex.choices.map((c) => c.label)).toContain("Hello");
    expect(isCorrect(ex, { kind: "choice", choiceId: "g.salaam" })).toBe(true);
    expect(isCorrect(ex, { kind: "choice", choiceId: ex.choices.find((c) => c.id !== "g.salaam")!.id })).toBe(false);
  });

  it("uses the interface language for meanings", () => {
    const ex = buildExercise({ type: "pick_wolof", entry: "g.jerejef" }, 0, { ...opts(), lang: "de" });
    expect(ex.kind === "choice" && ex.prompt).toBe("Danke");
  });

  it("pick_picture only offers entries that have pictures", () => {
    const pool = findLesson("food-1")!.lesson.entries;
    const ex = buildExercise({ type: "pick_picture", entry: "f.ndox" }, 0, { ...opts(), pool });
    expect(ex.kind === "choice" && ex.choices.every((c) => c.pic)).toBe(true);
  });

  it("build accepts the right word order only, ignoring case", () => {
    const ex = buildExercise({ type: "build", entry: "g.nanga", distractors: ["tudd", "rekk"] }, 0, opts());
    if (ex.kind !== "build") throw new Error("expected build");
    expect(ex.bank.map((b) => b.label).sort()).toEqual(["Na", "def", "nga", "rekk", "tudd"].sort());
    expect(isCorrect(ex, { kind: "build", words: ["na", "nga", "def"] })).toBe(true);
    expect(isCorrect(ex, { kind: "build", words: ["nga", "Na", "def"] })).toBe(false);
    expect(correctAnswerText(ex)).toBe("Na nga def?");
  });

  it("fill_blank blanks the right word", () => {
    const ex = buildExercise({ type: "fill_blank", entry: "g.fi", blank: 2, options: ["fi", "def", "suba"] }, 0, opts());
    if (ex.kind !== "fill") throw new Error("expected fill");
    expect(ex.before).toEqual(["Maa", "ngi"]);
    expect(ex.after).toEqual(["rekk"]);
    expect(isCorrect(ex, { kind: "fill", choiceId: "fi" })).toBe(true);
    expect(isCorrect(ex, { kind: "fill", choiceId: "def" })).toBe(false);
  });

  it("match is correct only without slips", () => {
    const ex = buildExercise({ type: "match", entries: ["g.waaw", "g.deedeet"] }, 0, opts());
    expect(isCorrect(ex, { kind: "match", mistakes: 0 })).toBe(true);
    expect(isCorrect(ex, { kind: "match", mistakes: 1 })).toBe(false);
  });

  it("is deterministic for a given seed", () => {
    const lesson = findLesson("numbers-1")!.lesson;
    const a = buildLesson(lesson, { course, lang: "fr", rng: seeded(42) });
    const b = buildLesson(lesson, { course, lang: "fr", rng: seeded(42) });
    expect(a).toEqual(b);
  });

  it("flags first appearances as new", () => {
    const ex = buildLesson(findLesson("greetings-1")!.lesson, { course, lang: "en", rng: seeded(3) });
    expect(ex[0]!.isNew).toBe(true);
    expect(ex[2]!.isNew).toBe(false); // listen to an entry already introduced
  });
});

describe("session", () => {
  const exercises = () => buildLesson(findLesson("greetings-1")!.lesson, { course, lang: "en", rng: seeded(7) });

  it("re-queues a missed exercise once and records it as a mistake", () => {
    let s = startSession(exercises(), 5, "lesson");
    const base = s.queue.length;
    s = next(answer(s, false));
    expect(s.queue).toHaveLength(base + 1);
    expect(s.queue.at(-1)!.isRetry).toBe(true);
    expect(s.drops).toBe(4);
    expect(s.mistakes).toHaveLength(1);
    while (s.status === "playing") s = next(answer(s, true));
    expect(s.status).toBe("complete");
    expect(accuracy(s)).toBeCloseTo((base - 1) / base);
    expect(xpFor(s)).toBe(10);
  });

  it("fails when drops run out", () => {
    let s = startSession(exercises(), 1, "lesson");
    s = next(answer(s, false));
    expect(s.status).toBe("failed");
  });

  it("never spends drops in review mode and gives a perfect-lesson bonus", () => {
    let r = startSession(exercises(), 1, "review");
    r = next(answer(r, false));
    expect(r.status).toBe("playing");
    expect(r.drops).toBe(1);

    let s = startSession(exercises(), 5, "lesson");
    while (s.status === "playing") s = next(answer(s, true));
    expect(xpFor(s)).toBe(15);
  });
});

describe("review", () => {
  it("builds one exercise per due entry", () => {
    const ex = buildReview(["g.salaam", "n.3", "f.begg"], "it", seeded(5));
    expect(ex).toHaveLength(3);
    expect(ex.flatMap((e) => e.entryIds).sort()).toEqual(["f.begg", "g.salaam", "n.3"]);
  });
});
