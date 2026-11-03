// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconSpeaker } from "@/components/icons";
import { Button, Loading, TabScreen } from "@/components/ui";
import { translate } from "@/i18n";
import { useAccount } from "@/lib/account";
import { getCloud } from "@/lib/cloud";
import { extFor, nextLines, pickMime, safeName, useRecorderStatus } from "@/lib/recorder";
import { useStore } from "@/lib/store";
import { useSwitchOff } from "@/lib/notices";
import { Paused } from "@/components/Paused";

const MAX_MS = 12_000;
type Progress = { entry_id: string; mine: boolean; approved: boolean }[];

export default function RecordPage() {
  const { lang, t } = useStore();
  const { user } = useAccount();
  const [status, refresh] = useRecorderStatus();
  const [done, setDone] = useState<Progress | null>(null);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "recording" | "recorded" | "sending" | "sent" | "failed" | "denied">("idle");
  const [take, setTake] = useState<{ blob: Blob; ms: number; mime: string; url: string } | null>(null);
  const paused = useSwitchOff("voices");
  const rec = useRef<{ mr: MediaRecorder; stream: MediaStream; started: number; timer: number } | null>(null);

  useEffect(() => {
    let alive = true;
    if (!status.isRecorder || !status.consented) return;
    getCloud()
      ?.rpc<Progress>("recorder_progress")
      .then((rows) => alive && setDone(rows ?? []))
      .catch(() => alive && setDone([]));
    return () => {
      alive = false;
    };
  }, [status.isRecorder, status.consented]);

  const queue = useMemo(() => (done ? nextLines(done, skipped) : []), [done, skipped]);
  const entry = queue[0];

  useEffect(() => () => rec.current?.stream.getTracks().forEach((tr) => tr.stop()), []);

  if (paused) return <Paused back="/profile/" />;
  if (user === undefined || (user && !status.loaded)) return <Loading />;
  if (!user || !status.isRecorder) {
    return (
      <TabScreen title={t("rec.title")}>
        <p className="rounded-2xl bg-white p-4 text-muted">{user ? t("rec.notInvited") : t("rec.signIn")}</p>
      </TabScreen>
    );
  }

  if (!status.consented) {
    return (
      <TabScreen title={t("rec.title")}>
        <section className="rounded-3xl bg-white p-5">
          <h2 className="mb-2 font-display text-xl font-extrabold text-night">{t("rec.termsTitle")}</h2>
          <p className="mb-4 whitespace-pre-line text-ink">{t("rec.terms")}</p>
          <label className="mb-4 flex items-start gap-2 font-bold">
            <input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            {t("rec.agree")}
          </label>
          <Button
            block
            disabled={!agree}
            onClick={() =>
              void getCloud()
                ?.rpc("recorder_consent")
                .then(refresh)
                .catch(() => setState("failed"))
            }
          >
            {t("rec.start")}
          </Button>
        </section>
      </TabScreen>
    );
  }

  const stopRecording = () => {
    const r = rec.current;
    if (r && r.mr.state !== "inactive") r.mr.stop();
  };

  const startRecording = async () => {
    const mime = pickMime();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      mr.onstop = () => {
        const r = rec.current;
        stream.getTracks().forEach((tr) => tr.stop());
        if (!r) return;
        window.clearTimeout(r.timer);
        const type = (mr.mimeType || mime || "audio/webm").split(";")[0]!;
        const blob = new Blob(chunks, { type });
        setTake({ blob, ms: Math.round(performance.now() - r.started), mime: type, url: URL.createObjectURL(blob) });
        setState("recorded");
        rec.current = null;
      };
      mr.start();
      rec.current = { mr, stream, started: performance.now(), timer: window.setTimeout(stopRecording, MAX_MS) };
      setTake(null);
      setState("recording");
    } catch {
      setState("denied");
    }
  };

  const send = async () => {
    const cloud = getCloud();
    if (!take || !entry || !cloud?.uploadFile) return;
    setState("sending");
    try {
      const path = `${user.id}/${safeName(entry.id)}-${Date.now()}.${extFor(take.mime)}`;
      await cloud.uploadFile("recordings", path, take.blob, take.mime);
      await cloud.rpc("submit_recording", {
        entry: entry.id,
        file_path: path,
        duration: Math.max(300, Math.min(15000, take.ms)),
        file_mime: take.mime,
      });
      setDone((d) => [...(d ?? []), { entry_id: entry.id, mine: true, approved: false }]);
      setTake(null);
      setState("sent");
      refresh();
    } catch {
      setState("failed");
    }
  };

  return (
    <TabScreen title={t("rec.title")}>
      <p className="mb-1 text-sm font-bold text-sea">{t("rec.stats", { a: status.approved, w: status.waiting })}</p>
      <p className="mb-4 text-sm text-muted">{t("rec.tips")}</p>
      {!done ? (
        <Loading />
      ) : !entry ? (
        <p className="rounded-2xl bg-white p-4 font-bold text-sea">{t("rec.allDone")}</p>
      ) : (
        <section className="rounded-3xl bg-white p-5 text-center shadow-[0_3px_0_var(--color-sand-3)]">
          <p lang="wo" className="font-display text-3xl leading-tight font-extrabold text-night">
            {entry.wo}
          </p>
          <p className="mt-1 text-muted">{translate(entry.tr, lang)}</p>
          {entry.note ? <p className="mt-1 text-sm text-sea">{translate(entry.note, lang)}</p> : null}

          <button
            type="button"
            onClick={() => (state === "recording" ? stopRecording() : void startRecording())}
            aria-pressed={state === "recording"}
            className={`mx-auto mt-6 grid h-24 w-24 place-items-center rounded-full font-display text-sm font-extrabold text-white shadow-lg ${
              state === "recording" ? "animate-pulse bg-berry" : "bg-clay"
            }`}
          >
            {state === "recording" ? "■" : "●"}
          </button>
          <p className="mt-2 text-sm font-bold text-night">{state === "recording" ? t("rec.recording") : t("rec.tapRecord")}</p>

          {take && state !== "recording" ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => void new Audio(take.url).play()}>
                <IconSpeaker size={18} /> {t("rec.listen")}
              </Button>
              <Button disabled={state === "sending"} onClick={() => void send()}>
                {t("rec.send")}
              </Button>
            </div>
          ) : null}

          {state === "sent" ? (
            <p role="status" className="mt-3 text-sm font-bold text-sea">
              {t("rec.sent")}
            </p>
          ) : null}
          {state === "failed" ? (
            <p role="alert" className="mt-3 text-sm font-bold text-berry">
              {t("rec.failed")}
            </p>
          ) : null}
          {state === "denied" ? (
            <p role="alert" className="mt-3 text-sm font-bold text-berry">
              {t("rec.micDenied")}
            </p>
          ) : null}

          <button
            type="button"
            className="mt-4 text-sm font-bold text-muted underline"
            onClick={() => {
              setSkipped((s) => new Set(s).add(entry.id));
              setTake(null);
              setState("idle");
            }}
          >
            {t("rec.skip")}
          </button>
        </section>
      )}
      {status.canApprove ? (
        <Link href="/voice-review/" className="mt-4 block text-center font-bold text-clay underline">
          {t("rec.review")}
        </Link>
      ) : null}
    </TabScreen>
  );
}
