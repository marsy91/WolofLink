// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * "Your organisation" on the account screen: join with a team code, see the
 * organisations you belong to, and leave them. The server
 * (supabase/migrations/*_organisations.sql) enforces every rule.
 */
import { useCallback, useEffect, useState } from "react";
import { Button, Dialog } from "@/components/ui";
import type { UiKey } from "@/i18n";
import { CloudError, getCloud, type CloudErrorKind, type Membership } from "@/lib/cloud";
import { useStore } from "@/lib/store";

const ERRORS: Partial<Record<CloudErrorKind, UiKey>> = {
  unknown_code: "org.errCode",
  not_found: "org.errCode",
  org_full: "org.errFull",
  org_suspended: "org.errSuspended",
  forbidden: "org.errForbidden",
  rate_limited: "acct.errRate",
};

export function OrgSection({ defaultName }: { defaultName: string }) {
  const { t } = useStore();
  const cloud = getCloud();
  const [orgs, setOrgs] = useState<Membership[] | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState(defaultName);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UiKey | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<Membership | null>(null);

  const load = useCallback(async () => {
    if (!cloud) return;
    try {
      setOrgs(await cloud.myOrganisations());
    } catch {
      setOrgs([]);
    }
  }, [cloud]);

  useEffect(() => {
    let alive = true;
    cloud
      ?.myOrganisations()
      .then((rows) => alive && setOrgs(rows))
      .catch(() => alive && setOrgs([]));
    return () => {
      alive = false;
    };
  }, [cloud]);

  if (!cloud) return null;

  const fail = (e: unknown) => setError((e instanceof CloudError && ERRORS[e.kind]) || "acct.errNetwork");

  const join = async () => {
    setError(null);
    setNotice(null);
    if (!name.trim()) return setError("org.errName");
    setBusy(true);
    try {
      const rows = await cloud.rpc<{ org_id: string; org_name: string }[]>("join_organisation", {
        code,
        member_name: name.trim(),
      });
      setNotice(t("org.joined", { org: rows?.[0]?.org_name ?? "" }));
      setCode("");
      setConsent(false);
      await load();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const leave = async (m: Membership) => {
    setBusy(true);
    try {
      await cloud.leaveOrganisation(m.orgId);
      setNotice(t("org.left", { org: m.orgName }));
      await load();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
      setLeaving(null);
    }
  };

  const field =
    "w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-3 text-lg outline-none focus:border-clay disabled:opacity-60";

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]" aria-labelledby="org-h">
      <h2 id="org-h" className="font-display text-lg font-extrabold text-night">
        {t("org.title")}
      </h2>
      {notice ? (
        <p role="status" className="rounded-2xl bg-sea-soft p-3 text-sea">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-2xl bg-berry-soft p-3 text-berry">
          {t(error)}
        </p>
      ) : null}

      {orgs && orgs.length > 0 ? (
        <ul className="space-y-2">
          {orgs.map((m) => (
            <li key={m.orgId} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-sand-3 p-3">
              <span className="min-w-0">
                <span className="block truncate font-bold text-night">
                  {m.role === "admin" ? t("org.adminOf", { org: m.orgName }) : t("org.memberOf", { org: m.orgName })}
                </span>
                <span className="text-sm text-muted">{m.displayName}</span>
              </span>
              <Button variant="secondary" disabled={busy} onClick={() => setLeaving(m)}>
                {t("org.leave")}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-muted">{t("org.intro")}</p>
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-muted">{t("org.code")}</span>
        <input
          value={code}
          disabled={busy}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={`${field} text-center font-display tracking-[0.3em]`}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-muted">{t("org.name")}</span>
        <input value={name} disabled={busy} maxLength={60} onChange={(e) => setName(e.target.value)} className={field} />
      </label>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-clay"
        />
        <span>{t("org.consent")}</span>
      </label>
      <Button
        block
        disabled={busy || code.replace(/[^A-Za-z0-9]/g, "").length !== 8 || !name.trim() || !consent}
        onClick={() => void join()}
      >
        {t("org.join")}
      </Button>

      <Dialog open={!!leaving} onClose={() => setLeaving(null)} title={t("org.leave")}>
        <p className="mb-5 text-muted">{leaving ? t("org.leaveConfirm", { org: leaving.orgName }) : ""}</p>
        <div className="flex flex-col gap-3">
          <Button block variant="wrong" disabled={busy} onClick={() => leaving && void leave(leaving)}>
            {t("org.leave")}
          </Button>
          <Button block variant="secondary" onClick={() => setLeaving(null)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
