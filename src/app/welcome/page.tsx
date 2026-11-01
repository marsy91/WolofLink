// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconCheck } from "@/components/icons";
import { LogoMark, Wordmark } from "@/components/Logo";
import { Button, Loading, ProgressBar } from "@/components/ui";
import { UI_LANGS, type UiLang } from "@/content/types";
import { LANG_FLAGS, LANG_NAMES } from "@/i18n";
import { useAccount } from "@/lib/account";
import { GOALS, type GoalId } from "@/lib/progress";
import { useStore } from "@/lib/store";

const STEPS = 4;

function OptionCard({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left transition ${
        selected ? "border-clay ring-2 ring-clay/25" : "border-sand-3 hover:border-night/30"
      }`}
    >
      {children}
      <span
        className={`ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-clay bg-clay text-white" : "border-sand-3"
        }`}
      >
        {selected ? <IconCheck size={16} /> : null}
      </span>
    </button>
  );
}

export default function Welcome() {
  const { ready, progress, lang, setDraftLang, update, t } = useStore();
  const account = useAccount();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId>("regular");
  const [name, setName] = useState("");

  useEffect(() => {
    if (ready && progress.profile) router.replace("/learn/");
  }, [ready, progress.profile, router]);

  if (!ready || progress.profile) return <Loading />;

  const finish = () => {
    const now = Date.now();
    update((p) => ({
      ...p,
      profile: {
        id: crypto.randomUUID?.() ?? String(now),
        name: name.trim(),
        uiLang: lang,
        target: "wo",
        goal,
        createdAt: now,
        guest: true,
      },
    }));
    router.replace("/learn/");
  };

  if (step === 0) {
    return (
      <main className="splash safe-top safe-bottom flex min-h-dvh flex-col bg-night text-sand">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <LogoMark size={120} className="anim-pop" />
          <h1 className="font-display text-4xl font-extrabold">
            <Wordmark className="text-sand" />
          </h1>
          <p className="text-lg text-sand/85">{t("app.tagline")}</p>
          <p lang="wo" className="font-display text-2xl font-extrabold text-sun">
            Dalal ak jàmm!
          </p>
        </div>
        <div className="mx-auto w-full max-w-lg px-6 pb-8">
          <Button block onClick={() => setStep(1)}>
            {t("onb.start")}
          </Button>
          {account.available ? (
            <Link href="/account/" className="mt-4 block text-center font-bold text-sun underline underline-offset-4">
              {t("acct.haveAccount")}
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          aria-label={t("common.back")}
          className="grid h-10 w-10 place-items-center rounded-full text-night hover:bg-sand-2"
        >
          <IconArrowLeft />
        </button>
        <ProgressBar value={step / STEPS} label={t("onb.step", { n: step, total: STEPS })} />
      </div>

      <section className="anim-pop flex-1" key={step}>
        {step === 1 && (
          <>
            <h1 className="mb-6 font-display text-3xl font-extrabold text-night">{t("onb.learnQ")}</h1>
            <div role="radiogroup" aria-label={t("onb.learnQ")} className="space-y-3">
              <OptionCard selected onSelect={() => {}}>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-night font-display text-lg font-extrabold text-sun">
                  WO
                </span>
                <span>
                  <span className="block font-display text-xl font-extrabold">Wolof</span>
                  <span className="text-sm text-muted">{t("onb.wolofDesc")}</span>
                </span>
              </OptionCard>
            </div>
            <p className="mt-4 text-sm text-muted">{t("onb.learnMore")}</p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mb-2 font-display text-3xl font-extrabold text-night">{t("onb.uiQ")}</h1>
            <p className="mb-6 text-muted">{t("onb.uiHint")}</p>
            <div role="radiogroup" aria-label={t("onb.uiQ")} className="space-y-3">
              {UI_LANGS.map((code: UiLang) => (
                <OptionCard key={code} selected={lang === code} onSelect={() => setDraftLang(code)}>
                  <span className="grid h-10 w-12 place-items-center rounded-lg bg-sand-2 font-display font-extrabold text-night">
                    {LANG_FLAGS[code]}
                  </span>
                  <span lang={code} className="font-display text-lg font-extrabold">
                    {LANG_NAMES[code]}
                  </span>
                </OptionCard>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="mb-2 font-display text-3xl font-extrabold text-night">{t("onb.goalQ")}</h1>
            <p className="mb-6 text-muted">{t("onb.goalHint")}</p>
            <div role="radiogroup" aria-label={t("onb.goalQ")} className="space-y-3">
              {(Object.keys(GOALS) as GoalId[]).map((id) => (
                <OptionCard key={id} selected={goal === id} onSelect={() => setGoal(id)}>
                  <span className="font-display text-lg font-extrabold">{t(`goal.${id}`)}</span>
                  <span className="text-muted">{t("goal.xpPerDay", { n: GOALS[id] })}</span>
                </OptionCard>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="mb-6 font-display text-3xl font-extrabold text-night">{t("onb.nameQ")}</h1>
            <label className="block">
              <span className="sr-only">{t("settings.name")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                autoComplete="given-name"
                placeholder={t("onb.namePlaceholder")}
                className="w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-3.5 text-lg outline-none focus:border-clay"
              />
            </label>
            <p className="mt-4 rounded-2xl bg-sea-soft p-4 text-sea">{t("onb.guestNote")}</p>
          </>
        )}
      </section>

      <div className="py-6">
        {step < STEPS ? (
          <Button block onClick={() => setStep(step + 1)}>
            {t("common.continue")}
          </Button>
        ) : (
          <Button block onClick={finish}>
            {t("onb.finish")}
          </Button>
        )}
      </div>
    </main>
  );
}
