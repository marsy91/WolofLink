// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useRef, useState } from "react";
import { Button, TabScreen } from "@/components/ui";
import { course } from "@/content/course";
import { translate } from "@/i18n";
import { playEntry, speakMeaning, stopAudio, waitForClip } from "@/lib/audio";
import { LISTEN_STEPS, PAUSE_MS, listenPlaylist, nextPosition, type ListenSource } from "@/lib/listen";
import { useStore } from "@/lib/store";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Hands-free listening: hear each line, slowly, then its meaning. */
export default function ListenPage() {
  const { progress, lang, t } = useStore();
  const [source, setSource] = useState<ListenSource>(Object.keys(progress.srs).length ? "learned" : (course.units[0]?.id ?? ""));
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ line: 0, step: 0 });
  const [loop, setLoop] = useState(true);
  const [sayMeaning, setSayMeaning] = useState(true);
  const run = useRef(0);
  const lock = useRef<{ release: () => Promise<void> } | null>(null);

  const playlist = listenPlaylist(source, progress);
  const entry = course.entries[playlist[pos.line] ?? ""];

  // Play the current step, then move on. A new run id cancels the previous one.
  useEffect(() => {
    if (!playing || !entry) return;
    const id = ++run.current;
    const step = LISTEN_STEPS[pos.step];
    void (async () => {
      if (step === "wolof" || step === "slow") {
        await playEntry(entry, { slow: step === "slow" });
        await waitForClip();
      } else if (step === "meaning" && sayMeaning) {
        await speakMeaning(translate(entry.tr, lang), lang);
      } else {
        await wait(PAUSE_MS);
      }
      if (run.current !== id) return;
      const next = nextPosition(pos.line, pos.step, playlist.length, loop);
      if (next) setPos(next);
      else setPlaying(false);
    })();
  }, [playing, pos, entry, lang, loop, sayMeaning, playlist.length]);

  // Keep the screen awake while playing (the phone would pause the audio otherwise).
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    if (playing && nav.wakeLock) {
      void nav.wakeLock
        .request("screen")
        .then((l) => (lock.current = l))
        .catch(() => {});
    }
    return () => {
      void lock.current?.release().catch(() => {});
      lock.current = null;
    };
  }, [playing]);

  useEffect(
    () => () => {
      run.current++;
      stopAudio();
    },
    [],
  );

  const stop = () => {
    run.current++;
    stopAudio();
    setPlaying(false);
  };
  const jump = (line: number) => {
    run.current++;
    stopAudio();
    setPos({ line: (line + playlist.length) % Math.max(1, playlist.length), step: 0 });
  };
  const showMeaning = LISTEN_STEPS.indexOf("meaning") <= pos.step || !playing;

  return (
    <TabScreen title={t("listen.title")}>
      <p className="mb-4 text-muted">{t("listen.intro")}</p>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-bold text-muted">{t("listen.what")}</span>
        <select
          className="w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-3 text-base"
          value={source}
          onChange={(e) => {
            stop();
            setSource(e.target.value);
            setPos({ line: 0, step: 0 });
          }}
        >
          {Object.keys(progress.srs).length ? <option value="learned">{t("listen.learned")}</option> : null}
          {course.units.map((u, i) => (
            <option key={u.id} value={u.id}>
              {t("path.unit", { n: i + 1 })}: {translate(u.title, lang)}
            </option>
          ))}
        </select>
      </label>

      {entry ? (
        <section className="mb-4 rounded-3xl bg-night p-6 text-center text-sand" aria-live="polite">
          <p className="mb-1 text-sm font-bold text-sand/70">
            {pos.line + 1} / {playlist.length}
          </p>
          <p lang="wo" className="font-display text-3xl leading-tight font-extrabold">
            {entry.wo}
          </p>
          <p className={`mt-2 text-lg text-sand/85 transition-opacity ${showMeaning ? "opacity-100" : "opacity-0"}`}>
            {translate(entry.tr, lang)}
          </p>
        </section>
      ) : (
        <p className="mb-4 rounded-2xl bg-white p-4 text-muted">{t("listen.empty")}</p>
      )}

      <div className="mb-4 flex gap-2">
        <Button variant="secondary" disabled={!entry} onClick={() => jump(pos.line - 1)} aria-label={t("listen.prev")}>
          ⏮
        </Button>
        <Button block disabled={!entry} onClick={() => (playing ? stop() : setPlaying(true))}>
          {playing ? t("listen.pause") : t("listen.play")}
        </Button>
        <Button variant="secondary" disabled={!entry} onClick={() => jump(pos.line + 1)} aria-label={t("listen.next")}>
          ⏭
        </Button>
      </div>

      <label className="mb-2 flex items-center gap-3 rounded-2xl bg-white p-3 font-bold">
        <input type="checkbox" className="h-5 w-5" checked={sayMeaning} onChange={(e) => setSayMeaning(e.target.checked)} />
        {t("listen.sayMeaning")}
      </label>
      <label className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 font-bold">
        <input type="checkbox" className="h-5 w-5" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
        {t("listen.loop")}
      </label>
      <p className="text-sm text-muted">{t("listen.tip")}</p>
    </TabScreen>
  );
}
