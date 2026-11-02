// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "@/lib/account";
import { friends } from "@/lib/friends";
import { useStore } from "@/lib/store";

let checkedThisSession = false;

/** "Awa nudged you": shown once on the Learn screen when friends sent a nudge. */
export function NudgeBanner() {
  const { t } = useStore();
  const { user } = useAccount();
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    if (!user || checkedThisSession) return;
    checkedThisSession = true;
    let alive = true;
    friends
      .myNudges()
      .then((rows) => alive && setNames([...new Set(rows.map((r) => r.from_name))]))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);
  if (!names.length) return null;
  const who = names.length === 1 ? names[0]! : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
  return (
    <section role="status" className="mb-4 flex items-center gap-3 rounded-3xl border-2 border-sea/30 bg-sea-soft p-4">
      <span aria-hidden className="text-3xl">
        👋
      </span>
      <p className="min-w-0 flex-1 font-bold text-night">{t("friends.nudgedYou", { name: who })}</p>
      <Link href="/friends/" className="text-sm font-bold text-sea underline">
        {t("friends.see")}
      </Link>
      <button type="button" aria-label={t("common.close")} onClick={() => setNames([])} className="text-muted">
        ✕
      </button>
    </section>
  );
}
