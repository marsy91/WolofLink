// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useMemo, useState } from "react";
import { IconSnail, IconSpeaker } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import { allPhrases, phrasebook, phraseById } from "@/content/phrasebook";
import type { Entry } from "@/content/types";
import { translate } from "@/i18n";
import { audioSourceFor, playEntry } from "@/lib/audio";
import { searchPhrases } from "@/lib/phrase-search";
import { toggleSavedPhrase } from "@/lib/progress";
import { useStore } from "@/lib/store";

type Filter = "all" | "saved" | string;

export default function Phrases() {
  const { progress, lang, update, t } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const saved = progress.savedPhrases;
  // Every phrase uses the same kind of audio, so one label covers the page.
  const voice = audioSourceFor(allPhrases[0]!);

  const pool = useMemo<Entry[]>(() => {
    if (filter === "saved") return saved.map((id) => phraseById.get(id)).filter((e): e is Entry => !!e);
    if (filter === "all") return allPhrases;
    return phrasebook.find((c) => c.id === filter)?.phrases ?? [];
  }, [filter, saved]);
  const results = useMemo(() => searchPhrases(pool, query, lang), [pool, query, lang]);
  // Group by category only when browsing everything without a search.
  const grouped = filter === "all" && !query.trim();

  const chip = (id: Filter, label: string, emoji?: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={filter === id}
      onClick={() => setFilter(id)}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold whitespace-nowrap ${
        filter === id ? "border-clay bg-clay text-white" : "border-sand-3 bg-white text-night"
      }`}
    >
      {emoji ? <span aria-hidden>{emoji}</span> : null}
      {label}
    </button>
  );

  const row = (e: Entry) => {
    const isSaved = saved.includes(e.id);
    const expanded = open === e.id;
    return (
      <li key={e.id} className="rounded-2xl border-2 border-sand-3 bg-white">
        <div className="flex items-start gap-2 p-3">
          <button
            type="button"
            onClick={() => {
              setOpen(expanded ? null : e.id);
              void playEntry(e);
            }}
            aria-expanded={expanded}
            className="min-w-0 flex-1 text-left"
          >
            <span lang="wo" className="block font-display text-lg leading-snug font-extrabold text-night">
              {e.wo}
            </span>
            <span className="block text-muted">{translate(e.tr, lang)}</span>
            {expanded && e.note ? <span className="mt-1 block text-sm text-sea">{translate(e.note, lang)}</span> : null}
          </button>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => void playEntry(e)}
              aria-label={t("ex.play")}
              className="grid h-10 w-10 place-items-center rounded-xl bg-night text-sun"
            >
              <IconSpeaker size={20} />
            </button>
            {expanded ? (
              <button
                type="button"
                onClick={() => void playEntry(e, { slow: true })}
                aria-label={t("ex.slow")}
                className="grid h-10 w-10 place-items-center rounded-xl bg-sand-2 text-night"
              >
                <IconSnail size={18} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => update((p) => toggleSavedPhrase(p, e.id))}
              aria-pressed={isSaved}
              aria-label={isSaved ? t("phrases.unsave") : t("phrases.save")}
              className={`grid h-10 w-10 place-items-center rounded-xl text-xl ${isSaved ? "text-sun" : "text-sand-3"}`}
            >
              <span aria-hidden>{isSaved ? "★" : "☆"}</span>
            </button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <TabScreen title={t("phrases.title")}>
      <p className="mb-3 text-muted">
        {t("phrases.intro")}
        {voice === "ai" ? <span className="mt-1 block text-xs">{t("ex.aiVoice")}</span> : null}
        {voice === "tts" ? <span className="mt-1 block text-xs">{t("ex.ttsRobot")}</span> : null}
      </p>
      <label className="mb-3 block">
        <span className="sr-only">{t("phrases.search")}</span>
        <input
          type="search"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder={t("phrases.search")}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay"
        />
      </label>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="toolbar" aria-label={t("phrases.title")}>
        {chip("all", t("phrases.all"))}
        {chip("saved", `${t("phrases.saved")} (${saved.length})`, "★")}
        {phrasebook.map((c) => chip(c.id, translate(c.title, lang), c.emoji))}
      </div>

      <p className="mb-2 text-sm font-bold text-muted" aria-live="polite">
        {t("phrases.count", { n: results.length })}
      </p>

      {results.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-muted">
          {filter === "saved" && !query ? t("phrases.noSaved") : t("phrases.none")}
        </p>
      ) : grouped ? (
        <div className="space-y-6">
          {phrasebook.map((c) => (
            <section key={c.id} aria-labelledby={`pb-${c.id}`}>
              <h2 id={`pb-${c.id}`} className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-night">
                <span aria-hidden>{c.emoji}</span> {translate(c.title, lang)}
              </h2>
              <ul className="space-y-2">{c.phrases.map(row)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">{results.map(row)}</ul>
      )}
    </TabScreen>
  );
}
