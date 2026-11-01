// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { course } from "@/content/course";
import { LOOK_EMOJI } from "@/content/seasons";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { useSeason } from "@/lib/seasons";
import { useStore } from "@/lib/store";
import { IconSpeaker } from "./icons";

/** Banner on the Learn screen while a holiday or an owner-scheduled event is on. */
export function SeasonBanner() {
  const { lang, t } = useStore();
  const season = useSeason();
  if (!season) return null;
  const words = season.words.map((id) => course.entries[id]).filter((e) => !!e).slice(0, 2);
  return (
    <section className={`season-${season.look} mb-4 rounded-3xl p-4 shadow-md`} aria-label={translate(season.title, lang)}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-3xl leading-none">
          {season.holiday?.emoji ?? LOOK_EMOJI[season.look]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-widest uppercase opacity-85">{t("season.now")}</p>
          <p className="font-display text-xl leading-tight font-extrabold">{translate(season.title, lang)}</p>
          {season.message ? <p className="mt-1 text-sm opacity-95">{translate(season.message, lang)}</p> : null}
        </div>
      </div>
      {words.length || season.holiday ? (
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
            </button>
          ))}
          {season.holiday ? (
            <Link href="/calendar/" className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-extrabold text-night">
              {t("season.more")}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
