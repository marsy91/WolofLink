// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconLoop, IconProfile } from "@/components/icons";
import { OrgSection } from "@/components/OrgSection";
import { Button, Dialog, Loading } from "@/components/ui";
import type { UiKey } from "@/i18n";
import { canCreateAccount, isBirthDate, todayIso } from "@/lib/age";
import { useAccount } from "@/lib/account";
import type { CloudErrorKind } from "@/lib/cloud";
import { EMAIL_RE } from "@/lib/cloud";
import { useSwitchOn } from "@/lib/notices";
import { useStore } from "@/lib/store";

const ERRORS: Record<CloudErrorKind, UiKey> = {
  invalid_email: "acct.errEmail",
  invalid_code: "acct.errCode",
  rate_limited: "acct.errRate",
  network: "acct.errNetwork",
  unknown: "acct.errNetwork",
  unknown_code: "org.errCode",
  org_suspended: "org.errSuspended",
  org_full: "org.errFull",
  forbidden: "org.errForbidden",
  not_found: "org.errCode",
};

export default function AccountPage() {
  const { ready, progress, lang, t, update } = useStore();
  const account = useAccount();
  const router = useRouter();
  const [email, setEmail] = useState("");
  // Signing up asks for a name as well as the email (used on certificates and for friends).
  const [name, setName] = useState(progress.profile?.name ?? "");
  // Progress is read from storage after the first render: fill in the saved name once it's there.
  const savedName = progress.profile?.name ?? "";
  const [birth, setBirth] = useState(progress.profile?.birthDate ?? "");
  const savedBirth = progress.profile?.birthDate ?? "";
  useEffect(() => {
    if (savedBirth) void Promise.resolve().then(() => setBirth((b) => b || savedBirth));
  }, [savedBirth]);
  useEffect(() => {
    if (savedName) void Promise.resolve().then(() => setName((n) => n || savedName));
  }, [savedName]);
  const [code, setCode] = useState("");
  // Supabase sends 6 digits by default; 8 if the project setting is changed.
  const codeOk = code.length >= 6 && code.length <= 8;
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UiKey | null>(null);
  // With Family play on, a child under 13 is pointed to a family profile instead.
  const familyOn = useSwitchOn("family");
  const [notice, setNotice] = useState<UiKey | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  /**
   * Set when a learner without a profile (from onboarding) signs in here: once
   * the first sync finishes we continue to their path, or to onboarding if the
   * cloud had no profile either. Learners signing in from Profile stay here.
   */
  const [restoreFrom, setRestoreFrom] = useState<number | null>(null);
  // From the welcome screen: "register" (after setup) or "signin" changes the wording.
  const [mode, setMode] = useState<"register" | "signin" | null>(null);
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "register" || m === "signin") void Promise.resolve().then(() => setMode(m));
  }, []);

  // After signing in from onboarding: continue once the first sync has finished.
  useEffect(() => {
    if (!restoreFrom || !account.user || account.status !== "idle") return;
    if (!account.lastSyncedAt || account.lastSyncedAt < restoreFrom) return;
    router.replace(progress.profile ? "/learn/" : "/welcome/");
  }, [restoreFrom, account.user, account.status, account.lastSyncedAt, progress.profile, router]);

  if (!ready || account.user === undefined) return <Loading />;

  const back = () => (progress.profile ? router.replace("/profile/") : router.replace("/welcome/"));
  const field =
    "w-full rounded-2xl border border-sand-3 bg-white px-4 py-3.5 text-lg outline-none focus:border-clay disabled:opacity-60";

  const askName = mode !== "signin";
  const send = async () => {
    setError(null);
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (askName && !cleanName) return setError("acct.errName");
    if (askName && !isBirthDate(birth)) return setError("acct.errBirth");
    if (askName && !canCreateAccount(birth)) return setError(familyOn ? "acct.tooYoungFamily" : "acct.tooYoung");
    if (!EMAIL_RE.test(email.trim())) return setError("acct.errEmail");
    if (askName && progress.profile && (progress.profile.name !== cleanName || progress.profile.birthDate !== birth)) {
      update((p) => (p.profile ? { ...p, profile: { ...p.profile, name: cleanName, birthDate: birth } } : p));
    }
    setBusy(true);
    const err = await account.sendCode(email);
    setBusy(false);
    if (err) return setError(ERRORS[err]);
    setStep("code");
    setCode("");
  };

  const verify = async () => {
    setError(null);
    setBusy(true);
    const err = await account.verifyCode(email, code);
    setBusy(false);
    if (err) return setError(ERRORS[err]);
    if (!progress.profile || mode === "register") setRestoreFrom(Date.now());
  };

  /** Back to a clean email form after leaving the account. */
  const resetForm = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  const signOut = async () => {
    await account.signOut();
    resetForm();
  };

  const remove = async () => {
    setBusy(true);
    const err = await account.deleteAccount();
    setBusy(false);
    setConfirmDelete(false);
    if (err) return setError(ERRORS[err]);
    resetForm();
    setEmail("");
    setNotice("acct.deleted");
  };

  const synced = account.lastSyncedAt
    ? t("acct.synced", { time: new Date(account.lastSyncedAt).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" }) })
    : t("acct.neverSynced");

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5">
      <div className="py-3">
        <button
          type="button"
          onClick={back}
          aria-label={t("common.back")}
          className="grid h-10 w-10 place-items-center rounded-full text-night hover:bg-sand-2"
        >
          <IconArrowLeft />
        </button>
      </div>
      <h1 className="mb-2 font-display text-3xl font-extrabold text-night">
        {t(mode === "register" && !account.user ? "welcome.registerTitle" : mode === "signin" && !account.user ? "welcome.signInTitle" : "acct.title")}
      </h1>
      {mode === "register" && !account.user ? (
        <p className="mb-2">
          <button type="button" onClick={() => router.replace("/learn/")} className="font-bold text-clay underline">
            {t("welcome.skip")}
          </button>
        </p>
      ) : null}

      {notice ? (
        <p role="status" className="mb-4 rounded-2xl bg-sea-soft p-4 text-sea">
          {t(notice)}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-4 rounded-2xl bg-berry-soft p-4 text-berry">
          {t(error)}
        </p>
      ) : null}

      {!account.available ? (
        <p className="text-muted">{t("acct.notConfigured")}</p>
      ) : account.user ? (
        /* ── Signed in ── */
        <div className="space-y-4">
          <section className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night text-sun">
              <IconProfile size={26} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display font-extrabold text-night">
                {t("acct.signedIn", { email: account.user.email ?? "" })}
              </p>
              <p className="text-sm text-muted" aria-live="polite">
                {account.status === "syncing"
                  ? t("acct.syncing")
                  : account.status === "error"
                    ? t("acct.errSync")
                    : synced}
              </p>
            </div>
          </section>
          <Button block variant="secondary" disabled={account.status === "syncing"} onClick={() => void account.syncNow()}>
            <IconLoop size={20} /> {t("acct.syncNow")}
          </Button>
          <OrgSection defaultName={progress.profile?.name ?? ""} />
          <div>
            <Button block variant="secondary" onClick={() => void signOut()}>
              {t("acct.signOut")}
            </Button>
            <p className="mt-2 text-sm text-muted">{t("acct.signOutNote")}</p>
          </div>
          <Button block variant="wrong" onClick={() => setConfirmDelete(true)}>
            {t("acct.delete")}
          </Button>
        </div>
      ) : step === "email" ? (
        /* ── Enter email ── */
        <div className="space-y-4">
          <p className="text-muted">{t("acct.why")}</p>
          {askName ? (
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-muted">{t("acct.name")}</span>
              <input
                type="text"
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={30}
                value={name}
                disabled={busy}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
              <span className="mt-1 block text-xs text-muted">{t("acct.nameHint")}</span>
            </label>
          ) : null}
          {askName ? (
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-muted">{t("acct.birth")}</span>
              <input
                type="date"
                autoComplete="bday"
                min="1900-01-01"
                max={todayIso()}
                value={birth}
                disabled={busy}
                onChange={(e) => setBirth(e.target.value)}
                className={field}
              />
              <span className="mt-1 block text-xs text-muted">{t("acct.birthHint")}</span>
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-muted">{t("acct.email")}</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              className={field}
            />
          </label>
          <Button block disabled={busy || !email.trim() || (askName && (!name.trim() || !birth))} onClick={() => void send()}>
            {t("acct.sendCode")}
          </Button>
          <p className="text-sm text-muted">
            {t("acct.privacy")}{" "}
            <Link href="/privacy/" className="font-bold text-clay underline">
              {t("settings.privacy")}
            </Link>
          </p>
        </div>
      ) : (
        /* ── Enter code ── */
        <div className="space-y-4">
          <p className="text-muted">{t("acct.codeSent", { email: email.trim() })}</p>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-muted">{t("acct.code")}</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={8}
              value={code}
              disabled={busy}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && codeOk && void verify()}
              className={`${field} text-center font-display text-3xl tracking-[0.4em]`}
              autoFocus
            />
          </label>
          <Button block disabled={busy || !codeOk} onClick={() => void verify()}>
            {t("acct.verify")}
          </Button>
          <div className="flex justify-between gap-3">
            <Button variant="ghost" disabled={busy} onClick={() => void send()}>
              {t("acct.resend")}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setStep("email")}>
              {t("acct.changeEmail")}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t("acct.delete")}>
        <p className="mb-5 text-muted">{t("acct.deleteConfirm")}</p>
        <div className="flex flex-col gap-3">
          <Button block variant="wrong" disabled={busy} onClick={() => void remove()}>
            {t("acct.delete")}
          </Button>
          <Button block variant="secondary" onClick={() => setConfirmDelete(false)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Dialog>
    </main>
  );
}
