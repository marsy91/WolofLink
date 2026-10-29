"use client";

import { IconInfo, IconPodium } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import { dayKey } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";

/**
 * Placeholder league. The rivals are clearly-labelled sample learners with
 * fixed weekly XP; a real league needs accounts and a backend.
 */
const SAMPLE = [
  { name: "Mariama", xp: 140 },
  { name: "Lukas", xp: 95 },
  { name: "Chiara", xp: 70 },
  { name: "Ousmane", xp: 55 },
  { name: "Inès", xp: 30 },
  { name: "Diego", xp: 15 },
];

function weekXp(byDay: Record<string, number>, now: number): number {
  let total = 0;
  for (let i = 0; i < 7; i++) total += byDay[dayKey(now - i * 86_400_000)] ?? 0;
  return total;
}

export default function League() {
  const { progress, t } = useStore();
  const now = useNow();
  const me = { name: progress.profile?.name || t("league.you"), xp: weekXp(progress.xpByDay, now), me: true };
  const rows = [...SAMPLE.map((s) => ({ ...s, me: false })), me].sort((a, b) => b.xp - a.xp);

  return (
    <TabScreen title={t("league.title")}>
      <p className="mb-4 flex gap-2 rounded-2xl bg-dusk-soft p-3 text-sm text-dusk">
        <IconInfo className="shrink-0" size={20} />
        {t("league.demo")}
      </p>
      <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-night">
        <IconPodium size={22} className="text-clay" /> {t("league.week")}
      </h2>
      <ol className="overflow-hidden rounded-3xl border-2 border-sand-3 bg-white">
        {rows.map((r, i) => (
          <li
            key={r.name + i}
            className={`flex items-center gap-3 border-b-2 border-sand-2 px-4 py-3 last:border-b-0 ${r.me ? "bg-sun-soft" : ""}`}
          >
            <span className="w-6 text-center font-display font-extrabold text-muted">{i + 1}</span>
            <span
              aria-hidden
              className={`grid h-9 w-9 place-items-center rounded-full font-display font-extrabold text-white ${
                r.me ? "bg-clay" : ["bg-sea", "bg-dusk", "bg-night-2"][i % 3]
              }`}
            >
              {r.name.slice(0, 1).toUpperCase()}
            </span>
            <span className={`flex-1 font-bold ${r.me ? "text-night" : ""}`}>
              {r.name}
              {r.me && progress.profile?.name ? ` (${t("league.you")})` : ""}
            </span>
            <span className="font-display font-extrabold text-night">{t("stats.xp", { n: r.xp })}</span>
          </li>
        ))}
      </ol>
    </TabScreen>
  );
}
