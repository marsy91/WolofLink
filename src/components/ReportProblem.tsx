// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useState } from "react";
import { PROBLEMS, reportsAvailable, sendReport, type Problem } from "@/lib/reports";
import { useStore } from "@/lib/store";
import { Button, Dialog } from "./ui";

/** A small "Report a problem" link that opens a dialog for one word or phrase. */
export function ReportProblem({ entryId, className = "" }: { entryId: string; className?: string }) {
  const { lang, t } = useStore();
  const [open, setOpen] = useState(false);
  const [problem, setProblem] = useState<Problem>("spelling");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "failed">("idle");
  if (!reportsAvailable()) return null;

  const close = () => {
    setOpen(false);
    if (state === "sent") {
      setState("idle");
      setNote("");
    }
  };
  const send = async () => {
    setState("busy");
    try {
      await sendReport(entryId, problem, note, lang);
      setState("sent");
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (state !== "busy") setState("idle");
        }}
        className={`text-sm font-bold text-muted underline underline-offset-2 ${className}`}
      >
        <span aria-hidden>⚑</span> {t("report.open")}
      </button>
      <Dialog open={open} onClose={close} title={t("report.open")}>
        {state === "sent" ? (
          <>
            <p role="status" className="mb-4 text-sea">
              {t("report.sent")}
            </p>
            <Button block onClick={close}>
              {t("common.continue")}
            </Button>
          </>
        ) : (
          <>
            <fieldset className="mb-3">
              <legend className="mb-1 font-bold text-night">{t("report.what")}</legend>
              {PROBLEMS.map((p) => (
                <label key={p} className="flex items-center gap-2 py-1">
                  <input type="radio" name="problem" checked={problem === p} onChange={() => setProblem(p)} />
                  {t(`report.${p}`)}
                </label>
              ))}
            </fieldset>
            <label className="mb-2 block">
              <span className="mb-1 block text-sm font-bold text-muted">{t("report.comment")}</span>
              <textarea
                value={note}
                maxLength={500}
                rows={3}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("report.placeholder")}
                className="w-full rounded-xl border-2 border-sand-3 bg-white px-3 py-2 outline-none focus:border-clay"
              />
            </label>
            <p className="mb-3 text-xs text-muted">{t("report.privacy")}</p>
            {state === "failed" ? (
              <p role="alert" className="mb-3 text-sm font-bold text-berry">
                {t("report.failed")}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={close}>
                {t("common.cancel")}
              </Button>
              <Button className="flex-1" disabled={state === "busy"} onClick={() => void send()}>
                {t("report.send")}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
