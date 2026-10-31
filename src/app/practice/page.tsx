// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { IconDrop, IconLoop } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import { course } from "@/content/course";
import { SURVIVAL_IDS, SURVIVAL_TITLE } from "@/content/survival";
import { translate } from "@/i18n";
import { dueEntries, MAX_DROPS, minutesToNextDrop, refreshDrops } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";

export default function Practice() {
  const { progress, lang, t } = useStore();
  const now = useNow();
  const due = dueEntries(progress, now, 50);
  // Mirrors LessonPlayer: due cards first, otherwise recent mistakes; 10 per session.
  const reviewSize = Math.min(10, due.length || progress.recentMistakes.length);
  const canReview = reviewSize > 0;
  const fresh = refreshDrops(progress, now);
  const mins = minutesToNextDrop(fresh, now);
  const learned = Object.keys(progress.srs).length;

  return (
    <TabScreen title={t("practice.title")}>
      <section className="mb-5 rounded-3xl bg-night p-5 text-sand">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sun">
            <IconLoop size={28} />
          </span>
          <p className="font-display text-xl font-extrabold">
            {canReview ? t("practice.due", { n: reviewSize }) : t("practice.title")}
          </p>
        </div>
        <p className="mb-4 text-sand/85">{canReview ? t("practice.body") : t("practice.none")}</p>
        {canReview ? (
          <Link
            href="/review/"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-sun font-display font-extrabold text-night shadow-[0_4px_0_var(--color-sun-2)] active:translate-y-[3px] active:shadow-none"
          >
            {t("practice.start")}
          </Link>
        ) : null}
        <p className="mt-3 text-sm text-sand/75">{t("practice.refill")}</p>
      </section>

      <section className="mb-5 rounded-3xl border-2 border-clay/30 bg-white p-5" aria-labelledby="survival-h">
        <h2 id="survival-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <span aria-hidden>🆘</span> {translate(SURVIVAL_TITLE, lang)}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("survival.body", { n: SURVIVAL_IDS.length })}</p>
        <div className="flex gap-2">
          <Link
            href="/survival/"
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-clay font-display font-extrabold text-white shadow-[0_4px_0_var(--color-clay-2)] active:translate-y-[3px] active:shadow-none"
          >
            {t("survival.practise")}
          </Link>
          <Link
            href="/phrases/?show=survival"
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl border-2 border-sand-3 bg-white font-display font-extrabold text-night"
          >
            {t("survival.list")}
          </Link>
        </div>
      </section>

      <section className="mb-5 rounded-3xl bg-white p-5 shadow-[0_3px_0_var(--color-sand-3)]" aria-labelledby="drops-h">
        <h2 id="drops-h" className="mb-2 font-display text-lg font-extrabold text-night">
          {t("drops.title")}
        </h2>
        <div className="mb-2 flex gap-1.5 text-sea" aria-label={t("stats.drops", { n: fresh.drops.count })}>
          {Array.from({ length: MAX_DROPS }, (_, i) => (
            <IconDrop key={i} size={30} filled={i < fresh.drops.count} className={i < fresh.drops.count ? "" : "text-sand-3"} />
          ))}
        </div>
        <p className="text-sm font-bold text-sea">{mins ? t("drops.next", { n: mins }) : t("drops.full")}</p>
        <p className="mt-2 text-sm text-muted">{t("drops.explain")}</p>
      </section>

      <p className="mb-3 text-sm font-bold text-muted">{t("practice.learned", { n: learned })}</p>

      {progress.recentMistakes.length > 0 ? (
        <section aria-labelledby="mistakes-h">
          <h2 id="mistakes-h" className="mb-2 font-display text-lg font-extrabold text-night">
            {t("practice.mistakes")}
          </h2>
          <ul className="space-y-2">
            {progress.recentMistakes.slice(0, 8).map((id) => {
              const entry = course.entries[id];
              if (!entry) return null;
              return (
                <li key={id} className="rounded-2xl border-2 border-sand-3 bg-white p-3">
                  <span lang="wo" className="block font-display font-extrabold text-night">
                    {entry.wo}
                  </span>
                  <span className="text-muted">{translate(entry.tr, lang)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </TabScreen>
  );
}
