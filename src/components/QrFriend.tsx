// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useRef, useState } from "react";
import { codeFromQr, qrPayload } from "@/lib/community";
import { useStore } from "@/lib/store";

/** Minimal shape of the browser's BarcodeDetector (not in TypeScript's DOM types yet). */
interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
type DetectorCtor = new (opts: { formats: string[] }) => Detector;

/** The phone's barcode detector, or null when this phone can't scan. */
function detectorCtor(): DetectorCtor | null {
  const Ctor = (globalThis as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
  return Ctor && typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function" ? Ctor : null;
}

/**
 * "Add in person": shows my friend code as a QR code and scans a friend's.
 * Scanning uses the phone's built-in barcode detector; nothing leaves the phone.
 */
export function QrFriend({ code, onCode }: { code: string; onCode: (code: string) => void }) {
  const { t } = useStore();
  const [modules, setModules] = useState<boolean[][] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Draw the QR code (library loaded only on this screen).
  useEffect(() => {
    let alive = true;
    void import("qrcode-generator").then(({ default: qrcode }) => {
      const qr = qrcode(0, "M");
      qr.addData(qrPayload(code));
      qr.make();
      const n = qr.getModuleCount();
      const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
      if (alive) setModules(grid);
    });
    return () => {
      alive = false;
    };
  }, [code]);

  // Scan with the camera while `scanning` is on.
  useEffect(() => {
    if (!scanning) return;
    const Ctor = detectorCtor();
    if (!Ctor) return;
    let stream: MediaStream | null = null;
    let timer = 0;
    let stopped = false;
    const detector = new Ctor({ formats: ["qr_code"] });
    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (stopped || !video.current) return;
        video.current.srcObject = s;
        void video.current.play();
        const tick = async () => {
          if (stopped || !video.current) return;
          try {
            const found = await detector.detect(video.current);
            for (const f of found) {
              const c = codeFromQr(f.rawValue);
              if (c) {
                setScanning(false);
                onCode(c);
                return;
              }
              setNote(t("qr.notOurs"));
            }
          } catch {
            /* frame not ready */
          }
          timer = window.setTimeout(() => void tick(), 300);
        };
        void tick();
      })
      .catch(() => {
        setNote(t("qr.cameraDenied"));
        setScanning(false);
      });
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [scanning, onCode, t]);

  const n = modules?.length ?? 0;
  return (
    <section className="mb-4 rounded-3xl border border-sand-3/60 bg-white p-4 shadow-card" aria-labelledby="qr-h">
      <h2 id="qr-h" className="mb-1 font-display text-lg font-extrabold text-night">
        {t("qr.title")}
      </h2>
      <p className="mb-3 text-sm text-muted">{t("qr.hint")}</p>
      {scanning ? (
        <video ref={video} className="mb-3 aspect-square w-full rounded-2xl bg-night object-cover" muted playsInline />
      ) : modules ? (
        <svg
          viewBox={`-2 -2 ${n + 4} ${n + 4}`}
          className="mx-auto mb-3 block h-52 w-52 rounded-xl bg-white"
          role="img"
          aria-label={t("qr.title")}
          shapeRendering="crispEdges"
        >
          <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#ffffff" />
          {modules.flatMap((row, r) => row.map((dark, c) => (dark ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#1d2550" /> : null)))}
        </svg>
      ) : (
        <div className="mx-auto mb-3 h-52 w-52 animate-pulse rounded-xl bg-sand-2" />
      )}
      <button
        type="button"
        onClick={() => {
          if (!scanning && !detectorCtor()) {
            setNote(t("qr.unsupported"));
            return;
          }
          setNote(null);
          setScanning((s) => !s);
        }}
        className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-sand-3 bg-white font-display font-extrabold text-night"
      >
        {scanning ? t("qr.stop") : t("qr.scan")}
      </button>
      {note ? (
        <p role="status" className="mt-2 text-sm font-bold text-muted">
          {note}
        </p>
      ) : null}
    </section>
  );
}
