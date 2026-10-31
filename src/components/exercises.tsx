// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/content/types";
import { audioSourceFor, playEntry } from "@/lib/audio";
import type {
  Answer,
  BuildExercise,
  ChoiceExercise,
  Exercise,
  FillExercise,
  MatchExercise,
  SpeakExercise,
  TypeExercise,
} from "@/lib/engine";
import { getSpeechChecker } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { IconKeyboard, IconMic, IconSnail, IconSpeaker } from "./icons";
import { Button } from "./ui";

export interface ExerciseProps<E extends Exercise = Exercise> {
  ex: E;
  /** True once the answer has been checked; inputs lock. */
  locked: boolean;
  /** Current candidate answer, or null when nothing is selected yet. */
  onChange: (answer: Answer | null) => void;
  /** Submit immediately (used by speak exercises). */
  onSubmit: (answer: Answer) => void;
}

/* ── Shared pieces ─────────────────────────────────────────────────────── */

export function AudioButtons({ entry, autoplay, big }: { entry: Entry; autoplay?: boolean; big?: boolean }) {
  const { t, progress } = useStore();
  const source = audioSourceFor(entry);
  useEffect(() => {
    if (autoplay && progress.settings.autoplay && source !== "none") void playEntry(entry);
    // Only on first show of this exercise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  if (source === "none") {
    return <p className="text-sm text-muted">{t("ex.ttsUnavailable")}</p>;
  }
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void playEntry(entry)}
        aria-label={t("ex.play")}
        className={`grid place-items-center rounded-2xl bg-night text-sun shadow-[0_4px_0_var(--color-night-3)] active:translate-y-[3px] active:shadow-none ${
          big ? "h-24 w-24" : "h-12 w-12"
        }`}
      >
        <IconSpeaker size={big ? 44 : 24} />
      </button>
      <button
        type="button"
        onClick={() => void playEntry(entry, { slow: true })}
        aria-label={t("ex.slow")}
        className={`grid place-items-center rounded-2xl bg-sand-2 text-night ${big ? "h-16 w-16" : "h-12 w-12"}`}
      >
        <IconSnail size={big ? 30 : 22} />
      </button>
    </div>
  );
}

function TtsNote({ entry }: { entry: Entry }) {
  const { t } = useStore();
  const source = audioSourceFor(entry);
  if (source === "tts") return <p className="mt-2 text-xs text-muted">{t("ex.ttsRobot")}</p>;
  return null;
}

function WolofText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span lang="wo" className={`font-display font-extrabold text-night ${className}`}>
      {children}
    </span>
  );
}

/** Number keys 1–9 select options; makes every choice exercise keyboard-friendly. */
function useNumberKeys(count: number, onPick: (index: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= count) onPick(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onPick, enabled]);
}

/* ── Choice-style exercises ────────────────────────────────────────────── */

export function ChoiceView({ ex, locked, onChange }: ExerciseProps<ChoiceExercise>) {
  const { t } = useStore();
  const [picked, setPicked] = useState<string | null>(null);
  const pick = (id: string) => {
    if (locked) return;
    setPicked(id);
    onChange({ kind: "choice", choiceId: id });
  };
  useNumberKeys(ex.choices.length, (i) => pick(ex.choices[i]!.id), !locked);

  const isPicture = ex.type === "pick_picture";
  const choicesAreWolof = ex.type === "pick_wolof" || ex.type === "listen";

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        {ex.type === "listen" ? (
          <div className="flex justify-center py-4">
            <AudioButtons entry={ex.entry} autoplay big />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
            {ex.promptIsWolof ? <AudioButtons entry={ex.entry} autoplay /> : null}
            {ex.promptIsWolof ? (
              <WolofText className="text-2xl">{ex.prompt}</WolofText>
            ) : (
              <span className="font-display text-2xl font-extrabold text-night">{ex.prompt}</span>
            )}
          </div>
        )}
        {ex.promptIsWolof ? <TtsNote entry={ex.entry} /> : null}
      </div>

      <div
        role="radiogroup"
        aria-label={t(`ex.${ex.type}`)}
        className={isPicture ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}
      >
        {ex.choices.map((c, i) => {
          const selected = picked === c.id;
          const showRight = locked && c.id === ex.answerId;
          const showWrong = locked && selected && c.id !== ex.answerId;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={locked}
              onClick={() => pick(c.id)}
              className={`relative flex items-center gap-3 rounded-2xl border-2 bg-white text-left transition ${
                isPicture ? "flex-col justify-center p-4 text-center" : "p-4"
              } ${
                showRight
                  ? "border-sea bg-sea-soft"
                  : showWrong
                    ? "anim-shake border-berry bg-berry-soft"
                    : selected
                      ? "border-clay bg-sun-soft"
                      : "border-sand-3 shadow-[0_3px_0_var(--color-sand-3)] hover:border-night/30"
              }`}
            >
              <kbd className="absolute top-2 left-2 hidden rounded-md border border-sand-3 px-1.5 text-xs text-muted sm:block">
                {i + 1}
              </kbd>
              {isPicture && c.pic ? (
                <span aria-hidden className="font-display text-5xl leading-none font-extrabold text-night">
                  {c.pic}
                </span>
              ) : null}
              <span
                lang={choicesAreWolof ? "wo" : undefined}
                className={`font-bold ${choicesAreWolof ? "font-display text-lg" : "text-lg"} ${isPicture ? "" : "sm:pl-6"}`}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tap-the-words sentence building ───────────────────────────────────── */

export function BuildView({ ex, locked, onChange }: ExerciseProps<BuildExercise>) {
  const { t } = useStore();
  const [chosen, setChosen] = useState<string[]>([]);
  const labelOf = (id: string) => ex.bank.find((b) => b.id === id)?.label ?? "";

  const set = (next: string[]) => {
    setChosen(next);
    onChange(next.length ? { kind: "build", words: next.map(labelOf) } : null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
        <span className="font-display text-2xl font-extrabold text-night">{ex.prompt}</span>
      </div>

      <div
        aria-live="polite"
        className="mb-6 flex min-h-20 flex-wrap content-start gap-2 border-y-2 border-sand-3 py-3"
      >
        {chosen.length === 0 ? <p className="self-center text-muted">{t("ex.tilesEmpty")}</p> : null}
        {chosen.map((id) => (
          <button
            key={id}
            type="button"
            disabled={locked}
            onClick={() => set(chosen.filter((c) => c !== id))}
            aria-label={t("ex.removeTile", { w: labelOf(id) })}
            className="rounded-xl border-2 border-night/20 bg-white px-3 py-2 font-display text-lg font-extrabold text-night shadow-[0_3px_0_var(--color-sand-3)]"
            lang="wo"
          >
            {labelOf(id)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {ex.bank.map((tile) => {
          const used = chosen.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              lang="wo"
              disabled={locked || used}
              onClick={() => set([...chosen, tile.id])}
              aria-hidden={used}
              className={`rounded-xl border-2 px-3 py-2 font-display text-lg font-extrabold ${
                used
                  ? "border-sand-3 bg-sand-3 text-transparent"
                  : "border-sand-3 bg-white text-night shadow-[0_3px_0_var(--color-sand-3)]"
              }`}
            >
              {tile.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Fill in the blank ─────────────────────────────────────────────────── */

export function FillView({ ex, locked, onChange }: ExerciseProps<FillExercise>) {
  const [picked, setPicked] = useState<string | null>(null);
  const pick = (id: string) => {
    if (locked) return;
    setPicked(id);
    onChange({ kind: "fill", choiceId: id });
  };
  useNumberKeys(ex.choices.length, (i) => pick(ex.choices[i]!.id), !locked);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 rounded-3xl bg-white p-5 shadow-[0_3px_0_var(--color-sand-3)]">
        <p className="mb-3 flex flex-wrap items-baseline gap-2 text-2xl" lang="wo">
          {ex.before.map((w, i) => (
            <WolofText key={`b${i}`}>{w}</WolofText>
          ))}
          <span
            className={`inline-block min-w-20 border-b-4 px-2 text-center font-display font-extrabold ${
              locked ? (picked === ex.answerId ? "border-sea text-sea" : "border-berry text-berry") : "border-clay text-clay"
            }`}
          >
            {picked ?? " "}
          </span>
          {ex.after.map((w, i) => (
            <WolofText key={`a${i}`}>{w}</WolofText>
          ))}
        </p>
        <p className="text-muted">{ex.meaning}</p>
      </div>
      <div role="radiogroup" className="flex flex-wrap justify-center gap-3">
        {ex.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={picked === c.id}
            lang="wo"
            disabled={locked}
            onClick={() => pick(c.id)}
            className={`min-w-24 rounded-2xl border-2 px-4 py-3 font-display text-lg font-extrabold ${
              picked === c.id ? "border-clay bg-sun-soft text-night" : "border-sand-3 bg-white text-night shadow-[0_3px_0_var(--color-sand-3)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Matching pairs ────────────────────────────────────────────────────── */

export function MatchView({ ex, locked, onSubmit }: ExerciseProps<MatchExercise>) {
  const { t } = useStore();
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  const attempt = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    if (l === r) {
      const next = [...matched, l];
      setMatched(next);
      if (next.length === ex.left.length) onSubmit({ kind: "match", mistakes });
    } else {
      setMistakes((m) => m + 1);
      setWrongFlash(`${l}|${r}`);
      window.setTimeout(() => setWrongFlash(null), 400);
    }
    setLeft(null);
    setRight(null);
  };

  const cell = (side: "l" | "r", id: string, label: string) => {
    const isMatched = matched.includes(id);
    const selected = side === "l" ? left === id : right === id;
    const flashing = wrongFlash?.split("|")[side === "l" ? 0 : 1] === id;
    return (
      <button
        key={`${side}-${id}`}
        type="button"
        lang={side === "l" ? "wo" : undefined}
        disabled={locked || isMatched}
        aria-pressed={selected}
        onClick={() => {
          if (side === "l") {
            setLeft(id);
            attempt(id, right);
          } else {
            setRight(id);
            attempt(left, id);
          }
        }}
        className={`min-h-16 rounded-2xl border-2 p-3 text-center text-base font-bold transition ${
          isMatched
            ? "border-sea/40 bg-sea-soft text-sea opacity-70"
            : flashing
              ? "anim-shake border-berry bg-berry-soft"
              : selected
                ? "border-clay bg-sun-soft"
                : "border-sand-3 bg-white shadow-[0_3px_0_var(--color-sand-3)]"
        } ${side === "l" ? "font-display" : ""}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">{ex.left.map((c) => cell("l", c.id, c.label))}</div>
        <div className="flex flex-col gap-3">{ex.right.map((c) => cell("r", c.id, c.label))}</div>
      </div>
      <p aria-live="polite" className="sr-only">
        {matched.length === ex.left.length ? t("ex.matchDone") : ""}
      </p>
    </div>
  );
}

/* ── Typing ─────────────────────────────────────────────────────────────── */

/** Letters most keyboards lack. Wolof's Latin alphabet also uses ŋ. */
const SPECIAL = ["à", "é", "ë", "ó", "ñ", "ŋ"];

export function TypeView({ ex, locked, onChange }: ExerciseProps<TypeExercise>) {
  const { t } = useStore();
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const set = (v: string) => {
    setText(v);
    onChange(v.trim() ? { kind: "type", text: v } : null);
  };
  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, []);

  const insert = (ch: string) => {
    const el = input.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    set(text.slice(0, start) + ch + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + ch.length, start + ch.length);
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      {ex.type === "listen_type" ? (
        <div className="mb-5 flex flex-col items-center gap-2 py-2">
          <AudioButtons entry={ex.entry} autoplay big />
          <TtsNote entry={ex.entry} />
        </div>
      ) : (
        <div className="mb-5 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
          <span className="font-display text-2xl font-extrabold text-night">{ex.prompt}</span>
        </div>
      )}
      <label className="block">
        <span className="sr-only">{t("ex.typePlaceholder")}</span>
        <input
          ref={input}
          lang="wo"
          value={text}
          disabled={locked}
          onChange={(e) => set(e.target.value)}
          placeholder={t("ex.typePlaceholder")}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          className="w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-4 font-display text-xl font-extrabold text-night outline-none focus:border-clay disabled:opacity-80"
        />
      </label>
      <div role="group" aria-label={t("ex.keyboard")} className="mt-3 flex flex-wrap items-center gap-2">
        <IconKeyboard size={20} className="text-muted" />
        {SPECIAL.map((ch) => (
          <button
            key={ch}
            type="button"
            disabled={locked}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(ch)}
            className="h-11 min-w-11 rounded-xl border-2 border-sand-3 bg-white font-display text-lg font-extrabold text-night shadow-[0_3px_0_var(--color-sand-3)] active:translate-y-[2px] active:shadow-none"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Speaking (self-checked placeholder) ──────────────────────────────── */

export function SpeakView({ ex, locked, onSubmit }: ExerciseProps<SpeakExercise>) {
  const { t } = useStore();
  const checker = getSpeechChecker();
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
        <AudioButtons entry={ex.entry} autoplay />
        <div>
          <WolofText className="block text-2xl">{ex.entry.wo}</WolofText>
          <span className="text-muted">{ex.meaning}</span>
        </div>
      </div>
      <TtsNote entry={ex.entry} />
      <div className="my-6 flex flex-col items-center gap-3 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-dusk-soft text-dusk" aria-hidden>
          <IconMic size={36} />
        </span>
        {!checker.available ? <p className="max-w-xs text-sm text-muted">{t("ex.speakHint")}</p> : null}
      </div>
      {!locked && (
        <div className="mt-auto flex flex-col gap-3">
          <Button block variant="secondary" onClick={() => onSubmit({ kind: "speak", said: true })}>
            {t("ex.speakSaid")}
          </Button>
          <Button block variant="ghost" onClick={() => onSubmit({ kind: "speak", said: false })}>
            {t("ex.speakCant")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ExerciseView(props: ExerciseProps) {
  const { ex } = props;
  switch (ex.kind) {
    case "choice":
      return <ChoiceView {...props} ex={ex} />;
    case "build":
      return <BuildView {...props} ex={ex} />;
    case "fill":
      return <FillView {...props} ex={ex} />;
    case "match":
      return <MatchView {...props} ex={ex} />;
    case "speak":
      return <SpeakView {...props} ex={ex} />;
    case "type":
      return <TypeView {...props} ex={ex} />;
  }
}
