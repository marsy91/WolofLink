// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * FamilyGuard: enforces the family screen rules from src/lib/family.ts (screenNeeds).
 * Family members stay off online screens (accounts, friends, owner console…), and children
 * need the grown-up check for settings. The main learner is never affected.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { GrownUpGate } from "@/components/GrownUpGate";
import { screenNeeds } from "@/lib/family";
import { grownUpOpen } from "@/lib/grownup";
import { useStore } from "@/lib/store";

export function FamilyGuard({ children }: { children: ReactNode }) {
  const { progress, t } = useStore();
  const pathname = usePathname() ?? "/";
  // The query string is read after mount: static export has no search params at build time.
  const [search, setSearch] = useState("");
  const [unlockedFor, setUnlockedFor] = useState<string | null>(null);
  useEffect(() => {
    void Promise.resolve().then(() => setSearch(window.location.search));
  }, [pathname]);

  const needs = screenNeeds(pathname, search, progress.profile);
  if (!needs) return <>{children}</>;
  if (needs === "grownup" && (unlockedFor === pathname || grownUpOpen())) return <>{children}</>;

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-xl font-extrabold text-night">
        {needs === "main" ? t("family.mainOnly") : t("family.grownupNeeded")}
      </p>
      {needs === "grownup" ? (
        <GrownUpGate onPass={() => setUnlockedFor(pathname)}>
          {(ask) => (
            <button type="button" onClick={ask} className="w-full max-w-xs rounded-2xl bg-clay py-4 font-display font-extrabold text-white">
              {t("grown.title")}
            </button>
          )}
        </GrownUpGate>
      ) : null}
      <Link href="/family/" className="w-full max-w-xs rounded-2xl border-2 border-sand-3 py-4 font-bold text-night">
        {t("acct.goToFamily")}
      </Link>
    </main>
  );
}
