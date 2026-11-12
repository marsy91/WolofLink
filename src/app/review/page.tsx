// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { Loading } from "@/components/ui";
import { useRestartKey } from "@/lib/nav";

/** Practice of due words, a unit test-out with ?testout=<unit id>, or a level test with ?level=<a1|a2>. */
export default function ReviewPage() {
  const run = useRestartKey();
  const [query, setQuery] = useState<{ testOut: string | null; level: string | null } | undefined>(undefined);
  useEffect(() => {
    // The page is pre-rendered; read the link after mount.
    const q = new URLSearchParams(window.location.search);
    void Promise.resolve().then(() => setQuery({ testOut: q.get("testout"), level: q.get("level") }));
  }, [run]);
  if (query === undefined) return <Loading />;
  if (query.level) return <LessonPlayer key={run} mode="review" levelTest={query.level} />;
  return query.testOut ? <LessonPlayer key={run} mode="review" testOut={query.testOut} /> : <LessonPlayer key={run} mode="review" />;
}
