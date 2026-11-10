// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useState } from "react";
import { IconInfo } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import { allLessons } from "@/content/course";
import { guide } from "@/lib/guide";
import { usePremium } from "@/lib/premium-context";
import { isUnlocked } from "@/lib/progress";
import { useStore } from "@/lib/store";

/** Every grammar and culture tip from the lessons, in one place. */
export default function GuidePage() {
  const { lang, progress, t } = useStore();
  const { unlockAll } = usePremium();
  const [query, setQuery] = useState("");
  const order = allLessons.map((l) => l.id);
  const units = guide(lang, query);
  return (
    <TabScreen title={t("guide.title")}>
      <p className="mb-3 text-muted">{t("guide.intro")}</p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("guide.search")}
        aria-label={t("guide.search")}
        className="mb-4 w-full rounded-2xl border border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay"
      />
      {units.length === 0 ? <p className="rounded-2xl bg-white p-4 text-muted">{t("guide.none")}</p> : null}
      {units.map((u) => (
        <section key={u.unitId} className="mb-5">
          <h2 className="mb-2 font-display text-lg font-extrabold text-night">
            {t("path.unit", { n: u.number })} · {u.title}
          </h2>
          <ul className="space-y-2">
            {u.tips.map((tip) => (
              <li key={tip.lessonId} className="rounded-2xl border border-sand-3 bg-white p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-clay">
                  <IconInfo size={16} /> {tip.lesson}
                </p>
                <p className="leading-relaxed text-night">{tip.text}</p>
                {unlockAll || isUnlocked(order, tip.lessonId, progress) ? (
                  <Link href={`/lesson/${tip.lessonId}/`} className="mt-2 inline-block text-sm font-bold text-sea underline">
                    {t("guide.practise")}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </TabScreen>
  );
}
