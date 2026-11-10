// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { ARENAS, arenaFor } from "@/content/arenas";
import { course } from "@/content/course";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { useStore } from "@/lib/store";
import { Confetti } from "./Confetti";
import { IconSpeaker } from "./icons";

const SEEN_KEY = "woloflink.arena.seen";

/** The learner's arena on the journey through Senegal, unlocked with duel trophies. */
export function ArenaCard({ trophies }: { trophies: number }) {
  const { lang, t } = useStore();
  const { arena, index, next, toNext } = arenaFor(trophies);
  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Celebrate once when a new arena is reached.
  useEffect(() => {
    try {
      const seen = Number(window.localStorage.getItem(SEEN_KEY) ?? "0");
      if (index > seen) void Promise.resolve().then(() => setCelebrate(true));
      if (index !== seen) window.localStorage.setItem(SEEN_KEY, String(index));
    } catch {
      // Celebration is optional.
    }
  }, [index]);

  const words = arena.words.map((id) => course.entries[id]).filter((e) => !!e);
  return (
    <section
      className="relative mb-4 overflow-hidden rounded-3xl p-5 text-white shadow-md"
      style={{ background: `linear-gradient(135deg, ${arena.colors[0]}, ${arena.colors[1]})` }}
      aria-labelledby="arena-h"
    >
      {celebrate ? <Confetti /> : null}
      <p className="text-xs font-bold tracking-widest uppercase opacity-85">
        {celebrate ? t("arena.unlocked") : t("arena.label", { n: index + 1, total: ARENAS.length })}
      </p>
      <h2 id="arena-h" className="flex items-center gap-2 font-display text-3xl font-extrabold">
        <span aria-hidden>{arena.emoji}</span> {arena.name}
      </h2>
      <p className="mt-1 text-sm opacity-95">{translate(arena.fact, lang)}</p>
      {words.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {words.map((e) => (
            <button
              key={e!.id}
              type="button"
              onClick={() => void playEntry(e!)}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold"
            >
              <IconSpeaker size={16} />
              <span lang="wo">{e!.wo}</span>
              <span className="font-normal opacity-85">· {translate(e!.tr, lang)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm font-bold">
          <span>🏆 {trophies}</span>
          <span>{next ? t("arena.next", { n: next.trophies, name: next.name }) : t("arena.last")}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-label={next ? t("arena.next", { n: next.trophies, name: next.name }) : t("arena.last")} aria-valuenow={Math.round(toNext * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-sun" style={{ width: `${toNext * 100}%` }} />
        </div>
      </div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="mt-3 text-sm font-bold underline">
        {t("arena.journey")}
      </button>
      {open ? (
        <ol className="mt-2 space-y-1">
          {ARENAS.map((a, i) => (
            <li key={a.id} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${i === index ? "bg-white/25 font-extrabold" : i < index ? "opacity-90" : "opacity-60"}`}>
              <span aria-hidden>{i <= index ? a.emoji : "🔒"}</span>
              <span className="flex-1">{a.name}</span>
              <span>🏆 {a.trophies}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <p className="mt-2 text-xs opacity-80">{t("arena.how")}</p>
    </section>
  );
}
