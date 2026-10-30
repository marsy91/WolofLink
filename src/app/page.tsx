// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoMark } from "@/components/Logo";
import { useStore } from "@/lib/store";

/** Entry point: send new learners to onboarding and returning ones to their path. */
export default function Home() {
  const { ready, progress } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(progress.profile ? "/learn/" : "/welcome/");
  }, [ready, progress.profile, router]);
  return (
    <div className="grid min-h-dvh place-items-center bg-night">
      <LogoMark size={96} />
    </div>
  );
}
