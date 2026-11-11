// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { Loading } from "@/components/ui";
import { useRestartKey } from "@/lib/nav";

/** Practice of due words, or a unit test-out with ?testout=<unit id>. */
export default function ReviewPage() {
  const run = useRestartKey();
  const [testOut, setTestOut] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    // The page is pre-rendered; read the link after mount.
    void Promise.resolve().then(() => setTestOut(new URLSearchParams(window.location.search).get("testout")));
  }, [run]);
  if (testOut === undefined) return <Loading />;
  return testOut ? <LessonPlayer key={run} mode="review" testOut={testOut} /> : <LessonPlayer key={run} mode="review" />;
}
