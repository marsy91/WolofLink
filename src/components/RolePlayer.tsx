// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { findStory, storyLineId as lineId } from "@/content/course";
import { translate } from "@/i18n";
import { playEntry, playTone, stopAudio, waitForClip } from "@/lib/audio";
import { seeded } from "@/lib/engine";
import { haptic } from "@/lib/native";
import { applySession } from "@/lib/progress";
import { buildRoleplay, playableSpeakers } from "@/lib/roleplay";
import { useNow, useStore } from "@/lib/store";
import { Character } from "./Character";
import { Confetti } from "./Confetti";
import { IconClose } from "./icons";
import { Button, Loading, ProgressBar, useRequireProfile } from "./ui";

export const ROLEPLAY_XP = 15;

/** Take a part in a dialogue: the partner speaks, you choose your reply. */
export function RolePlayer({ storyId }: { storyId: string }) {
  const allowed = useRequireProfile();
  const { progress, lang, update, t } = useStore();
  const router = useRouter();
  const now = useNow();
  const found = findStory(storyId);
  const story = found?.story;
  const [role, setRole] = useState<string | null>(null);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);
  const saved = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { sound, haptics } = progress.settings;

  const turns = useMemo(() => (story && role ? buildRoleplay(story, role, seeded(now)) : []), [story, role]); // eslint-disable-line react-hooks/exhaustive-deps
  const turn = turns[at];
  const mineCount = turns.filter((x) => x.mine).length;

  // The partner's lines play by themselves, then the dialogue moves on.
  useEffect(() => {
    if (!story || !turn || turn.mine || done) return;
    let alive = true;
    const l = story.lines[turn.index]!;
    void (async () => {
      await playEntry({ id: lineId(story.id, turn.index), wo: l.wo, tr: l.tr });
      await waitForClip();
      if (alive) setAt((n) => n + 1);
    })();
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    return () => {
      alive = false;
    };
  }, [story, turn, done]);

  useEffect(() => {
    if (story && role && at >= turns.length && turns.length) void Promise.resolve().then(() => setDone(true));
  }, [at, turns.length, story, role]);

  useEffect(() => {
    if (!done || !story || saved.current) return;
    saved.current = true;
    if (sound) playTone("complete");
    if (haptics) void haptic("complete");
    const applied = applySession(
      progress,
      { mode: "story", storyId: `${story.id}:roleplay`, xp: ROLEPLAY_XP, accuracy: mineCount ? right / mineCount : 1, outcomes: {}, mistakes: mineCount - right },
      Date.now(),
    );
    update(() => applied.progress);
  }, [done, story, progress, update, right, mineCount, sound, haptics]);

  useEffect(() => stopAudio, []);

  if (!allowed) return <Loading />;
  if (!found || !story) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <Link href="/practice/" className="font-bold text-clay underline">
          {t("fail.home")}
        </Link>
      </main>
    );
  }
  const exit = () => {
    stopAudio();
    router.replace("/practice/");
  };

  if (!role) {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-6">
        <p className="text-sm font-bold tracking-widest text-clay uppercase">{t("roleplay.title")}</p>
        <h1 className="font-display text-3xl font-extrabold text-night">{translate(story.title, lang)}</h1>
        <p className="text-muted">{t("roleplay.choose")}</p>
        <div className="grid grid-cols-2 gap-3">
          {playableSpeakers(story).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRole(s)}
              className="flex flex-col items-center gap-2 rounded-3xl border border-sand-3 bg-white p-4 shadow-card transition active:translate-y-[2px]"
            >
              <Character name={s} size={88} />
              <span className="font-display font-extrabold text-night">{t("roleplay.as", { name: s })}</span>
            </button>
          ))}
        </div>
        <Button block variant="ghost" onClick={exit}>
          {t("common.cancel")}
        </Button>
      </main>
    );
  }

  if (done) {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <Confetti />
        <div className="flex items-end gap-2">
          {[...new Set(story.lines.map((l) => l.speaker))].slice(0, 2).map((s) => (
            <Character key={s} name={s} mood="happy" size={96} />
          ))}
        </div>
        <h1 className="font-display text-4xl font-extrabold text-night">{t("roleplay.done")}</h1>
        <p className="text-lg text-muted">{t("roleplay.score", { n: right, total: mineCount })}</p>
        <p className="font-bold text-dusk">+{ROLEPLAY_XP} XP</p>
        <Button block onClick={() => router.replace(`/roleplay/${story.id}/`)}>
          {t("roleplay.again")}
        </Button>
        <Button block variant="secondary" onClick={exit}>
          {t("fail.home")}
        </Button>
      </main>
    );
  }

  const choose = (i: number) => {
    if (!turn || picked !== null) return;
    setPicked(i);
    const ok = turn.options[i]!.correct;
    if (ok) setRight((n) => n + 1);
    if (sound) playTone(ok ? "correct" : "wrong");
    if (haptics) void haptic(ok ? "correct" : "wrong");
    const l = story.lines[turn.index]!;
    void playEntry({ id: lineId(story.id, turn.index), wo: l.wo, tr: l.tr });
  };
  const next = () => {
    stopAudio();
    setPicked(null);
    setAt((n) => n + 1);
  };

  // The two people on stage: the partner talks during their line; both react to your answer.
  const partner = story.lines.find((l) => l.speaker !== role)?.speaker ?? "";
  const pickedOk = picked !== null && turn?.mine ? turn.options[picked]!.correct : null;
  const partnerMood = turn && !turn.mine ? "talking" : pickedOk ? "happy" : "idle";
  const myMood = pickedOk === true ? "happy" : pickedOk === false ? "sad" : "idle";

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={exit} aria-label={t("common.close")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand-2">
          <IconClose />
        </button>
        <ProgressBar value={at / turns.length} label={translate(story.title, lang)} />
      </div>
      <div className="mx-4 mb-3 flex items-end justify-around rounded-3xl bg-gradient-to-b from-sea-soft to-white px-6 pt-5 pb-2 shadow-card" aria-hidden>
        <div className="flex flex-col items-center">
          <Character name={partner} mood={partnerMood} size={124} />
          <span className="text-xs font-bold text-muted">{partner}</span>
        </div>
        <div className="flex flex-col items-center">
          <Character name={role} mood={myMood} size={124} />
          <span className="text-xs font-bold text-muted">{role}</span>
        </div>
      </div>
      <ol className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {story.lines.slice(0, at).map((l, i) => (
          <li key={i} className={`flex ${l.speaker === role ? "justify-end" : ""}`}>
            <div className={`max-w-[85%] rounded-3xl px-4 py-3 ${l.speaker === role ? "bg-night text-sand" : "bg-white text-night"}`}>
              <p className="text-xs font-bold opacity-70">{l.speaker}</p>
              <p lang="wo" className="font-bold">{l.wo}</p>
              <p className="text-sm opacity-80">{translate(l.tr, lang)}</p>
            </div>
          </li>
        ))}
        {turn && !turn.mine ? (
          <li className="flex">
            <div className="rounded-3xl bg-white px-4 py-3 text-night">
              <p className="text-xs font-bold opacity-70">{story.lines[turn.index]!.speaker}</p>
              <p lang="wo" className="font-bold">{story.lines[turn.index]!.wo}</p>
            </div>
          </li>
        ) : null}
        <div ref={endRef} />
      </ol>
      {turn && turn.mine ? (
        <section className="border-t border-sand-3 bg-white px-4 pt-4 pb-6">
          <p className="mb-1 text-sm font-bold text-clay">{t("roleplay.yourTurn", { name: role })}</p>
          <p className="mb-3 text-sm text-muted">{translate(story.lines[turn.index]!.tr, lang)}</p>
          <div className="space-y-2">
            {turn.options.map((o, i) => {
              const state = picked === null ? "" : o.correct ? "border-sea bg-sea-soft" : picked === i ? "border-berry bg-berry-soft" : "opacity-60";
              return (
                <button
                  key={i}
                  type="button"
                  lang="wo"
                  disabled={picked !== null}
                  onClick={() => choose(i)}
                  className={`w-full rounded-2xl border border-sand-3 px-4 py-3 text-left font-bold text-night ${state}`}
                >
                  {o.wo}
                </button>
              );
            })}
          </div>
          {picked !== null ? (
            <Button block className="mt-4" onClick={next}>
              {t("common.continue")}
            </Button>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
