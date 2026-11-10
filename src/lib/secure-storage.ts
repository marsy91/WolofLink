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

const browserStore = (): PlainStore | null => (typeof window === "undefined" ? null : window.localStorage);

/** The session store for this platform. */
export function authStorage(): AuthStorage {
  if (Capacitor.isNativePlatform()) {
    let plugin: Promise<SecureStore> | null = null;
    const secure: SecureStore = {
      get: async (o) => (await (plugin ??= load())).get(o),
      set: async (o) => (await (plugin ??= load())).set(o),
      remove: async (o) => (await (plugin ??= load())).remove(o),
    };
    return secureAuthStorage(secure, browserStore());
  }
  return plainAuthStorage(browserStore());
}

const load = () => import("capacitor-secure-storage-plugin").then((m) => m.SecureStoragePlugin as SecureStore);
