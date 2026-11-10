// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "@/components/Confetti";
import { DuelRace } from "@/components/DuelRace";
import { IconClose, IconSpeaker } from "@/components/icons";
import { Paused } from "@/components/Paused";
import { Button, Loading } from "@/components/ui";
import { translate } from "@/i18n";
import { playEntry, playTone } from "@/lib/audio";
import { buildDuel, crownsFor, duels, optionLabel, pointsFor, roundOf, DUEL_LENGTH, type DuelQuestion, type DuelResult } from "@/lib/duels";
import { friends } from "@/lib/friends";
import { haptic } from "@/lib/native";
import { useSwitchOff } from "@/lib/notices";
import { useStore } from "@/lib/store";

interface Setup {
  mode: "challenge" | "reply";
  /** The friend's account id (for a rematch). */
  friendId?: string;
  duelId?: string;
  name: string;
  /** Known once the duel is started (challenge) or loaded (reply). */
  seed?: number;
  entries?: string[];
}

type Phase = "intro" | "starting" | "countdown" | "play" | "done";
type Outcome = { kind: "sent"; trophies: number } | { kind: "result"; r: DuelResult };

/** Milliseconds since `from` (called from tap handlers, not during render). */
const msSince = (from: number) => performance.now() - from;
const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

function reducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Counts up to `to` once (instantly when motion is reduced). */
function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reducedMotion()) {
      void Promise.resolve().then(() => setN(to));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 900);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

export default function DuelPage() {
  const { lang, t } = useStore();
  const [setup, setSetup] = useState<Setup | null | "missing">(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [myName, setMyName] = useState("");
  const [startError, setStartError] = useState<string | null>(null);
  const [count, setCount] = useState(3);
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [points, setPoints] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [floatPts, setFloatPts] = useState<{ n: number; key: number } | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [sendState, setSendState] = useState<"idle" | "sending" | "failed">("idle");
  const shownAt = useRef(0);
  const duelsOff = useSwitchOff("duels");
  const friendsOff = useSwitchOff("friends");
  const paused = duelsOff || friendsOff;
  const score = points.reduce((a, b) => a + b, 0);

  // Read the link after mount (the page is pre-rendered): ?friend=…&name=… to challenge, ?id=… to reply.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const friend = q.get("friend");
    const id = q.get("id");
    friends
      .myCard()
      .then((c) => setMyName(c?.display_name ?? ""))
      .catch(() => undefined);
    if (friend) {
      void Promise.resolve().then(() => setSetup({ mode: "challenge", friendId: friend, name: q.get("name") ?? "" }));
    } else if (id) {
      duels
        .list()
        .then((rows) => {
          const d = rows.find((r) => r.id === id && r.status === "waiting" && !r.i_challenged);
          setSetup(d ? { mode: "reply", duelId: d.id, friendId: d.other_id, name: d.other_name, seed: d.seed, entries: d.entries } : "missing");
        })
        .catch(() => setSetup("missing"));
    } else void Promise.resolve().then(() => setSetup("missing"));
  }, []);

  const q = phase === "play" ? questions[index] : undefined;
  useEffect(() => {
    if (!q) return;
    shownAt.current = performance.now();
    if (q.kind === "listen") void playEntry(q.entry);
  }, [q]);

  // 3-2-1 countdown, then the first question.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count < 0) {
      void Promise.resolve().then(() => setPhase("play"));
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 650);
    return () => window.clearTimeout(id);
  }, [phase, count]);

  // Results: reveal the rounds one by one.
  useEffect(() => {
    if (outcome?.kind !== "result" || revealed >= 3) return;
    const id = window.setTimeout(() => setRevealed((n) => n + 1), reducedMotion() ? 0 : 700);
    return () => window.clearTimeout(id);
  }, [outcome, revealed]);

  if (paused) return <Paused back="/friends/" />;
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

  const begin = (s: Setup) => {
    try {
      setQuestions(buildDuel(s.seed!, s.entries!));
      setSetup(s);
      setIndex(0);
      setPoints([]);
      if (reducedMotion()) setPhase("play");
      else {
        setCount(3);
        setPhase("countdown");
      }
    } catch {
      setSetup("missing");
    }
  };

  const start = async () => {
    setStartError(null);
    if (setup.mode === "reply") return begin(setup);
    setPhase("starting");
    try {
      const r = await duels.start(setup.friendId!);
      begin({ ...setup, duelId: r.duel, seed: r.seed, entries: r.entries });
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      setStartError(/no new words/.test(msg) ? t("duel.noNewWords", { name: setup.name }) : /paused/.test(msg) ? t("community.paused") : t("duel.startFailed"));
      setPhase("intro");
    }
  };

  const submit = async (all: number[]) => {
    setSendState("sending");
    try {
      if (setup.mode === "challenge") {
        const trophies = await duels.finish(setup.duelId!, all);
        setOutcome({ kind: "sent", trophies });
      } else {
        const r = await duels.answer(setup.duelId!, all);
        if (r) setOutcome({ kind: "result", r });
      }
      setSendState("idle");
    } catch {
      setSendState("failed");
    }
  };

  const choose = (i: number) => {
    if (!q || picked !== null) return;
    const correct = i === q.answer;
    const got = pointsFor(correct, msSince(shownAt.current));
    const all = [...points, got];
    setPicked(i);
    setPoints(all);
    setStreak(correct ? streak + 1 : 0);
    if (correct) setFloatPts({ n: got, key: index });
    playTone(correct ? "correct" : "wrong");
    void haptic(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      setPicked(null);
      setFloatPts(null);
      if (index + 1 < questions.length) setIndex(index + 1);
      else {
        setPhase("done");
        void submit(all);
      }
    }, correct ? 650 : 1000);
  };

  // How far each pirogue has sailed: one step per question, a bit further for speed.
  const sailed = (pts: number[]) => pts.reduce((a, p) => a + (p > 0 ? 0.7 + (0.3 * (p - 100)) / 50 : 0.35), 0) / DUEL_LENGTH;

  // ── Intro: face-off ──
  if (phase === "intro" || phase === "starting") {
    return (
      <main className="splash safe-top safe-bottom flex min-h-dvh flex-col overflow-hidden bg-night p-6 text-center text-sand">
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <div className="flex items-center gap-4" aria-hidden>
            <span className="anim-from-left grid h-20 w-20 place-items-center rounded-full bg-clay font-display text-3xl font-extrabold text-white shadow-lg">
              {initial(myName || t("friends.you"))}
            </span>
            <span className="anim-stamp font-display text-3xl font-extrabold text-sun">{t("duel.vs")}</span>
            <span className="anim-from-right grid h-20 w-20 place-items-center rounded-full bg-dusk font-display text-3xl font-extrabold text-white shadow-lg">
              {initial(setup.name)}
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">{t("duel.title", { name: setup.name })}</h1>
          <p className="text-sand/85">{t(setup.mode === "challenge" ? "duel.introChallenge" : "duel.introReply", { n: DUEL_LENGTH, name: setup.name })}</p>
          {startError ? (
            <p role="alert" className="rounded-2xl bg-white/10 p-3 font-bold text-sun">
              {startError}
            </p>
          ) : null}
        </div>
        {phase === "starting" ? (
          <Loading />
        ) : (
          <Button block onClick={() => void start()}>
            {t("duel.start")}
          </Button>
        )}
        <Link href="/friends/" className="mt-4 font-bold text-sand/80 underline">
          {t("common.cancel")}
        </Link>
      </main>
    );
  }

  // ── Countdown ──
  if (phase === "countdown") {
    return (
      <main className="splash safe-top safe-bottom flex min-h-dvh items-center justify-center bg-night text-sun" aria-live="polite">
        <span key={count} className="anim-pop font-display text-8xl font-extrabold">
          {count > 0 ? count : t("duel.go")}
        </span>
      </main>
    );
  }

  // ── Finished ──
  if (phase === "done") {
    const r = outcome?.kind === "result" ? outcome.r : null;
    const rounds = r?.their_points ? crownsFor(r.my_points, r.their_points) : null;
    const allShown = revealed >= 3 || !rounds;
    // The leader reaches the finish line; the other boat ends where their answers took them.
    const lead = r?.their_points ? Math.max(sailed(r.my_points), sailed(r.their_points)) || 1 : 1;
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        {r && allShown && r.result === "won" ? <Confetti /> : null}
        {rounds ? (
          <div className="w-full">
            <DuelRace
              mine={sailed(r!.my_points.slice(0, [0, 3, 6, 10][revealed])) / lead}
              theirs={sailed(r!.their_points!.slice(0, [0, 3, 6, 10][revealed])) / lead}
              label={t("duel.crowns", { mine: rounds.mine, name: setup.name, theirs: rounds.theirs })}
            />
            <ol className="mt-3 grid grid-cols-3 gap-2">
              {rounds.rounds.map((round, i) => (
                <li
                  key={i}
                  className={`rounded-2xl border-2 p-2 text-sm ${i < revealed ? "anim-pop" : "opacity-40"} ${
                    i < revealed && round.winner === "me" ? "border-sun bg-sun-soft" : "border-sand-3 bg-white"
                  }`}
                >
                  <span className="block font-bold text-muted">{t("duel.round", { n: i + 1 })}</span>
                  <span className="block font-display text-lg font-extrabold text-night">
                    {i < revealed ? `${round.mine} – ${round.theirs}` : "…"}
                  </span>
                  <span aria-hidden className="text-xl">
                    {i < revealed ? (round.winner === "me" ? "👑" : round.winner === "them" ? "·" : "=") : ""}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="text-sm font-bold tracking-widest text-muted uppercase">{t("duel.yourScore")}</p>
        <p className="font-display text-6xl font-extrabold text-night">
          <CountUp to={score} />
        </p>
        {sendState === "sending" ? <Loading /> : null}
        {sendState === "failed" ? (
          <>
            <p role="alert" className="font-bold text-berry">
              {t("duel.sendFailed")}
            </p>
            <Button onClick={() => void submit(points)}>{t("duel.retry")}</Button>
          </>
        ) : null}
        {outcome?.kind === "sent" ? (
          <>
            <p className="anim-pop font-display text-2xl font-extrabold text-sea">🏆 {t("duel.trophies", { n: outcome.trophies })}</p>
            <p className="text-sm text-muted">{t("duel.trophiesHow")}</p>
            <p className="text-lg text-night">{t("duel.sent", { name: setup.name })}</p>
          </>
        ) : null}
        {r && allShown ? (
          <>
            <p className="anim-pop font-display text-3xl font-extrabold text-night">
              {r.result === "won" ? `🏆 ${t("duel.won")}` : r.result === "draw" ? `🤝 ${t("duel.draw")}` : t("duel.lost")}
            </p>
            {r.my_crowns != null && r.their_crowns != null ? (
              <p className="font-bold text-night">{t("duel.crowns", { mine: r.my_crowns, name: setup.name, theirs: r.their_crowns })}</p>
            ) : (
              <p className="text-muted">{t("duel.scores", { mine: r.my_score, name: setup.name, theirs: r.their_score })}</p>
            )}
            <p className="font-bold text-sea">🏆 {t("duel.trophies", { n: r.trophies_won })}</p>
            <p className="text-sm text-muted">{t("duel.trophiesHow")}</p>
            {setup.friendId ? (
              <a
                href={`/duel/?friend=${encodeURIComponent(setup.friendId)}&name=${encodeURIComponent(setup.name)}`}
                className="mt-2 rounded-2xl bg-clay px-6 py-3 font-display font-extrabold text-white"
              >
                {t("duel.rematch")}
              </a>
            ) : null}
          </>
        ) : null}
        {outcome ? (
          <Link href="/friends/" className="mt-2 font-bold text-clay underline">
            {t("duel.back")}
          </Link>
        ) : null}
      </main>
    );
  }

  // ── Question ──
  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      <div className="flex items-center gap-3 pt-3">
        <Link href="/friends/" aria-label={t("common.close")} className="grid h-10 w-10 place-items-center rounded-full">
          <IconClose />
        </Link>
        <span className="flex-1 text-sm font-bold text-muted">{t("duel.round", { n: roundOf(index) + 1 })}</span>
        {streak >= 3 ? (
          <span key={streak} className="anim-pop rounded-full bg-sun-soft px-3 py-1 text-sm font-extrabold text-night">
            🔥 {t("duel.streak", { n: streak })}
          </span>
        ) : null}
        <span className="relative font-display text-xl font-extrabold text-night">
          {score}
          {floatPts ? (
            <span key={floatPts.key} aria-hidden className="anim-float-up absolute -top-1 right-0 text-base text-sea">
              +{floatPts.n}
            </span>
          ) : null}
        </span>
      </div>
      <DuelRace mine={sailed(points)} theirs={null} label={t("duel.race", { n: index + 1, total: questions.length })} />

      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-2 text-center text-sm font-bold text-muted">{t(`duel.ask.${q!.kind}`)}</p>
        <div className="mb-4 flex min-h-28 items-center justify-center text-center">
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
            <p key={index} lang={q!.kind === "meaning" ? "wo" : undefined} className="anim-pop font-display text-4xl leading-tight font-extrabold text-night">
              {q!.kind === "meaning" ? q!.entry.wo : translate(q!.entry.tr, lang)}
            </p>
          )}
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-sand-3" role="presentation" title={t("duel.speed")}>
          {picked === null ? <div key={index} className="timer-drain h-full rounded-full bg-sun" /> : null}
        </div>
        <div className="grid gap-3">
          {q!.options.map((o, i) => {
            const state =
              picked === null
                ? ""
                : i === q!.answer
                  ? `border-sea bg-sea-soft ${i === picked ? "anim-pop" : ""}`
                  : i === picked
                    ? "border-berry bg-berry-soft anim-shake"
                    : "opacity-50";
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
