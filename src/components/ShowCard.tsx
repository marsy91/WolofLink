// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useRef } from "react";
import type { Entry } from "@/content/types";
import { translate } from "@/i18n";
import { playEntry } from "@/lib/audio";
import { useStore } from "@/lib/store";
import { IconClose, IconSnail, IconSpeaker } from "./icons";

/** Font size that keeps the phrase on screen: very big for short phrases, smaller for long ones. */
export function showSize(text: string): string {
  const n = text.length;
  if (n <= 12) return "text-6xl";
  if (n <= 24) return "text-5xl";
  if (n <= 40) return "text-4xl";
  return "text-3xl";
}

/**
 * "Show it" card: the phrase full screen in huge letters, for holding the phone up
 * to a taxi driver or a shopkeeper, with the audio played out loud.
 */
export function ShowCard({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { lang, t } = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    void playEntry(entry);
  }, [entry]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={entry.wo}
      className="splash m-0 h-dvh max-h-none w-screen max-w-none bg-night p-0 text-sand backdrop:bg-night"
    >
      <div className="safe-top safe-bottom flex h-full flex-col">
        <div className="flex justify-end p-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={t("common.close")}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10"
          >
            <IconClose />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <p lang="wo" className={`font-display leading-tight font-extrabold break-words ${showSize(entry.wo)}`}>
            {entry.wo}
          </p>
          <p className="text-lg text-sand/75">{translate(entry.tr, lang)}</p>
        </div>
        <div className="flex justify-center gap-4 p-6">
          <button
            type="button"
            onClick={() => void playEntry(entry)}
            aria-label={t("ex.play")}
            className="grid h-20 w-20 place-items-center rounded-full bg-sun text-night shadow-lg"
          >
            <IconSpeaker size={36} />
          </button>
          <button
            type="button"
            onClick={() => void playEntry(entry, { slow: true })}
            aria-label={t("ex.slow")}
            className="grid h-20 w-20 place-items-center rounded-full bg-white/15 text-sand"
          >
            <IconSnail size={32} />
          </button>
        </div>
        <p className="px-6 pb-6 text-center text-sm text-sand/70">{t("show.hint")}</p>
      </div>
    </dialog>
  );
}
