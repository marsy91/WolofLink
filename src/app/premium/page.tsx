// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconCheck, IconClose, IconGem } from "@/components/icons";
import { Button, Loading, RedirectTo, useRequireProfile } from "@/components/ui";
import { course } from "@/content/course";
import type { UiKey } from "@/i18n";
import type { PlanKind } from "@/lib/billing";
import { PREMIUM_ENABLED } from "@/lib/features";
import { FREE_LESSON_COUNT, TOTAL_LESSON_COUNT } from "@/lib/premium";
import { usePremium } from "@/lib/premium-context";
import { useStore } from "@/lib/store";

const PLAN_LABEL: Record<PlanKind, UiKey> = {
  monthly: "premium.monthly",
  annual: "premium.annual",
  lifetime: "premium.lifetime",
  other: "premium.title",
};
const ORDER: PlanKind[] = ["annual", "monthly", "lifetime", "other"];

/** Premium is switched off in free builds (src/lib/features.ts): send old links to the path. */
export default function PremiumRoute() {
  return PREMIUM_ENABLED ? <PremiumPage /> : <RedirectTo href="/learn/" />;
}

function PremiumPage() {
  const allowed = useRequireProfile();
  const { t } = useStore();
  const p = usePremium();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ key: UiKey; ok: boolean } | null>(null);
  const { available, premium, loadPlans } = p;

  useEffect(() => {
    if (available && !premium) void loadPlans();
  }, [available, premium, loadPlans]);

  if (!allowed) return <Loading />;

  const plans = [...p.plans].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  const chosen = selected ?? plans[0]?.id ?? null;

  const buy = async () => {
    if (!chosen) return;
    setBusy(true);
    setMessage(null);
    const result = await p.purchase(chosen);
    setBusy(false);
    if (result === "failed") setMessage({ key: "premium.failed", ok: false });
  };

  const restore = async () => {
    setBusy(true);
    const on = await p.restore();
    setBusy(false);
    setMessage(on ? { key: "premium.restored", ok: true } : { key: "premium.nothingToRestore", ok: false });
  };

  const benefits: string[] = [
    t("premium.b1", { n: TOTAL_LESSON_COUNT, u: course.units.length, free: FREE_LESSON_COUNT }),
    t("premium.b2"),
    t("premium.b3"),
    t("premium.b4"),
    t("premium.b5"),
  ];

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      <div className="py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t("common.close")}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand-2"
        >
          <IconClose />
        </button>
      </div>

      <div className="mb-6 rounded-3xl bg-night p-6 text-center text-sand">
        <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-sun">
          <IconGem size={36} />
        </span>
        <h1 className="font-display text-3xl font-extrabold">{t("premium.title")}</h1>
        <p className="mt-1 text-sand/85">{t("premium.subtitle")}</p>
      </div>

      <ul className="mb-6 space-y-3">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sea text-white">
              <IconCheck size={14} />
            </span>
            <span className="text-lg">{b}</span>
          </li>
        ))}
      </ul>

      {message ? (
        <p role={message.ok ? "status" : "alert"} className={`mb-4 rounded-2xl p-4 ${message.ok ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"}`}>
          {t(message.key)}
        </p>
      ) : null}

      {premium ? (
        <div className="rounded-3xl bg-sun-soft p-5 text-center">
          <p className="font-display text-xl font-extrabold text-night">{t("premium.thanks")}</p>
          <p className="mt-2 text-sm text-muted">{t("premium.manage")}</p>
        </div>
      ) : !available ? (
        <p className="rounded-2xl bg-white p-4 text-muted">{t("premium.unavailable")}</p>
      ) : p.loadingPlans ? (
        <p className="text-muted" role="status">
          {t("premium.loading")}
        </p>
      ) : plans.length === 0 ? (
        <div className="space-y-3">
          <p className="rounded-2xl bg-white p-4 text-muted">{t("premium.noPlans")}</p>
          <Button block variant="secondary" onClick={() => void loadPlans()}>
            {t("premium.retry")}
          </Button>
        </div>
      ) : (
        <>
          <div role="radiogroup" aria-label={t("premium.title")} className="mb-4 space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={chosen === plan.id}
                onClick={() => setSelected(plan.id)}
                className={`flex w-full items-center justify-between rounded-2xl border-2 bg-white p-4 text-left ${
                  chosen === plan.id ? "border-clay ring-2 ring-clay/25" : "border-sand-3"
                }`}
              >
                <span>
                  <span className="block font-display text-lg font-extrabold text-night">{t(PLAN_LABEL[plan.kind])}</span>
                  {plan.kind === "annual" ? (
                    <span className="text-sm font-bold text-sea">{t("premium.bestValue")}</span>
                  ) : null}
                </span>
                <span className="font-display text-lg font-extrabold text-night">{plan.price}</span>
              </button>
            ))}
          </div>
          <Button block disabled={busy || !chosen} onClick={() => void buy()}>
            {t("premium.continue")}
          </Button>
        </>
      )}

      {available && !premium ? (
        <Button block variant="ghost" className="mt-2" disabled={busy} onClick={() => void restore()}>
          {t("premium.restore")}
        </Button>
      ) : null}

      <p className="mt-4 pb-6 text-xs leading-relaxed text-muted">
        {t("premium.fine")}{" "}
        <Link href="/terms/" className="font-bold text-clay underline">
          {t("premium.terms")}
        </Link>{" "}
        ·{" "}
        <Link href="/privacy/" className="font-bold text-clay underline">
          {t("settings.privacy")}
        </Link>
      </p>
    </main>
  );
}
