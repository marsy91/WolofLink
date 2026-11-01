// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** Text helpers for the Holidays screen and its notifications. */
import type { Occurrence } from "@/content/calendar";
import type { UiLang } from "@/content/types";
import { t as tr, translate } from "@/i18n";

export function formatHolidayDate(iso: string, lang: UiLang): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y!, m! - 1, d!)),
  );
}

/** Notification texts for every upcoming date, in the interface language. */
export function reminderItems(list: Occurrence[], lang: UiLang) {
  return list
    .filter((o) => o.daysAway >= 1)
    .map((o) => {
      const name = translate(o.holiday.title, lang);
      return {
        date: o.date,
        title: tr(lang, o.status === "expected" ? "cal.nTitleExpected" : "cal.nTitle", { name }),
        body: tr(lang, "cal.nBody"),
      };
    });
}
