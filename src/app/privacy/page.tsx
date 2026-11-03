// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Metadata } from "next";
import Link from "next/link";
import { ACCOUNTS_ENABLED, PAID_ENABLED, SUPPORTER_ENABLED } from "@/lib/features";

export const metadata: Metadata = { title: "Privacy policy — WolofLink" };

const UPDATED = "31 October 2026";

/**
 * Public privacy policy (also needed as a URL for Google Play and the App
 * Store). Keep it in sync with SECURITY.md and docs/store/privacy-answers.md
 * whenever data handling changes. The account and purchase sections appear
 * only in builds with those features switched on (src/lib/features.ts).
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
        {ACCOUNTS_ENABLED ? (
          <>
            WolofLink works without an account, and then your progress stays only on your device. If you choose to
            create an account, we store your email address and your learning progress so you can continue on other
            devices. We never sell or share your data, and there is no advertising and no analytics.
          </>
        ) : (
          <>
            WolofLink has no accounts: your progress stays only on your device. We do not collect, sell or share any
            personal data, and there is no advertising and no analytics.
          </>
        )}
      </Section>

      <Section title="What is stored, and where">
        <ul className="list-disc space-y-1 pl-5">
          <li>Your learning progress (XP, streak, completed lessons and dialogues, review schedule and badges).</li>
          <li>Your settings (interface language, daily goal, sound, vibration and reminder time).</li>
          <li>An optional first name you type during setup, shown only to you.</li>
        </ul>
        <p className="mt-2">
          {ACCOUNTS_ENABLED ? "Without an account, this" : "This"} information is saved only in the app&apos;s private
          storage on your device.
        </p>
      </Section>

      {ACCOUNTS_ENABLED ? (
        <Section title="Optional account and cloud sync">
          <p>If you create an account, we process:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>your email address, to send you sign-in codes and identify your account;</li>
            <li>a copy of the progress and settings listed above, so they sync between your devices.</li>
          </ul>
          <p className="mt-2">
            This data is stored by our hosting provider, Supabase, encrypted in transit (HTTPS) and at rest, and each
            account can only read its own data. We use it only to run the app. You can delete your account and its cloud
            data at any time in the app (Profile → Account → Delete account); deletion is immediate and permanent.
          </p>
        </Section>
      ) : null}

      {ACCOUNTS_ENABLED ? (
        <Section title="Organisations (team codes)">
          If you join an organisation (for example your NGO, school or employer) with a team code, its administrators
          can see the name you chose, your XP, the number of lessons completed, your streak and when you last practised.
          They never see your email address or anything else. You can leave an organisation at any time in Profile →
          Account, and they stop seeing your progress straight away. The WolofLink owner can manage organisations and
          accounts to run the service, for example to remove abuse. The owner may give a small number of WolofLink team
          members limited access for support (for example to look up an account by email when you write to us). They
          are bound by confidentiality, every action is logged, and deleting an account always needs the owner&apos;s
          approval.
        </Section>
      ) : null}

      {ACCOUNTS_ENABLED ? (
        <Section title="Problem reports and statistics">
          If you tap “Report a problem” on a word, we receive which word it was, the kind of problem, your optional note,
          the app language and the app version. If you are signed in, the report is linked to your account so we can
          limit abuse; it never includes your name or email. Reports are only read by the WolofLink owner and team members they authorise, to correct the
          course. We also count, across all learners with an account, how often each word is answered right or wrong, so
          we can find and fix difficult or mistaken content. Those totals never identify anyone.
        </Section>
      ) : null}

      {ACCOUNTS_ENABLED ? (
        <Section title="Friends">
          If you use Friends, you choose a display name and get a friend code. People who enter your code (or whose code
          you enter) become your friends and can see that name, your XP this week, your streak and when you last
          practised, never your email. There is no public list or search, and no messaging; friends can only send a
          “nudge” reminder, at most once a day. You can remove a friend at any time; deleting your account removes your
          friends list and nudges. If you turn on friend notifications, your phone&apos;s notification token is stored
          so we can tell you when a friend challenges or nudges you (sent through Google&apos;s Firebase Cloud
          Messaging); turning them off or deleting your account removes it.
        </Section>
      ) : null}

      {ACCOUNTS_ENABLED ? (
        <Section title="Voice recordings (invited contributors only)">
          Native speakers we invite can record lines in their own voice. Their recordings are stored securely, checked
          automatically (a speech-recognition model transcribes each clip to make sure it matches the line and contains
          nothing offensive), and listened to by a reviewer. Only approved recordings are played to learners, with the
          name the contributor chose in the credits. Contributors can ask for their recordings to be deleted at any time
          by writing to support@woloflink.com; deleting their account deletes them too. Learners are never recorded:
          the app only asks for the microphone on the recording screen for invited contributors.
        </Section>
      ) : null}

      {PAID_ENABLED ? (
        <Section title={SUPPORTER_ENABLED ? "Purchases (optional Supporter subscription)" : "Purchases (WolofLink Premium)"}>
          Payments are handled entirely by Google Play or the Apple App Store; we never see your card details. To check
          your subscription, the app uses RevenueCat, which receives an anonymous app user ID (or your account ID if you
          are signed in) and your purchase history from the store. RevenueCat acts as our service provider and does not
          sell this data.
          {SUPPORTER_ENABLED ? " Every lesson stays free whether or not you subscribe; a subscription only adds a supporter badge and unlimited drops." : ""}
        </Section>
      ) : null}

      <Section title="Device features">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Audio:</strong> the Wolof audio clips are stored inside the app and play without a connection. If a
            line has no clip, it is read aloud by your device&apos;s text-to-speech service, which is provided by your
            phone or browser maker and covered by their privacy policy.
          </li>
          <li>
            <strong>Notifications:</strong> if you turn on the daily reminder, the app schedules a notification on your
            device. Nothing about it is sent to a server.
          </li>
          <li>
            <strong>Vibration:</strong> used for answer feedback; you can turn it off in Settings.
          </li>
          <li>
            <strong>Microphone:</strong> only on the recording screen, which exists for native speakers we invite to
            record lines (see “Voice recordings”). Learners are never recorded. The app does not use your camera,
            contacts or location.
          </li>
        </ul>
      </Section>

      <Section title="Deleting your data">
        On your device: Settings → Reset all progress, or uninstall the app.
        {ACCOUNTS_ENABLED
          ? " In the cloud: Profile → Account → Delete account, which permanently removes your account, email address and synced progress."
          : null}
      </Section>

      <Section title="Children">
        WolofLink is suitable for learners of all ages and does not knowingly collect personal information from anyone,
        including children.
      </Section>

      <Section title="Your rights">
        Depending on where you live (for example under the GDPR), you can ask to access, correct, export or delete your
        data. Most of this you can do yourself in the app; for anything else, contact us.
      </Section>

      <Section title="Changes">
        If we change what data the app uses, we will update this policy before the change is released.
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
