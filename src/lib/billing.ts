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
import { PAID_ENABLED } from "./features";

export type PlanKind = "monthly" | "annual" | "lifetime" | "other";

export interface Plan {
  id: string;
  kind: PlanKind;
  /** Localised price from the store, e.g. "4,99 €". */
  price: string;
  title: string;
}

export type PurchaseResult = "purchased" | "cancelled" | "pending" | "failed";

/** Why a purchase or restore went wrong, in words the screen can show. */
export type BillingProblem = "network" | "pending" | "alreadyOwned" | "notAllowed" | "store" | "unknown";

/** What happened in the RevenueCat paywall. */
export type PaywallOutcome = "purchased" | "restored" | "cancelled" | "notPresented" | "error";

/** The learner's current plan, from RevenueCat's customer info. */
export interface ProStatus {
  active: boolean;
  /** Store product of the active entitlement: "monthly", "yearly" or "lifetime" (or the store's own id). */
  productId: string | null;
  kind: PlanKind | null;
  willRenew: boolean;
  /** ISO date the current period ends; null for lifetime. */
  expires: string | null;
  /** Where the store lets the learner manage or cancel (Google Play subscriptions page). */
  managementUrl: string | null;
}

export interface BillingBackend {
  /** Links purchases to a signed-in account so Premium follows the learner across devices. */
  identify(userId: string | null): Promise<void>;
  isPremium(): Promise<boolean>;
  status(): Promise<ProStatus>;
  plans(): Promise<Plan[]>;
  purchase(planId: string): Promise<PurchaseResult>;
  restore(): Promise<boolean>;
  onChange(cb: (premium: boolean) => void): void;
  /** The RevenueCat paywall set up in the dashboard (only when the learner doesn't have Pro yet). */
  paywall(): Promise<PaywallOutcome>;
  /** RevenueCat Customer Center: manage, cancel, restore or get help with a subscription. */
  customerCenter(): Promise<void>;
}

/** RevenueCat error codes we treat specially (PURCHASES_ERROR_CODE in the SDK). */
const ERROR_CODE = {
  cancelled: "1",
  store: "2",
  notAllowed: "3",
  alreadyOwned: "6",
  network: "10",
  pending: "20",
  offline: "35",
} as const;

/** Maps an error thrown by the RevenueCat SDK to something the screen can explain. */
export function problemOf(e: unknown): BillingProblem | "cancelled" {
  const err = e as { code?: string | number; userCancelled?: boolean | null } | null;
  const code = err?.code === undefined || err?.code === null ? "" : String(err.code);
  if (code === ERROR_CODE.cancelled || err?.userCancelled) return "cancelled";
  if (code === ERROR_CODE.pending) return "pending";
  if (code === ERROR_CODE.network || code === ERROR_CODE.offline) return "network";
  if (code === ERROR_CODE.alreadyOwned) return "alreadyOwned";
  if (code === ERROR_CODE.notAllowed) return "notAllowed";
  if (code === ERROR_CODE.store) return "store";
  return "unknown";
}

/** Package type first (MONTHLY, ANNUAL, LIFETIME), then our product ids (monthly, yearly, lifetime). */
export function kindOf(packageType: string | undefined, productId: string | null | undefined): PlanKind {
  const byType: Record<string, PlanKind> = { MONTHLY: "monthly", ANNUAL: "annual", LIFETIME: "lifetime" };
  if (packageType && byType[packageType]) return byType[packageType];
  const id = (productId ?? "").toLowerCase();
  if (/(^|[^a-z])(yearly|annual)/.test(id)) return "annual";
  if (/(^|[^a-z])monthly/.test(id)) return "monthly";
  if (/(^|[^a-z])lifetime/.test(id)) return "lifetime";
  return "other";
}

type EntitlementInfo = { isActive: boolean; willRenew: boolean; productIdentifier: string; expirationDate: string | null };
type Info = { entitlements: { active: Record<string, EntitlementInfo> }; managementURL: string | null };

/** Reads the woloflink_pro entitlement from RevenueCat customer info. */
export function statusOf(info: Info): ProStatus {
  const e = info.entitlements.active[ENTITLEMENT];
  if (!e?.isActive) return { active: false, productId: null, kind: null, willRenew: false, expires: null, managementUrl: info.managementURL ?? null };
  return {
    active: true,
    productId: e.productIdentifier,
    kind: kindOf(undefined, e.productIdentifier),
    willRenew: e.willRenew,
    expires: e.expirationDate,
    managementUrl: info.managementURL ?? null,
  };
}

/**
 * The public RevenueCat SDK key for this build. A Test Store key (test_…) is used only when the
 * build switch NEXT_PUBLIC_REVENUECAT_TEST_STORE=on: RevenueCat makes release builds crash on
 * purpose with a test key (Google Play testing tracks included), so it is for debug APKs only.
 */
export function sdkKeyFor(platform: string, env: Record<string, string | undefined>): string | undefined {
  if (env.NEXT_PUBLIC_REVENUECAT_TEST_STORE === "on" && env.NEXT_PUBLIC_REVENUECAT_TEST_KEY) return env.NEXT_PUBLIC_REVENUECAT_TEST_KEY;
  if (platform === "android") return env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || undefined;
  if (platform === "ios") return env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || undefined;
  return undefined;
}

function sdkKey(): string | undefined {
  // Spelled out so the bundler inlines each public value at build time.
  return sdkKeyFor(Capacitor.getPlatform(), {
    NEXT_PUBLIC_REVENUECAT_TEST_STORE: process.env.NEXT_PUBLIC_REVENUECAT_TEST_STORE,
    NEXT_PUBLIC_REVENUECAT_TEST_KEY: process.env.NEXT_PUBLIC_REVENUECAT_TEST_KEY,
    NEXT_PUBLIC_REVENUECAT_ANDROID_KEY: process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY,
    NEXT_PUBLIC_REVENUECAT_IOS_KEY: process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY,
  });
}

let backend: BillingBackend | null | undefined;

/** The billing backend, or null where purchases aren't available (web, or no key). */
export function getBilling(): BillingBackend | null {
  if (backend !== undefined) return backend;
  // Test double for browser tests only (NEXT_PUBLIC_FAKE_BILLING=on at build time). With the
  // switch unset, the bundler removes this branch from release builds.
  if (process.env.NEXT_PUBLIC_FAKE_BILLING === "on" && PAID_ENABLED) {
    backend = fakeBilling();
    return backend;
  }
  // Nothing paid: everything is free, so the store SDK is never loaded.
  const key = PAID_ENABLED && Capacitor.isNativePlatform() ? sdkKey() : undefined;
  backend = key ? revenueCatBackend(key) : null;
  return backend;
}

/** Last purchase or restore problem, so the screen can explain it. */
let lastProblem: BillingProblem | null = null;
export function lastBillingProblem(): BillingProblem | null {
  return lastProblem;
}

function revenueCatBackend(apiKey: string): BillingBackend {
  type RC = typeof import("@revenuecat/purchases-capacitor");
  let ready: Promise<RC> | null = null;
  // Configure once per app launch, lazily, the first time anything needs the store.
  const rc = () =>
    (ready ??= import("@revenuecat/purchases-capacitor").then(async (mod) => {
      if (process.env.NEXT_PUBLIC_REVENUECAT_TEST_STORE === "on") await mod.Purchases.setLogLevel({ level: mod.LOG_LEVEL.DEBUG });
      await mod.Purchases.configure({ apiKey });
      return mod;
    }));
  const ui = () => import("@revenuecat/purchases-capacitor-ui");
  const active = (info: Info) => statusOf(info).active;

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
      return active(customerInfo as unknown as Info);
    },
    async status() {
      const { Purchases } = await rc();
      const { customerInfo } = await Purchases.getCustomerInfo();
      return statusOf(customerInfo as unknown as Info);
    },
    async plans() {
      const { Purchases } = await rc();
      const offerings = await Purchases.getOfferings();
      return (offerings.current?.availablePackages ?? []).map((p) => ({
        id: p.identifier,
        kind: kindOf(p.packageType, p.product.identifier),
        price: p.product.priceString,
        title: p.product.title,
      }));
    },
    async purchase(planId) {
      lastProblem = null;
      const { Purchases } = await rc();
      try {
        const offerings = await Purchases.getOfferings();
        const aPackage = offerings.current?.availablePackages.find((p) => p.identifier === planId);
        if (!aPackage) {
          lastProblem = "store";
          return "failed";
        }
        const { customerInfo } = await Purchases.purchasePackage({ aPackage });
        if (active(customerInfo as unknown as Info)) return "purchased";
        lastProblem = "unknown";
        return "failed";
      } catch (e) {
        const problem = problemOf(e);
        if (problem === "cancelled") return "cancelled";
        if (problem === "pending") return "pending";
        lastProblem = problem;
        return "failed";
      }
    },
    async restore() {
      lastProblem = null;
      const { Purchases } = await rc();
      try {
        const { customerInfo } = await Purchases.restorePurchases();
        return active(customerInfo as unknown as Info);
      } catch (e) {
        const problem = problemOf(e);
        lastProblem = problem === "cancelled" ? null : problem;
        return false;
      }
    },
    onChange(cb) {
      void rc().then(({ Purchases }) => Purchases.addCustomerInfoUpdateListener((info) => cb(active(info as unknown as Info))));
    },
    async paywall() {
      await rc();
      try {
        const { RevenueCatUI, PaywallResultEnum } = await ui();
        const { result } = await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: ENTITLEMENT });
        const map: Record<string, PaywallOutcome> = {
          [PaywallResultEnum.PURCHASED]: "purchased",
          [PaywallResultEnum.RESTORED]: "restored",
          [PaywallResultEnum.CANCELLED]: "cancelled",
          [PaywallResultEnum.NOT_PRESENTED]: "notPresented",
        };
        return map[result] ?? "error";
      } catch {
        return "error";
      }
    },
    async customerCenter() {
      await rc();
      const { RevenueCatUI } = await ui();
      await RevenueCatUI.presentCustomerCenter();
    },
  };
}

function fakeBilling(): BillingBackend {
  const KEY = "woloflink.fakebilling";
  const on = () => window.localStorage.getItem(KEY) === "1";
  let listener: ((premium: boolean) => void) | null = null;
  return {
    async identify() {},
    async isPremium() {
      return on();
    },
    async plans() {
      return [
        { id: "$rc_monthly", kind: "monthly", price: "£2.99", title: "Supporter monthly" },
        { id: "$rc_annual", kind: "annual", price: "£19.99", title: "Supporter yearly" },
      ];
    },
    async purchase() {
      window.localStorage.setItem(KEY, "1");
      listener?.(true);
      return "purchased";
    },
    async restore() {
      return on();
    },
    async status() {
      return on()
        ? { active: true, productId: "yearly", kind: "annual", willRenew: true, expires: "2027-11-11T00:00:00Z", managementUrl: null }
        : { active: false, productId: null, kind: null, willRenew: false, expires: null, managementUrl: null };
    },
    onChange(cb) {
      listener = cb;
    },
    async paywall() {
      return "error";
    },
    async customerCenter() {},
  };
}
