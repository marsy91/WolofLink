// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LearnTarget } from "@/content/reverse";
import { stopAudio } from "@/lib/audio";
import { base64ToUrl, duelVoice, listenChoices, VOICE_MAX_MS, wordIn, type DuelClip } from "@/lib/duel-voice";
import { pickMime } from "@/lib/recorder";
import { useStore } from "@/lib/store";
import { IconMic, IconSpeaker } from "./icons";

const card = "glass-card w-full rounded-3xl p-5 text-left";
const btn = "btn-game min-h-12 rounded-2xl px-5 font-display font-extrabold uppercase";
const ghost = "min-h-12 rounded-2xl bg-white/80 px-4 font-bold text-night underline";

/** Record one duel word for the other player (voice swap in two-way duels). */
export function VoiceRecordPanel({
  duelId,
  entryId,
  lang,
  name,
  onDone,
}: {
  duelId: string;
  entryId: string;
  lang: LearnTarget;
  name: string;
  onDone: () => void;
}) {
  const { t } = useStore();
  const [state, setState] = useState<"idle" | "recording" | "ready" | "sending" | "sent" | "failed" | "notAllowed" | "denied">("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<{ mr: MediaRecorder; stream: MediaStream; timer: number } | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const supported = typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  useEffect(
    () => () => {
      rec.current?.stream.getTracks().forEach((tr) => tr.stop());
      player.current?.pause();
    },
    [],
  );
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  if (!supported) return null;

  const stop = () => {
    const r = rec.current;
    if (r && r.mr.state !== "inactive") r.mr.stop();
  };
  const start = async () => {
    stopAudio();
    const mime = pickMime();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
      const chunks: Blob[] = [];
      mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        window.clearTimeout(rec.current?.timer);
        rec.current = null;
        const b = new Blob(chunks, { type: (mr.mimeType || mime || "audio/webm").split(";")[0] });
        setBlob(b);
        setUrl(URL.createObjectURL(b));
        setState("ready");
      };
      mr.start();
      rec.current = { mr, stream, timer: window.setTimeout(stop, VOICE_MAX_MS) };
      setState("recording");
    } catch {
      setState("denied");
    }
  };
  const play = () => {
    if (!url) return;
    player.current?.pause();
    player.current = new Audio(url);
    void player.current.play().catch(() => {});
  };
  const send = async () => {
    if (!blob) return;
    setState("sending");
    try {
      await duelVoice.send(duelId, entryId, lang, blob);
      setState("sent");
    } catch (e) {
      setState(/not allowed/i.test(String((e as { message?: string })?.message ?? e)) ? "notAllowed" : "failed");
    }
  };

  if (state === "sent" || state === "notAllowed") {
    return (
      <section className={card} aria-live="polite">
        <p className="mb-3 font-bold text-night">{state === "sent" ? t("voice.sent", { name }) : t("voice.notAllowed")}</p>
        <button type="button" onClick={onDone} className={btn}>
          {t("common.continue")}
        </button>
      </section>
    );
  }

  return (
    <section className={card} aria-labelledby="voice-rec-h">
      <h2 id="voice-rec-h" className="mb-1 font-display text-xl font-extrabold text-night">
        {t("voice.recordTitle", { name })}
      </h2>
      <p className="mb-3 text-sm text-night/80">{t("voice.recordHint", { name })}</p>
      <p lang={lang} className="mb-4 text-center font-display text-3xl font-extrabold text-clay">
        {wordIn(entryId, lang)}
      </p>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => (state === "recording" ? stop() : void start())}
          aria-label={state === "recording" ? t("voice.stop") : state === "ready" ? t("voice.again") : t("voice.record")}
          className={`grid h-16 w-16 place-items-center rounded-full text-white ${state === "recording" ? "animate-pulse bg-berry" : "bg-dusk"}`}
        >
          <IconMic size={30} />
        </button>
        {state === "ready" || state === "sending" || state === "failed" ? (
          <button type="button" onClick={play} className="flex min-h-12 items-center gap-2 rounded-full bg-white/90 px-4 font-extrabold text-night">
            <IconSpeaker size={18} /> {t("voice.play")}
          </button>
        ) : null}
      </div>
      <p className="mb-3 text-center text-sm font-bold text-night/80" aria-live="polite">
        {state === "recording" ? t("voice.recording") : state === "denied" ? t("voice.denied") : state === "failed" ? t("voice.failed") : ""}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={!blob || state === "sending" || state === "recording"} onClick={() => void send()} className={`${btn} disabled:opacity-50`}>
          {t("voice.send")}
        </button>
        <button type="button" onClick={onDone} className={ghost}>
          {t("voice.skip")}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-night/70">{t("voice.privacy", { name })}</p>
    </section>
  );
}

/** Hear the other player's word and guess which one it was; the clip can be reported. */
export function VoiceListenPanel({
  clip,
  entries,
  seed,
  name,
  duelId,
  onDone,
}: {
  clip: DuelClip;
  entries: readonly string[];
  seed: number;
  name: string;
  duelId: string;
  onDone: () => void;
}) {
  const { t } = useStore();
  const [url] = useState(() => base64ToUrl(clip.b64, clip.mime));
  const [picked, setPicked] = useState<string | null>(null);
  const [report, setReport] = useState<"no" | "confirm" | "sending" | "done" | "failed">("no");
  const player = useRef<HTMLAudioElement | null>(null);
  const [choices] = useState(() => listenChoices(clip.entryId, entries, clip.lang, seed));

  useEffect(
    () => () => {
      player.current?.pause();
      URL.revokeObjectURL(url);
    },
    [url],
  );
  const play = () => {
    stopAudio();
    player.current?.pause();
    player.current = new Audio(url);
    void player.current.play().catch(() => {});
  };
  const sendReport = async () => {
    setReport("sending");
    player.current?.pause();
    try {
      await duelVoice.report(duelId);
      setReport("done");
    } catch {
      setReport("failed");
    }
  };

  if (report === "done") {
    return (
      <section className={card} aria-live="polite">
        <p className="mb-3 font-bold text-night">{t("voice.reported")}</p>
        <button type="button" onClick={onDone} className={btn}>
          {t("common.continue")}
        </button>
      </section>
    );
  }

  return (
    <section className={card} aria-labelledby="voice-listen-h">
      <h2 id="voice-listen-h" className="mb-1 font-display text-xl font-extrabold text-night">
        {t("voice.listenTitle", { name })}
      </h2>
      <p className="mb-3 text-sm text-night/80">{t("voice.listenHint", { name })}</p>
      <div className="mb-4 flex justify-center">
        <button type="button" onClick={play} aria-label={t("voice.listen")} className="glass-card glow-gold grid h-20 w-20 place-items-center rounded-full text-clay">
          <IconSpeaker size={36} />
        </button>
      </div>
      <div className="mb-3 grid gap-2">
        {choices.map((c) => {
          const state = picked === null ? "" : c.id === clip.entryId ? "glow-right" : c.id === picked ? "glow-wrong" : "opacity-40";
          return (
            <button
              key={c.id}
              type="button"
              lang={clip.lang}
              disabled={picked !== null}
              onClick={() => setPicked(c.id)}
              className={`glass-card min-h-12 rounded-2xl px-4 py-2 text-left font-bold text-night ${state}`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <p className="mb-3 text-center font-display text-lg font-extrabold text-night" aria-live="polite">
          {picked === clip.entryId ? t("voice.right", { name }) : t("voice.wrong", { name, word: wordIn(clip.entryId, clip.lang) })}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {picked !== null ? (
          <button type="button" onClick={onDone} className={btn}>
            {t("common.continue")}
          </button>
        ) : null}
        {report === "no" || report === "failed" ? (
          <button type="button" onClick={() => setReport("confirm")} className="text-sm font-bold text-night/80 underline">
            ⚑ {t("voice.report")}
          </button>
        ) : null}
      </div>
      {report === "confirm" || report === "sending" ? (
        <div role="alertdialog" aria-labelledby="voice-report-q" className="mt-3 rounded-2xl bg-white/90 p-3">
          <p id="voice-report-q" className="mb-2 text-sm font-bold text-night">
            {t("voice.reportConfirm")}
          </p>
          <div className="flex gap-3">
            <button type="button" disabled={report === "sending"} onClick={() => void sendReport()} className="rounded-xl bg-berry px-4 py-2 font-extrabold text-white">
              {t("voice.reportYes")}
            </button>
            <button type="button" onClick={() => setReport("no")} className="rounded-xl px-4 py-2 font-bold text-night underline">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      ) : null}
      {report === "failed" ? <p className="mt-2 text-sm font-bold text-berry">{t("voice.failed")}</p> : null}
    </section>
  );
}

/** On the Friends screen: words friends recorded for you, waiting to be heard. */
export function VoiceWaiting() {
  const { t } = useStore();
  const [rows, setRows] = useState<{ duel_id: string; speaker_name: string }[]>([]);
  useEffect(() => {
    let alive = true;
    duelVoice
      .waiting()
      .then((r) => alive && setRows(r))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  if (!rows.length) return null;
  return (
    <ul className="mb-4 space-y-2" aria-label={t("voice.listen")}>
      {rows.slice(0, 3).map((r) => (
        <li key={r.duel_id}>
          <Link
            href={`/duel/?listen=${encodeURIComponent(r.duel_id)}`}
            className="arena-sky flex items-center gap-3 rounded-3xl p-4 font-display font-extrabold text-night shadow-card"
          >
            <span aria-hidden className="text-2xl">
              🎧
            </span>
            <span className="min-w-0 flex-1">{t("voice.waiting", { name: r.speaker_name })}</span>
            <span className="btn-game rounded-xl px-3 py-1.5 text-sm uppercase">{t("voice.listen")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
