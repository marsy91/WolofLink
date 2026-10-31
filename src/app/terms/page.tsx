// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of use — WolofLink" };

const UPDATED = "31 October 2026";

/**
 * Terms of use, linked from the Premium screen (the app stores require them for
 * subscriptions). Have a lawyer review before charging money.
 */
export default function Terms() {
  return (
    <main className="safe-top safe-bottom mx-auto max-w-2xl px-5 py-8 leading-relaxed text-ink">
      <Link href="/" className="font-bold text-clay underline">
        ← WolofLink
      </Link>
      <h1 className="mt-4 mb-1 font-display text-4xl font-extrabold text-night">Terms of use</h1>
      <p className="mb-6 text-sm text-muted">Last updated: {UPDATED}</p>

      <Section title="The service">
        WolofLink is an app for learning Wolof. The first units are free. WolofLink Premium unlocks every unit, every
        dialogue and unlimited drops. By using the app you agree to these terms.
      </Section>

      <Section title="Subscriptions and purchases">
        <ul className="list-disc space-y-1 pl-5">
          <li>Premium is sold through Google Play or the Apple App Store, and paid to your store account.</li>
          <li>
            Monthly and yearly subscriptions renew automatically at the price shown, unless you cancel at least 24 hours
            before the end of the current period.
          </li>
          <li>
            You can manage or cancel your subscription in your Google Play or App Store account settings. If you
            cancel, you keep Premium until the end of the period you paid for.
          </li>
          <li>A lifetime purchase, where offered, is a one-off payment for Premium on your store account.</li>
          <li>
            Refunds are handled by Google or Apple under their refund policies. Your statutory consumer rights are not
            affected.
          </li>
          <li>If a free trial is offered, it turns into a paid subscription when it ends unless you cancel before.</li>
        </ul>
      </Section>

      <Section title="Accounts">
        Accounts are optional. You are responsible for keeping access to your email address. You can delete your
        account at any time in the app (Profile → Account).
      </Section>

      <Section title="Course content">
        All lessons, translations, audio, images and other content are owned by WolofLink and protected by copyright.
        You may use them for your personal learning. You may not copy, resell or redistribute them.
      </Section>

      <Section title="Acceptable use">
        Don&apos;t misuse the app or its services, try to access other learners&apos; data, or interfere with how the
        app works.
      </Section>

      <Section title="No warranty">
        We work hard to make the Wolof in WolofLink accurate and natural, but languages vary by region and speaker, and
        the app is provided “as is”. To the extent the law allows, WolofLink is not liable for indirect losses arising
        from its use.
      </Section>

      <Section title="Changes">
        We may update these terms. If changes are significant, we will tell you in the app before they take effect.
      </Section>

      <Section title="Contact">
        Questions? Contact the WolofLink owner through the support contact listed on the app&apos;s store page. See also
        the{" "}
        <Link href="/privacy/" className="font-bold text-clay underline">
          privacy policy
        </Link>
        .
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
