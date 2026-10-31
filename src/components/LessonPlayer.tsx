// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { course, findLesson } from "@/content/course";
import { translate, type UiKey } from "@/i18n";
import { playTone, stopAudio } from "@/lib/audio";
import {
  buildLesson,
  correctAnswerText,
  gradeTyped,
  isCorrect,
  MAX_LEVEL,
  seeded,
  type Answer,
  type Exercise,
  type TypedGrade,
} from "@/lib/engine";
import { haptic } from "@/lib/native";
import { canOpenLesson } from "@/lib/premium";
import { usePremium } from "@/lib/premium-context";
import {
  ACHIEVEMENTS,
  applySession,
  currentStreak,
  dueEntries,
  minutesToNextDrop,
  nextLevel,
  refreshDrops,
  spendDrop,
  type ApplyOutcome,
} from "@/lib/progress";
import { buildReview } from "@/lib/review";
import {
  accuracy,
  answer as answerSession,
  current,
  next as nextSession,
  progressValue,
  startSession,
  xpFor,
  type SessionState,
} from "@/lib/session";
import { useNow, useStore } from "@/lib/store";
import { ExerciseView } from "./exercises";
import { Confetti } from "./Confetti";
import { BADGE_GLYPHS, IconClose, IconDrop, IconGem, IconInfo, IconRings, IconShield, IconSpark, IconSun } from "./icons";
import { Button, Dialog, Loading, ProgressBar, useRequireProfile } from "./ui";

type Props = { mode: "lesson"; lessonId: string } | { mode: "review" };

export function LessonPlayer(props: Props) {
  const allowed = useRequireProfile();
  const { progress, lang, update, t } = useStore();
  const router = useRouter();
  const now = useNow();

  const found = props.mode === "lesson" ? findLesson(props.lessonId) : null;
  const { premium } = usePremium();
  const [session, setSession] = useState<SessionState | null>(null);
  const [pending, setPending] = useState<Answer | null>(null);
  const [outcome, setOutcome] = useState<ApplyOutcome | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [typed, setTyped] = useState<TypedGrade | null>(null);
  const saved = useRef(false);

  const exit = useCallback(() => {
    stopAudio();
    router.replace(props.mode === "review" ? "/practice/" : "/learn/");
  }, [router, props.mode]);

  const level = props.mode === "lesson" ? nextLevel(progress, props.lessonId, MAX_LEVEL) : 1;

  const begin = () => {
    // `now` (refreshed by useNow) keeps render pure; second precision is plenty here.
    const rng = seeded(now);
    let exercises: Exercise[];
    if (props.mode === "lesson") {
      if (!found) return;
      exercises = buildLesson(found.lesson, { course, lang, rng }, level);
    } else {
      const due = dueEntries(progress, now, 10);
      exercises = buildReview(due.length ? due : progress.recentMistakes.slice(0, 10), lang, rng);
    }
    if (exercises.length === 0) return exit();
    // Premium learners never run out of drops.
    const drops = premium ? Number.POSITIVE_INFINITY : refreshDrops(progress, now).drops.count;
    setSession(startSession(exercises, drops, props.mode, level));
  };

  const ex = session ? current(session) : undefined;
  const sound = progress.settings.sound;
  const vibrate = progress.settings.haptics;

  const submit = (a: Answer) => {
    if (!session || !ex || session.feedback) return;
    const ok = isCorrect(ex, a);
    setTyped(ex.kind === "type" && a.kind === "type" ? gradeTyped(ex.entry.wo, a.text) : null);
    if (sound) playTone(ok ? "correct" : "wrong");
    if (vibrate) void haptic(ok ? "correct" : "wrong");
    if (!ok && session.mode === "lesson" && !premium) update((p) => spendDrop(p, Date.now()));
    setSession(answerSession(session, ok));
  };

  const advance = () => {
    if (!session) return;
    stopAudio();
    setPending(null);
    setTyped(null);
    setSession(nextSession(session));
  };

  // Persist results exactly once when the session completes.
  useEffect(() => {
    if (!session || session.status !== "complete" || saved.current) return;
    saved.current = true;
    if (sound) playTone("complete");
    if (vibrate) void haptic("complete");
    const result = {
      mode: session.mode,
      level: session.level,
      ...(props.mode === "lesson" ? { lessonId: props.lessonId } : {}),
      xp: xpFor(session),
      accuracy: accuracy(session),
      outcomes: session.outcomes,
      mistakes: session.mistakes.length,
    };
    const applied = applySession(progress, result, Date.now());
    update(() => applied.progress);
    setOutcome(applied);
  }, [session, sound, vibrate, update, props, progress]);

  // Enter = check / continue (Escape closes the quit dialog natively).
  // Re-subscribed each render so the handler always sees the latest state.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!session || session.status !== "playing") return;
      if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
        if (session.feedback) advance();
        else if (pending) submit(pending);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => stopAudio, []);

  if (!allowed) return <Loading />;

  if (props.mode === "lesson" && !found) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="mb-4 text-lg">{t("lesson.notFound")}</p>
          <Link href="/learn/" className="font-bold text-clay underline">
            {t("fail.home")}
          </Link>
        </div>
      </main>
    );
  }

  // Premium lessons opened directly (e.g. an old link) go to the upgrade screen.
  if (props.mode === "lesson" && !canOpenLesson(props.lessonId, premium)) {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <IconGem size={48} className="text-dusk" />
        <p className="text-lg">{t("premium.lessonLocked")}</p>
        <Button onClick={() => router.replace("/premium/")}>{t("premium.see")}</Button>
        <Button variant="ghost" onClick={exit}>
          {t("fail.home")}
        </Button>
      </main>
    );
  }

  /* ── Intro ── */
  if (!session) {
    const title = found ? translate(found.lesson.title, lang) : t("practice.title");
    const tip = found?.lesson.tip ? translate(found.lesson.tip, lang) : t("practice.body");
    const outOfDrops = props.mode === "lesson" && !premium && refreshDrops(progress, now).drops.count <= 0;
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
        <div className="py-3">
          <button
            type="button"
            onClick={exit}
            aria-label={t("common.close")}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand-2"
          >
            <IconClose />
          </button>
        </div>
        <div className="anim-pop flex flex-1 flex-col justify-center">
          <p className="mb-1 text-sm font-bold tracking-widest text-clay uppercase">{t("lesson.tipTitle")}</p>
          <h1 className="mb-2 font-display text-4xl font-extrabold text-night">{title}</h1>
          {props.mode === "lesson" ? (
            <p className="mb-4 flex items-center gap-2 font-bold text-dusk">
              <IconRings size={22} />
              {t("path.level", { n: level, total: MAX_LEVEL })}
              {level > 1 ? <span className="font-normal text-muted">· {t("lesson.levelHint")}</span> : null}
            </p>
          ) : null}
          <div className="flex gap-3 rounded-3xl bg-white p-5 shadow-[0_3px_0_var(--color-sand-3)]">
            <IconInfo className="mt-0.5 shrink-0 text-sea" />
            <p className="text-lg leading-relaxed">{tip}</p>
          </div>
          {outOfDrops ? <DropsNotice /> : null}
        </div>
        <div className="py-6">
          {outOfDrops ? (
            <Button block onClick={() => router.replace("/review/")}>
              {t("fail.practice")}
            </Button>
          ) : (
            <Button block onClick={begin} autoFocus>
              {t("lesson.begin")}
            </Button>
          )}
        </div>
      </main>
    );
  }

  /* ── Failed ── */
  if (session.status === "failed") {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-sea-soft text-sea">
          <IconDrop size={52} />
        </span>
        <h1 className="font-display text-3xl font-extrabold text-night">{t("fail.title")}</h1>
        <p className="text-lg text-muted">{t("fail.body")}</p>
        <div className="flex w-full flex-col gap-3">
          <Button block onClick={() => router.replace("/review/")}>
            {t("fail.practice")}
          </Button>
          <Button block variant="secondary" onClick={exit}>
            {t("fail.home")}
          </Button>
        </div>
      </main>
    );
  }

  /* ── Complete ── */
  if (session.status === "complete") {
    if (!outcome) return <Loading />;
    const pct = Math.round(accuracy(session) * 100);
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
        <Confetti />
        <div className="anim-pop flex flex-1 flex-col items-center pt-10 text-center">
          <h1 className="mb-1 font-display text-4xl font-extrabold text-night">
            {session.mode === "review" ? t("lesson.reviewComplete") : t("lesson.complete")}
          </h1>
          {session.mode === "lesson" ? (
            <p className="mb-5 flex items-center gap-1.5 font-bold text-dusk">
              <IconRings size={20} />
              {t("result.levelDone", { n: session.level })}
            </p>
          ) : (
            <div className="mb-5" />
          )}
          <div className="mb-6 grid w-full grid-cols-3 gap-3">
            <Stat icon={<IconSpark className="text-dusk" />} label={t("result.xp")} value={`+${xpFor(session)}`} />
            <Stat icon={<span className="font-display font-extrabold text-sea">%</span>} label={t("result.accuracy")} value={`${pct}%`} />
            <Stat
              icon={<IconSun className="text-clay" />}
              label={t("result.streak")}
              value={String(currentStreak(outcome.progress, now))}
            />
          </div>

          {outcome.streakExtended ? (
            <Banner icon={<IconSun size={26} />}>
              {t("result.streakUp", { n: currentStreak(outcome.progress, now) })}
            </Banner>
          ) : null}
          {outcome.shieldUsed ? <Banner icon={<IconShield size={26} />}>{t("shield.used")}</Banner> : null}
          {outcome.shieldEarned ? <Banner icon={<IconShield size={26} />}>{t("shield.earned")}</Banner> : null}

          {outcome.newAchievements.map((id) => {
            const def = ACHIEVEMENTS.find((a) => a.id === id)!;
            const Glyph = BADGE_GLYPHS[def.glyph];
            return (
              <div key={id} className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-sun-soft p-3 text-left">
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

          <section className="w-full text-left" aria-labelledby="mistakes-h">
            <h2 id="mistakes-h" className="mb-2 font-display text-lg font-extrabold text-night">
              {session.mistakes.length ? t("result.mistakes") : t("result.flawless")}
            </h2>
            <ul className="space-y-2">
              {session.mistakes.flatMap((m) =>
                m.entryIds.map((id) => {
                  const entry = course.entries[id]!;
                  return (
                    <li key={`${m.key}-${id}`} className="rounded-2xl border-2 border-sand-3 bg-white p-3">
                      <span lang="wo" className="block font-display font-extrabold text-night">
                        {entry.wo}
                      </span>
                      <span className="text-muted">{translate(entry.tr, lang)}</span>
                    </li>
                  );
                }),
              )}
            </ul>
          </section>
        </div>
        <div className="py-6">
          <Button block onClick={exit} autoFocus>
            {t("common.continue")}
          </Button>
        </div>
      </main>
    );
  }

  /* ── Playing ── */
  if (!ex) return <Loading />;
  const feedback = session.feedback;
  const isSpeak = ex.kind === "speak";
  const isMatch = ex.kind === "match";

  return (
    <main className="safe-top mx-auto flex min-h-dvh max-w-lg flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setQuitOpen(true)}
          aria-label={t("common.close")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand-2"
        >
          <IconClose />
        </button>
        <ProgressBar
          value={progressValue(session)}
          label={t("lesson.progress", { n: session.index + 1, total: session.queue.length })}
        />
        {session.mode === "lesson" ? (
          <span className="flex items-center gap-1 font-display font-extrabold text-sea" aria-label={t("stats.drops", { n: session.drops })}>
            <IconDrop size={22} filled />
            {Number.isFinite(session.drops) ? session.drops : "∞"}
          </span>
        ) : null}
      </div>

      <section className="flex flex-1 flex-col px-5 pt-2 pb-40" aria-live="polite">
        <div className="mb-4 flex items-center gap-2">
          {ex.isNew ? (
            <span className="rounded-full bg-dusk px-2.5 py-0.5 text-xs font-bold text-white uppercase">{t("ex.new")}</span>
          ) : null}
          {ex.isRetry ? (
            <span className="rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-clay-2 uppercase">{t("ex.again")}</span>
          ) : null}
        </div>
        <h1 className="mb-5 font-display text-2xl font-extrabold text-night">{t(`ex.${ex.type}`)}</h1>
        <ExerciseView key={ex.key} ex={ex} locked={!!feedback} onChange={setPending} onSubmit={submit} />
      </section>

      {/* Footer: Check button, or feedback sheet after answering. */}
      <footer
        className={`safe-bottom fixed inset-x-0 bottom-0 z-10 border-t-2 ${
          feedback ? (feedback.correct ? "anim-slide-up border-sea/30 bg-sea-soft" : "anim-slide-up border-berry/30 bg-berry-soft") : "border-sand-3 bg-sand"
        }`}
      >
        <div className="mx-auto max-w-lg px-5 py-4">
          {feedback ? (
            <div role="status">
              <p className={`font-display text-2xl font-extrabold ${feedback.correct ? "text-sea" : "text-berry"}`}>
                {feedback.correct ? t("ex.correct") : t("ex.incorrect")}
              </p>
              {feedback.correct && typed && typed !== "exact" ? (
                <p className="mt-1 text-ink">
                  <span className="font-bold">{t(typed === "accents" ? "ex.accents" : "ex.typo")}</span>{" "}
                  <span lang="wo" className="font-display font-extrabold">
                    {ex.kind === "type" ? ex.entry.wo : ""}
                  </span>
                </p>
              ) : null}
              {!feedback.correct && !isMatch ? (
                <p className="mt-1 text-ink">
                  <span className="font-bold">{t("ex.answer")}</span>{" "}
                  <span lang={ex.kind === "choice" && (ex.type === "pick_meaning" || ex.type === "pick_picture") ? undefined : "wo"} className="font-display font-extrabold">
                    {correctAnswerText(ex)}
                  </span>
                </p>
              ) : null}
              {"entry" in ex && ex.entry.note ? <p className="mt-1 text-sm text-muted">{translate(ex.entry.note, lang)}</p> : null}
              <Button block className="mt-3" variant={feedback.correct ? "correct" : "wrong"} onClick={advance} autoFocus>
                {t("common.continue")}
              </Button>
            </div>
          ) : isSpeak || isMatch ? null : (
            <Button block disabled={!pending} onClick={() => pending && submit(pending)}>
              {t("ex.check")}
            </Button>
          )}
        </div>
      </footer>

      <Dialog open={quitOpen} onClose={() => setQuitOpen(false)} title={t("lesson.quitTitle")}>
        <p className="mb-5 text-muted">{t("lesson.quitBody")}</p>
        <div className="flex flex-col gap-3">
          <Button block onClick={() => setQuitOpen(false)}>
            {t("lesson.stay")}
          </Button>
          <Button block variant="secondary" onClick={exit}>
            {t("lesson.quitConfirm")}
          </Button>
        </div>
      </Dialog>
    </main>
  );
}

function Banner({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-night p-3 text-left text-sand">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-sun">{icon}</span>
      <p className="font-display font-extrabold">{children}</p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-sand-3 bg-white p-3">
      {icon}
      <span className="font-display text-2xl font-extrabold text-night">{value}</span>
      <span className="text-xs font-bold text-muted">{label}</span>
    </div>
  );
}

export function DropsNotice() {
  const { progress, t } = useStore();
  const now = useNow();
  const mins = minutesToNextDrop(refreshDrops(progress, now), now);
  return (
    <div className="mt-4 rounded-2xl bg-sea-soft p-4 text-sea">
      <p className="font-display font-extrabold">{t("fail.title")}</p>
      <p className="text-sm">{mins ? t("drops.next", { n: mins }) : t("drops.full")}</p>
    </div>
  );
}
