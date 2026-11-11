// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconExpand, IconSnail, IconSpeaker, IconStar, SECTION_ICONS } from "@/components/icons";
import Link from "next/link";
import { ReportProblem } from "@/components/ReportProblem";
import { ShowCard } from "@/components/ShowCard";
import { soundsIn } from "@/content/sounds";
import { TabScreen } from "@/components/ui";
import {
  dictionary,
  dictionaryById,
  dictionarySections,
  sectionOfEntry,
  survivalSection,
  type DictionarySection,
} from "@/content/dictionary";
import type { Entry } from "@/content/types";
import { translate } from "@/i18n";
import { audioSourceFor, playEntry } from "@/lib/audio";
import { rankedSearch } from "@/lib/phrase-search";
import { toggleSavedPhrase } from "@/lib/progress";
import { useStore } from "@/lib/store";

/** "all", "saved", "course" (every course word) or a phrasebook section id. */
type Filter = "all" | "saved" | "course" | string;

export default function Phrases() {
  const { progress, lang, update, t } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  // The Practice tab links here with ?show=survival (read after mount: the page is pre-rendered).
  useEffect(() => {
    // One-time read of the link after hydration, so the pre-rendered page and the first render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("show") === "survival") setFilter("survival");
  }, []);
  const [open, setOpen] = useState<string | null>(null);
  const [showing, setShowing] = useState<Entry | null>(null);
  const saved = progress.savedPhrases;
  // Every entry uses the same kind of audio, so one label covers the page.
  const voice = audioSourceFor(dictionary[0]!);

  const sections = useMemo<DictionarySection[]>(() => {
    if (filter === "all") return dictionarySections;
    if (filter === "course") return dictionarySections.filter((s) => s.kind === "course");
    if (filter === "survival") return [survivalSection];
    return dictionarySections.filter((s) => s.id === filter);
  }, [filter]);
  const pool = useMemo<Entry[]>(() => {
    if (filter === "saved") return saved.map((id) => dictionaryById.get(id)).filter((e): e is Entry => !!e);
    return sections.flatMap((s) => s.entries);
  }, [filter, saved, sections]);
  const results = useMemo(() => rankedSearch(pool, query, lang), [pool, query, lang]);
  const searching = !!query.trim();
  // Draw the list in pages (24 rows, then 80 more as you scroll): drawing all ~490 rows at once is slow on budget phones.
  const sig = `${filter}|${query}`;
  const [paging, setPaging] = useState({ sig, limit: FIRST_PAGE });
  const limit = paging.sig === sig ? paging.limit : FIRST_PAGE;
  const total = grouped0(searching, filter) ? sections.reduce((n, c) => n + c.entries.length, 0) : results.length;
  const more = () => setPaging({ sig, limit: limit + NEXT_PAGE });
  const sectionLabel = (id: string) => {
    const sec = sectionOfEntry.get(id);
    if (!sec) return "";
    return sec.kind === "course" ? t("dict.unit", { n: sec.emoji, title: translate(sec.title, lang) }) : translate(sec.title, lang);
  };
  // Group into sections when browsing (not searching, not the saved list).
  const grouped = !searching && filter !== "saved";

  const chip = (id: Filter, label: string, withIcon = false) => {
    const Icon = withIcon ? SECTION_ICONS[id] : undefined;
    return (
    <button
      key={id}
      type="button"
      aria-pressed={filter === id}
      onClick={() => setFilter(id)}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold whitespace-nowrap ${
        filter === id ? "border-clay bg-clay text-white" : "border-sand-3 bg-white text-night"
      }`}
    >
      {Icon ? <Icon size={16} /> : null}
      {label}
    </button>
    );
  };

  const row = (e: Entry) => {
    const isSaved = saved.includes(e.id);
    const expanded = open === e.id;
    return (
      <li key={e.id} className="rounded-2xl border border-sand-3/60 bg-white shadow-card">
        <div className="flex items-center gap-2 py-2.5 pr-2 pl-3.5">
          <button
            type="button"
            onClick={() => {
              setOpen(expanded ? null : e.id);
              void playEntry(e);
            }}
            aria-expanded={expanded}
            className="min-w-0 flex-1 text-left"
          >
            <span lang="wo" className="block font-display text-[1.05rem] leading-snug font-extrabold text-night">
              {e.wo}
            </span>
            <span className="block text-sm leading-snug text-muted">{translate(e.tr, lang)}</span>
            {searching || filter === "saved" ? (
              <span className="mt-0.5 block text-xs text-muted/80">{sectionLabel(e.id)}</span>
            ) : null}
            {expanded && e.note ? <span className="mt-1 block text-sm text-sea">{translate(e.note, lang)}</span> : null}
          </button>
          <div className="flex shrink-0 items-center gap-1">
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
              className={`grid h-10 w-10 place-items-center rounded-xl ${isSaved ? "text-sun" : "text-muted/50"}`}
            >
              <IconStar size={20} filled={isSaved} />
            </button>
          </div>
        </div>
        {expanded ? (
          <button
            type="button"
            onClick={() => setShowing(e)}
            className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-night px-3 py-2 text-sm font-extrabold text-sand"
          >
            <IconExpand size={16} /> {t("show.open")}
          </button>
        ) : null}
        {expanded && soundsIn(e.wo).length ? (
          <div className="mx-3 mb-2 rounded-xl bg-sand p-2 text-sm">
            <span className="font-bold text-night">{t("sounds.howTo")}</span>
            {soundsIn(e.wo).map((snd) => (
              <Link key={snd.id} href={`/sounds/#sound-${snd.id}`} className="mt-0.5 block text-muted">
                <span lang="wo" className="font-bold text-clay">
                  {snd.label}
                </span>{" "}
                {translate(snd.how, lang)}
              </Link>
            ))}
          </div>
        ) : null}
        {expanded ? <ReportProblem entryId={e.id} className="mx-3 mb-3" /> : null}
      </li>
    );
  };

  return (
    <TabScreen title={t("phrases.title")}>
      <p className="mb-3 text-muted">
        {t("phrases.intro")}
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
          className="w-full rounded-2xl border border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay"
        />
      </label>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="toolbar" aria-label={t("phrases.title")}>
        {chip("all", t("phrases.all"))}
        {chip("saved", `${t("phrases.saved")} (${saved.length})`, true)}
        {chip("survival", translate(survivalSection.title, lang), true)}
        {chip("course", t("dict.course"), true)}
        {dictionarySections.filter((c) => c.kind === "phrasebook").map((c) => chip(c.id, translate(c.title, lang), true))}
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
          {pageOfSections(sections, limit).map((c) => (
            <section key={c.id} aria-labelledby={`pb-${c.id}`}>
              <h2 id={`pb-${c.id}`} className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-night">
                {c.kind === "course" ? (
                  <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-sand-2 px-1 text-sm">{c.emoji}</span>
                ) : (
                  <SectionIcon id={c.id} />
                )}{" "}
                {c.kind === "course" ? t("dict.unit", { n: c.emoji, title: translate(c.title, lang) }) : translate(c.title, lang)}
              </h2>
              <ul className="space-y-2">{c.entries.map(row)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">{results.slice(0, limit).map(row)}</ul>
      )}
      {results.length > 0 && limit < total ? <MoreOnScroll onMore={more} /> : null}
      {showing ? <ShowCard entry={showing} onClose={() => setShowing(null)} /> : null}
    </TabScreen>
  );
}

/** Line icon for a phrasebook section (decorative). */
function SectionIcon({ id }: { id: string }) {
  const Icon = SECTION_ICONS[id];
  return Icon ? (
    <span className="grid h-7 w-7 place-items-center rounded-lg bg-sand-2 text-clay">
      <Icon size={18} />
    </span>
  ) : null;
}

const FIRST_PAGE = 24;
const NEXT_PAGE = 80;

/** Same rule as `grouped` in the component (browsing, not searching or viewing saved phrases). */
function grouped0(searching: boolean, filter: string): boolean {
  return !searching && filter !== "saved";
}

/** The first `limit` rows across sections, keeping section headings. */
function pageOfSections(sections: DictionarySection[], limit: number): DictionarySection[] {
  const out: DictionarySection[] = [];
  let left = limit;
  for (const c of sections) {
    if (left <= 0) break;
    out.push(c.entries.length <= left ? c : { ...c, entries: c.entries.slice(0, left) });
    left -= c.entries.length;
  }
  return out;
}

/** Calls `onMore` when the end of the list comes near the screen. */
function MoreOnScroll({ onMore }: { onMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      onMore();
      return;
    }
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && onMore(), { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [onMore]);
  return <div ref={ref} aria-hidden className="h-8" />;
}
