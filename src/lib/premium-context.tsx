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
import { getBilling, lastBillingProblem, type BillingProblem, type PaywallOutcome, type Plan, type ProStatus, type PurchaseResult } from "./billing";
import { useGrants } from "./grants";

interface Premium {
  /** False where purchases aren't possible (web build, or no store key configured). */
  available: boolean;
  /** Store purchase, or Premium given by the owner (directly or through a paid organisation). */
  premium: boolean;
  /** Every lesson and dialogue open without finishing earlier ones (owner, or given by the owner). */
  unlockAll: boolean;
  plans: Plan[];
  loadingPlans: boolean;
  loadPlans: () => Promise<void>;
  purchase: (planId: string) => Promise<PurchaseResult>;
  restore: () => Promise<boolean>;
  /** Why the last purchase or restore failed, if it did. */
  problem: () => BillingProblem | null;
  /** The store plan behind Pro (null when Pro comes from the owner or there is no store). */
  status: () => Promise<ProStatus | null>;
  /** The RevenueCat paywall; "error" means fall back to the plan list in the app. */
  paywall: () => Promise<PaywallOutcome>;
  /** RevenueCat Customer Center (manage or cancel); false if it couldn't open. */
  customerCenter: () => Promise<boolean>;
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
  const grants = useGrants();

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

  // Stable identity: the purchase screen calls this from an effect, so a new function on every
  // state change would make it re-request the plans forever.
  const loadPlans = useCallback(async () => {
    if (!billing) return;
    setLoadingPlans(true);
    try {
      setPlans(await billing.plans());
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [billing]);

  const value = useMemo<Premium>(
    () => ({
      available: !!billing,
      premium: premium || grants.premium,
      unlockAll: grants.unlockAll,
      plans,
      loadingPlans,
      loadPlans,
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
      problem: lastBillingProblem,
      async status() {
        if (!billing) return null;
        try {
          return await billing.status();
        } catch {
          return null;
        }
      },
      async paywall() {
        if (!billing) return "error";
        const outcome = await billing.paywall();
        if (outcome === "purchased" || outcome === "restored" || outcome === "notPresented") {
          try {
            setPremium(await billing.isPremium());
          } catch {
            // Offline: the update listener catches up later.
          }
        }
        return outcome;
      },
      async customerCenter() {
        if (!billing) return false;
        try {
          await billing.customerCenter();
          setPremium(await billing.isPremium());
          return true;
        } catch {
          return false;
        }
      },
    }),
    [billing, premium, grants.premium, grants.unlockAll, plans, loadingPlans, loadPlans, setPremium],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): Premium {
  const p = useContext(PremiumContext);
  if (!p) throw new Error("usePremium must be used inside <PremiumProvider>");
  return p;
}
