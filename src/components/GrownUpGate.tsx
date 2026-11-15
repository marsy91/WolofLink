// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * GrownUpGate: wraps any action that a child profile needs a grown-up for.
 * Shows a multiplication challenge; on success, calls onPass and stays open
 * for GROWN_UP_OPEN_MS (5 minutes) so the grown-up doesn't have to re-answer.
 */
"use client";

import { useCallback, useId, useState } from "react";
import { closeGrownUp, grownUpOpen, grownUpQuestion, isGrownUpAnswer, openGrownUp } from "@/lib/grownup";
import { useStore } from "@/lib/store";

interface Props {
  /** If true the gate renders nothing and calls children directly. */
  skip?: boolean;
  /** Called once the grown-up passes the check. */
  onPass: () => void;
  children: (ask: () => void) => React.ReactNode;
}

export function GrownUpGate({ skip, onPass, children }: Props) {
  const { t } = useStore();
  const [open, setOpen] = useState(false);
  const [seed] = useState(() => Math.floor(Math.random() * 65535));
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(false);
  const id = useId();

  const ask = useCallback(() => {
    if (skip || grownUpOpen()) {
      onPass();
      return;
    }
    setTyped("");
    setWrong(false);
    setOpen(true);
  }, [skip, onPass]);

  const submit = useCallback(() => {
    const q = grownUpQuestion(seed);
    if (isGrownUpAnswer(q, typed)) {
      openGrownUp();
      setOpen(false);
      onPass();
    } else {
      setWrong(true);
      setTyped("");
    }
  }, [seed, typed, onPass]);

  const q = grownUpQuestion(seed);

  return (
    <>
      {children(ask)}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="mb-1 text-center font-display text-xl font-extrabold text-night">{t("grown.title")}</h2>
            <p className="mb-4 text-center text-muted">{t("grown.hint", { a: String(q.a), b: String(q.b) })}</p>
            <label htmlFor={id} className="mb-1 block text-sm font-semibold text-night">
              {t("grown.answer")}
            </label>
            <input
              id={id}
              type="number"
              inputMode="numeric"
              className="mb-1 w-full rounded-xl border border-sand-3 bg-bg px-4 py-3 text-center text-2xl font-bold text-night focus:outline-none focus:ring-2 focus:ring-clay"
              value={typed}
              onChange={(e) => { setTyped(e.target.value); setWrong(false); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
            {wrong && <p className="mb-2 text-center text-sm text-red-600">{t("grown.wrong")}</p>}
            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-sand-3 py-3 font-bold text-muted"
                onClick={() => { setOpen(false); closeGrownUp(); }}
              >
                {t("common.cancel")}
              </button>
              <button
                className="flex-1 rounded-xl bg-clay py-3 font-bold text-white"
                onClick={submit}
              >
                {t("grown.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
