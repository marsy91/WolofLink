// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Paused } from "@/components/Paused";
import { Button, Loading, ProgressBar, TabScreen } from "@/components/ui";
import { COUNTRY_CENTRES, countriesByName, countryName, flag, isLand, MAP_COLS, MAP_ROWS, project } from "@/content/world";
import { useAccount } from "@/lib/account";
import { WORLD_ENABLED } from "@/lib/features";
import { useSwitchOff } from "@/lib/notices";
import { useStore } from "@/lib/store";
import { cachedWorld, dotLevel, goalPercent, topContributors, world, type WorldSummary } from "@/lib/world";

const field = "w-full rounded-2xl border border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay";
const card = "mb-5 rounded-3xl border border-sand-3/60 bg-white p-5 shadow-card";
const DOT_RADIUS = { 1: 0.75, 2: 1, 3: 1.3, 4: 1.6 } as const;

export default function WorldPage() {
  const worldOff = useSwitchOff("world");
  if (!WORLD_ENABLED || worldOff) return <Paused back="/profile/" />;
  return <World />;
}

function World() {
  const { t, lang } = useStore();
  const { user } = useAccount();
  const communityOff = useSwitchOff("community");
  const [summary, setSummary] = useState<WorldSummary | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "offline" | "error">("loading");
  const [mine, setMine] = useState<string | null | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const num = (n: number) => n.toLocaleString(lang);

  const load = useCallback(async () => {
    const cached = cachedWorld();
    if (cached) {
      setSummary(cached.summary);
      setSavedAt(cached.savedAt);
    }
    try {
      const fresh = await world.summary();
      if (fresh) setSummary(fresh);
      setStatus("live");
    } catch {
      setStatus(cached ? "offline" : "error");
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (!user) return;
    world
      .me()
      .then((c) => {
        setMine(c);
        setDraft(c ?? "");
      })
      .catch(() => setMine(null));
  }, [user]);

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await world.setCountry(draft || null);
      setMine(draft || null);
      setMessage({ text: t(draft ? "world.saved" : "world.removed"), ok: true });
      await load();
    } catch {
      setMessage({ text: t("world.saveError"), ok: false });
    } finally {
      setBusy(false);
    }
  };

  const options = useMemo(() => countriesByName(lang), [lang]);

  if (status === "loading" && !summary) return <Loading />;

  return (
    <TabScreen title={t("world.title")}>
      <p className="mb-5 text-muted">{t("world.intro")}</p>

      {status === "offline" && savedAt ? (
        <p role="status" className="mb-4 rounded-2xl bg-sand-2 p-3 text-sm font-bold text-night">
          {t("world.offline", { when: new Date(savedAt).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" }) })}
        </p>
      ) : null}

      {status === "error" && !summary ? (
        <section className={card}>
          <p role="alert" className="mb-3 font-bold text-night">
            {t("world.loadError")}
          </p>
          <Button onClick={() => void load()}>{t("world.retry")}</Button>
        </section>
      ) : null}

      {summary ? <Goal summary={summary} num={num} /> : null}
      {summary ? <WorldMap summary={summary} num={num} /> : null}

      <section className={card} aria-labelledby="mine-h">
        <h2 id="mine-h" className="mb-1 font-display text-lg font-extrabold text-night">
          {t("world.yourCountry")}
        </h2>
        {user ? (
          <>
            <p className="mb-3 text-sm text-muted">{t("world.yourCountryHint")}</p>
            <label htmlFor="world-country" className="sr-only">
              {t("world.yourCountry")}
            </label>
            <select id="world-country" className={`${field} mb-3`} value={draft} disabled={mine === undefined} onChange={(e) => setDraft(e.target.value)}>
              <option value="">{t("world.none")}</option>
              {options.map((c) => (
                <option key={c} value={c}>
                  {flag(c)} {countryName(c, lang)}
                </option>
              ))}
            </select>
            <Button disabled={busy || mine === undefined || draft === (mine ?? "")} onClick={() => void save()}>
              {t("world.save")}
            </Button>
            {message ? (
              <p role={message.ok ? "status" : "alert"} className={`mt-3 rounded-2xl p-3 text-sm font-bold ${message.ok ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"}`}>
                {message.text}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">{t("world.signIn")}</p>
            <Link href="/account/" className="font-bold text-clay underline">
              {t("world.signInCta")}
            </Link>
          </>
        )}
      </section>

      {user && !communityOff ? (
        <Link href="/community/" className="mb-4 flex items-center gap-3 rounded-3xl border border-sand-3/60 bg-white p-4 shadow-card active:translate-y-[1px]">
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-extrabold text-night">{t("world.leagues")}</span>
            <span className="text-sm text-muted">{t("world.leaguesHint")}</span>
          </span>
          <span aria-hidden className="text-clay">
            →
          </span>
        </Link>
      ) : null}
    </TabScreen>
  );
}

function Goal({ summary, num }: { summary: WorldSummary; num: (n: number) => string }) {
  const { t, lang } = useStore();
  const pct = goalPercent(summary);
  const top = topContributors(summary);
  return (
    <section className={card} aria-labelledby="goal-h">
      <h2 id="goal-h" className="mb-3 font-display text-lg font-extrabold text-night">
        {t("world.goalTitle")}
      </h2>
      <p className="mb-2 font-display text-2xl font-extrabold text-night tabular-nums">
        {t("world.goalProgress", { xp: num(summary.weekXp), goal: num(summary.goal) })}
      </p>
      <ProgressBar value={pct / 100} label={t("world.goalTitle")} tone="sea" />
      <p className="mt-2 text-sm font-bold text-night">{pct >= 100 ? t("world.goalDone") : t("world.active", { n: num(summary.active) })}</p>
      <p className="mt-1 text-xs text-muted">{t("world.goalHint")}</p>
      {top.length ? (
        <>
          <h3 className="mt-4 mb-2 text-sm font-bold text-muted">{t("world.topTitle")}</h3>
          <ul className="space-y-2">
            {top.map((x) => (
              <li key={x.c} className="flex items-center gap-3">
                <span aria-hidden className="text-xl">
                  {flag(x.c)}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-night">{countryName(x.c, lang)}</span>
                <span className="text-sm text-muted tabular-nums">{t("world.share", { n: x.share })}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function WorldMap({ summary, num }: { summary: WorldSummary; num: (n: number) => string }) {
  const { t, lang } = useStore();
  const land = useMemo(() => {
    const dots: [number, number][] = [];
    for (let row = 0; row < MAP_ROWS; row++) for (let col = 0; col < MAP_COLS; col++) if (isLand(col, row)) dots.push([col + 0.5, row + 0.5]);
    return dots;
  }, []);
  const placed = summary.countries
    .map((c) => {
      const centre = COUNTRY_CENTRES.get(c.c);
      return centre ? { ...c, ...project(...centre) } : null;
    })
    .filter((x) => !!x);

  return (
    <section className={card} aria-labelledby="map-h">
      <h2 id="map-h" className="mb-3 font-display text-lg font-extrabold text-night">
        {t("world.mapTitle")}
      </h2>
      <div className="-mx-2 mb-4 rounded-2xl bg-sand-2 p-2">
        <svg viewBox={`0 0 ${MAP_COLS} ${MAP_ROWS}`} role="img" aria-label={t("world.mapAlt")} className="block h-auto w-full">
          {land.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={0.36} className="fill-sand-3" />
          ))}
          {placed.map((c) => {
            const r = DOT_RADIUS[dotLevel(c.n)];
            return (
              <g key={c.c}>
                <circle cx={c.x} cy={c.y} r={r * 1.9} className="fill-clay opacity-20 motion-safe:animate-pulse" />
                <circle cx={c.x} cy={c.y} r={r} className="fill-clay" />
              </g>
            );
          })}
        </svg>
      </div>
      {summary.countries.length ? (
        <ul className="space-y-2">
          {summary.countries.map((c) => (
            <li key={c.c} className="flex items-center gap-3">
              <span aria-hidden className="text-xl">
                {flag(c.c)}
              </span>
              <span className="min-w-0 flex-1 truncate font-bold text-night">{countryName(c.c, lang)}</span>
              <span className="text-sm text-muted tabular-nums">{t("world.learners", { n: num(c.n) })}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-bold text-night">{t("world.empty")}</p>
      )}
      {summary.other.n ? (
        <p className="mt-3 text-sm text-muted">{t("world.other", { countries: num(summary.other.countries), n: num(summary.other.n) })}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted">{t("world.fewHint")}</p>
    </section>
  );
}
