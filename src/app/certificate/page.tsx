// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Loading } from "@/components/ui";
import { course } from "@/content/course";
import { LEVELS, levels, type LevelId } from "@/lib/insights";
import { CEFR_LEVELS } from "@/lib/levels";
import { useStore } from "@/lib/store";

/** A certificate for a completed level, to screenshot, print or show an employer. */
export default function CertificatePage() {
  const { progress, lang, t } = useStore();
  const [id, setId] = useState<LevelId | null | undefined>(undefined);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("level");
    void Promise.resolve().then(() => setId(LEVELS.some((l) => l.id === q) ? (q as LevelId) : null));
  }, []);
  if (id === undefined) return <Loading />;
  const state = levels(progress).find((l) => l.id === id);
  // Passing the level test earns the certificate too (learners who already speak some Wolof).
  const cefr = CEFR_LEVELS.find((c) => c.insights === id);
  const test = cefr ? progress.levelTests?.[cefr.id] : undefined;
  const testPassed = !!test?.passedAt;
  if (!id || !(state?.complete || testPassed)) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="mb-3 text-muted">{t("cert.notYet")}</p>
          <Link href="/progress/" className="font-bold text-clay underline">
            {t("insights.title")}
          </Link>
        </div>
      </main>
    );
  }
  const units = LEVELS.find((l) => l.id === id)!.units;
  const lessons = course.units.filter((u) => units.includes(u.id)).flatMap((u) => u.lessons);
  const finished = Math.max(...lessons.map((l) => progress.lessons[l.id]?.lastAt ?? 0), test?.passedAt ?? 0);
  const date = new Date(finished).toLocaleDateString(lang, { dateStyle: "long" });
  const canPrint = typeof window !== "undefined" && typeof window.print === "function" && !("Capacitor" in window && (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 py-8">
      <article className="rounded-[2rem] border-8 border-double border-sun bg-white p-6 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <LogoMark size={56} />
        </div>
        <p className="text-xs font-bold tracking-[0.25em] text-clay uppercase">{t("cert.heading")}</p>
        <p className="mt-4 text-muted">{t("cert.awardedTo")}</p>
        <p className="font-display text-3xl font-extrabold text-night">{progress.profile?.name || "—"}</p>
        <p className="mt-4 text-muted">{t("cert.forCompleting")}</p>
        <p className="font-display text-xl font-extrabold text-night">{t(`insights.${id}`)}</p>
        <p className="mt-2 text-sm text-muted">{t("cert.detail", { units: units.length, lessons: lessons.length })}</p>
        {testPassed && cefr ? (
          <p className="mt-2 text-sm font-bold text-sea">{t("leveltest.certLine", { n: Math.round(test!.best * 100), level: cefr.cefr })}</p>
        ) : null}
        <p className="mt-4 font-bold text-night">{date}</p>
        <p className="mt-6 text-[11px] leading-snug text-muted">{t("cert.note")}</p>
      </article>
      <p className="mt-4 text-center text-sm text-muted">{t("cert.share")}</p>
      <div className="mt-3 flex justify-center gap-4 print:hidden">
        {canPrint ? (
          <button type="button" onClick={() => window.print()} className="font-bold text-clay underline">
            {t("cert.print")}
          </button>
        ) : null}
        <Link href="/progress/" className="font-bold text-clay underline">
          {t("common.close")}
        </Link>
      </div>
    </main>
  );
}
