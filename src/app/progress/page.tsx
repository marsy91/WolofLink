// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { IconCap } from "@/components/icons";
import { ProgressBar, TabScreen } from "@/components/ui";
import { course } from "@/content/course";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { currentLevel, lastWeek, levels, unitDone, wordCounts } from "@/lib/insights";
import { currentStreak } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";

/** The learner's own progress: level, words, the week, and certificates. */
export default function ProgressPage() {
  const { progress, lang, t } = useStore();
  const now = useNow(60_000);
  const level = currentLevel(progress);
  const all = levels(progress);
  const words = wordCounts(progress);
  const week = lastWeek(progress, now);
  const max = Math.max(10, ...week.map((d) => d.xp));
  const done = course.units.filter((u) => unitDone(progress, u.id));

  return (
    <TabScreen title={t("insights.title")}>
      <section className="mb-4 rounded-3xl bg-night p-5 text-sand">
        <p className="text-sm font-bold text-sand/70">{t("insights.workingOn")}</p>
        <p className="mb-3 font-display text-2xl font-extrabold">{t(`insights.${level.id}`)}</p>
        <ProgressBar value={level.done / Math.max(1, level.total)} label={t(`insights.${level.id}`)} />
        <p className="mt-2 text-sm text-sand/80">{t("insights.units", { n: level.done, total: level.total })}</p>
      </section>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {(
          [
            [t("insights.strong"), words.strong],
            [t("insights.learning"), words.learning],
            [t("insights.streak"), currentStreak(progress, now)],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-sand-3 bg-white p-3 text-center">
            <p className="font-display text-2xl font-extrabold text-night">{n}</p>
            <p className="text-xs font-bold text-muted">{label}</p>
          </div>
        ))}
      </div>

      <section className="mb-4 rounded-3xl border border-sand-3 bg-white p-4" aria-labelledby="week-h">
        <h2 id="week-h" className="mb-3 font-display text-lg font-extrabold text-night">{t("insights.week")}</h2>
        <div className="flex h-28 items-end gap-2" role="img" aria-label={t("insights.weekLabel", { n: week.reduce((s, d) => s + d.xp, 0) })}>
          {week.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-sun" style={{ height: `${Math.max(4, (d.xp / max) * 96)}px` }} />
              <span className="text-[10px] font-bold text-muted">
                {new Date(`${d.day}T12:00:00`).toLocaleDateString(lang, { weekday: "narrow" })}
              </span>
            </div>
          ))}
        </div>
      </section>

      {words.tricky.length ? (
        <section className="mb-4 rounded-3xl border-2 border-berry/30 bg-white p-4" aria-labelledby="tricky-h">
          <h2 id="tricky-h" className="mb-1 font-display text-lg font-extrabold text-night">{t("insights.tricky")}</h2>
          <p className="mb-3 text-sm text-muted">{t("insights.trickyHint")}</p>
          <ul className="mb-3 flex flex-wrap gap-2">
            {words.tricky.map((id) => {
              const e = course.entries[id]!;
              return (
                <li key={id}>
                  <button type="button" onClick={() => void playEntry(e)} className="rounded-full bg-berry-soft px-3 py-1.5 text-sm font-bold text-berry">
                    <span lang="wo">{e.wo}</span> <span className="font-normal">· {translate(e.tr, lang)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link href="/review/" className="font-bold text-clay underline">
            {t("practice.start")}
          </Link>
        </section>
      ) : null}

      <section className="mb-4 rounded-3xl border border-sand-3 bg-white p-4" aria-labelledby="cando-h">
        <h2 id="cando-h" className="mb-2 font-display text-lg font-extrabold text-night">{t("insights.canDo")}</h2>
        {done.length ? (
          <ul className="space-y-1">
            {done.map((u) => (
              <li key={u.id} className="flex gap-2 text-night">
                <span className="text-sea" aria-hidden>
                  ✓
                </span>
                {translate(u.title, lang)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("insights.canDoNone")}</p>
        )}
      </section>

      <section className="mb-4 rounded-3xl border border-sun/50 bg-sun-soft p-4" aria-labelledby="cert-h">
        <h2 id="cert-h" className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-night"><IconCap size={22} className="text-sun-deep" /> {t("insights.certificates")}</h2>
        <ul className="space-y-2">
          {all.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3">
              <span className="font-bold text-night">{t(`insights.${l.id}`)}</span>
              {l.complete ? (
                <Link href={`/certificate/?level=${l.id}`} className="rounded-xl bg-night px-3 py-2 text-sm font-extrabold text-sand">
                  {t("insights.view")}
                </Link>
              ) : (
                <span className="text-sm text-muted">{t("insights.units", { n: l.done, total: l.total })}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </TabScreen>
  );
}
