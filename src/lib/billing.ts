// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * In-app purchases boundary. Screens use `BillingBackend`; the implementation
 * below uses RevenueCat, which wraps Google Play Billing and Apple StoreKit,
 * validates receipts on its servers and tracks the "premium" entitlement.
 *
 * Billing is only active in the native apps when a public RevenueCat SDK key is
 * configured (NEXT_PUBLIC_REVENUECAT_ANDROID_KEY / _IOS_KEY). Those keys are
 * designed to ship inside apps; secret RevenueCat keys must never be added here.
 */
import { Capacitor } from "@capacitor/core";
import { ENTITLEMENT } from "./premium";
import { PREMIUM_ENABLED } from "./features";

export type PlanKind = "monthly" | "annual" | "lifetime" | "other";

export interface Plan {
  id: string;
  kind: PlanKind;
  /** Localised price from the store, e.g. "4,99 €". */
  price: string;
  title: string;
}

export type PurchaseResult = "purchased" | "cancelled" | "failed";

export interface BillingBackend {
  /** Links purchases to a signed-in account so Premium follows the learner across devices. */
  identify(userId: string | null): Promise<void>;
  isPremium(): Promise<boolean>;
  plans(): Promise<Plan[]>;
  purchase(planId: string): Promise<PurchaseResult>;
  restore(): Promise<boolean>;
  onChange(cb: (premium: boolean) => void): void;
}

function sdkKey(): string | undefined {
  const platform = Capacitor.getPlatform();
  if (platform === "android") return process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || undefined;
  if (platform === "ios") return process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || undefined;
  return undefined;
}

let backend: BillingBackend | null | undefined;

/** The billing backend, or null where purchases aren't available (web, or no key). */
export function getBilling(): BillingBackend | null {
  if (backend !== undefined) return backend;
  // Premium switched off: everything is free, so the store SDK is never loaded.
  const key = PREMIUM_ENABLED && Capacitor.isNativePlatform() ? sdkKey() : undefined;
  backend = key ? revenueCatBackend(key) : null;
  return backend;
}

const KIND: Record<string, PlanKind> = { MONTHLY: "monthly", ANNUAL: "annual", LIFETIME: "lifetime" };

function revenueCatBackend(apiKey: string): BillingBackend {
  type RC = typeof import("@revenuecat/purchases-capacitor");
  let ready: Promise<RC> | null = null;
  const rc = () =>
    (ready ??= import("@revenuecat/purchases-capacitor").then(async (mod) => {
      await mod.Purchases.configure({ apiKey });
      return mod;
    }));
  const active = (info: { entitlements: { active: Record<string, unknown> } }) => ENTITLEMENT in info.entitlements.active;

  return {
    async identify(userId) {
      const { Purchases } = await rc();
      const { isAnonymous } = await Purchases.isAnonymous();
      if (userId) await Purchases.logIn({ appUserID: userId });
      else if (!isAnonymous) await Purchases.logOut();
    },
    async isPremium() {
      const { Purchases } = await rc();
      const { customerInfo } = await Purchases.getCustomerInfo();
      return active(customerInfo);
    },
    async plans() {
      const { Purchases } = await rc();
      const offerings = await Purchases.getOfferings();
      return (offerings.current?.availablePackages ?? []).map((p) => ({
        id: p.identifier,
        kind: KIND[p.packageType] ?? "other",
        price: p.product.priceString,
        title: p.product.title,
      }));
    },
    async purchase(planId) {
      const { Purchases } = await rc();
      const offerings = await Purchases.getOfferings();
      const aPackage = offerings.current?.availablePackages.find((p) => p.identifier === planId);
      if (!aPackage) return "failed";
      try {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage });
        return active(customerInfo) ? "purchased" : "failed";
      } catch (e) {
        return (e as { userCancelled?: boolean }).userCancelled ? "cancelled" : "failed";
      }
    },
    async restore() {
      const { Purchases } = await rc();
      const { customerInfo } = await Purchases.restorePurchases();
      return active(customerInfo);
    },
    onChange(cb) {
      void rc().then(({ Purchases }) => Purchases.addCustomerInfoUpdateListener((info) => cb(active(info))));
    },
  };
}
