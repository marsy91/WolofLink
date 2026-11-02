// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Friend notifications (duels, nudges) through Firebase Cloud Messaging.
 * Only in the Android/iOS app, only when the build has PUSH_ENABLED, and only
 * after the learner turns them on (Friends screen or Settings).
 * The server side is supabase/functions/notify-friend.
 */
import { Capacitor } from "@capacitor/core";
import type { UiLang } from "@/content/types";
import { getCloud } from "./cloud";
import { PUSH_ENABLED } from "./features";

export type PushResult = "on" | "off" | "denied" | "unsupported";

export function pushSupported(): boolean {
  return PUSH_ENABLED && Capacitor.isNativePlatform() && getCloud() !== null;
}

let listening = false;
let currentToken: string | null = null;

/** Turns friend notifications on (asks for permission) or off. */
export async function setFriendPush(on: boolean, lang: UiLang, navigate: (path: string) => void): Promise<PushResult> {
  if (!pushSupported()) return "unsupported";
  const cloud = getCloud()!;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    if (!on) {
      if (currentToken) await cloud.rpc("forget_push_token", { device_token: currentToken }).catch(() => {});
      await PushNotifications.unregister().catch(() => {});
      currentToken = null;
      return "off";
    }
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive !== "granted") perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return "denied";
    if (!listening) {
      listening = true;
      await PushNotifications.createChannel({ id: "friends", name: "Friends", description: "Duels and nudges from friends", importance: 4 }).catch(() => {});
      await PushNotifications.addListener("registration", (t) => {
        currentToken = t.value;
        void cloud.rpc("save_push_token", { device_token: t.value, device_platform: Capacitor.getPlatform() === "ios" ? "ios" : "android", device_lang: lang });
      });
      await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
        const link = (a.notification.data as { link?: string } | undefined)?.link;
        if (link && link.startsWith("/")) navigate(link);
      });
    }
    await PushNotifications.register();
    return "on";
  } catch {
    return "unsupported";
  }
}

/** Asks the server to notify the friend; silent if push isn't set up. */
export function notifyFriend(kind: "nudge" | "duel" | "result", ids: { id?: string; to?: string }) {
  const cloud = getCloud();
  if (!PUSH_ENABLED || !cloud?.invoke) return;
  void cloud.invoke("notify-friend", { kind, ...ids }).catch(() => {});
}
