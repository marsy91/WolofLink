// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Review queue for community recordings (owner console → Voices, and /voice-review
 * for trusted reviewers). English only, like the owner console. Nothing reaches
 * learners until someone approves it here; nobody can approve their own clips.
 */
import { useCallback, useEffect, useState } from "react";
import { dictionaryById } from "@/content/dictionary";
import { getCloud } from "@/lib/cloud";
import { Button, Loading } from "./ui";

export interface QueueRow {
  id: string;
  entry_id: string;
  path: string;
  duration_ms: number;
  status: string;
  auto_score: number | null;
  transcript: string | null;
  flag: string | null;
  recorder: string;
  own: boolean;
  created_at: string;
}

const QUEUES: [string, string, string][] = [
  ["review", "To review", "Passed the automatic check."],
  ["new", "Not checked yet", "The automatic check hasn't run on these yet (or isn't set up). Listen extra carefully."],
  ["flagged", "Flagged", "The automatic check found a problem. Usually reject; approve only if you're sure it's fine."],
  ["approved", "Live", "Voices learners hear now. Pull one at once if a learner reports a problem."],
];
const REASONS = ["Wrong or missing words", "Poor sound (noise, cut off, too quiet)", "Offensive or swearing", "Not natural Senegalese Wolof", "Other"];

type Say = (text: string, ok?: boolean) => void;

export function VoiceReview({ say }: { say: Say }) {
  const [queue, setQueue] = useState("review");
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const load = useCallback(() => {
    getCloud()
      ?.rpc<QueueRow[]>("review_queue", { queue, max_rows: 50 })
      .then((r) => setRows(r ?? []))
      .catch((e: Error) => {
        setRows([]);
        say(e.message, false);
      });
  }, [queue, say]);
  useEffect(() => load(), [load]);

  const play = async (r: QueueRow) => {
    const cloud = getCloud();
    if (!cloud?.downloadFile) return;
    setPlaying(r.id);
    try {
      const blob = await cloud.downloadFile("recordings", r.path);
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => setPlaying(null);
      await audio.play();
    } catch (e) {
      setPlaying(null);
      say(`Couldn't play it: ${(e as Error).message}`, false);
    }
  };

  const decide = async (r: QueueRow, decision: "approved" | "rejected", note?: string) => {
    try {
      await getCloud()?.rpc("review_recording", { recording: r.id, decision, review_note: note ?? null });
      say(decision === "approved" ? "Approved: learners will hear it within a few hours." : "Rejected.");
      load();
    } catch (e) {
      say((e as Error).message, false);
    }
  };

  const pull = async (r: QueueRow) => {
    try {
      await getCloud()?.rpc("pull_voice", { entry: r.entry_id, reason: "pulled by reviewer" });
      say("Taken off the app. Learners hear the previous audio again.");
      load();
    } catch (e) {
      say((e as Error).message, false);
    }
  };

  const info = QUEUES.find(([id]) => id === queue)!;
  return (
    <>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {QUEUES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={queue === id}
            onClick={() => {
              setRows(null);
              setQueue(id);
            }}
            className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${queue === id ? "border-clay bg-clay text-white" : "border-sand-3 bg-white text-night"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">{info[2]}</p>
      {!rows ? <Loading /> : rows.length === 0 ? <p className="text-muted">Nothing here.</p> : null}
      {rows?.map((r) => {
        const e = dictionaryById.get(r.entry_id);
        return (
          <section key={r.id} className="mb-3 rounded-2xl bg-white p-4 shadow-card">
            <p lang="wo" className="font-display text-xl font-extrabold text-night">
              {e?.wo ?? r.entry_id}
            </p>
            <p className="text-sm text-muted">{e?.tr.en ?? ""}</p>
            <p className="mt-1 text-xs text-muted">
              By {r.recorder} · {(r.duration_ms / 1000).toFixed(1)} s · {new Date(r.created_at).toLocaleDateString()}
              {r.auto_score != null ? ` · automatic check: ${Math.round((1 - Math.min(1, r.auto_score)) * 100)}% match` : ""}
            </p>
            {r.transcript ? <p className="text-xs text-muted">Heard by the checker: “{r.transcript}”</p> : null}
            {r.flag ? <p className="mt-1 text-sm font-bold text-berry">⚠ {r.flag}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void play(r)} disabled={playing === r.id}>
                {playing === r.id ? "Playing…" : "▶ Listen"}
              </Button>
              {queue === "approved" ? (
                <Button variant="wrong" onClick={() => void pull(r)}>
                  Pull from app
                </Button>
              ) : r.own ? (
                <span className="self-center text-sm text-muted">Your own recording: another reviewer must decide.</span>
              ) : (
                <>
                  <Button onClick={() => void decide(r, "approved")}>Approve</Button>
                  <select
                    aria-label="Reject with a reason"
                    className="rounded-xl border-2 border-sand-3 bg-white px-2 py-2 text-sm font-bold text-berry"
                    value=""
                    onChange={(ev) => ev.target.value && void decide(r, "rejected", ev.target.value)}
                  >
                    <option value="">Reject…</option>
                    {REASONS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
