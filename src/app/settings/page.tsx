"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Dialog, TabScreen } from "@/components/ui";
import { UI_LANGS, type UiLang } from "@/content/types";
import { LANG_NAMES } from "@/i18n";
import { GOALS, type GoalId, type Progress } from "@/lib/progress";
import { useStore } from "@/lib/store";

const VERSION = "0.1.0";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="font-bold">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? "bg-sea" : "bg-sand-3"}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-7" : "left-1"}`} />
      </button>
    </label>
  );
}

export default function Settings() {
  const { progress, update, reset, t } = useStore();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const profile = progress.profile;
  if (!profile) return <TabScreen>{null}</TabScreen>;

  const setProfile = (patch: Partial<NonNullable<Progress["profile"]>>) =>
    update((p) => (p.profile ? { ...p, profile: { ...p.profile, ...patch } } : p));
  const setSettings = (patch: Partial<Progress["settings"]>) =>
    update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

  const field = "w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay";

  return (
    <TabScreen title={t("settings.title")}>
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-muted">{t("settings.name")}</span>
          <input
            className={field}
            value={profile.name}
            maxLength={30}
            onChange={(e) => setProfile({ name: e.target.value })}
            placeholder={t("onb.namePlaceholder")}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-muted">{t("settings.uiLang")}</span>
          <select className={field} value={profile.uiLang} onChange={(e) => setProfile({ uiLang: e.target.value as UiLang })}>
            {UI_LANGS.map((code) => (
              <option key={code} value={code}>
                {LANG_NAMES[code]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-muted">{t("settings.goal")}</span>
          <select className={field} value={profile.goal} onChange={(e) => setProfile({ goal: e.target.value as GoalId })}>
            {(Object.keys(GOALS) as GoalId[]).map((id) => (
              <option key={id} value={id}>
                {t(`goal.${id}`)} · {t("goal.xpPerDay", { n: GOALS[id] })}
              </option>
            ))}
          </select>
        </label>

        <div className="divide-y-2 divide-sand-2 rounded-2xl border-2 border-sand-3 bg-white px-4">
          <Toggle label={t("settings.sound")} checked={progress.settings.sound} onChange={(v) => setSettings({ sound: v })} />
          <Toggle label={t("settings.audio")} checked={progress.settings.autoplay} onChange={(v) => setSettings({ autoplay: v })} />
        </div>

        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-1 font-display text-lg font-extrabold text-night">{t("settings.about")}</h2>
          <p className="text-sm text-muted">{t("settings.aboutBody")}</p>
          <p className="mt-2 text-xs text-muted">{t("settings.version", { v: VERSION })}</p>
        </section>

        <Button block variant="wrong" onClick={() => setConfirm(true)}>
          {t("settings.reset")}
        </Button>
      </div>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title={t("settings.reset")}>
        <p className="mb-5 text-muted">{t("settings.resetConfirm")}</p>
        <div className="flex flex-col gap-3">
          <Button
            block
            variant="wrong"
            onClick={() => {
              reset();
              router.replace("/welcome/");
            }}
          >
            {t("settings.reset")}
          </Button>
          <Button block variant="secondary" onClick={() => setConfirm(false)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Dialog>
    </TabScreen>
  );
}
