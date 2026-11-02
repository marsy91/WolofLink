// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useCallback, useState } from "react";
import { TabScreen } from "@/components/ui";
import { VoiceReview } from "@/components/VoiceReview";
import { useRecorderStatus } from "@/lib/recorder";

/** Review page for trusted reviewers (the owner also has it in the owner console). */
export default function VoiceReviewPage() {
  const [status] = useRecorderStatus();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const say = useCallback((text: string, ok = true) => setMessage({ text, ok }), []);
  return (
    <TabScreen title="Review recordings">
      {!status.loaded ? null : !status.canApprove ? (
        <p className="rounded-2xl bg-white p-4 text-muted">This page is for WolofLink voice reviewers.</p>
      ) : (
        <>
          {message ? (
            <p role={message.ok ? "status" : "alert"} className={`mb-3 rounded-2xl p-3 ${message.ok ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"}`}>
              {message.text}
            </p>
          ) : null}
          <VoiceReview say={say} />
        </>
      )}
    </TabScreen>
  );
}
