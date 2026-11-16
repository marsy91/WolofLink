// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import type { UiLang } from "@/content/types";
import { t, type UiKey } from "@/i18n";
import { readSafetyLang } from "@/lib/safety-lang";

/**
 * The screen shown when something goes wrong: a crash (`kind="crash"`, with "Try again") or a
 * page that doesn't exist (`kind="missing"`). It uses no app context, so it still works when the
 * store or a provider is what broke. "Back to lessons" reloads the app fresh, which clears any
 * broken state; saved progress is on the phone and isn't touched.
 */
export function SafetyScreen({ kind, onRetry }: { kind: "crash" | "missing"; onRetry?: () => void }) {
  const [lang, setLang] = useState<UiLang>("en");
  useEffect(() => setLang(readSafetyLang()), []);
  const tr = (key: UiKey) => t(lang, key);
  const crash = kind === "crash";

  return (
    <main lang={lang} className="grid min-h-dvh place-items-center bg-sand px-6 py-10 text-center">
      <div className="w-full max-w-sm">
        <LogoMark size={88} className="mx-auto mb-6" />
        <h1 className="mb-3 font-display text-3xl font-extrabold text-night">
          {tr(crash ? "oops.crashTitle" : "oops.missingTitle")}
        </h1>
        <p className="mb-8 text-base text-muted">{tr(crash ? "oops.crashBody" : "oops.missingBody")}</p>
        <div className="flex flex-col gap-3">
          {crash && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-night px-5 py-3 font-display text-base font-extrabold tracking-wide text-white active:translate-y-[2px]"
            >
              {tr("oops.retry")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 font-display text-base font-extrabold tracking-wide ${
              crash && onRetry ? "bg-transparent text-night underline-offset-4 hover:underline" : "bg-night text-white"
            }`}
          >
            {tr("oops.home")}
          </button>
        </div>
      </div>
    </main>
  );
}
