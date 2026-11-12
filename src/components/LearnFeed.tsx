// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { allLessons, course } from "@/content/course";
import { phrasebook } from "@/content/phrasebook";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { MAX_LEVEL } from "@/lib/engine";
import { continueLesson, dayNumber, feedPosts } from "@/lib/feed";
import { canOpenLesson, canOpenStory } from "@/lib/premium";
import { usePremium } from "@/lib/premium-context";
import { dueEntries, isUnlocked, toggleSavedPhrase } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";
import {
  IconBook,
  IconLoop,
  IconPath,
  IconSnail,
  IconSpeaker,
  IconStar,
} from "./icons";

const PAGE = 8;
const order = allLessons.map((l) => l.id);

/**
 * The Feed layout of the Learn screen: story rings (continue, review, dialogue, phrasebook
 * situations), a "continue" card, then everyday phrases to listen to, save and share.
 */
export function LearnFeed({ onShowPath }: { onShowPath: () => void }) {
  const { progress, lang, update, t } = useStore();
  const { premium, unlockAll } = usePremium();
  const now = useNow(60_000);
  const day = dayNumber(now);
  const [only, setOnly] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [shared, setShared] = useState<string | null>(null);

  const next = continueLesson(
    allLessons,
    (id) => progress.lessons[id]?.times ?? 0,
    (id) => unlockAll || isUnlocked(order, id, progress),
    MAX_LEVEL
  );
  const nextUnit = next
    ? course.units.find((u) => u.lessons.some((l) => l.id === next.id))
    : undefined;
  const due = dueEntries(progress, now, 10, course).length;
  const story = course.units
    .map((u) =>
      u.story &&
      (unlockAll ||
        (u.lessons.length > 0 &&
          u.lessons.every((l) => progress.lessons[l.id]))) &&
      !progress.stories[u.story.id]
        ? u.story
        : null
    )
    .find(Boolean);

  const posts = useMemo(() => feedPosts(phrasebook, day, only), [day, only]);
  const catById = useMemo(() => new Map(phrasebook.map((c) => [c.id, c])), []);
  const saved = new Set(progress.savedPhrases);

  const share = async (id: string, text: string) => {
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setShared(id);
    } catch {
      // Cancelled.
    }
  };

  const ring =
    "relative grid h-16 w-16 place-items-center rounded-full p-[3px]";
  const live =
    "bg-[conic-gradient(var(--color-sun),var(--color-clay),var(--color-dusk),var(--color-sea),var(--color-sun))]";

  return (
    <div>
      <nav
        aria-label={t("feed.stories")}
        className="-mx-4 mb-4 overflow-x-auto px-4 pb-1"
      >
        <ul className="flex gap-3">
          {next ? (
            <li>
              <Link
                href={
                  canOpenLesson(next.id, premium)
                    ? `/lesson/${next.id}/`
                    : "/premium/"
                }
                className="flex w-16 flex-col items-center gap-1"
              >
                <span className={`${ring} ${live}`}>
                  <span className="grid h-full w-full place-items-center feed-card rounded-full border-2 border-sand text-sun">
                    <IconPath size={24} />
                  </span>
                </span>
                <span className="w-full truncate text-center text-xs font-bold text-night">
                  {t("feed.continue")}
                </span>
              </Link>
            </li>
          ) : null}
          {due > 0 ? (
            <li>
              <Link
                href="/review/"
                className="flex w-16 flex-col items-center gap-1"
              >
                <span className={`${ring} ${live}`}>
                  <span className="grid h-full w-full place-items-center rounded-full border-2 border-sand bg-sea text-white">
                    <IconLoop size={24} />
                  </span>
                </span>
                <span className="w-full truncate text-center text-xs font-bold text-night">
                  {t("feed.review", { n: due })}
                </span>
              </Link>
            </li>
          ) : null}
          {story ? (
            <li>
              <Link
                href={
                  canOpenStory(story.id, premium)
                    ? `/dialogue/${story.id}/`
                    : "/premium/"
                }
                className="flex w-16 flex-col items-center gap-1"
              >
                <span className={`${ring} ${live}`}>
                  <span className="grid h-full w-full place-items-center rounded-full border-2 border-sand bg-dusk text-white">
                    <IconBook size={24} />
                  </span>
                </span>
                <span className="w-full truncate text-center text-xs font-bold text-night">
                  {t("story.label")}
                </span>
              </Link>
            </li>
          ) : null}
          {phrasebook.map((c) => {
            const on = only === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setOnly(on ? null : c.id);
                    setShown(PAGE);
                  }}
                  className="flex w-16 flex-col items-center gap-1"
                >
                  <span className={`${ring} ${on ? live : "bg-sand-3"}`}>
                    <span
                      aria-hidden
                      className="grid h-full w-full place-items-center rounded-full border-2 border-sand bg-white text-2xl"
                    >
                      {c.emoji}
                    </span>
                  </span>
                  <span className="w-full truncate text-center text-xs text-muted">
                    {translate(c.title, lang)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {next && nextUnit && !only ? (
        <Link
          href={
            canOpenLesson(next.id, premium)
              ? `/lesson/${next.id}/`
              : "/premium/"
          }
          className="mb-6 flex items-center gap-3 feed-card rounded-3xl p-5 shadow-card active:translate-y-[2px]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-widest uppercase opacity-80">
              {translate(nextUnit.title, lang)}
            </span>
            <span className="block truncate font-display text-xl font-extrabold">
              {translate(next.title, lang)}
            </span>
          </span>
          <span className="rounded-2xl bg-sun px-4 py-2 font-display font-extrabold text-night">
            {progress.lessons[next.id] ? t("feed.levelUp") : t("path.start")}
          </span>
        </Link>
      ) : null}

      <ol className="space-y-8">
        {posts.slice(0, shown).map(({ entry, categoryId }, i) => {
          const cat = catById.get(categoryId)!;
          const isSaved = saved.has(entry.id);
          const tr = translate(entry.tr, lang);
          return (
            <li key={entry.id}>
              <article aria-label={`${entry.wo}: ${tr}`}>
                <header className="mb-2 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 place-items-center rounded-full bg-dusk-soft text-lg"
                  >
                    {cat.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-night">
                      {translate(cat.title, lang)}
                    </span>
                    <span className="block text-xs text-muted">
                      {i === 0 && !only
                        ? t("feed.phraseOfDay")
                        : t("feed.phrase")}
                    </span>
                  </span>
                </header>
                <div className="relative overflow-hidden feed-card rounded-[1.75rem] p-6 pt-24">
                  <span
                    aria-hidden
                    className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/5"
                  />
                  <span
                    aria-hidden
                    className={`absolute top-8 right-10 h-14 w-14 rounded-full ${
                      ["bg-sun", "bg-clay", "bg-sea", "bg-dusk"][i % 4]
                    }`}
                  />
                  <span
                    aria-hidden
                    className="weave absolute inset-x-0 top-28 h-3 opacity-60"
                  />
                  <p
                    lang="wo"
                    className="relative mt-6 font-display text-4xl leading-tight font-extrabold break-words"
                  >
                    {entry.wo}
                  </p>
                  <p className="relative mt-1 text-lg opacity-80">{tr}</p>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void playEntry(entry)}
                    aria-label={t("ex.play")}
                    className="grid h-11 w-11 place-items-center rounded-full text-night hover:bg-sand-2"
                  >
                    <IconSpeaker size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void playEntry(entry, { slow: true })}
                    aria-label={t("ex.slow")}
                    className="grid h-11 w-11 place-items-center rounded-full text-night hover:bg-sand-2"
                  >
                    <IconSnail size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void share(entry.id, `${entry.wo} = ${tr} · WolofLink`)
                    }
                    className="h-11 rounded-full px-3 text-sm font-bold text-night hover:bg-sand-2"
                  >
                    {shared === entry.id ? t("feed.shared") : t("feed.share")}
                  </button>
                  <button
                    type="button"
                    aria-pressed={isSaved}
                    aria-label={
                      isSaved ? t("phrases.saved") : t("phrases.save")
                    }
                    onClick={() =>
                      update((p) => toggleSavedPhrase(p, entry.id))
                    }
                    className={`ml-auto grid h-11 w-11 place-items-center rounded-full hover:bg-sand-2 ${
                      isSaved ? "text-sun-2" : "text-night"
                    }`}
                  >
                    <IconStar size={24} filled={isSaved} />
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      {shown < posts.length ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-6 min-h-12 w-full rounded-2xl border-2 border-sand-3 bg-white font-display font-extrabold text-night"
        >
          {t("feed.more")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onShowPath}
        className="mt-4 mb-2 min-h-12 w-full rounded-2xl font-bold text-clay underline"
      >
        {t("feed.showPath")}
      </button>
    </div>
  );
}
