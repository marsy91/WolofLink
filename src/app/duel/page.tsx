// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconClose, IconSpeaker } from "@/components/icons";
import { Button, Loading } from "@/components/ui";
import { translate } from "@/i18n";
import { playEntry, playTone } from "@/lib/audio";
import { buildDuel, duels, optionLabel, pickDuelEntries, pointsFor, DUEL_LENGTH, type DuelQuestion } from "@/lib/duels";
import { haptic } from "@/lib/native";
import { useStore } from "@/lib/store";

interface Setup {
  mode: "challenge" | "reply";
  friendId?: string;
  duelId?: string;
  name: string;
  seed: number;
  entries: string[];
}

/** Milliseconds since `from` (called from tap handlers, not during render). */
const msSince = (from: number) => performance.now() - from;

type Outcome = { kind: "sent" } | { kind: "result"; result: "won" | "lost" | "draw"; mine: number; theirs: number; trophies: number };

export default function DuelPage() {
  const { progress, lang, t } = useStore();
  const [setup, setSetup] = useState<Setup | null | "missing">(null);
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [index, setIndex] = useState(-1);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [sendState, setSendState] = useState<"idle" | "sending" | "failed">("idle");
  const shownAt = useRef(0);

  // Read the link after mount (the page is pre-rendered): ?friend=…&name=… to challenge, ?id=… to reply.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const friend = q.get("friend");
    const id = q.get("id");
    if (friend) {
      const seed = Math.floor(Math.random() * 2_000_000_000);
      void Promise.resolve().then(() =>
        setSetup({ mode: "challenge", friendId: friend, name: q.get("name") ?? "", seed, entries: pickDuelEntries(progress, seed) }),
      );
    } else if (id) {
      duels
        .list()
        .then((rows) => {
          const d = rows.find((r) => r.id === id && r.status === "waiting" && !r.i_challenged);
          setSetup(d ? { mode: "reply", duelId: d.id, name: d.other_name, seed: d.seed, entries: d.entries } : "missing");
        })
        .catch(() => setSetup("missing"));
    } else void Promise.resolve().then(() => setSetup("missing"));
    // Only on first load: the duel must not change while it's being played.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = index >= 0 ? questions[index] : undefined;
  useEffect(() => {
    if (!q) return;
    shownAt.current = performance.now();
    if (q.kind === "listen") void playEntry(q.entry);
  }, [q]);

  if (setup === null) return <Loading />;
  if (setup === "missing") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg text-muted">{t("duel.missing")}</p>
        <Link href="/friends/" className="font-bold text-clay underline">
          {t("duel.back")}
        </Link>
      </main>
    );
  }

  const start = () => {
    try {
      setQuestions(buildDuel(setup.seed, setup.entries));
      setIndex(0);
    } catch {
      setSetup("missing");
    }
  };

  const submit = async (total: number) => {
    setSendState("sending");
    try {
      if (setup.mode === "challenge") {
        await duels.create(setup.friendId!, setup.seed, setup.entries, total);
        setOutcome({ kind: "sent" });
      } else {
        const r = await duels.play(setup.duelId!, total);
        if (r) setOutcome({ kind: "result", result: r.result, mine: r.my_score, theirs: r.their_score, trophies: r.trophies_won });
      }
      setSendState("idle");
    } catch {
      setSendState("failed");
    }
  };

  const choose = (i: number) => {
    if (!q || picked !== null) return;
    const correct = i === q.answer;
    const total = score + pointsFor(correct, msSince(shownAt.current));
    setPicked(i);
    setScore(total);
    playTone(correct ? "correct" : "wrong");
    void haptic(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      setPicked(null);
      if (index + 1 < questions.length) setIndex(index + 1);
      else {
        setIndex(questions.length);
        void submit(total);
      }
    }, correct ? 450 : 900);
  };

  // ── Intro ──
  if (index < 0) {
    return (
      <main className="splash safe-top safe-bottom flex min-h-dvh flex-col bg-night p-6 text-center text-sand">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <span aria-hidden className="text-6xl">
            ⚔️
          </span>
          <h1 className="font-display text-3xl font-extrabold">{t("duel.title", { name: setup.name })}</h1>
          <p className="text-sand/85">{t(setup.mode === "challenge" ? "duel.introChallenge" : "duel.introReply", { n: DUEL_LENGTH, name: setup.name })}</p>
        </div>
        <Button block onClick={start}>
          {t("duel.start")}
        </Button>
        <Link href="/friends/" className="mt-4 font-bold text-sand/80 underline">
          {t("common.cancel")}
        </Link>
      </main>
    );
  }

  // ── Finished ──
  if (index >= questions.length) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm font-bold tracking-widest text-muted uppercase">{t("duel.yourScore")}</p>
        <p className="font-display text-6xl font-extrabold text-night">{score}</p>
        {sendState === "sending" ? <Loading /> : null}
        {sendState === "failed" ? (
          <>
            <p role="alert" className="font-bold text-berry">
              {t("duel.sendFailed")}
            </p>
            <Button onClick={() => void submit(score)}>{t("duel.retry")}</Button>
          </>
        ) : null}
        {outcome?.kind === "sent" ? <p className="text-lg text-night">{t("duel.sent", { name: setup.name })}</p> : null}
        {outcome?.kind === "result" ? (
          <>
            <p className="font-display text-3xl font-extrabold text-night">
              {outcome.result === "won" ? `🏆 ${t("duel.won")}` : outcome.result === "draw" ? `🤝 ${t("duel.draw")}` : t("duel.lost")}
            </p>
            <p className="text-muted">{t("duel.scores", { mine: outcome.mine, name: setup.name, theirs: outcome.theirs })}</p>
            <p className="font-bold text-sea">{t("duel.trophies", { n: outcome.trophies })}</p>
          </>
        ) : null}
        {outcome ? (
          <Link href="/friends/" className="mt-4 font-bold text-clay underline">
            {t("duel.back")}
          </Link>
        ) : null}
      </main>
    );
  }

  // ── Question ──
  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      <div className="flex items-center gap-3 py-3">
        <Link href="/friends/" aria-label={t("common.close")} className="grid h-10 w-10 place-items-center rounded-full">
          <IconClose />
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-sand-3" aria-label={`${index + 1} / ${questions.length}`}>
          <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <span className="font-display font-extrabold text-night">{score}</span>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-2 text-center text-sm font-bold text-muted">{t(`duel.ask.${q!.kind}`)}</p>
        <div className="mb-8 flex min-h-28 items-center justify-center text-center">
          {q!.kind === "listen" ? (
            <button
              type="button"
              onClick={() => void playEntry(q!.entry)}
              aria-label={t("ex.play")}
              className="grid h-24 w-24 place-items-center rounded-full bg-night text-sun shadow-lg"
            >
              <IconSpeaker size={40} />
            </button>
          ) : (
            <p lang={q!.kind === "meaning" ? "wo" : undefined} className="font-display text-4xl leading-tight font-extrabold text-night">
              {q!.kind === "meaning" ? q!.entry.wo : translate(q!.entry.tr, lang)}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          {q!.options.map((o, i) => {
            const state = picked === null ? "" : i === q!.answer ? "border-sea bg-sea-soft" : i === picked ? "border-berry bg-berry-soft" : "opacity-50";
            return (
              <button
                key={o.id}
                type="button"
                disabled={picked !== null}
                onClick={() => choose(i)}
                lang={q!.kind === "meaning" ? undefined : "wo"}
                className={`min-h-14 rounded-2xl border-2 border-sand-3 bg-white px-4 py-3 text-left text-lg font-bold text-night ${state}`}
              >
                {optionLabel(q!, o, lang)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-10" />
    </main>
  );
}
