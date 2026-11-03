// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

/** Shown in place of a feature the owner has paused from the console. */
export function Paused({ back = "/learn/" }: { back?: string }) {
  const { t } = useStore();
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <span aria-hidden className="text-5xl">
        ⏸️
      </span>
      <h1 className="font-display text-2xl font-extrabold text-night">{t("paused.title")}</h1>
      <p className="text-muted">{t("paused.body")}</p>
      <Link href={back} className="font-bold text-clay underline">
        {t("paused.back")}
      </Link>
    </main>
  );
}
