// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { BADGE_GLYPHS, IconGem, IconLock, IconProfile, IconRosette, IconShield, IconSliders } from "@/components/icons";
import { TabScreen } from "@/components/ui";
import type { UiKey } from "@/i18n";
import { useAccount } from "@/lib/account";
import { useIsOwner } from "@/lib/owner";
import { PREMIUM_ENABLED } from "@/lib/features";
import { usePremium } from "@/lib/premium-context";
import { ACHIEVEMENTS, currentStreak, MAX_SHIELDS } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";

export default function Profile() {
  const { progress, lang, t } = useStore();
  const account = useAccount();
  const isOwner = useIsOwner();
  const { premium, unlockAll } = usePremium();
  const now = useNow();
  const profile = progress.profile;
  const since = profile ? new Date(profile.createdAt).toLocaleDateString(lang, { dateStyle: "medium" }) : "";

  return (
    <TabScreen>
      <div className="mb-5 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-night text-sun">
          <IconProfile size={34} />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold text-night">{profile?.name || t("profile.guest")}</h1>
          <p className="text-sm text-muted">{t("profile.since", { d: since })}</p>
        </div>
        <Link
          href="/settings/"
          aria-label={t("nav.settings")}
          className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-sand-3 bg-white text-night"
        >
          <IconSliders />
        </Link>
      </div>

      <dl className="mb-6 grid grid-cols-3 gap-3">
        {[
          [t("profile.totalXp"), progress.xpTotal],
          [t("profile.bestStreak"), Math.max(progress.streak.best, currentStreak(progress, now))],
          [t("profile.lessons"), Object.keys(progress.lessons).length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border-2 border-sand-3 bg-white p-3 text-center">
            <dd className="font-display text-2xl font-extrabold text-night">{value}</dd>
            <dt className="text-xs font-bold text-muted">{label}</dt>
          </div>
        ))}
      </dl>

      {!PREMIUM_ENABLED && (premium || unlockAll) ? (
        <p className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-dusk/30 bg-dusk-soft p-4 text-sm font-bold text-night">
          <IconGem size={24} className="shrink-0 text-dusk" />
          <span>
            {unlockAll ? <span className="block">{t("grant.unlockAll")}</span> : null}
            {premium ? <span className="block">{t("grant.premium")}</span> : null}
          </span>
        </p>
      ) : null}

      {PREMIUM_ENABLED ? (
        <Link
          href="/premium/"
          className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-dusk/30 bg-dusk-soft p-4 active:translate-y-[2px]"
        >
          <IconGem size={28} className="shrink-0 text-dusk" />
          <span className="flex-1">
            <span className="block font-display font-extrabold text-night">{t("premium.title")}</span>
            <span className="text-sm text-muted">{premium ? t("premium.thanks") : t("premium.subtitle")}</span>
          </span>
        </Link>
      ) : null}

      <section className="mb-6 flex gap-3 rounded-2xl bg-night p-4 text-sand" aria-labelledby="shield-h">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-sun">
          <IconShield size={28} />
        </span>
        <div>
          <h2 id="shield-h" className="font-display font-extrabold">
            {t("shield.title")} · {t("shield.count", { n: progress.streak.shields, max: MAX_SHIELDS })}
          </h2>
          <p className="text-sm text-sand/80">{t("shield.body")}</p>
        </div>
      </section>

      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold text-night">
        <IconRosette size={22} className="text-clay" />
        {t("profile.achievements")}
      </h2>
      <ul className="mb-6 grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = !!progress.achievements[a.id];
          const Glyph = BADGE_GLYPHS[a.glyph];
          return (
            <li
              key={a.id}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${
                unlocked ? "border-sun bg-sun-soft" : "border-dashed border-sand-3 bg-white/50"
              }`}
            >
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-full ${
                  unlocked ? "bg-night text-sun" : "bg-sand-3 text-muted"
                }`}
              >
                <Glyph size={28} />
                {!unlocked ? (
                  <span className="absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center rounded-full bg-white text-muted">
                    <IconLock size={14} />
                  </span>
                ) : null}
              </span>
              <span className="font-display font-extrabold text-night">{t(`ach.${a.id}.name` as UiKey)}</span>
              <span className="text-xs text-muted">
                {t(`ach.${a.id}.desc` as UiKey)}
                {unlocked ? "" : ` · ${t("profile.locked")}`}
              </span>
            </li>
          );
        })}
      </ul>

      {isOwner ? (
        <Link
          href="/owner/"
          className="mb-4 block rounded-3xl border-2 border-clay bg-white p-5 active:translate-y-[2px]"
        >
          <h2 className="mb-1 font-display text-lg font-extrabold text-clay">Owner console</h2>
          <p className="text-sm text-muted">Organisations, people, licences and the change log.</p>
        </Link>
      ) : null}

      {account.available ? (
        <Link
          href="/account/"
          className="block rounded-3xl bg-white p-5 shadow-[0_3px_0_var(--color-sand-3)] active:translate-y-[2px] active:shadow-none"
        >
          <h2 className="mb-1 font-display text-lg font-extrabold text-night">
            {account.user ? t("acct.title") : t("profile.account")}
          </h2>
          <p className="text-sm text-muted">
            {account.user ? t("acct.signedIn", { email: account.user.email ?? "" }) : t("acct.why")}
          </p>
        </Link>
      ) : (
        <section className="rounded-3xl bg-white p-5 shadow-[0_3px_0_var(--color-sand-3)]">
          <h2 className="mb-1 font-display text-lg font-extrabold text-night">{t("profile.account")}</h2>
          <p className="text-sm text-muted">{t("profile.accountSoon")}</p>
        </section>
      )}
    </TabScreen>
  );
}
