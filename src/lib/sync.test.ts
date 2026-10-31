// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import type { CloudBackend, RemoteProgress } from "./cloud";
import { applySession, emptyProgress, type Progress } from "./progress";
import { syncOnce } from "./sync";

function fakeCloud(initial: Progress | null) {
  let stored: RemoteProgress | null = initial ? { data: JSON.parse(JSON.stringify(initial)), updatedAt: "" } : null;
  let pushes = 0;
  const cloud: CloudBackend = {
    getUser: async () => ({ id: "u1", email: "a@b.co" }),
    onAuthChange: () => () => {},
    sendCode: async () => {},
    verifyCode: async () => ({ id: "u1", email: "a@b.co" }),
    signOut: async () => {},
    deleteAccount: async () => {},
    rpc: async () => undefined as never,
    myOrganisations: async () => [],
    leaveOrganisation: async () => {},
    pull: async () => stored,
    push: async (p) => {
      pushes++;
      stored = { data: JSON.parse(JSON.stringify(p)), updatedAt: "" };
    },
  };
  return { cloud, pushes: () => pushes, stored: () => stored?.data as Progress | undefined };
}

const t = new Date(2026, 0, 1, 10).getTime();
const played = (id: string, at = t): Progress => ({
  ...applySession(emptyProgress(at), { mode: "lesson", lessonId: id, xp: 10, accuracy: 1, outcomes: {}, mistakes: 0 }, at)
    .progress,
  updatedAt: at,
});

describe("syncOnce", () => {
  it("uploads local progress when the cloud is empty", async () => {
    const f = fakeCloud(null);
    const local = played("greetings-1");
    const r = await syncOnce(local, f.cloud);
    expect(r.uploaded).toBe(true);
    expect(f.stored()?.lessons["greetings-1"]).toBeDefined();
  });

  it("downloads to a fresh device without uploading", async () => {
    const f = fakeCloud(played("greetings-1"));
    const r = await syncOnce(emptyProgress(t + 1000), f.cloud);
    expect(r.progress.lessons["greetings-1"]).toBeDefined();
    expect(r.progress.profile).toBeNull(); // the played() fixture has no profile either
    expect(f.pushes()).toBe(0);
  });

  it("merges both ways and is stable on the next round", async () => {
    const f = fakeCloud(played("greetings-1"));
    const r1 = await syncOnce(played("numbers-1", t + 5000), f.cloud);
    expect(Object.keys(r1.progress.lessons).sort()).toEqual(["greetings-1", "numbers-1"]);
    expect(r1.uploaded).toBe(true);
    const r2 = await syncOnce(r1.progress, f.cloud);
    expect(r2.uploaded).toBe(false);
  });

  it("surfaces network errors to the caller", async () => {
    const f = fakeCloud(null);
    f.cloud.pull = async () => {
      throw new Error("Failed to fetch");
    };
    await expect(syncOnce(played("greetings-1"), f.cloud)).rejects.toThrow();
  });
});
