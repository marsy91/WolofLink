// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Where the sign-in session is kept.
 *
 * In the Android app the session goes into the phone's keystore-encrypted storage
 * (capacitor-secure-storage-plugin), not into the WebView's plain localStorage, so it
 * can't be read from a backup or a copied app folder. On the web it stays in
 * localStorage. A session saved by an older version is moved across on first read.
 */
import { Capacitor } from "@capacitor/core";

/** The minimal async key/value store the Supabase client accepts. */
export interface AuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Native secure store: get() throws or returns an empty value when the key is missing. */
export interface SecureStore {
  get(o: { key: string }): Promise<{ value?: string }>;
  set(o: { key: string; value: string }): Promise<unknown>;
  remove(o: { key: string }): Promise<unknown>;
}

/** Plain synchronous store (window.localStorage). */
export interface PlainStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Wraps a plain store; any failure (private mode, quota) behaves like "nothing saved". */
export function plainAuthStorage(plain: PlainStore | null): AuthStorage {
  return {
    async getItem(key) {
      try {
        return plain?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        plain?.setItem(key, value);
      } catch {
        /* ignore */
      }
    },
    async removeItem(key) {
      try {
        plain?.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

/**
 * Secure store first. A value still sitting in the plain store (saved by an older
 * app version) is moved into the secure store and wiped from the plain one.
 */
export function secureAuthStorage(secure: SecureStore, plain: PlainStore | null): AuthStorage {
  const legacy = plainAuthStorage(plain);
  const read = async (key: string): Promise<string | null> => {
    try {
      const { value } = await secure.get({ key });
      return value ? value : null;
    } catch {
      return null;
    }
  };
  return {
    async getItem(key) {
      const found = await read(key);
      if (found !== null) return found;
      const old = await legacy.getItem(key);
      if (old === null) return null;
      try {
        await secure.set({ key, value: old });
        await legacy.removeItem(key);
      } catch {
        /* keep the old copy if the secure store is unavailable */
      }
      return old;
    },
    async setItem(key, value) {
      try {
        await secure.set({ key, value });
        await legacy.removeItem(key);
      } catch {
        await legacy.setItem(key, value);
      }
    },
    async removeItem(key) {
      try {
        await secure.remove({ key });
      } catch {
        /* already gone */
      }
      await legacy.removeItem(key);
    },
  };
}

/**
 * Safety net: a secure-store call that hasn't answered within `ms` fails, so the
 * caller falls back to plain storage instead of leaving the app stuck on "Loading…".
 */
export function withTimeout(secure: SecureStore, ms: number): SecureStore {
  const limit = <T>(p: Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("secure storage timed out")), ms);
      p.then(
        (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        (e) => {
          clearTimeout(timer);
          reject(e);
        },
      );
    });
  return {
    get: (o) => limit(secure.get(o)),
    set: (o) => limit(secure.set(o)),
    remove: (o) => limit(secure.remove(o)),
  };
}

const browserStore = (): PlainStore | null => (typeof window === "undefined" ? null : window.localStorage);

/** The session store for this platform. */
export function authStorage(): AuthStorage {
  if (Capacitor.isNativePlatform()) {
    // Keep the *module* in the promise, never the plugin itself: a Capacitor plugin
    // proxy answers every property, including `then`, so resolving a promise with it
    // makes the promise wait forever (the 0.25.4 "Loading…" bug on the sign-in screen).
    let mod: Promise<PluginModule> | null = null;
    const secure: SecureStore = {
      get: async (o) => (await (mod ??= loadModule())).SecureStoragePlugin.get(o),
      set: async (o) => (await (mod ??= loadModule())).SecureStoragePlugin.set(o),
      remove: async (o) => (await (mod ??= loadModule())).SecureStoragePlugin.remove(o),
    };
    return secureAuthStorage(withTimeout(secure, 4000), browserStore());
  }
  return plainAuthStorage(browserStore());
}

type PluginModule = { SecureStoragePlugin: SecureStore };
const loadModule = (): Promise<PluginModule> => import("capacitor-secure-storage-plugin");
