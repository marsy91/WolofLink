// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "@/components/Confetti";
import { DuelRace, DuelScene } from "@/components/DuelRace";
import { IconClose, IconSpeaker } from "@/components/icons";
import { Paused } from "@/components/Paused";
import { Loading } from "@/components/ui";
import { translate } from "@/i18n";
import { playEntry, playTone } from "@/lib/audio";
import { buildDuel, crownsFor, duelProblem, duels, optionLabel, pickDuelEntries, pointsFor, roundOf, DUEL_LENGTH, type DuelQuestion, type DuelResult } from "@/lib/duels";
import { friends } from "@/lib/friends";
import { haptic } from "@/lib/native";
import { botPoints, isBotLevel, BOT_LEVELS, type BotLevel } from "@/lib/duel-bot";
import { useConsoleRole } from "@/lib/owner";
import { goTo, useRestartKey } from "@/lib/nav";
import { useNoticesState, useSwitchOff } from "@/lib/notices";
import { isLowEnd, playSfx, type Sfx } from "@/lib/sfx";
import { useStore } from "@/lib/store";

interface Setup {
  mode: "challenge" | "reply" | "bot";
  /** Duel the computer: its level and its points for each question. */
  level?: BotLevel;
  botPts?: number[];
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

/** A number that rolls from its last value to the new one (instantly when motion is reduced). */
function Rolling({ value }: { value: number }) {
  const [n, setN] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (reducedMotion() || start === value) {
      void Promise.resolve().then(() => setN(value));
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 700);
      setN(Math.round(start + (value - start) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

/** Remounts the duel when a rematch is asked for (same screen, new address). */
export default function DuelPage() {
  const run = useRestartKey();
  return <Duel key={run} />;
}

function Duel() {
  const router = useRouter();
  const { lang, t, progress, update } = useStore();
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
  const [flash, setFlash] = useState<{ kind: "red" | "gold"; key: number } | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [sendState, setSendState] = useState<"idle" | "sending" | "failed" | "over">("idle");
  const [lowEnd, setLowEnd] = useState(false);
  const [sendError, setSendError] = useState("");
  const shownAt = useRef(0);
  const duelsOff = useSwitchOff("duels");
  const friendsOff = useSwitchOff("friends");
  const notices = useNoticesState();
  const role = useConsoleRole();
  const paused = duelsOff || friendsOff;
  const sound = progress.settings.sound;
  const score = points.reduce((a, b) => a + b, 0);
  const sfx = (k: Sfx) => {
    if (sound) playSfx(k);
  };
  // Camera shake: restart the CSS animation on the screen without re-mounting it.
  const stage = useRef<HTMLElement | null>(null);
  const shake = () => {
    const el = stage.current;
    if (!el || reducedMotion()) return;
    el.classList.remove("anim-cam-shake");
    void el.offsetWidth;
    el.classList.add("anim-cam-shake");
  };

  // Read the link after mount (the page is pre-rendered): ?friend=…&name=… to challenge, ?id=… to reply.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const friend = q.get("friend");
    const id = q.get("id");
    void Promise.resolve().then(() => setLowEnd(isLowEnd()));
    friends
      .myCard()
      .then((c) => setMyName(c?.display_name ?? ""))
      .catch(() => undefined);
    const bot = q.get("bot");
    if (isBotLevel(bot)) {
      void Promise.resolve().then(() => setSetup({ mode: "bot", level: bot, name: t("bot.name") }));
    } else if (friend) {
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
    // Only on first load: the duel must not change while it's being played.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The VS slams in: a clang and a camera shake.
  useEffect(() => {
    if (phase !== "intro" || setup === null || setup === "missing") return;
    const id = window.setTimeout(() => {
      if (progress.settings.sound) playSfx("clang");
      shake();
    }, 480);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, setup === null]);

  const q = phase === "play" ? questions[index] : undefined;
  useEffect(() => {
    if (!q) return;
    shownAt.current = performance.now();
    if (q.kind === "listen") void playEntry(q.entry);
  }, [q]);

  // 3-2-1 countdown with a tick and a shake on each number, then "Go!".
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count >= 0 && progress.settings.sound) playSfx(count > 0 ? "tick" : "go");
    if (count < 0) {
      void Promise.resolve().then(() => setPhase("play"));
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 700);
    return () => window.clearTimeout(id);
  }, [phase, count, progress.settings.sound]);

  // Results: reveal the rounds one by one, a chime for each crown won.
  useEffect(() => {
    if (outcome?.kind !== "result" || revealed >= 3) return;
    const id = window.setTimeout(
      () => {
        const r = outcome.r;
        const won = r.their_points ? crownsFor(r.my_points, r.their_points).rounds[revealed]?.winner === "me" : false;
        if (progress.settings.sound) playSfx(won ? "crown" : "whoosh");
        if (revealed === 2 && r.result === "won" && progress.settings.sound) window.setTimeout(() => playSfx("cheer"), 500);
        setRevealed((n) => n + 1);
      },
      reducedMotion() ? 0 : 800,
    );
    return () => window.clearTimeout(id);
  }, [outcome, revealed, progress.settings.sound]);

  const isBot = setup !== null && setup !== "missing" && setup.mode === "bot";
  // Duel the computer: learners once the owner switches it on; the owner can always try it.
  const botAllowed = !!notices?.on.includes("bot_duels") || role === "owner";
  if (paused && !isBot) return <Paused back="/friends/" />;
  if (setup === null || (isBot && !botAllowed && (notices === undefined || role === undefined))) return <Loading />;
  if (isBot && !botAllowed) return <Paused back="/practice/" />;
  if (setup === "missing") {
    return (
      <DuelScene lowEnd>
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg text-night/85">{t("duel.missing")}</p>
          <Link href="/friends/" className="font-bold text-clay underline">
            {t("duel.back")}
          </Link>
        </main>
      </DuelScene>
    );
  }

  const soundToggle = (
    <button
      type="button"
      aria-label={t("settings.sound")}
      aria-pressed={sound}
      onClick={() => update((p) => ({ ...p, settings: { ...p.settings, sound: !p.settings.sound } }))}
      className={`grid h-10 w-10 place-items-center rounded-full bg-white/80 ${sound ? "text-night" : "text-night/40"}`}
    >
      <IconSpeaker size={20} />
    </button>
  );

  const problemText = (p: ReturnType<typeof duelProblem>) =>
    p === "noNewWords"
      ? t("duel.noNewWords", { name: (setup as Setup).name })
      : p === "paused"
        ? t("community.paused")
        : p === "tooMany"
          ? t("duel.tooMany")
          : p === "offline"
            ? t("friends.offline")
            : p === "over"
              ? t("duel.over")
              : p === "updating"
                ? t("duel.updating")
                : t("duel.startFailed");

  const begin = (s: Setup) => {
    try {
      setQuestions(buildDuel(s.seed!, s.entries!));
      setSetup(s);
      setIndex(0);
      setPoints([]);
      setStreak(0);
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
    if (setup.mode === "bot") {
      const seed = Math.floor(Math.random() * 2_000_000_000);
      const level = setup.level ?? "medium";
      return begin({ ...setup, level, seed, entries: pickDuelEntries(progress, seed), botPts: botPoints(seed, level) });
    }
    setPhase("starting");
    try {
      const r = await duels.start(setup.friendId!);
      begin({ ...setup, duelId: r.duel, seed: r.seed, entries: r.entries });
    } catch (e) {
      setStartError(problemText(duelProblem(e)));
      setPhase("intro");
    }
  };

  const submit = async (all: number[]) => {
    if (setup.mode === "bot") {
      // Played on the phone: work out the crowns here, nothing is sent.
      const theirs = setup.botPts ?? [];
      const c = crownsFor(all, theirs);
      const mine = all.reduce((a, b) => a + b, 0);
      const other = theirs.reduce((a, b) => a + b, 0);
      const result = c.mine !== c.theirs ? (c.mine > c.theirs ? "won" : "lost") : mine !== other ? (mine > other ? "won" : "lost") : "draw";
      setOutcome({ kind: "result", r: { my_score: mine, their_score: other, my_crowns: c.mine, their_crowns: c.theirs, result, trophies_won: 0, my_points: all, their_points: theirs } });
      return;
    }
    setSendState("sending");
    try {
      if (setup.mode === "challenge") {
        const trophies = await duels.finish(setup.duelId!, all);
        setOutcome({ kind: "sent", trophies });
        sfx("crown");
      } else {
        const r = await duels.answer(setup.duelId!, all);
        if (r) setOutcome({ kind: "result", r });
      }
      setSendState("idle");
    } catch (e) {
      const problem = duelProblem(e);
      setSendState(problem === "over" ? "over" : "failed");
      setSendError(problemText(problem));
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
    setFlash({ kind: correct ? "gold" : "red", key: index });
    if (correct) setFloatPts({ n: got, key: index });
    else shake();
    if (sound) playTone(correct ? "correct" : "wrong");
    if (correct && streak + 1 >= 3) sfx("crown");
    void haptic(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      setPicked(null);
      setFloatPts(null);
      setFlash(null);
      if (index + 1 < questions.length) {
        setIndex(index + 1);
        sfx("whoosh");
      } else {
        setPhase("done");
        void submit(all);
      }
    }, correct ? 700 : 1050);
  };

  // How far each pirogue has sailed: one step per question, a bit further for speed.
  const sailed = (pts: number[]) => pts.reduce((a, p) => a + (p > 0 ? 0.7 + (0.3 * (p - 100)) / 50 : 0.35), 0) / DUEL_LENGTH;

  // ── Intro: face-off ──
  if (phase === "intro" || phase === "starting") {
    return (
      <DuelScene lowEnd={lowEnd}>
        <main ref={stage} className="safe-top safe-bottom flex min-h-dvh flex-col p-6 text-center">
          <div className="relative mt-6 flex h-56 items-center justify-center" aria-hidden>
            <div className="anim-panel-left absolute top-4 left-[-6%] flex h-44 w-[56%] items-center justify-center rounded-3xl bg-gradient-to-br from-[#e0703f] to-[#7a2a14] shadow-[0_6px_0_#7a2a14]">
              <span className="grid h-24 w-24 skew-x-[8deg] place-items-center rounded-full bg-white/15 font-display text-5xl font-extrabold text-white ring-4 ring-white/60">
                {initial(myName || t("friends.you"))}
              </span>
            </div>
            <div className="anim-panel-right absolute top-4 right-[-6%] flex h-44 w-[56%] items-center justify-center rounded-3xl bg-gradient-to-br from-[#9a5ab8] to-[#3b1a52] shadow-[0_6px_0_#3b1a52]">
              <span className="grid h-24 w-24 skew-x-[8deg] place-items-center rounded-full bg-white/15 font-display text-5xl font-extrabold text-white ring-4 ring-white/60">
                {setup.mode === "bot" ? "🤖" : initial(setup.name)}
              </span>
            </div>
            <span className="anim-ring absolute top-1/2 left-1/2 h-24 w-24 rounded-full border-4 border-[#ffc93c]" style={{ animationDelay: "480ms" }} />
            <span className="anim-slam vs-text relative font-display text-6xl font-extrabold" style={{ animationDelay: "420ms" }}>
              {t("duel.vs")}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <h1 className="text-glow-white font-display text-3xl font-extrabold">{t("duel.title", { name: setup.name })}</h1>
            <p className="text-night/85">
              {setup.mode === "bot"
                ? t("bot.intro", { n: DUEL_LENGTH })
                : t(setup.mode === "challenge" ? "duel.introChallenge" : "duel.introReply", { n: DUEL_LENGTH, name: setup.name })}
            </p>
            {setup.mode === "bot" ? (
              <div className="w-full">
                <p className="mb-2 text-sm font-bold text-muted">{t("bot.pickLevel")}</p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("bot.pickLevel")}>
                  {BOT_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={setup.level === level}
                      onClick={() => setSetup({ ...setup, level })}
                      className={`glass-card rounded-xl px-2 py-2 font-display font-extrabold ${setup.level === level ? "glow-gold text-night" : "text-night"}`}
                    >
                      {t(`bot.level.${level}`)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {startError ? (
              <p role="alert" className="rounded-2xl bg-white/80 p-3 font-bold text-clay">
                {startError}
              </p>
            ) : null}
          </div>
          {phase === "starting" ? (
            <Loading />
          ) : (
            <button type="button" onClick={() => void start()} className="btn-game anim-pulse-glow min-h-14 w-full rounded-2xl font-display text-xl font-extrabold tracking-wide uppercase">
              {t("duel.start")}
            </button>
          )}
          <div className="mt-4 flex items-center justify-between">
            <Link href={setup.mode === "bot" ? "/practice/" : "/friends/"} className="rounded-full bg-white/90 px-3 py-1 font-bold text-night underline">
              {t("common.cancel")}
            </Link>
            {soundToggle}
          </div>
        </main>
      </DuelScene>
    );
  }

  // ── Countdown ──
  if (phase === "countdown") {
    return (
      <DuelScene lowEnd={lowEnd}>
        <main key={count} className="safe-top safe-bottom flex min-h-dvh items-center justify-center" aria-live="polite">
          <span className="anim-ring absolute top-1/2 left-1/2 h-40 w-40 rounded-full border-4 border-[#ffc93c]" aria-hidden />
          <span className="anim-slam text-glow font-display text-9xl font-extrabold text-clay">{count > 0 ? count : t("duel.go")}</span>
        </main>
      </DuelScene>
    );
  }

  // ── Finished ──
  if (phase === "done") {
    const r = outcome?.kind === "result" ? outcome.r : null;
    const rounds = r?.their_points ? crownsFor(r.my_points, r.their_points) : null;
    const allShown = revealed >= 3 || !rounds;
    // The leader reaches the finish line; the other boat ends where their answers took them.
    const lead = r?.their_points ? Math.max(sailed(r.my_points), sailed(r.their_points)) || 1 : 1;
    const ends = [0, 3, 6, 10];
    return (
      <DuelScene lowEnd={lowEnd}>
        <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
          {r && allShown && r.result === "won" ? <Confetti pieces={lowEnd ? 24 : 48} /> : null}
          {r && allShown ? (
            <p className={`anim-rise font-display text-5xl font-extrabold tracking-tight ${r.result === "lost" ? "text-glow-white" : "text-glow text-clay"}`}>
              {r.result === "won" ? t("duel.won") : r.result === "draw" ? t("duel.draw") : setup.mode === "bot" ? t("bot.lost") : t("duel.lost")}
            </p>
          ) : null}
          {rounds ? (
            <div className="w-full">
              <DuelRace
                mine={sailed(r!.my_points.slice(0, ends[revealed])) / lead}
                theirs={sailed(r!.their_points!.slice(0, ends[revealed])) / lead}
                label={t("duel.crowns", { mine: rounds.mine, name: setup.name, theirs: rounds.theirs })}
              />
              <ol className="mt-3 grid grid-cols-3 gap-2">
                {rounds.rounds.map((round, i) => {
                  const shown = i < revealed;
                  const won = shown && round.winner === "me";
                  return (
                    <li key={i} className={`glass-card rounded-2xl p-2 ${shown ? "" : "opacity-40"} ${won ? "glow-gold shine" : ""}`}>
                      <span className="block text-xs font-bold tracking-wider text-muted uppercase">{t("duel.round", { n: i + 1 })}</span>
                      <span className="block font-display text-lg font-extrabold text-night">{shown ? `${round.mine} – ${round.theirs}` : "…"}</span>
                      <span aria-hidden className={`block h-8 text-2xl ${won ? "anim-drop-in" : ""}`}>
                        {shown ? (round.winner === "me" ? "👑" : round.winner === "them" ? "·" : "=") : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
          <p className="text-sm font-bold tracking-widest text-muted uppercase">{t("duel.yourScore")}</p>
          <p className="text-glow-white font-display text-7xl font-extrabold">
            <Rolling value={score} />
          </p>
          {sendState === "sending" ? <Loading /> : null}
          {sendState === "failed" ? (
            <>
              <p role="alert" className="font-bold text-berry">
                {sendError && sendError !== t("duel.startFailed") ? sendError : t("duel.sendFailed")}
              </p>
              <button type="button" onClick={() => void submit(points)} className="btn-game rounded-2xl px-6 py-3 font-display font-extrabold">
                {t("duel.retry")}
              </button>
            </>
          ) : null}
          {outcome?.kind === "sent" ? (
            <>
              <p className="glass-card glow-gold shine anim-drop-in rounded-full px-5 py-2 font-display text-2xl font-extrabold text-clay">
                🏆 {t("duel.trophies", { n: outcome.trophies })}
              </p>
              <p className="text-sm text-muted">{t("duel.trophiesHow")}</p>
              <p className="text-lg text-night">{t("duel.sent", { name: setup.name })}</p>
            </>
          ) : null}
          {r && allShown ? (
            <>
              {r.my_crowns != null && r.their_crowns != null ? (
                <p className="font-bold text-night">{t("duel.crowns", { mine: r.my_crowns, name: setup.name, theirs: r.their_crowns })}</p>
              ) : (
                <p className="text-muted">{t("duel.scores", { mine: r.my_score, name: setup.name, theirs: r.their_score })}</p>
              )}
              {setup.mode === "bot" ? (
                <p className="text-sm text-muted">{t("bot.noTrophies")}</p>
              ) : (
                <>
                  <p className="glass-card glow-gold shine anim-drop-in rounded-full px-5 py-2 font-display text-xl font-extrabold text-clay">
                    🏆 {t("duel.trophies", { n: r.trophies_won })}
                  </p>
                  <p className="text-sm text-muted">{t("duel.trophiesHow")}</p>
                </>
              )}
              {setup.mode === "bot" ? (
                <button
                  type="button"
                  onClick={() => goTo(router, `/duel/?bot=${setup.level ?? "medium"}`)}
                  className="btn-game anim-pulse-glow mt-2 rounded-2xl px-8 py-3 font-display text-lg font-extrabold uppercase"
                >
                  {t("duel.rematch")}
                </button>
              ) : setup.friendId ? (
                <button
                  type="button"
                  onClick={() => goTo(router, `/duel/?friend=${encodeURIComponent(setup.friendId!)}&name=${encodeURIComponent(setup.name)}`)}
                  className="btn-game anim-pulse-glow mt-2 rounded-2xl px-8 py-3 font-display text-lg font-extrabold uppercase"
                >
                  {t("duel.rematch")}
                </button>
              ) : null}
            </>
          ) : null}
          {sendState === "over" ? (
            <p role="alert" className="font-bold text-clay">
              {t("duel.over")}
            </p>
          ) : null}
          {outcome || sendState === "over" ? (
            <Link href={setup.mode === "bot" ? "/practice/" : "/friends/"} className="mt-2 rounded-full bg-white/90 px-3 py-1 font-bold text-night underline">
              {setup.mode === "bot" ? t("practice.title") : t("duel.back")}
            </Link>
          ) : null}
        </main>
      </DuelScene>
    );
  }

  // ── Question ──
  return (
    <DuelScene lowEnd={lowEnd}>
      {flash ? <div key={`${flash.kind}${flash.key}`} aria-hidden className={`pointer-events-none fixed inset-0 z-20 ${flash.kind === "red" ? "flash-red" : "flash-gold"}`} /> : null}
      <main ref={stage} className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
        <div className="flex items-center gap-3 pt-3">
          <Link href={setup.mode === "bot" ? "/practice/" : "/friends/"} aria-label={t("common.close")} className="grid h-10 w-10 place-items-center rounded-full bg-white/80">
            <IconClose />
          </Link>
          <span className="glass-card rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase">{t("duel.round", { n: roundOf(index) + 1 })}</span>
          <span className="flex-1" />
          {soundToggle}
          <span className="text-glow-white relative min-w-16 text-right font-display text-3xl font-extrabold">
            <Rolling value={score} />
            {floatPts ? (
              <span key={floatPts.key} aria-hidden className="anim-float-up absolute -top-3 right-0 font-display text-base font-extrabold text-clay">
                +{floatPts.n}
              </span>
            ) : null}
          </span>
        </div>
        <DuelRace
          mine={sailed(points)}
          theirs={setup.mode === "bot" ? sailed((setup.botPts ?? []).slice(0, points.length)) : null}
          label={t("duel.race", { n: index + 1, total: questions.length })}
        />
        <div className="h-7 text-center">
          {streak >= 3 ? (
            <span key={streak} className="anim-rise text-glow inline-block font-display text-xl font-extrabold text-clay">
              🔥 {t("duel.streak", { n: streak })}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <p className="mb-2 text-center text-sm font-bold tracking-wider text-muted uppercase">{t(`duel.ask.${q!.kind}`)}</p>
          <div className="mb-4 flex min-h-28 items-center justify-center text-center">
            {q!.kind === "listen" ? (
              <button
                type="button"
                onClick={() => void playEntry(q!.entry)}
                aria-label={t("ex.play")}
                className="glass-card glow-gold grid h-24 w-24 place-items-center rounded-full text-clay"
              >
                <IconSpeaker size={40} />
              </button>
            ) : (
              <p key={index} lang={q!.kind === "meaning" ? "wo" : undefined} className="anim-rise text-glow-white font-display text-4xl leading-tight font-extrabold">
                {q!.kind === "meaning" ? q!.entry.wo : translate(q!.entry.tr, lang)}
              </p>
            )}
          </div>
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/80" role="presentation" title={t("duel.speed")}>
            {picked === null ? <div key={index} className="timer-drain timer-glow h-full rounded-full" /> : null}
          </div>
          <div className="grid gap-3">
            {q!.options.map((o, i) => {
              const state =
                picked === null ? "" : i === q!.answer ? `glow-right ${i === picked ? "anim-pop" : ""}` : i === picked ? "glow-wrong anim-shake" : "opacity-40";
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(i)}
                  lang={q!.kind === "meaning" ? undefined : "wo"}
                  className={`glass-card min-h-14 rounded-2xl px-4 py-3 text-left text-lg font-bold text-night ${state}`}
                >
                  {optionLabel(q!, o, lang)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-10" />
      </main>
    </DuelScene>
  );
}
