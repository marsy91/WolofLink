// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useState } from "react";
import { Button, Dialog } from "@/components/ui";
import { community, REPORT_REASONS, type ReportReason } from "@/lib/community";
import { useStore } from "@/lib/store";

const REASON_KEY: Record<ReportReason, "safety.reason.harassment" | "safety.reason.spam" | "safety.reason.name" | "safety.reason.handle" | "safety.reason.underage" | "safety.reason.other"> = {
  harassment: "safety.reason.harassment",
  spam: "safety.reason.spam",
  "inappropriate name": "safety.reason.name",
  "inappropriate handle": "safety.reason.handle",
  underage: "safety.reason.underage",
  other: "safety.reason.other",
};

/** Block and Report buttons for another learner, with their confirmation dialogs. */
export function SafetyActions({ userId, name, onBlocked }: { userId: string; name: string; onBlocked?: () => void }) {
  const { t } = useStore();
  const [open, setOpen] = useState<"block" | "report" | null>(null);
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const block = async () => {
    setBusy(true);
    try {
      await community.block(userId);
      setOpen(null);
      setDone(t("safety.blocked", { name }));
      onBlocked?.();
    } catch {
      setDone(t("community.error"));
    } finally {
      setBusy(false);
    }
  };
  const report = async () => {
    setBusy(true);
    try {
      await community.report(userId, reason, note);
      setOpen(null);
      setDone(t("safety.reported"));
    } catch (e) {
      setDone(/too many/.test((e as Error)?.message ?? "") ? t("community.tooMany") : t("community.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen("block")} className="rounded-xl border border-sand-3 px-3 py-2 text-sm font-bold text-night">
          {t("safety.block")}
        </button>
        <button type="button" onClick={() => setOpen("report")} className="rounded-xl border border-sand-3 px-3 py-2 text-sm font-bold text-berry">
          {t("safety.report")}
        </button>
      </div>
      {done ? (
        <p role="status" className="mt-2 text-sm font-bold text-sea">
          {done}
        </p>
      ) : null}

      <Dialog open={open === "block"} onClose={() => setOpen(null)} title={t("safety.blockTitle", { name })}>
        <p className="mb-5 text-muted">{t("safety.blockBody")}</p>
        <div className="flex flex-col gap-3">
          <Button block variant="wrong" disabled={busy} onClick={() => void block()}>
            {t("safety.block")}
          </Button>
          <Button block variant="secondary" onClick={() => setOpen(null)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Dialog>

      <Dialog open={open === "report"} onClose={() => setOpen(null)} title={t("safety.reportTitle", { name })}>
        <fieldset className="mb-3 space-y-1">
          {REPORT_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 py-1">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
              <span>{t(REASON_KEY[r])}</span>
            </label>
          ))}
        </fieldset>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-bold text-muted">{t("safety.reportNote")}</span>
          <textarea
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-2xl border border-sand-3 bg-white p-3"
            rows={3}
          />
        </label>
        <div className="flex flex-col gap-3">
          <Button block disabled={busy} onClick={() => void report()}>
            {t("safety.reportSend")}
          </Button>
          <Button block variant="secondary" onClick={() => setOpen(null)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
