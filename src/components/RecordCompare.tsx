// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/content/types";
import { playEntry, stopAudio } from "@/lib/audio";
import { pickMime } from "@/lib/recorder";
import { useStore } from "@/lib/store";
import { IconMic, IconSpeaker } from "./icons";

/** Longest practice take; plenty for any line in the course. */
export const PRACTICE_MAX_MS = 8000;

/**
 * Record yourself saying a line and play it next to the model voice. The take
 * stays in memory on the phone and is thrown away when you move on.
 */
export function RecordCompare({ entry, disabled }: { entry: Entry; disabled?: boolean }) {
  const { t } = useStore();
  const [state, setState] = useState<"idle" | "recording" | "ready" | "denied">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<{ mr: MediaRecorder; stream: MediaStream; timer: number } | null>(null);
  const mine = useRef<HTMLAudioElement | null>(null);
  const supported = typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  useEffect(
    () => () => {
      rec.current?.stream.getTracks().forEach((tr) => tr.stop());
      mine.current?.pause();
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
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        window.clearTimeout(rec.current?.timer);
        rec.current = null;
        const blob = new Blob(chunks, { type: (mr.mimeType || mime || "audio/webm").split(";")[0] });
        setUrl(URL.createObjectURL(blob));
        setState("ready");
      };
      mr.start();
      rec.current = { mr, stream, timer: window.setTimeout(stop, PRACTICE_MAX_MS) };
      setState("recording");
    } catch {
      setState("denied");
    }
  };
  const playMine = () => {
    if (!url) return;
    stopAudio();
    mine.current?.pause();
    mine.current = new Audio(url);
    void mine.current.play().catch(() => {});
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (state === "recording" ? stop() : void start())}
        aria-label={state === "recording" ? t("speak.stop") : t("speak.record")}
        className={`grid h-20 w-20 place-items-center rounded-full text-white transition ${
          state === "recording" ? "animate-pulse bg-berry" : "bg-dusk"
        } disabled:opacity-50`}
      >
        <IconMic size={36} />
      </button>
      <p className="text-sm font-bold text-muted">
        {state === "recording" ? t("speak.recording") : state === "denied" ? t("speak.denied") : state === "ready" ? t("speak.compare") : t("speak.tapToRecord")}
      </p>
      {state === "ready" ? (
        <div className="flex gap-2">
          <button type="button" onClick={playMine} className="flex items-center gap-1.5 rounded-full bg-dusk-soft px-4 py-2 text-sm font-extrabold text-dusk">
            <IconMic size={16} /> {t("speak.playMine")}
          </button>
          <button
            type="button"
            onClick={() => {
              mine.current?.pause();
              void playEntry(entry);
            }}
            className="flex items-center gap-1.5 rounded-full bg-sea-soft px-4 py-2 text-sm font-extrabold text-sea"
          >
            <IconSpeaker size={16} /> {t("speak.playModel")}
          </button>
        </div>
      ) : null}
      <p className="max-w-xs text-center text-xs text-muted">{t("speak.private")}</p>
    </div>
  );
}
