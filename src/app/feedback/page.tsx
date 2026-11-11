// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconCheck, IconStar } from "@/components/icons";
import { Paused } from "@/components/Paused";
import { Button, TabScreen } from "@/components/ui";
import { useAccount } from "@/lib/account";
import {
  FEEDBACK_KINDS,
  FEEDBACK_MAX,
  asksForReview,
  cleanScreen,
  feedbackProblem,
  flushFeedback,
  sendFeedback,
  type FeedbackKind,
  type SendResult,
} from "@/lib/feedback";
import { useSwitchOff } from "@/lib/notices";
import { useStore } from "@/lib/store";

const PLAY_URL = "https://play.google.com/store/apps/details?id=app.woloflink.learn";

/** Send an idea, a bug, a Wolof correction or anything else to the WolofLink team. */
export default function FeedbackPage() {
  const { lang, t } = useStore();
  const { user } = useAccount();
  const paused = useSwitchOff("feedback");
  const [kind, setKind] = useState<FeedbackKind>("idea");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState(false);
  const [from, setFrom] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    void Promise.resolve().then(() => {
      setFrom(cleanScreen(q.get("from")));
      if (q.get("kind") === "wolof") setKind("wolof");
    });
    // Anything written offline earlier goes out now.
    void flushFeedback();
  }, []);

  if (paused) return <Paused back="/profile/" />;

  const problem = feedbackProblem({ kind, rating, message });
  const send = async () => {
    if (problem || busy) return;
    setBusy(true);
    try {
      setResult(await sendFeedback({ kind, rating, message, contact: !!user && contact, lang, screen: from }));
    } catch {
      setResult("unavailable");
    } finally {
      setBusy(false);
    }
  };

  if (result === "sent" || result === "queued") {
    return (
      <TabScreen title={t("feedback.title")}>
        <section className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-card">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-sea-soft text-sea">
            <IconCheck size={30} />
          </span>
          <h2 className="font-display text-2xl font-extrabold text-night">{t("feedback.thanks")}</h2>
          <p className="text-muted">{t(result === "sent" ? "feedback.sent" : "feedback.queued")}</p>
          {asksForReview(rating) ? (
            <div className="mt-2 w-full rounded-2xl bg-sun-soft p-4">
              <p className="mb-3 font-bold text-night">{t("feedback.rateAsk")}</p>
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-night px-5 font-display font-extrabold text-sand"
              >
                {t("feedback.rateButton")}
              </a>
            </div>
          ) : null}
          <Link href="/profile/" className="mt-2 font-bold text-clay underline">
            {t("feedback.done")}
          </Link>
        </section>
      </TabScreen>
    );
  }

  return (
    <TabScreen title={t("feedback.title")}>
      <p className="mb-4 text-muted">{t("feedback.intro")}</p>

      <fieldset className="mb-5">
        <legend className="mb-2 font-display font-extrabold text-night">{t("feedback.kind")}</legend>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`min-h-11 rounded-full border-2 px-4 font-bold ${kind === k ? "border-night bg-night text-sand" : "border-sand-3 bg-white text-night"}`}
            >
              {t(`feedback.kind.${k}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 font-display font-extrabold text-night">{t("feedback.rating")}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={rating !== null && n <= rating}
              aria-label={t("feedback.stars", { n })}
              onClick={() => setRating(rating === n ? null : n)}
              className={`grid h-12 w-12 place-items-center rounded-xl ${rating !== null && n <= rating ? "text-sun-2" : "text-sand-3"}`}
            >
              <IconStar size={32} filled={rating !== null && n <= rating} />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mb-1 block font-display font-extrabold text-night" htmlFor="fb-message">
        {t("feedback.message")}
      </label>
      <textarea
        id="fb-message"
        value={message}
        maxLength={FEEDBACK_MAX}
        rows={6}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t(`feedback.placeholder.${kind}`)}
        className="w-full rounded-2xl border-2 border-sand-3 bg-white p-3 text-night"
      />
      <p className="mb-4 text-right text-xs text-muted" aria-live="polite">
        {message.length} / {FEEDBACK_MAX}
      </p>

      {user ? (
        <label className="mb-4 flex items-start gap-3 rounded-2xl bg-white p-3">
          <input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} className="mt-1 h-5 w-5" />
          <span className="text-sm text-night">{t("feedback.contact")}</span>
        </label>
      ) : null}

      {result === "paused" || result === "limit" || result === "unavailable" ? (
        <p role="alert" className="mb-3 rounded-2xl bg-berry-soft p-3 text-sm font-bold text-berry">
          {t(`feedback.error.${result}`)}
        </p>
      ) : null}

      <Button block disabled={!!problem || busy} onClick={() => void send()}>
        {t("feedback.send")}
      </Button>
      <p className="mt-3 text-xs text-muted">{t(user && contact ? "feedback.privacyContact" : "feedback.privacy")}</p>
    </TabScreen>
  );
}
