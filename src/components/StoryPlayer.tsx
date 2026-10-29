"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { findStory } from "@/content/course";
import type { Entry, StoryLine } from "@/content/types";
import { translate, type UiKey } from "@/i18n";
import { playEntry, playTone, stopAudio } from "@/lib/audio";
import { seeded, shuffle } from "@/lib/engine";
import { haptic } from "@/lib/native";
import { ACHIEVEMENTS, applySession, type ApplyOutcome } from "@/lib/progress";
import { useStore } from "@/lib/store";
import { Confetti } from "./Confetti";
import { BADGE_GLYPHS, IconBook, IconClose, IconSpark, IconSpeaker } from "./icons";
import { Button, Loading, ProgressBar, useRequireProfile } from "./ui";

export const STORY_XP = 10;

const asEntry = (l: StoryLine, i: number): Entry => ({ id: `story-line-${i}`, wo: l.wo, tr: l.tr });

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function StoryPlayer({ storyId }: { storyId: string }) {
  const allowed = useRequireProfile();
  const { progress, lang, update, t } = useStore();
  const router = useRouter();
  const found = findStory(storyId);

  const [shown, setShown] = useState(1);
  const [showTr, setShowTr] = useState(false);
  const [phase, setPhase] = useState<"read" | "quiz" | "done">("read");
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [outcome, setOutcome] = useState<ApplyOutcome | null>(null);
  const saved = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Options shuffled once per story; `order[q]` maps display index -> option index.
  const order = useMemo(() => {
    if (!found) return [];
    const rng = seeded(hash(found.story.id));
    return found.story.questions.map((qq) => shuffle(qq.options.map((_, i) => i), rng));
  }, [found]);

  const story = found?.story;
  const speakers = useMemo(() => [...new Set(story?.lines.map((l) => l.speaker) ?? [])], [story]);
  const { sound, haptics, autoplay } = progress.settings;

  // Autoplay each newly revealed line.
  useEffect(() => {
    if (!story || phase !== "read" || !autoplay) return;
    const i = shown - 1;
    const l = story.lines[i];
    if (l) void playEntry(asEntry(l, i));
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown, story, phase, autoplay]);

  useEffect(() => {
    if (phase !== "done" || !story || saved.current) return;
    saved.current = true;
    if (sound) playTone("complete");
    if (haptics) void haptic("complete");
    const applied = applySession(
      progress,
      {
        mode: "story",
        storyId: story.id,
        xp: STORY_XP,
        accuracy: correct / story.questions.length,
        outcomes: {},
        mistakes: story.questions.length - correct,
      },
      Date.now(),
    );
    update(() => applied.progress);
    setOutcome(applied);
  }, [phase, story, progress, update, correct, sound, haptics]);

  useEffect(() => stopAudio, []);

  if (!allowed) return <Loading />;
  if (!found || !story) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <Link href="/learn/" className="font-bold text-clay underline">
          {t("fail.home")}
        </Link>
      </main>
    );
  }

  const unlocked = found.unit.lessons.every((l) => progress.lessons[l.id]);
  const exit = () => {
    stopAudio();
    router.replace("/learn/");
  };

  const header = (value: number) => (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={exit}
        aria-label={t("common.close")}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand-2"
      >
        <IconClose />
      </button>
      <ProgressBar value={value} label={translate(story.title, lang)} />
    </div>
  );

  if (!unlocked) {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <IconBook size={48} className="text-dusk" />
        <p className="text-lg">{t("story.locked")}</p>
        <Button onClick={exit}>{t("fail.home")}</Button>
      </main>
    );
  }

  /* ── Done ── */
  if (phase === "done") {
    if (!outcome) return <Loading />;
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
        <Confetti />
        <div className="anim-pop flex flex-1 flex-col items-center gap-4 pt-12 text-center">
          <IconBook size={56} className="text-dusk" />
          <h1 className="font-display text-4xl font-extrabold text-night">{t("story.done")}</h1>
          <p className="text-muted">{t("story.score", { n: correct, total: story.questions.length })}</p>
          <p className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-display text-2xl font-extrabold text-night">
            <IconSpark className="text-dusk" /> +{STORY_XP} XP
          </p>
          {outcome.newAchievements.map((id) => {
            const def = ACHIEVEMENTS.find((a) => a.id === id)!;
            const Glyph = BADGE_GLYPHS[def.glyph];
            return (
              <div key={id} className="flex w-full items-center gap-3 rounded-2xl bg-sun-soft p-3 text-left">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-night text-sun">
                  <Glyph size={26} />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-widest text-clay uppercase">{t("result.badge")}</p>
                  <p className="font-display font-extrabold text-night">{t(`ach.${id}.name` as UiKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="py-6">
          <Button block onClick={exit} autoFocus>
            {t("common.continue")}
          </Button>
        </div>
      </main>
    );
  }

  /* ── Quiz ── */
  if (phase === "quiz") {
    const question = story.questions[q]!;
    const opts = order[q]!;
    const isRight = picked !== null && opts[picked] === question.answer;
    const check = () => {
      if (picked === null) return;
      setChecked(true);
      if (isRight) setCorrect((c) => c + 1);
      if (sound) playTone(isRight ? "correct" : "wrong");
      if (haptics) void haptic(isRight ? "correct" : "wrong");
    };
    const nextQ = () => {
      setChecked(false);
      setPicked(null);
      if (q + 1 >= story.questions.length) setPhase("done");
      else setQ(q + 1);
    };
    return (
      <main className="safe-top mx-auto flex min-h-dvh max-w-lg flex-col">
        {header(0.6 + (0.4 * q) / story.questions.length)}
        <section className="flex-1 px-5 pt-2 pb-40">
          <p className="mb-1 text-sm font-bold tracking-widest text-dusk uppercase">
            {t("story.question", { n: q + 1, total: story.questions.length })}
          </p>
          <h1 className="mb-5 font-display text-2xl font-extrabold text-night">{translate(question.prompt, lang)}</h1>
          <div role="radiogroup" className="flex flex-col gap-3">
            {opts.map((oi, di) => {
              const selected = picked === di;
              const right = checked && oi === question.answer;
              const wrong = checked && selected && oi !== question.answer;
              return (
                <button
                  key={oi}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={checked}
                  onClick={() => setPicked(di)}
                  className={`rounded-2xl border-2 bg-white p-4 text-left text-lg font-bold ${
                    right
                      ? "border-sea bg-sea-soft"
                      : wrong
                        ? "anim-shake border-berry bg-berry-soft"
                        : selected
                          ? "border-clay bg-sun-soft"
                          : "border-sand-3 shadow-[0_3px_0_var(--color-sand-3)]"
                  }`}
                >
                  {translate(question.options[oi]!, lang)}
                </button>
              );
            })}
          </div>
        </section>
        <footer
          className={`safe-bottom fixed inset-x-0 bottom-0 border-t-2 ${
            checked ? (isRight ? "border-sea/30 bg-sea-soft" : "border-berry/30 bg-berry-soft") : "border-sand-3 bg-sand"
          }`}
        >
          <div className="mx-auto max-w-lg px-5 py-4" role={checked ? "status" : undefined}>
            {checked ? (
              <>
                <p className={`mb-3 font-display text-2xl font-extrabold ${isRight ? "text-sea" : "text-berry"}`}>
                  {isRight ? t("ex.correct") : t("ex.incorrect")}
                </p>
                <Button block variant={isRight ? "correct" : "wrong"} onClick={nextQ} autoFocus>
                  {t("common.continue")}
                </Button>
              </>
            ) : (
              <Button block disabled={picked === null} onClick={check}>
                {t("ex.check")}
              </Button>
            )}
          </div>
        </footer>
      </main>
    );
  }

  /* ── Read ── */
  const allShown = shown >= story.lines.length;
  return (
    <main className="safe-top mx-auto flex min-h-dvh max-w-lg flex-col">
      {header((0.6 * shown) / story.lines.length)}
      <section className="flex-1 px-5 pt-2 pb-40" aria-live="polite">
        <p className="mb-1 flex items-center gap-2 text-sm font-bold tracking-widest text-dusk uppercase">
          <IconBook size={18} /> {t("story.label")}
        </p>
        <h1 className="mb-2 font-display text-3xl font-extrabold text-night">{translate(story.title, lang)}</h1>
        <label className="mb-4 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={showTr} onChange={(e) => setShowTr(e.target.checked)} className="h-4 w-4 accent-clay" />
          {t("story.translate")}
        </label>
        <ol className="space-y-3">
          {story.lines.slice(0, shown).map((l, i) => {
            const right = speakers.indexOf(l.speaker) % 2 === 1;
            return (
              <li key={i} className={`anim-pop flex items-end gap-2 ${right ? "flex-row-reverse" : ""}`}>
                <span
                  aria-hidden
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display font-extrabold text-white ${
                    right ? "bg-sea" : "bg-clay"
                  }`}
                >
                  {l.speaker.slice(0, 1)}
                </span>
                <button
                  type="button"
                  onClick={() => void playEntry(asEntry(l, i))}
                  className={`max-w-[80%] rounded-3xl border-2 border-sand-3 bg-white px-4 py-3 text-left shadow-[0_3px_0_var(--color-sand-3)] ${
                    right ? "rounded-br-md" : "rounded-bl-md"
                  }`}
                >
                  <span className="block text-xs font-bold text-muted">{l.speaker}</span>
                  <span lang="wo" className="flex items-start gap-2 font-display text-lg font-extrabold text-night">
                    {l.wo}
                    <IconSpeaker size={18} className="mt-1 shrink-0 text-clay" />
                  </span>
                  {showTr ? <span className="mt-1 block text-muted">{translate(l.tr, lang)}</span> : null}
                </button>
              </li>
            );
          })}
        </ol>
        <div ref={endRef} />
        <p className="mt-4 text-center text-xs text-muted">{t("story.tapToHear")}</p>
      </section>
      <footer className="safe-bottom fixed inset-x-0 bottom-0 border-t-2 border-sand-3 bg-sand">
        <div className="mx-auto max-w-lg px-5 py-4">
          <Button
            block
            autoFocus
            onClick={() => {
              if (haptics) void haptic("tap");
              if (allShown) {
                stopAudio();
                setPhase("quiz");
              } else setShown(shown + 1);
            }}
          >
            {allShown ? t("story.toQuestions") : t("common.continue")}
          </Button>
        </div>
      </footer>
    </main>
  );
}
