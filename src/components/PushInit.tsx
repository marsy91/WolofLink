// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "@/lib/account";
import { pushSupported, setFriendPush } from "@/lib/push";
import { useStore } from "@/lib/store";

/** Re-registers friend notifications on start (tokens can change) when the learner turned them on. */
export function PushInit() {
  const { progress, lang } = useStore();
  const { user } = useAccount();
  const router = useRouter();
  const on = progress.settings.friendPush === true;
  useEffect(() => {
    if (on && user && pushSupported()) void setFriendPush(true, lang, (path) => router.push(path));
  }, [on, user, lang, router]);
  return null;
}

/** Shared toggle logic for the Friends card and Settings. */
export function useFriendPushToggle() {
  const { progress, lang, update } = useStore();
  const router = useRouter();
  return {
    supported: pushSupported(),
    on: progress.settings.friendPush === true,
    async set(next: boolean) {
      const result = await setFriendPush(next, lang, (path) => router.push(path));
      update((p) => ({ ...p, settings: { ...p.settings, friendPush: next && result === "on" } }));
      return result;
    },
  };
}
