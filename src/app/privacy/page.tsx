// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy policy — WolofLink" };

const UPDATED = "30 October 2026";

/**
 * Public privacy policy (also needed as a URL for Google Play and the App
 * Store). Keep it in sync with SECURITY.md and docs/store/privacy-answers.md
 * whenever data handling changes, e.g. when accounts are added.
 */
export default function Privacy() {
  return (
    <main className="safe-top safe-bottom mx-auto max-w-2xl px-5 py-8 leading-relaxed text-ink">
      <Link href="/" className="font-bold text-clay underline">
        ← WolofLink
      </Link>
      <h1 className="mt-4 mb-1 font-display text-4xl font-extrabold text-night">Privacy policy</h1>
      <p className="mb-6 text-sm text-muted">Last updated: {UPDATED}</p>

      <Section title="Summary">
        WolofLink does not collect, sell or share your personal data. There are no accounts, no advertising and no
        analytics. Your learning progress stays on your device.
      </Section>

      <Section title="What is stored, and where">
        <ul className="list-disc space-y-1 pl-5">
          <li>Your learning progress (XP, streak, completed lessons and dialogues, review schedule and badges).</li>
          <li>Your settings (interface language, daily goal, sound, vibration and reminder time).</li>
          <li>An optional first name you type during setup, shown only to you.</li>
        </ul>
        <p className="mt-2">
          This information is saved only in the app&apos;s private storage on your device. It is never sent to us or to
          anyone else.
        </p>
      </Section>

      <Section title="Device features">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Audio:</strong> Wolof words are read aloud by your device&apos;s text-to-speech service. That service is
            provided by your phone or browser maker and is covered by their privacy policy.
          </li>
          <li>
            <strong>Notifications:</strong> if you turn on the daily reminder, the app schedules a notification on your
            device. Nothing is sent to a server.
          </li>
          <li>
            <strong>Vibration:</strong> used for answer feedback; you can turn it off in Settings.
          </li>
          <li>The app does not use your microphone, camera, contacts or location.</li>
        </ul>
      </Section>

      <Section title="Deleting your data">
        Use Settings → Reset all progress, or uninstall the app. Either removes everything WolofLink stored on your
        device.
      </Section>

      <Section title="Children">
        WolofLink is suitable for learners of all ages and does not knowingly collect personal information from anyone,
        including children.
      </Section>

      <Section title="Changes">
        If we add features such as accounts or cloud sync, we will update this policy before they are released and
        explain what data they use.
      </Section>

      <Section title="Contact">
        For privacy questions, contact the WolofLink owner through the support contact listed on the app&apos;s store
        page.
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 font-display text-xl font-extrabold text-night">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
