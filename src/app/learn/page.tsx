"use client";

import Link from "next/link";
import { IconCheck, IconLock, UNIT_GLYPHS } from "@/components/icons";
import { ProgressBar, TabScreen } from "@/components/ui";
import { allLessons, course } from "@/content/course";
import type { Unit } from "@/content/types";
import { translate } from "@/i18n";
import { dailyGoal, isUnlocked, xpToday } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";

const TONES: Record<Unit["tone"], string> = {
  sun: "bg-[#94600f] text-white",
  clay: "bg-clay text-white",
  sea: "bg-sea text-white",
  dusk: "bg-dusk text-white",
};

const order = allLessons.map((l) => l.id);

export default function Learn() {
  const { progress, lang, t } = useStore();
  const now = useNow();
  const today = xpToday(progress, now);
  const goal = dailyGoal(progress);
  const name = progress.profile?.name;

  return (
    <TabScreen>
      <section className="mb-6 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
        <p className="mb-1 font-display text-xl font-extrabold text-night">
          {name ? `Salaam aleekum, ${name}!` : "Salaam aleekum!"}
        </p>
        <p className="mb-3 text-sm text-muted">
          {today >= goal ? t("goal.met") : t("goal.progress", { x: today, y: goal })}
        </p>
        <ProgressBar value={today / goal} label={t("goal.progress", { x: today, y: goal })} />
      </section>

      <ol className="space-y-6">
        {course.units.map((unit, ui) => {
          const Glyph = UNIT_GLYPHS[unit.glyph];
          const planned = unit.lessons.length === 0;
          return (
            <li key={unit.id}>
              <div
                className={`weave relative mb-3 flex items-center gap-3 overflow-hidden rounded-3xl p-4 ${
                  planned ? "bg-sand-3 text-muted" : TONES[unit.tone]
                }`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20">
                  <Glyph size={28} />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase opacity-90">{t("path.unit", { n: ui + 1 })}</p>
                  <h2 className="font-display text-xl leading-tight font-extrabold">{translate(unit.title, lang)}</h2>
                  {planned ? <p className="text-sm font-bold">{t("path.comingSoon")}</p> : null}
                </div>
              </div>

              {!planned && (
                <ol className="relative ml-6 space-y-3 border-l-4 border-dashed border-sand-3 pl-6">
                  {unit.lessons.map((lesson) => {
                    const record = progress.lessons[lesson.id];
                    const unlocked = isUnlocked(order, lesson.id, progress);
                    const done = !!record;
                    return (
                      <li key={lesson.id} className="relative">
                        <span
                          aria-hidden
                          className={`absolute top-1/2 -left-[2.4rem] grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border-4 border-sand ${
                            done ? "bg-sea text-white" : unlocked ? "bg-sun text-night" : "bg-sand-3 text-muted"
                          }`}
                        >
                          {done ? <IconCheck size={14} /> : !unlocked ? <IconLock size={12} /> : null}
                        </span>
                        {unlocked ? (
                          <Link
                            href={`/lesson/${lesson.id}/`}
                            className="flex items-center gap-3 rounded-2xl border-2 border-sand-3 bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)] transition active:translate-y-[2px] active:shadow-none"
                          >
                            <div className="flex-1">
                              <h3 className="font-display text-lg font-extrabold text-night">{translate(lesson.title, lang)}</h3>
                              <p className="text-sm text-muted">
                                {done
                                  ? `${t("path.done")} · ${Math.round(record.bestAccuracy * 100)}%`
                                  : t("path.exercises", { n: lesson.exercises.length })}
                              </p>
                            </div>
                            <span
                              className={`rounded-xl px-3 py-2 font-display text-sm font-extrabold ${
                                done ? "bg-sea-soft text-sea" : "bg-clay text-white"
                              }`}
                            >
                              {done ? t("path.again") : t("path.start")}
                            </span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-sand-3 p-4 text-muted">
                            <div className="flex-1">
                              <h3 className="font-display text-lg font-extrabold">{translate(lesson.title, lang)}</h3>
                              <p className="text-sm">{t("path.locked")}</p>
                            </div>
                            <IconLock />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </TabScreen>
  );
}
