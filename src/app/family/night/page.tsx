// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Family Làmb Night: a pass-the-phone Wolof wrestling tournament.
 * 2–6 players, all ages. Visual style: clay-toy stocky wrestlers, Senegal-
 * flag loincloths, sandy pit. Each player's avatar colour is their loincloth.
 * Questions match the player's level (pictures / words / phrases).
 */

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LambRing } from "@/components/LambArena";
import { Confetti } from "@/components/Confetti";
import { IconArrowLeft } from "@/components/icons";
import { useStore } from "@/lib/store";
import { useFamily } from "@/lib/family-context";
import { avatarOf, members, levelOf, isChild } from "@/lib/family";
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  TURNS_EACH,
  SUDDEN_DEATH_PAIRS,
  boutBalance,
  boutEnd,
  champion,
  inSuddenDeath,
  newTournament,
  nextMatch,
  nightQuestion,
  questionNow,
  recordWinner,
  turnOf,
  type Bout,
  type Fighter,
  type Tournament,
} from "@/lib/family-night";
import { seeded } from "@/lib/engine";
import { playTone } from "@/lib/audio";

// ── Colour helpers ────────────────────────────────────────────────────────────

/** A lighter version of a hex colour for the loincloth trim. */
function lighten(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + 60);
  const g = Math.min(255, ((n >> 8) & 0xff) + 60);
  const b = Math.min(255, (n & 0xff) + 60);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase =
  | { kind: "setup" }
  | { kind: "pass"; to: string; onContinue: () => void }
  | { kind: "bout"; tournament: Tournament; bout: Bout; matchSeed: number }
  | { kind: "result"; tournament: Tournament; winner: string; how: string }
  | { kind: "champion"; id: string };

// ── Option button colours (match the clay-toy aesthetic from the reference image) ──

const OPTION_COLORS = ["#4a90d9", "#4caf50", "#f5a623", "#9b59b6"] as const;

// ── Main component ────────────────────────────────────────────────────────────

export default function FamilyNightPage() {
  const { progress, t } = useStore();
  const { family, giveCrown } = useFamily();
  const allMembers = members(progress, family);
  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });
  const [answered, setAnswered] = useState<boolean | null>(null);
  const router = useRouter();
  const seed = useRef(0);
  if (seed.current === 0) seed.current = Math.floor(Date.now() % 65535) + 1;

  // ── Helpers ──

  const profileById = useCallback(
    (id: string) => allMembers.find((p) => p.id === id) ?? null,
    [allMembers],
  );

  const avatarColour = useCallback(
    (id: string) => avatarOf(profileById(id)),
    [profileById],
  );

  const startTournament = useCallback(() => {
    if (selected.length < MIN_PLAYERS) return;
    const t = newTournament(selected, seed.current);
    const m = nextMatch(t)!;
    const bout: Bout = {
      left: { id: m.match.a, level: levelOf(profileById(m.match.a)) },
      right: { id: m.match.b!, level: levelOf(profileById(m.match.b!)!) },
      answers: [],
      seed: seed.current ^ (m.round * 997),
    };
    setPhase({
      kind: "pass",
      to: m.match.a,
      onContinue: () => setPhase({ kind: "bout", tournament: t, bout, matchSeed: seed.current }),
    });
  }, [selected, profileById]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (phase.kind !== "bout") return;
      const { tournament, bout } = phase;
      setAnswered(correct);
      void playTone(correct ? "correct" : "wrong");
      setTimeout(() => {
        setAnswered(null);
        const newBout: Bout = { ...bout, answers: [...bout.answers, correct] };
        const end = boutEnd(newBout);
        if (end) {
          const winnerId = end.winner === 0 ? bout.left.id : bout.right.id;
          const newT = recordWinner(tournament, winnerId);
          const champ = champion(newT);
          if (champ) {
            giveCrown(champ);
            setPhase({ kind: "champion", id: champ });
          } else {
            setPhase({ kind: "result", tournament: newT, winner: winnerId, how: end.how });
          }
        } else {
          // Next turn: pass to the right player
          const nextTurn = turnOf(newBout);
          const nextId = nextTurn === 0 ? newBout.left.id : newBout.right.id;
          setPhase({
            kind: "pass",
            to: nextId,
            onContinue: () => setPhase({ kind: "bout", tournament, bout: newBout, matchSeed: phase.matchSeed }),
          });
        }
      }, 900);
    },
    [phase, giveCrown],
  );

  const startNextMatch = useCallback(
    (t0: Tournament) => {
      // Advance past byes using a loop to avoid recursive useCallback.
      let t = t0;
      for (;;) {
        const m = nextMatch(t);
        if (!m) {
          const champ = champion(t);
          if (champ) { giveCrown(champ); setPhase({ kind: "champion", id: champ }); }
          return;
        }
        if (m.match.b) {
          const matchSeed = seed.current ^ (m.round * 997 + m.index * 101);
          const bout: Bout = {
            left: { id: m.match.a, level: levelOf(profileById(m.match.a)) },
            right: { id: m.match.b, level: levelOf(profileById(m.match.b)) },
            answers: [],
            seed: matchSeed,
          };
          setPhase({
            kind: "pass",
            to: m.match.a,
            onContinue: () => setPhase({ kind: "bout", tournament: t, bout, matchSeed }),
          });
          return;
        }
        // Bye — advance without recursion
        t = recordWinner(t, m.match.a);
      }
    },
    [profileById, giveCrown],
  );

  // ── Render ──

  if (phase.kind === "setup") {
    return (
      <div className="min-h-dvh bg-bg px-4 pb-10 pt-safe-top">
        <div className="mb-6 flex items-center gap-3 pt-4">
          <Link href="/family/" aria-label={t("common.back")} className="grid h-10 w-10 place-items-center rounded-xl border border-sand-3 bg-white text-night">
            <IconArrowLeft />
          </Link>
          <h1 className="font-display text-xl font-extrabold text-night">{t("night.title")}</h1>
        </div>
        <p className="mb-6 text-center text-muted">{t("night.players")}</p>
        <div className="mb-6 space-y-3">
          {allMembers.map((p) => {
            const sel = selected.includes(p.id);
            return (
              <button
                key={p.id}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 transition ${sel ? "border-clay bg-clay/5" : "border-sand-3 bg-white"}`}
                onClick={() =>
                  setSelected((s) =>
                    s.includes(p.id)
                      ? s.filter((id) => id !== p.id)
                      : s.length < MAX_PLAYERS
                      ? [...s, p.id]
                      : s,
                  )
                }
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white"
                  style={{ background: avatarOf(p) }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-bold text-night">{p.name}</p>
                  <p className="text-sm text-muted">{t(`family.level.${levelOf(p)}`)}</p>
                </div>
                {sel ? <span className="text-2xl text-clay">✓</span> : null}
              </button>
            );
          })}
        </div>
        {selected.length < MIN_PLAYERS && (
          <p className="mb-4 text-center text-sm text-muted">{t("night.minPlayers", { n: String(MIN_PLAYERS) })}</p>
        )}
        <button
          disabled={selected.length < MIN_PLAYERS}
          className="w-full rounded-2xl bg-clay py-4 font-display font-extrabold text-white disabled:opacity-40"
          onClick={startTournament}
        >
          {t("night.start")}
        </button>
      </div>
    );
  }

  if (phase.kind === "pass") {
    const p = profileById(phase.to);
    return (
      <div className="splash flex min-h-dvh flex-col items-center justify-center bg-night px-6 pb-10 pt-safe-top">
        <div
          className="mb-6 grid h-24 w-24 place-items-center rounded-full text-4xl font-extrabold text-white"
          style={{ background: p ? avatarOf(p) : "#c2502f" }}
        >
          {p?.name.slice(0, 1).toUpperCase() ?? "?"}
        </div>
        <h2 className="mb-10 text-center font-display text-2xl font-extrabold text-white">
          {t("night.passes", { name: p?.name ?? "" })}
        </h2>
        <button
          className="w-full max-w-xs rounded-2xl bg-clay py-5 font-display text-xl font-extrabold text-white"
          onClick={phase.onContinue}
        >
          {t("common.continue")}
        </button>
      </div>
    );
  }

  if (phase.kind === "bout") {
    const { tournament, bout, matchSeed } = phase;
    const q = questionNow(bout);
    const bal = boutBalance(bout);
    const turn = turnOf(bout);
    const currentFighter = turn === 0 ? bout.left : bout.right;
    const currentId = currentFighter.id;
    const currentProfile = profileById(currentId);
    const leftProfile = profileById(bout.left.id);
    const rightProfile = profileById(bout.right.id);
    const leftColour = avatarColour(bout.left.id);
    const rightColour = avatarColour(bout.right.id);
    const isSuddenDeath = inSuddenDeath(bout);
    const roundNum = tournament.rounds.length;

    return (
      <div className="flex min-h-dvh flex-col bg-bg pb-safe-bottom pt-safe-top">
        {/* Round header */}
        <div className="flex items-center gap-2 px-4 pt-4 text-sm font-bold text-muted">
          <span>
            {roundNum === tournament.rounds.length && tournament.rounds[roundNum - 1]!.length === 1
              ? t("night.final")
              : t("night.round", { n: String(roundNum) })}
          </span>
          {isSuddenDeath && (
            <span className="rounded-full bg-clay px-2 py-0.5 text-xs font-extrabold text-white">⚡ Sudden death</span>
          )}
        </div>

        {/* Names */}
        <div className="mb-1 flex justify-between px-4 pt-1 text-sm font-bold">
          <span style={{ color: leftColour }}>{leftProfile?.name ?? "?"}</span>
          <span style={{ color: rightColour }}>{rightProfile?.name ?? "?"}</span>
        </div>

        {/* Wrestling ring with avatar colours */}
        <div className="px-2">
          <LambRing
            balance={bal}
            label={`${leftProfile?.name ?? ""} vs ${rightProfile?.name ?? ""}`}
            pulse={bout.answers.length}
            lastRight={bout.answers[bout.answers.length - 1]}
            colours={{
              left: { cloth: leftColour, trim: lighten(leftColour) },
              right: { cloth: rightColour, trim: lighten(rightColour) },
            }}
          />
        </div>

        {/* Turn indicator */}
        <div className="mb-3 flex items-center justify-center gap-2 px-4">
          <div
            className="grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold text-white"
            style={{ background: avatarColour(currentId) }}
          >
            {currentProfile?.name.slice(0, 1).toUpperCase()}
          </div>
          <p className="font-bold text-night">{t("night.yourTurn", { name: currentProfile?.name ?? "" })}</p>
        </div>

        {/* Question */}
        <div className="flex-1 px-4">
          <p className="mb-1 text-center text-sm font-semibold text-muted">{t(`night.kind.${q.kind}`)}</p>

          {/* Wolof text (or picture) */}
          {q.kind === "picture" ? (
            <div className="mb-4 flex justify-center">
              <span className="text-7xl">{q.entry.pic}</span>
            </div>
          ) : q.kind === "meaning" || q.kind === "listen" ? (
            <p className="mb-4 text-center font-display text-3xl font-extrabold text-night">{q.entry.wo}</p>
          ) : (
            <p className="mb-4 text-center text-lg text-muted">{q.entry.tr.en}</p>
          )}

          {/* Answer options with OPTION_COLORS styling (clay-toy UI) */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const label =
                q.kind === "picture"
                  ? (opt.pic ?? opt.tr.en)
                  : q.kind === "wolof"
                  ? opt.wo
                  : opt.tr.en;
              const colour = OPTION_COLORS[i % OPTION_COLORS.length]!;
              const isCorrect = opt === q.entry;
              const dimmed = answered !== null && !isCorrect;
              const highlighted = answered !== null && isCorrect;
              return (
                <button
                  key={opt.id}
                  disabled={answered !== null}
                  className={`w-full rounded-2xl px-5 py-4 font-display text-lg font-extrabold text-white shadow-md transition active:scale-95 ${dimmed ? "opacity-30" : ""} ${highlighted ? "scale-105" : ""}`}
                  style={{ background: colour }}
                  onClick={() => handleAnswer(isCorrect)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Feedback flash */}
          {answered !== null && (
            <p className={`mt-4 text-center font-display text-2xl font-extrabold ${answered ? "text-sea" : "text-clay"}`}>
              {answered ? t("night.correct") : t("night.wrong")}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase.kind === "result") {
    const { tournament, winner, how } = phase;
    const wp = profileById(winner);
    const howKey = how === "thrown" ? "night.thrown" : how === "points" ? "night.pointsWin" : "night.crowdWin";
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 pb-10 pt-safe-top">
        <div
          className="mb-4 grid h-24 w-24 place-items-center rounded-full text-4xl font-extrabold text-white"
          style={{ background: wp ? avatarOf(wp) : "#c2502f" }}
        >
          {wp?.name.slice(0, 1).toUpperCase() ?? "?"}
        </div>
        <h2 className="mb-2 text-center font-display text-2xl font-extrabold text-night">
          {t(howKey as "night.thrown", { name: wp?.name ?? "" })}
        </h2>
        <button
          className="mt-10 w-full max-w-xs rounded-2xl bg-clay py-5 font-display text-xl font-extrabold text-white"
          onClick={() => startNextMatch(tournament)}
        >
          {t("common.continue")}
        </button>
      </div>
    );
  }

  if (phase.kind === "champion") {
    const { id } = phase;
    const cp = profileById(id);
    return (
      <div className="splash relative flex min-h-dvh flex-col items-center justify-center bg-night px-6 pb-10 pt-safe-top">
        <Confetti pieces={48} />
        <div
          className="mb-4 grid h-28 w-28 place-items-center rounded-full border-4 border-sun text-5xl font-extrabold text-white shadow-xl"
          style={{ background: cp ? avatarOf(cp) : "#c2502f" }}
        >
          {cp?.name.slice(0, 1).toUpperCase() ?? "🏆"}
        </div>
        <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-sun">
          {t("night.champion", { name: cp?.name ?? "" })}
        </h1>
        <p className="mb-10 text-center text-sand/80">{t("night.subtitle")}</p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            className="w-full rounded-2xl bg-clay py-5 font-display text-xl font-extrabold text-white"
            onClick={() => { setSelected([]); setPhase({ kind: "setup" }); }}
          >
            {t("night.playAgain")}
          </button>
          <Link
            href="/family/"
            className="w-full rounded-2xl border-2 border-sand/40 py-4 text-center font-bold text-sand"
          >
            {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
