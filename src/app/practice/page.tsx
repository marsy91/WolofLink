// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { IconBook, IconCalendar, IconDialogue, IconDrop, IconHeadphones, IconLifebuoy, IconLoop, IconSpeaker } from "@/components/icons";
import { Pirogue } from "@/components/DuelRace";
import { TabScreen } from "@/components/ui";
import { allStories, course } from "@/content/course";
import { upcoming } from "@/content/calendar";
import { SURVIVAL_IDS, SURVIVAL_TITLE } from "@/content/survival";
import { translate } from "@/i18n";
import { useDateOverrides } from "@/lib/holidays";
import { dueEntries, MAX_DROPS, minutesToNextDrop, refreshDrops } from "@/lib/progress";
import { BOT_LEVELS } from "@/lib/duel-bot";
import { useSwitchOn } from "@/lib/notices";
import { usePremium } from "@/lib/premium-context";
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
  const overrides = useDateOverrides();
  const nextHoliday = upcoming(new Date(now), overrides)[0];
  const { unlockAll } = usePremium();
  const botOn = useSwitchOn("bot_duels");
  const openStories = allStories.filter(({ unit }) => unlockAll || unit.lessons.every((l) => progress.lessons[l.id]));

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
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-sun font-display font-extrabold text-night shadow-[0_2px_0_var(--color-sun-2)] active:translate-y-[2px] active:shadow-none"
          >
            {t("practice.start")}
          </Link>
        ) : null}
        <p className="mt-3 text-sm text-sand/75">{t("practice.refill")}</p>
      </section>

      {botOn ? (
        <section className="duel-sky relative mb-5 overflow-hidden rounded-3xl p-5 text-night" aria-labelledby="bot-h">
          <span aria-hidden className="duel-glow absolute inset-0" />
          <div className="relative mb-2 flex items-center gap-3">
            <span aria-hidden className="anim-bob shrink-0">
              <Pirogue hull="#c2502f" trim="#f2c14e" size={56} />
            </span>
            <h2 id="bot-h" className="text-glow-white font-display text-xl font-extrabold">
              {t("bot.title")}
            </h2>
          </div>
          <p className="relative mb-4 text-sm text-night/85">{t("bot.card")}</p>
          <div className="relative grid grid-cols-3 gap-2">
            {BOT_LEVELS.map((level) => (
              <Link key={level} href={`/duel/?bot=${level}`} className="btn-game rounded-xl px-2 py-2 text-center font-display text-sm font-extrabold uppercase">
                {t(`bot.level.${level}`)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-5 rounded-3xl border border-clay/30 bg-white p-5" aria-labelledby="survival-h">
        <h2 id="survival-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <IconLifebuoy size={22} className="text-clay" /> {translate(SURVIVAL_TITLE, lang)}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("survival.body", { n: SURVIVAL_IDS.length })}</p>
        <div className="flex gap-2">
          <Link
            href="/survival/"
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-clay font-display font-extrabold text-white shadow-[0_2px_0_var(--color-clay-2)] active:translate-y-[2px] active:shadow-none"
          >
            {t("survival.practise")}
          </Link>
          <Link
            href="/phrases/?show=survival"
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-sand-3 bg-white font-display font-extrabold text-night"
          >
            {t("survival.list")}
          </Link>
        </div>
      </section>

      <section className="mb-5 rounded-3xl border border-night/20 bg-white p-5" aria-labelledby="roleplay-h">
        <h2 id="roleplay-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <IconDialogue size={22} className="text-dusk" /> {t("roleplay.cardTitle")}
        </h2>
        <p className="mb-3 text-sm text-muted">{t("roleplay.card")}</p>
        {openStories.length ? (
          <ul className="space-y-2">
            {openStories.map(({ story }) => (
              <li key={story.id}>
                <Link
                  href={`/roleplay/${story.id}/`}
                  className="flex min-h-12 items-center justify-between rounded-2xl border border-sand-3 bg-white px-4 font-bold text-night"
                >
                  {translate(story.title, lang)} <span className="text-clay">{t("roleplay.start")} →</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("roleplay.none", { units: allStories.map(({ unit }) => course.units.indexOf(unit) + 1).join(", ") })}</p>
        )}
      </section>

      <section className="mb-5 rounded-3xl border border-sun/50 bg-sun-soft p-5" aria-labelledby="listen-h">
        <h2 id="listen-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <IconHeadphones size={22} className="text-sun-deep" /> {t("listen.cardTitle")}
        </h2>
        <p className="mb-4 text-sm text-night/80">{t("listen.card")}</p>
        <Link
          href="/listen/"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-night font-display font-extrabold text-sand"
        >
          {t("listen.open")}
        </Link>
      </section>

      <section className="mb-5 rounded-3xl border border-sea/30 bg-white p-5" aria-labelledby="guide-h">
        <h2 id="guide-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <IconBook size={22} className="text-sea" /> {t("guide.cardTitle")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("guide.card")}</p>
        <Link
          href="/guide/"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-sand-3 bg-white font-display font-extrabold text-night"
        >
          {t("guide.open")}
        </Link>
      </section>

      <section className="mb-5 rounded-3xl border border-dusk/30 bg-white p-5" aria-labelledby="sounds-h">
        <h2 id="sounds-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <IconSpeaker size={22} className="text-dusk" /> {t("sounds.title")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("sounds.card")}</p>
        <Link
          href="/sounds/"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-sand-3 bg-white font-display font-extrabold text-night"
        >
          {t("sounds.open")}
        </Link>
      </section>

      <section className="mb-5 rounded-3xl border border-sea/30 bg-white p-5" aria-labelledby="cal-h">
        <h2 id="cal-h" className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold text-night">
          <IconCalendar size={22} className="text-sea" /> {t("cal.title")}
        </h2>
        {nextHoliday ? (
          <p className="mb-1 font-bold text-sea">
            {t("cal.next", { name: translate(nextHoliday.holiday.title, lang) })} ·{" "}
            {nextHoliday.ongoing
              ? t("cal.now")
              : nextHoliday.daysAway === 0
                ? t("cal.today")
                : nextHoliday.daysAway === 1
                  ? t("cal.tomorrow")
                  : t("cal.inDays", { n: nextHoliday.daysAway })}
          </p>
        ) : null}
        <p className="mb-4 text-sm text-muted">{t("cal.card")}</p>
        <Link
          href="/calendar/"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-sand-3 bg-white font-display font-extrabold text-night"
        >
          {t("cal.open")}
        </Link>
      </section>

      <section className="mb-5 rounded-3xl bg-white p-5 shadow-card" aria-labelledby="drops-h">
        <h2 id="drops-h" className="mb-2 font-display text-lg font-extrabold text-night">
          {t("drops.title")}
        </h2>
        <div className="mb-2 flex gap-1.5 text-sea" role="img" aria-label={t("stats.drops", { n: fresh.drops.count })}>
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
                <li key={id} className="rounded-2xl border border-sand-3 bg-white p-3">
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
