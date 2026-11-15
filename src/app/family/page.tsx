// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Family screen: shows all profiles on the phone, lets the main learner add,
 * switch to, or remove family members (with a grown-up check for children),
 * and launches Family Làmb Night.
 */

import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { GlyphFamily, IconArrowLeft } from "@/components/icons";
import { GrownUpGate } from "@/components/GrownUpGate";
import { useStore } from "@/lib/store";
import { useFamily } from "@/lib/family-context";
import { useSwitchOn } from "@/lib/notices";
import { AVATARS, FAMILY_LEVELS, avatarOf, isChild, isMain, levelOf, MAX_FAMILY, members, type FamilyLevel } from "@/lib/family";
import { grownUpOpen } from "@/lib/grownup";

export default function FamilyPage() {
  const { progress, t } = useStore();
  const { family, switchProfile, addProfile, removeProfile } = useFamily();
  const familyNightOn = useSwitchOn("family_night");
  const router = useRouter();
  const profile = progress.profile;
  const allMembers = members(progress, family);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<FamilyLevel>("kid");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [err, setErr] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const nameId = useId();

  const iAmChild = isChild(profile);
  const iAmMain = isMain(profile);

  // Switch to another profile — children need the grown-up check.
  const doSwitch = useCallback(
    (id: string) => {
      if (!switchProfile(id)) return;
      router.push("/learn/");
    },
    [switchProfile, router],
  );

  const doAdd = useCallback(() => {
    const result = addProfile({ name, level, avatar });
    if (result === "ok") {
      setAdding(false);
      setName("");
      setErr(null);
    } else if (result === "name") {
      setErr(t("family.errName"));
    } else {
      setErr(t("family.full", { n: String(MAX_FAMILY) }));
    }
  }, [addProfile, name, level, avatar, t]);

  const doRemove = useCallback(
    (id: string) => {
      removeProfile(id);
      setConfirmRemove(null);
    },
    [removeProfile],
  );

  return (
    <div className="min-h-dvh bg-bg px-4 pb-10 pt-safe-top">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 pt-4">
        <Link href="/profile/" aria-label={t("common.back")} className="grid h-10 w-10 place-items-center rounded-xl border border-sand-3 bg-white text-night">
          <IconArrowLeft />
        </Link>
        <h1 className="font-display text-xl font-extrabold text-night">{t("family.title")}</h1>
      </div>

      {/* Profile cards */}
      <div className="mb-4 space-y-3">
        {allMembers.map((p) => {
          const isActive = p.id === profile?.id;
          const memberProgress = isActive ? progress : family.others.find((o) => o.profile?.id === p.id);
          const crowns = family.crowns[p.id] ?? 0;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${isActive ? "border-clay bg-clay/5" : "border-sand-3 bg-white"}`}
            >
              {/* Avatar circle */}
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-extrabold text-white"
                style={{ background: avatarOf(p) }}
                aria-hidden
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-extrabold text-night">
                  {p.name} {isActive ? <span className="ml-1 rounded-full bg-clay px-2 py-0.5 text-xs text-white">▶</span> : null}
                </p>
                <p className="text-sm text-muted">
                  {t(`family.level.${levelOf(p)}`)}
                  {crowns > 0 ? <span className="ml-2">{t("family.crowns", { n: String(crowns) })}</span> : null}
                </p>
              </div>
              {/* Switch / remove */}
              {!isActive && iAmMain && (
                <GrownUpGate skip={!isChild(p) || grownUpOpen()} onPass={() => doSwitch(p.id)}>
                  {(ask) => (
                    <button
                      className="shrink-0 rounded-xl bg-clay/10 px-3 py-2 text-sm font-bold text-clay"
                      onClick={ask}
                    >
                      {t("family.switchTo", { name: "" }).replace("{name}", "").trim() === "" ? "▶" : t("family.switchTo", { name: p.name })}
                    </button>
                  )}
                </GrownUpGate>
              )}
              {!isActive && iAmMain && !isMain(p) && (
                <button
                  className="ml-1 shrink-0 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-500"
                  onClick={() => setConfirmRemove(p.id)}
                >
                  {t("family.remove")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add member button (main profile only) */}
      {iAmMain && allMembers.length < MAX_FAMILY && !adding && (
        <button
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-clay/30 py-4 font-bold text-clay"
          onClick={() => setAdding(true)}
        >
          <span className="text-xl">＋</span> {t("family.addMember")}
        </button>
      )}

      {/* Add form */}
      {adding && (
        <div className="mb-6 rounded-2xl border border-sand-3 bg-white p-5 shadow-card">
          <h2 className="mb-3 font-display text-lg font-extrabold text-night">{t("family.addMember")}</h2>
          <label htmlFor={nameId} className="mb-1 block text-sm font-semibold text-night">
            {t("family.namePlaceholder")}
          </label>
          <input
            id={nameId}
            type="text"
            className="mb-3 w-full rounded-xl border border-sand-3 bg-bg px-4 py-3 text-night focus:outline-none focus:ring-2 focus:ring-clay"
            placeholder={t("family.namePlaceholder")}
            value={name}
            onChange={(e) => { setName(e.target.value); setErr(null); }}
            maxLength={24}
          />
          {/* Level picker */}
          <div className="mb-3 flex gap-2">
            {FAMILY_LEVELS.map((lv) => (
              <button
                key={lv}
                className={`flex-1 rounded-xl py-2 text-sm font-bold ${level === lv ? "bg-clay text-white" : "border border-sand-3 text-night"}`}
                onClick={() => setLevel(lv)}
              >
                {t(`family.level.${lv}`)}
              </button>
            ))}
          </div>
          {/* Avatar picker */}
          <p className="mb-2 text-sm font-semibold text-night">{t("family.pickAvatar")}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {AVATARS.map((c) => (
              <button
                key={c}
                className={`h-9 w-9 rounded-full border-4 ${avatar === c ? "border-clay" : "border-transparent"}`}
                style={{ background: c }}
                onClick={() => setAvatar(c)}
                aria-label={c}
              />
            ))}
          </div>
          {err && <p className="mb-2 text-sm text-red-600">{err}</p>}
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-xl border border-sand-3 py-3 font-bold text-muted"
              onClick={() => { setAdding(false); setErr(null); setName(""); }}
            >
              {t("common.cancel")}
            </button>
            <button className="flex-1 rounded-xl bg-clay py-3 font-bold text-white" onClick={doAdd}>
              {t("family.addMember")}
            </button>
          </div>
        </div>
      )}

      {/* Family Làmb Night */}
      {familyNightOn && allMembers.length >= 2 && (
        <Link
          href="/family/night/"
          className="mb-4 flex items-center gap-4 rounded-2xl border border-clay/30 bg-gradient-to-r from-clay/10 to-transparent p-5"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-clay text-2xl text-white">🤼</span>
          <div>
            <p className="font-display font-extrabold text-night">{t("night.title")}</p>
            <p className="text-sm text-muted">{t("night.subtitle")}</p>
          </div>
        </Link>
      )}

      {/* Confirm remove dialog */}
      {confirmRemove !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-xl">
            <p className="mb-4 text-center font-bold text-night">
              {t("family.confirmRemove", { name: allMembers.find((p) => p.id === confirmRemove)?.name ?? "" })}
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-xl border border-sand-3 py-3 font-bold text-muted"
                onClick={() => setConfirmRemove(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white"
                onClick={() => doRemove(confirmRemove)}
              >
                {t("family.remove")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice when not main */}
      {iAmChild && (
        <p className="mt-6 text-center text-sm text-muted">{t("family.mainOnly")}</p>
      )}
    </div>
  );
}
