// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Thin wrappers over native capabilities that degrade gracefully on the web:
 * haptic feedback and the daily practice reminder.
 */
import { Capacitor } from "@capacitor/core";
import type { UiLang } from "@/content/types";
import { t } from "@/i18n";

export type HapticKind = "tap" | "correct" | "wrong" | "complete";

export async function haptic(kind: HapticKind) {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
      if (kind === "tap") await Haptics.impact({ style: ImpactStyle.Light });
      else if (kind === "correct") await Haptics.notification({ type: NotificationType.Success });
      else if (kind === "wrong") await Haptics.notification({ type: NotificationType.Error });
      else await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate({ tap: 8, correct: 15, wrong: [30, 40, 30], complete: [20, 30, 60] }[kind]);
    }
  } catch {
    // Haptics are optional.
  }
}

const REMINDER_ID = 1001;

export type ReminderResult = "scheduled" | "cancelled" | "denied" | "unsupported";

export function remindersSupported(): boolean {
  return Capacitor.isNativePlatform();
}

/** Schedules (or cancels) one repeating daily notification in the interface language. */
export async function syncReminder(opts: {
  enabled: boolean;
  hour: number;
  minute: number;
  lang: UiLang;
}): Promise<ReminderResult> {
  if (!remindersSupported()) return "unsupported";
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    if (!opts.enabled) return "cancelled";
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return "denied";
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: t(opts.lang, "remind.nTitle"),
          body: t(opts.lang, "remind.nBody"),
          schedule: { on: { hour: opts.hour, minute: opts.minute }, allowWhileIdle: true },
        },
      ],
    });
    return "scheduled";
  } catch {
    return "unsupported";
  }
}
