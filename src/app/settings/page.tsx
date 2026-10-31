// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Dialog, TabScreen } from "@/components/ui";
import { UI_LANGS, type UiLang } from "@/content/types";
import { LANG_NAMES } from "@/i18n";
import { IconBell } from "@/components/icons";
import { useAccount } from "@/lib/account";
import { hasAiClips } from "@/lib/audio";
import { remindersSupported, syncReminder, type ReminderResult } from "@/lib/native";
import { GOALS, type GoalId, type Progress } from "@/lib/progress";
import { useStore } from "@/lib/store";

const VERSION = "0.10.0";

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
  const account = useAccount();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [reminderState, setReminderState] = useState<ReminderResult | null>(null);
  const profile = progress.profile;
  if (!profile) return <TabScreen>{null}</TabScreen>;

  const setProfile = (patch: Partial<NonNullable<Progress["profile"]>>) =>
    update((p) => (p.profile ? { ...p, profile: { ...p.profile, ...patch } } : p));
  const setSettings = (patch: Partial<Progress["settings"]>) =>
    update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

  const reminder = progress.settings.reminder;
  const time = `${String(reminder.hour).padStart(2, "0")}:${String(reminder.minute).padStart(2, "0")}`;
  const setReminder = async (patch: Partial<Progress["settings"]["reminder"]>, lang = profile.uiLang) => {
    const next = { ...reminder, ...patch };
    const result = await syncReminder({ ...next, lang });
    // Keep the switch off if the phone refused notifications.
    setSettings({ reminder: { ...next, enabled: next.enabled && result === "scheduled" } });
    setReminderState(result);
  };

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
          <select
            className={field}
            value={profile.uiLang}
            onChange={(e) => {
              const uiLang = e.target.value as UiLang;
              setProfile({ uiLang });
              if (reminder.enabled) void setReminder({}, uiLang);
            }}
          >
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
          <Toggle label={t("settings.haptics")} checked={progress.settings.haptics} onChange={(v) => setSettings({ haptics: v })} />
        </div>

        <section className="rounded-2xl border-2 border-sand-3 bg-white px-4 py-2" aria-labelledby="remind-h">
          <h2 id="remind-h" className="flex items-center gap-2 pt-2 font-display text-lg font-extrabold text-night">
            <IconBell size={22} className="text-clay" />
            {t("remind.title")}
          </h2>
          {remindersSupported() ? (
            <>
              <Toggle label={t("remind.on")} checked={reminder.enabled} onChange={(v) => void setReminder({ enabled: v })} />
              <label className="flex items-center justify-between gap-4 pb-3">
                <span className="font-bold">{t("remind.time")}</span>
                <input
                  type="time"
                  value={time}
                  disabled={!reminder.enabled}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":").map(Number);
                    if (Number.isFinite(h) && Number.isFinite(m)) void setReminder({ hour: h!, minute: m! });
                  }}
                  className="rounded-xl border-2 border-sand-3 px-3 py-2 font-display font-extrabold disabled:opacity-50"
                />
              </label>
              {reminderState === "denied" ? (
                <p role="alert" className="pb-3 text-sm text-berry">
                  {t("remind.denied")}
                </p>
              ) : null}
            </>
          ) : (
            <p className="pb-3 text-sm text-muted">{t("remind.webOnly")}</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-1 font-display text-lg font-extrabold text-night">{t("settings.about")}</h2>
          <p className="text-sm text-muted">{t("settings.aboutBody")}</p>
          {hasAiClips ? <p className="mt-2 text-sm text-muted">{t("settings.voice")}</p> : null}
          <p className="mt-2 text-xs text-muted">
            {t("settings.version", { v: VERSION })} · © 2026 WolofLink ·{" "}
            <Link href="/privacy/" className="font-bold text-clay underline">
              {t("settings.privacy")}
            </Link>
          </p>
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
            onClick={async () => {
              // Reset this device only: sign out first so the cloud copy isn't merged straight back.
              if (account.user) await account.signOut();
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
