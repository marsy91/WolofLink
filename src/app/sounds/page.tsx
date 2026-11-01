// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { IconSpeaker } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import { course } from "@/content/course";
import { SOUNDS } from "@/content/sounds";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { useStore } from "@/lib/store";

export default function SoundsPage() {
  const { lang, t } = useStore();
  return (
    <TabScreen title={t("sounds.title")}>
      <p className="mb-4 text-muted">{t("sounds.intro")}</p>
      <ul className="space-y-3">
        {SOUNDS.map((s) => (
          <li key={s.id} id={`sound-${s.id}`} className="scroll-mt-24 rounded-3xl border-2 border-sand-3 bg-white p-4">
            <p lang="wo" className="font-display text-2xl font-extrabold text-clay">
              {s.label}
            </p>
            <p className="mb-2 text-night">{translate(s.how, lang)}</p>
            <div className="flex flex-wrap gap-2">
              {s.examples
                .map((id) => course.entries[id])
                .filter((e) => !!e)
                .map((e) => (
                  <button
                    key={e!.id}
                    type="button"
                    onClick={() => void playEntry(e!)}
                    className="flex items-center gap-1.5 rounded-full bg-sea-soft px-3 py-1.5 text-sm font-bold text-sea"
                    aria-label={`${t("ex.play")}: ${e!.wo}`}
                  >
                    <IconSpeaker size={16} />
                    <span lang="wo">{e!.wo}</span>
                    <span className="font-normal text-muted">· {translate(e!.tr, lang)}</span>
                  </button>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </TabScreen>
  );
}
