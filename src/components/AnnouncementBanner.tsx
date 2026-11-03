// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { translate } from "@/i18n";
import { dismiss, dismissedIds, useNotices } from "@/lib/notices";
import { useStore } from "@/lib/store";

/** Owner announcements on the Learn screen; each can be closed and stays closed. */
export function AnnouncementBanner() {
  const { lang, t } = useStore();
  const { announcements } = useNotices();
  const [hidden, setHidden] = useState<string[] | null>(null);
  useEffect(() => {
    void Promise.resolve().then(() => setHidden(dismissedIds()));
  }, []);
  if (!hidden) return null;
  const shown = announcements.filter((a) => !hidden.includes(a.id));
  if (!shown.length) return null;
  return (
    <>
      {shown.map((a) => (
        <section key={a.id} aria-label={t("notice.label")} className="mb-4 flex items-start gap-3 rounded-3xl border-2 border-sea/40 bg-sea-soft p-4">
          <span aria-hidden className="text-2xl leading-none">
            📣
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight font-extrabold text-night">{translate(a.title, lang)}</p>
            {a.message ? <p className="mt-1 text-sm text-night/90">{translate(a.message, lang)}</p> : null}
          </div>
          <button
            type="button"
            aria-label={t("notice.dismiss")}
            onClick={() => {
              dismiss(a.id);
              setHidden((h) => [...(h ?? []), a.id]);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted"
          >
            ✕
          </button>
        </section>
      ))}
    </>
  );
}
