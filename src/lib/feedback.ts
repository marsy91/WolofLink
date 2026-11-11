// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * In-app feedback (Profile → Send feedback, and after a lesson). Works without an
 * account. Sent with the app version, the interface language and the screen it came
 * from, nothing else. With no connection it waits on the phone and goes out the next
 * time the app is online (at most a few messages are kept). The owner reads it in the
 * console and can pause it with the "feedback" switch.
 */
import type { UiLang } from "@/content/types";
import { CloudError, getCloud } from "./cloud";
import { APP_VERSION } from "./version";

export const FEEDBACK_KINDS = ["idea", "bug", "wolof", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export const FEEDBACK_MIN = 3;
export const FEEDBACK_MAX = 1000;
const QUEUE_KEY = "woloflink.feedback.queue.v1";
const QUEUE_MAX = 5;

export interface FeedbackDraft {
  kind: FeedbackKind;
  rating: number | null;
  message: string;
  contact: boolean;
  lang: UiLang;
  screen: string | null;
}

export type FeedbackProblem = "kind" | "short" | "long" | "rating";
export type SendResult = "sent" | "queued" | "paused" | "limit" | "unavailable";

/** Only an app path such as "/lesson/greet-1/" is kept; anything else is dropped. */
export function cleanScreen(from: string | null | undefined): string | null {
  if (!from) return null;
  const path = from.split(/[?#]/)[0]!.toLowerCase();
  return /^\/[a-z0-9/_-]{0,80}$/.test(path) ? path : null;
}

export function feedbackProblem(d: Pick<FeedbackDraft, "kind" | "rating" | "message">): FeedbackProblem | null {
  if (!(FEEDBACK_KINDS as readonly string[]).includes(d.kind)) return "kind";
  if (d.rating !== null && !(Number.isInteger(d.rating) && d.rating >= 1 && d.rating <= 5)) return "rating";
  const n = d.message.trim().length;
  if (n < FEEDBACK_MIN) return "short";
  if (n > FEEDBACK_MAX) return "long";
  return null;
}

/** Ask for a store review only after a happy rating. */
export const asksForReview = (rating: number | null) => rating !== null && rating >= 4;

type Rpc = (fn: string, args: Record<string, unknown>) => Promise<unknown>;

function argsOf(d: FeedbackDraft): Record<string, unknown> {
  return {
    fb_kind: d.kind,
    fb_rating: d.rating,
    fb_message: d.message.trim().slice(0, FEEDBACK_MAX),
    fb_contact: d.contact,
    fb_version: APP_VERSION,
    fb_lang: d.lang,
    fb_screen: cleanScreen(d.screen),
  };
}

function defaultRpc(): Rpc | null {
  const cloud = getCloud();
  return cloud ? (fn, args) => cloud.rpc(fn, args) : null;
}

export function readQueue(): FeedbackDraft[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]") as unknown;
    return Array.isArray(raw) ? (raw as FeedbackDraft[]).filter((d) => d && typeof d.message === "string" && !feedbackProblem(d)) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: FeedbackDraft[]): void {
  try {
    if (items.length) window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-QUEUE_MAX)));
    else window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    // Storage blocked: the message is simply not kept.
  }
}

const isNetwork = (e: unknown) => e instanceof CloudError && e.kind === "network";
const resultOf = (e: unknown): SendResult =>
  e instanceof CloudError && e.kind === "org_suspended" ? "paused" : e instanceof CloudError && (e.kind === "org_full" || e.kind === "rate_limited") ? "limit" : "unavailable";

/** Sends now, or keeps it on the phone when there is no connection. */
export async function sendFeedback(d: FeedbackDraft, rpc: Rpc | null = defaultRpc()): Promise<SendResult> {
  if (feedbackProblem(d)) throw new Error("invalid feedback");
  if (!rpc) return "unavailable";
  try {
    await rpc("send_feedback", argsOf(d));
    return "sent";
  } catch (e) {
    if (!isNetwork(e)) return resultOf(e);
    writeQueue([...readQueue(), d]);
    return "queued";
  }
}

let flushing = false;
/** Sends anything waiting on the phone. Stops at the first network failure. */
export async function flushFeedback(rpc: Rpc | null = defaultRpc()): Promise<number> {
  if (!rpc || flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    const queue = readQueue();
    while (queue.length) {
      try {
        await rpc("send_feedback", argsOf(queue[0]!));
        sent++;
      } catch (e) {
        if (isNetwork(e)) break;
        // Paused, over the limit or refused: drop it rather than retry for ever.
      }
      queue.shift();
      writeQueue(queue);
    }
  } finally {
    flushing = false;
  }
  return sent;
}
