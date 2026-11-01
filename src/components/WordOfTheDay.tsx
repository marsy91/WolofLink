// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { wordOfTheDay } from "@/content/word-of-day";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { useNow, useStore } from "@/lib/store";
import { IconSpeaker } from "./icons";

/** A word or short phrase a day on the Learn screen, the same for everyone. */
export function WordOfTheDay() {
  const { lang, t } = useStore();
  const now = useNow(10 * 60_000);
  const e = wordOfTheDay(new Date(now));
  return (
    <section className="mb-6 flex items-center gap-3 rounded-3xl border-2 border-sun/40 bg-sun-soft p-4" aria-labelledby="wotd-h">
      <button
        type="button"
        onClick={() => void playEntry(e)}
        aria-label={`${t("ex.play")}: ${e.wo}`}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night text-sun"
      >
        <IconSpeaker size={22} />
      </button>
      <div className="min-w-0">
        <p id="wotd-h" className="text-xs font-bold tracking-widest text-muted uppercase">
          {t("wotd.title")}
        </p>
        <p lang="wo" className="font-display text-xl leading-tight font-extrabold text-night">
          {e.wo}
        </p>
        <p className="text-sm text-muted">{translate(e.tr, lang)}</p>
      </div>
    </section>
  );
}
