// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useMemo, useState } from "react";
import { IconSpeaker } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import { upcoming, type Occurrence } from "@/content/calendar";
import { course } from "@/content/course";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { formatHolidayDate, reminderItems } from "@/lib/holiday-text";
import { useDateOverrides } from "@/lib/holidays";
import { remindersSupported, syncHolidayReminders, type ReminderResult } from "@/lib/native";
import { useNow, useStore } from "@/lib/store";

export default function CalendarPage() {
  const { progress, lang, update, t } = useStore();
  const now = useNow(60_000);
  const overrides = useDateOverrides();
  const list = useMemo(() => upcoming(new Date(now), overrides), [now, overrides]);
  const [open, setOpen] = useState<string | null>(null);
  const [remindState, setRemindState] = useState<ReminderResult | null>(null);
  const remindOn = progress.settings.holidayReminders === true;

  // Keep scheduled notifications in step with corrected dates and the interface language.
  const signature = list.map((o) => `${o.holiday.id}${o.date}${o.status}`).join("|") + lang;
  useEffect(() => {
    if (!remindOn) return;
    void syncHolidayReminders({ enabled: true, items: reminderItems(list, lang) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remindOn, signature]);

  const setRemind = async (enabled: boolean) => {
    const result = await syncHolidayReminders({ enabled, items: reminderItems(list, lang) });
    setRemindState(result);
    update((p) => ({ ...p, settings: { ...p.settings, holidayReminders: enabled && result === "scheduled" } }));
  };

  const when = (o: Occurrence) =>
    o.ongoing ? t("cal.now") : o.daysAway === 0 ? t("cal.today") : o.daysAway === 1 ? t("cal.tomorrow") : t("cal.inDays", { n: o.daysAway });
  const hasExpected = list.some((o) => o.status === "expected");

  return (
    <TabScreen title={t("cal.title")}>
      {remindersSupported() ? (
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
          <label className="flex items-center justify-between gap-4">
            <span className="font-bold">{t("cal.remind")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={remindOn}
              onClick={() => void setRemind(!remindOn)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${remindOn ? "bg-sea" : "bg-sand-3"}`}
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${remindOn ? "left-7" : "left-1"}`} />
            </button>
          </label>
          {remindState === "denied" ? <p className="mt-2 text-sm font-bold text-clay">{t("remind.denied")}</p> : null}
        </section>
      ) : null}

      <ul className="space-y-3">
        {list.map((o) => {
          const key = `${o.holiday.id}:${o.date}`;
          const expanded = open === key;
          const words = o.holiday.words.map((id) => course.entries[id]).filter((e) => !!e);
          return (
            <li key={key} className="rounded-3xl border-2 border-sand-3 bg-white">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : key)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <span aria-hidden className="text-3xl leading-none">
                  {o.holiday.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-extrabold text-night">{translate(o.holiday.title, lang)}</span>
                  <span className="block text-sm text-muted">{formatHolidayDate(o.date, lang)}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-bold">
                    <span className="rounded-full bg-night px-2 py-0.5 text-sand">{when(o)}</span>
                    {o.status === "expected" ? (
                      <span className="rounded-full bg-sun/30 px-2 py-0.5 text-night">{t("cal.expected")}</span>
                    ) : o.status === "confirmed" ? (
                      <span className="rounded-full bg-sea/15 px-2 py-0.5 text-sea">{t("cal.confirmed")}</span>
                    ) : null}
                    {o.holiday.publicHoliday ? (
                      <span className="rounded-full bg-clay/15 px-2 py-0.5 text-clay">{t("cal.publicHoliday")}</span>
                    ) : null}
                  </span>
                </span>
              </button>
              {expanded ? (
                <div className="border-t-2 border-sand-3 px-4 pt-3 pb-4">
                  <p className="text-night">{translate(o.holiday.about, lang)}</p>
                  {words.length ? (
                    <>
                      <h3 className="mt-3 mb-1 text-sm font-extrabold text-muted">{t("cal.words")}</h3>
                      <ul className="divide-y divide-sand-3">
                        {words.map((e) => (
                          <li key={e!.id} className="flex items-center gap-3 py-2">
                            <button
                              type="button"
                              aria-label={t("ex.play")}
                              onClick={() => void playEntry(e!)}
                              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sea/10 text-sea"
                            >
                              <IconSpeaker size={20} />
                            </button>
                            <span className="min-w-0">
                              <span lang="wo" className="block font-display font-extrabold text-night">
                                {e!.wo}
                              </span>
                              <span className="text-sm text-muted">{translate(e!.tr, lang)}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {hasExpected ? <p className="mt-4 text-sm text-muted">{t("cal.expectedNote")}</p> : null}
    </TabScreen>
  );
}
