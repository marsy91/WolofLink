// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Premium status for the UI. The store (via RevenueCat) is the source of truth;
 * a cached flag lets Premium work offline between launches. The cache only
 * unlocks content already inside the app, so tampering with it gains nothing
 * that isn't already in the download (documented in SECURITY.md).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAccount } from "./account";
import { getBilling, type Plan, type PurchaseResult } from "./billing";

interface Premium {
  /** False where purchases aren't possible (web build, or no store key configured). */
  available: boolean;
  premium: boolean;
  plans: Plan[];
  loadingPlans: boolean;
  loadPlans: () => Promise<void>;
  purchase: (planId: string) => Promise<PurchaseResult>;
  restore: () => Promise<boolean>;
}

const PremiumContext = createContext<Premium | null>(null);
const CACHE_KEY = "woloflink.premium";

function readCache(): boolean {
  try {
    return window.localStorage.getItem(CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCache(on: boolean) {
  try {
    window.localStorage.setItem(CACHE_KEY, on ? "1" : "0");
  } catch {
    // Offline convenience only.
  }
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const billing = getBilling();
  const { user } = useAccount();
  // Read lazily on the client; premium-only UI waits for the store to be ready, so no hydration mismatch.
  const [premium, setPremiumState] = useState(() => (typeof window === "undefined" || !billing ? false : readCache()));
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const setPremium = useCallback((on: boolean) => {
    setPremiumState(on);
    writeCache(on);
  }, []);

  // Refresh from the store on launch and whenever the signed-in account changes.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!billing || user === undefined) return;
    let alive = true;
    void (async () => {
      try {
        await billing.identify(userId);
        const on = await billing.isPremium();
        if (alive) setPremium(on);
      } catch {
        // Offline: keep the cached status.
      }
    })();
    return () => {
      alive = false;
    };
  }, [billing, userId, user, setPremium]);

  useEffect(() => {
    billing?.onChange(setPremium);
  }, [billing, setPremium]);

  const value = useMemo<Premium>(
    () => ({
      available: !!billing,
      premium,
      plans,
      loadingPlans,
      async loadPlans() {
        if (!billing) return;
        setLoadingPlans(true);
        try {
          setPlans(await billing.plans());
        } catch {
          setPlans([]);
        } finally {
          setLoadingPlans(false);
        }
      },
      async purchase(planId) {
        if (!billing) return "failed";
        const result = await billing.purchase(planId);
        if (result === "purchased") setPremium(true);
        return result;
      },
      async restore() {
        if (!billing) return false;
        try {
          const on = await billing.restore();
          setPremium(on);
          return on;
        } catch {
          return false;
        }
      },
    }),
    [billing, premium, plans, loadingPlans, setPremium],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): Premium {
  const p = useContext(PremiumContext);
  if (!p) throw new Error("usePremium must be used inside <PremiumProvider>");
  return p;
}
