// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Button, Loading, TabScreen } from "@/components/ui";
import { useAccount } from "@/lib/account";
import { useNow, useStore } from "@/lib/store";
import {
  TeamPlanInactive,
  activeWithin,
  certificateMembers,
  csvFileName,
  loadAdminOrgs,
  loadTeam,
  saveCsv,
  sortTeam,
  teamCsv,
  teamStats,
  type AdminOrg,
  type SaveResult,
  type TeamMember,
  type TeamSort,
} from "@/lib/team";

/** The organisation admin dashboard (Profile → Account → Your organisation → Team dashboard). */
export default function TeamPage() {
  const { t } = useStore();
  const { user } = useAccount();
  const [orgs, setOrgs] = useState<AdminOrg[] | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    loadAdminOrgs()
      .then((list) => {
        if (!alive) return;
        setOrgs(list);
        setOrgId((cur) => cur ?? list[0]?.orgId ?? null);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [user]);

  if (user === undefined) return <Loading />;
  if (!user) {
    return (
      <TabScreen title={t("team.title")}>
        <p className="mb-4 text-muted">{t("team.signIn")}</p>
        <Link href="/account/" className="font-bold text-clay underline">
          {t("team.toAccount")}
        </Link>
      </TabScreen>
    );
  }
  if (failed) return <TabScreen title={t("team.title")}><p role="alert" className="text-berry">{t("team.error")}</p></TabScreen>;
  if (!orgs) return <Loading />;
  if (orgs.length === 0) {
    return (
      <TabScreen title={t("team.title")}>
        <p className="mb-4 text-muted">{t("team.notAdmin")}</p>
        <Link href="/account/" className="font-bold text-clay underline">
          {t("team.toAccount")}
        </Link>
      </TabScreen>
    );
  }
  const org = orgs.find((o) => o.orgId === orgId) ?? orgs[0]!;
  return (
    <TabScreen title={t("team.title")}>
      {orgs.length > 1 ? (
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-bold text-muted">{t("team.pick")}</span>
          <select value={org.orgId} onChange={(e) => setOrgId(e.target.value)} className="w-full rounded-2xl border-2 border-sand-3 bg-white p-3 text-night">
            {orgs.map((o) => (
              <option key={o.orgId} value={o.orgId}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Team key={org.orgId} org={org} />
    </TabScreen>
  );
}

function Team({ org }: { org: AdminOrg }) {
  const { t, lang } = useStore();
  const now = useNow(60_000);
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [state, setState] = useState<"ok" | "inactive" | "error">("ok");
  const [sort, setSort] = useState<TeamSort>("name");
  const [saved, setSaved] = useState<SaveResult | null>(null);
  const [certs, setCerts] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!org.teamActive) {
      void Promise.resolve().then(() => alive && setState("inactive"));
      return;
    }
    loadTeam(org.orgId)
      .then((list) => alive && setMembers(list))
      .catch((e) => alive && setState(e instanceof TeamPlanInactive ? "inactive" : "error"));
    return () => {
      alive = false;
    };
  }, [org]);

  const stats = useMemo(() => (members ? teamStats(members, now) : null), [members, now]);
  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(lang, { dateStyle: "medium" }) : t("team.never"));

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(org.joinCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const exportCsv = async () => {
    if (!members) return;
    const csv = teamCsv(members, {
      name: t("team.col.name"),
      role: t("team.col.role"),
      joined: t("team.col.joined"),
      xp: "XP",
      lessons: t("team.col.lessons"),
      streak: t("team.col.streak"),
      lastActive: t("team.col.last"),
      admin: t("team.admin"),
      member: t("team.member"),
    });
    setSaved(await saveCsv(csv, csvFileName(org.name, Date.now())));
  };

  return (
    <>
      <section className="mb-4 rounded-3xl bg-white p-5 shadow-card">
        <h2 className="font-display text-2xl font-extrabold text-night">{org.name}</h2>
        <p className={`mt-1 text-sm font-bold ${org.teamActive ? "text-sea" : "text-berry"}`}>
          {org.teamActive ? t("team.planActive") : t("team.planInactive")}
          {org.teamActive && org.paidUntil ? ` · ${t("team.until", { date: day(org.paidUntil) })}` : ""}
        </p>
        <p className="mt-4 text-sm font-bold text-muted">{t("team.code")}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-display text-2xl font-extrabold tracking-widest text-night">{org.joinCode}</span>
          <button type="button" onClick={() => void copyCode()} className="min-h-11 rounded-full border-2 border-sand-3 px-4 font-bold text-night">
            {copied ? t("team.copied") : t("team.copy")}
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">{t("team.howToJoin")}</p>
        <p className="mt-3 font-bold text-night">
          {t("team.seats", { used: org.members, total: org.seats ?? t("team.unlimited") })}
        </p>
      </section>

      {state === "inactive" ? (
        <p role="status" className="rounded-2xl bg-sun-soft p-4 text-night">
          {t("team.inactiveHelp")}
        </p>
      ) : state === "error" ? (
        <p role="alert" className="rounded-2xl bg-berry-soft p-4 font-bold text-berry">
          {t("team.error")}
        </p>
      ) : !members || !stats ? (
        <Loading />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {(
              [
                [t("team.stat.members"), stats.members],
                [t("team.stat.active"), stats.activeThisWeek],
                [t("team.stat.average"), stats.averageLessons],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white p-3 text-center shadow-card">
                <p className="font-display text-2xl font-extrabold text-night">{value}</p>
                <p className="text-xs font-bold text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={t("team.sortBy")}>
            {(["name", "lessons", "recent"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sort === s}
                onClick={() => setSort(s)}
                className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${sort === s ? "border-night bg-night text-sand" : "border-sand-3 bg-white text-night"}`}
              >
                {t(`team.sort.${s}`)}
              </button>
            ))}
          </div>

          {members.length === 0 ? (
            <p className="mb-4 text-muted">{t("team.empty")}</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {sortTeam(members, sort).map((m) => (
                <li key={m.userId} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                  <span
                    aria-hidden
                    className={`h-3 w-3 shrink-0 rounded-full ${activeWithin(m, now) ? "bg-sea" : "bg-sand-3"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-night">
                      {m.name}
                      {m.role === "admin" ? <span className="ml-2 text-xs text-muted">{t("team.admin")}</span> : null}
                    </span>
                    <span className="text-xs text-muted">{t("team.last", { date: day(m.lastActive) })}</span>
                  </span>
                  <span className="text-right text-sm">
                    <span className="block font-bold text-night">{t("team.lessonsN", { n: m.lessons })}</span>
                    <span className="text-xs text-muted">{m.xp} XP · {t("team.streakN", { n: m.streak })}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mb-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={!members.length} onClick={() => void exportCsv()}>
              {t("team.export")}
            </Button>
            <Button variant="secondary" disabled={!certificateMembers(members).length} onClick={() => setCerts((c) => !c)}>
              {t("team.certificates")}
            </Button>
          </div>
          {saved ? (
            <p role="status" className={`mb-4 text-sm font-bold ${saved === "failed" ? "text-berry" : "text-sea"}`}>
              {t(`team.saved.${saved}`)}
            </p>
          ) : null}

          {certs ? <Certificates org={org} members={certificateMembers(members)} /> : null}
          <p className="mt-4 text-xs text-muted">{t("team.privacy")}</p>
        </>
      )}
    </>
  );
}

/** One certificate per member who finished at least one lesson, to print or screenshot. */
function Certificates({ org, members }: { org: AdminOrg; members: TeamMember[] }) {
  const { t, lang } = useStore();
  const date = new Date().toLocaleDateString(lang, { dateStyle: "long" });
  const native = typeof window !== "undefined" && !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
  return (
    <section className="mt-2">
      <p className="mb-3 text-sm text-muted">{native ? t("team.certPhone") : t("team.certPrint")}</p>
      {!native && typeof window !== "undefined" && typeof window.print === "function" ? (
        <Button block className="mb-4 print:hidden" onClick={() => window.print()}>
          {t("cert.print")}
        </Button>
      ) : null}
      <div className="space-y-4">
        {members.map((m) => (
          <article key={m.userId} className="break-inside-avoid rounded-[2rem] border-8 border-double border-sun bg-white p-6 text-center">
            <div className="mb-3 flex justify-center">
              <LogoMark size={44} />
            </div>
            <p className="text-xs font-bold tracking-[0.25em] text-clay uppercase">{t("team.certHeading")}</p>
            <p className="mt-3 text-muted">{t("cert.awardedTo")}</p>
            <p className="font-display text-2xl font-extrabold text-night">{m.name}</p>
            <p className="mt-3 text-muted">{t("team.certFor", { n: m.lessons, org: org.name })}</p>
            <p className="mt-3 font-bold text-night">{date}</p>
            <p className="mt-4 text-[11px] leading-snug text-muted">{t("team.certNote")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
