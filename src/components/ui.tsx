// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { currentStreak, dailyGoal, xpToday } from "@/lib/progress";
import { useNow, useStore } from "@/lib/store";
import { GlyphChat, IconDrop, IconLoop, IconPath, IconPodium, IconProfile, IconSpark, IconSun } from "./icons";

type Variant = "primary" | "secondary" | "ghost" | "correct" | "wrong";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-clay text-white shadow-[0_4px_0_var(--color-clay-2)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-clay-2)]",
  secondary:
    "bg-white text-night border-2 border-sand-3 shadow-[0_4px_0_var(--color-sand-3)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-sand-3)]",
  ghost: "bg-transparent text-night underline-offset-4 hover:underline",
  correct: "bg-sea text-white shadow-[0_4px_0_#0a4c4f] active:translate-y-[3px] active:shadow-[0_1px_0_#0a4c4f]",
  wrong: "bg-berry text-white shadow-[0_4px_0_#7c1a14] active:translate-y-[3px] active:shadow-[0_1px_0_#7c1a14]",
};

export function Button({
  variant = "primary",
  className = "",
  block,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; block?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 font-display text-base font-extrabold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:active:translate-y-0 ${VARIANTS[variant]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    />
  );
}

export function ProgressBar({ value, label, tone = "sun" }: { value: number; label: string; tone?: "sun" | "sea" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-3.5 w-full overflow-hidden rounded-full bg-sand-3/70"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tone === "sun" ? "bg-sun" : "bg-sea"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Redirects to onboarding when there is no profile yet. */
export function useRequireProfile() {
  const { ready, progress } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready && !progress.profile) router.replace("/welcome/");
  }, [ready, progress.profile, router]);
  return ready && !!progress.profile;
}

export function Loading() {
  const { t } = useStore();
  return (
    <div className="grid min-h-dvh place-items-center text-muted" role="status">
      {t("common.loading")}
    </div>
  );
}

export function SaveErrorBanner() {
  const { saveError, t } = useStore();
  if (!saveError) return null;
  return (
    <p role="alert" className="mx-4 mt-2 rounded-xl bg-berry-soft px-3 py-2 text-sm text-berry">
      {t("error.storage")}
    </p>
  );
}

function StatusBar() {
  const { progress, t } = useStore();
  const now = useNow();
  const streak = currentStreak(progress, now);
  const today = xpToday(progress, now);
  const goal = dailyGoal(progress);
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
      <Link
        href="/learn/"
        className="flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1.5 font-display font-extrabold text-night"
        aria-label={t("stats.streak", { n: streak })}
      >
        <IconSun size={20} className={streak > 0 ? "text-clay" : "text-muted"} />
        {streak}
      </Link>
      <div
        className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-display font-extrabold text-night"
        aria-label={t("goal.progress", { x: today, y: goal })}
      >
        <IconSpark size={20} className="text-dusk" />
        <span>
          {today}
          <span className="text-muted">/{goal}</span>
        </span>
      </div>
      <Link
        href="/practice/"
        className="flex items-center gap-1.5 rounded-full bg-sea-soft px-3 py-1.5 font-display font-extrabold text-sea"
        aria-label={t("stats.drops", { n: progress.drops.count })}
      >
        <IconDrop size={20} filled />
        {progress.drops.count}
      </Link>
    </div>
  );
}

const TABS = [
  { href: "/learn/", key: "nav.learn", Icon: IconPath },
  { href: "/practice/", key: "nav.practice", Icon: IconLoop },
  { href: "/phrases/", key: "nav.phrases", Icon: GlyphChat },
  { href: "/circle/", key: "nav.league", Icon: IconPodium },
  { href: "/profile/", key: "nav.profile", Icon: IconProfile },
] as const;

function BottomNav() {
  const { t } = useStore();
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t-2 border-sand-3 bg-white">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map(({ href, key, Icon }) => {
          const active = pathname?.startsWith(href.slice(0, -1)) ?? false;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-bold ${active ? "text-clay" : "text-muted"}`}
              >
                <span className={`grid h-9 w-12 place-items-center rounded-xl ${active ? "bg-sun-soft" : ""}`}>
                  <Icon size={24} />
                </span>
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Standard tab screen: status pills on top, bottom navigation. */
export function TabScreen({ children, title }: { children: ReactNode; title?: string }) {
  const allowed = useRequireProfile();
  if (!allowed) return <Loading />;
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-10 bg-sand/95 backdrop-blur">
        <StatusBar />
      </header>
      <SaveErrorBanner />
      <main className="flex-1 px-4 pt-2 pb-28">
        {title ? <h1 className="mb-4 font-display text-3xl font-extrabold text-night">{title}</h1> : null}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

/** Accessible modal dialog using the native <dialog> element (focus trap + Esc built in). */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="dialog-title"
      className="m-auto w-[min(92vw,26rem)] rounded-3xl bg-white p-6 text-ink shadow-xl backdrop:bg-night/60"
    >
      <h2 id="dialog-title" className="mb-2 font-display text-2xl font-extrabold text-night">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
