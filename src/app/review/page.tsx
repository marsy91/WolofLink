// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useEffect, useState } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { Loading } from "@/components/ui";

/** Practice of due words, or a unit test-out with ?testout=<unit id>. */
export default function ReviewPage() {
  const [testOut, setTestOut] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    // The page is pre-rendered; read the link after mount.
    void Promise.resolve().then(() => setTestOut(new URLSearchParams(window.location.search).get("testout")));
  }, []);
  if (testOut === undefined) return <Loading />;
  return testOut ? <LessonPlayer mode="review" testOut={testOut} /> : <LessonPlayer mode="review" />;
}
