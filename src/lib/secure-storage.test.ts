// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { plainAuthStorage, secureAuthStorage, withTimeout, type PlainStore, type SecureStore } from "./secure-storage";

function plain(initial: Record<string, string> = {}): PlainStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  };
}

function secure(fail = false): SecureStore & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    async get({ key }) {
      if (fail) throw new Error("unavailable");
      if (!(key in data)) throw new Error("Item with given key does not exist");
      return { value: data[key] };
    },
    async set({ key, value }) {
      if (fail) throw new Error("unavailable");
      data[key] = value;
    },
    async remove({ key }) {
      if (fail) throw new Error("unavailable");
      delete data[key];
    },
  };
}

/** Like a Capacitor plugin proxy: every property, including `then`, is a method. */
function thenableProxy(): SecureStore {
  return new Proxy({} as SecureStore, {
    get: (_t, prop) => (prop === "get" || prop === "set" || prop === "remove" ? async () => ({ value: "" }) : () => new Promise(() => {})),
  });
}

describe("secure session storage", () => {
  it("does not hang when the plugin object looks like a promise", async () => {
    // Regression test for 0.25.4: resolving a promise with a Capacitor proxy never settles.
    const mod = Promise.resolve({ SecureStoragePlugin: thenableProxy() });
    const store = secureAuthStorage(
      {
        get: async (o) => (await mod).SecureStoragePlugin.get(o),
        set: async (o) => (await mod).SecureStoragePlugin.set(o),
        remove: async (o) => (await mod).SecureStoragePlugin.remove(o),
      },
      plain(),
    );
    expect(await store.getItem("woloflink.auth")).toBeNull();
  });

  it("gives up on a secure store that never answers and uses plain storage", async () => {
    const stuck: SecureStore = { get: () => new Promise(() => {}), set: () => new Promise(() => {}), remove: () => new Promise(() => {}) };
    const p = plain();
    const store = secureAuthStorage(withTimeout(stuck, 20), p);
    await store.setItem("woloflink.auth", "session");
    expect(p.data["woloflink.auth"]).toBe("session");
    expect(await store.getItem("woloflink.auth")).toBe("session");
  });

  it("keeps the session only in the secure store", async () => {
    const p = plain();
    const s = secure();
    const store = secureAuthStorage(s, p);
    await store.setItem("woloflink.auth", "session");
    expect(s.data["woloflink.auth"]).toBe("session");
    expect(p.data["woloflink.auth"]).toBeUndefined();
    expect(await store.getItem("woloflink.auth")).toBe("session");
    await store.removeItem("woloflink.auth");
    expect(await store.getItem("woloflink.auth")).toBeNull();
  });

  it("moves a session saved by an older version out of plain storage", async () => {
    const p = plain({ "woloflink.auth": "old-session" });
    const s = secure();
    const store = secureAuthStorage(s, p);
    expect(await store.getItem("woloflink.auth")).toBe("old-session");
    expect(s.data["woloflink.auth"]).toBe("old-session");
    expect(p.data["woloflink.auth"]).toBeUndefined();
  });

  it("falls back to plain storage if the secure store is unavailable", async () => {
    const p = plain();
    const store = secureAuthStorage(secure(true), p);
    await store.setItem("woloflink.auth", "session");
    expect(await store.getItem("woloflink.auth")).toBe("session");
    await store.removeItem("woloflink.auth");
    expect(await store.getItem("woloflink.auth")).toBeNull();
  });

  it("treats a broken plain store as empty", async () => {
    const broken: PlainStore = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    const store = plainAuthStorage(broken);
    await store.setItem("k", "v");
    expect(await store.getItem("k")).toBeNull();
  });
});
