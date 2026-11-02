// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "@/lib/account";
import { duelState, duels } from "@/lib/duels";
import { friends } from "@/lib/friends";
import { useStore } from "@/lib/store";

let checkedThisSession = false;

/** "Awa nudged you" and "your turn in a duel": shown on the Learn screen (checked once per session). */
export function NudgeBanner() {
  const { t } = useStore();
  const { user } = useAccount();
  const [names, setNames] = useState<string[]>([]);
  const [turns, setTurns] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!user || checkedThisSession) return;
    checkedThisSession = true;
    let alive = true;
    friends
      .myNudges()
      .then((rows) => alive && setNames([...new Set(rows.map((r) => r.from_name))]))
      .catch(() => {});
    duels
      .list()
      .then((rows) => alive && setTurns(rows.filter((d) => duelState(d) === "your-turn").map((d) => ({ id: d.id, name: d.other_name }))))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);
  const turnBanner = turns.length ? (
    <section role="status" className="mb-4 flex items-center gap-3 rounded-3xl bg-night p-4 text-sand">
      <span aria-hidden className="text-3xl">
        ⚔️
      </span>
      <p className="min-w-0 flex-1 font-bold">{t("duel.yourTurnBanner", { name: turns[0]!.name, n: turns.length })}</p>
      <Link href={`/duel/?id=${encodeURIComponent(turns[0]!.id)}`} className="rounded-xl bg-sun px-3 py-2 text-sm font-extrabold text-night">
        {t("duel.play")}
      </Link>
    </section>
  ) : null;
  if (!names.length) return turnBanner;
  const who = names.length === 1 ? names[0]! : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
  return (
    <>
    {turnBanner}
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
    </>
  );
}
