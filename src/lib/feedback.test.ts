// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudError } from "./cloud";
import { asksForReview, cleanScreen, feedbackProblem, flushFeedback, readQueue, sendFeedback, type FeedbackDraft } from "./feedback";
import { APP_VERSION } from "./version";

const draft = (over: Partial<FeedbackDraft> = {}): FeedbackDraft => ({
  kind: "idea",
  rating: 5,
  message: "  More dialogues please  ",
  contact: false,
  lang: "en",
  screen: "/learn/",
  ...over,
});

// A small stand-in for the phone's storage (tests run without a browser).
const store = new Map<string, string>();
vi.stubGlobal("window", {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

describe("feedback", () => {
  beforeEach(() => store.clear());

  it("checks the message, kind and rating", () => {
    expect(feedbackProblem(draft())).toBeNull();
    expect(feedbackProblem(draft({ message: " a " }))).toBe("short");
    expect(feedbackProblem(draft({ message: "x".repeat(1001) }))).toBe("long");
    expect(feedbackProblem(draft({ rating: 6 }))).toBe("rating");
    expect(feedbackProblem(draft({ rating: null }))).toBeNull();
    expect(feedbackProblem(draft({ kind: "spam" as never }))).toBe("kind");
  });

  it("keeps only app paths as the screen", () => {
    expect(cleanScreen("/lesson/greet-1/?x=1")).toBe("/lesson/greet-1/");
    expect(cleanScreen("https://evil.example/")).toBeNull();
    expect(cleanScreen("javascript:alert(1)")).toBeNull();
    expect(cleanScreen(null)).toBeNull();
  });

  it("asks for a store review only after 4 or 5 stars", () => {
    expect(asksForReview(5)).toBe(true);
    expect(asksForReview(4)).toBe(true);
    expect(asksForReview(3)).toBe(false);
    expect(asksForReview(null)).toBe(false);
  });

  it("sends the trimmed message with the version, language and screen", async () => {
    const rpc = vi.fn().mockResolvedValue(null);
    expect(await sendFeedback(draft(), rpc)).toBe("sent");
    expect(rpc).toHaveBeenCalledWith("send_feedback", {
      fb_kind: "idea",
      fb_rating: 5,
      fb_message: "More dialogues please",
      fb_contact: false,
      fb_version: APP_VERSION,
      fb_lang: "en",
      fb_screen: "/learn/",
    });
  });

  it("keeps it on the phone when offline and sends it later", async () => {
    const offline = vi.fn().mockRejectedValue(new CloudError("network", "Failed to fetch"));
    expect(await sendFeedback(draft(), offline)).toBe("queued");
    expect(await sendFeedback(draft({ message: "Second one" }), offline)).toBe("queued");
    expect(readQueue()).toHaveLength(2);
    expect(await flushFeedback(offline)).toBe(0);
    expect(readQueue()).toHaveLength(2);
    const online = vi.fn().mockResolvedValue(null);
    expect(await flushFeedback(online)).toBe(2);
    expect(readQueue()).toHaveLength(0);
  });

  it("keeps at most five waiting messages", async () => {
    const offline = vi.fn().mockRejectedValue(new CloudError("network", "offline"));
    for (let i = 0; i < 8; i++) await sendFeedback(draft({ message: `Message ${i}` }), offline);
    expect(readQueue().map((d) => d.message)).toEqual(["Message 3", "Message 4", "Message 5", "Message 6", "Message 7"]);
  });

  it("reports a pause or the daily limit instead of queueing", async () => {
    expect(await sendFeedback(draft(), vi.fn().mockRejectedValue(new CloudError("org_suspended", "paused")))).toBe("paused");
    expect(await sendFeedback(draft(), vi.fn().mockRejectedValue(new CloudError("org_full", "too many")))).toBe("limit");
    expect(await sendFeedback(draft(), null)).toBe("unavailable");
    expect(readQueue()).toHaveLength(0);
  });
});
