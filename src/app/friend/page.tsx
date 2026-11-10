// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SafetyActions } from "@/components/SafetyActions";
import { Loading, TabScreen } from "@/components/ui";
import { cityById } from "@/content/places";
import { useAccount } from "@/lib/account";
import { community, handleUrl, type FriendProfile } from "@/lib/community";
import { NEARBY_ENABLED } from "@/lib/features";
import { useStore } from "@/lib/store";

const NETWORK_LABEL = { instagram: "Instagram", tiktok: "TikTok", x: "X", snapchat: "Snapchat" } as const;

/** A friend's profile (/friend/?id=…). The server only answers for mutual friends. */
export default function FriendProfilePage() {
  const { t } = useStore();
  const { user } = useAccount();
  const [id, setId] = useState<string | null>(null);
  const [profile, setProfile] = useState<FriendProfile | null | undefined>(undefined);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => setId(new URLSearchParams(window.location.search).get("id")));
  }, []);

  useEffect(() => {
    if (!user || !id) return;
    let alive = true;
    community
      .profile(id)
      .then((p) => alive && setProfile(p))
      .catch(() => alive && setProfile(null));
    return () => {
      alive = false;
    };
  }, [user, id]);

  if (user === undefined || (user && id && profile === undefined)) return <Loading />;
  if (!user || !id || !profile || blocked) {
    return (
      <TabScreen title={t("friends.title")}>
        <p className="mb-4 rounded-2xl bg-white p-4 text-muted shadow-card">{blocked ? "" : t("friend.friendsOnly")}</p>
        <Link href="/friends/" className="block text-center font-bold text-clay underline">
          {t("friends.title")}
        </Link>
      </TabScreen>
    );
  }

  const stats: [string, number][] = [
    [t("friend.weekXp"), profile.week_xp],
    [t("friend.streak"), profile.streak],
    [t("friend.totalXp"), profile.xp_total],
    [t("friend.lessons"), profile.lessons],
  ];
  return (
    <TabScreen title={profile.display_name}>
      {profile.home_city ? <p className="-mt-2 mb-4 font-bold text-muted">{cityById.get(profile.home_city)?.name ?? profile.home_city}</p> : null}
      <ul className="mb-5 grid grid-cols-2 gap-3">
        {stats.map(([label, n]) => (
          <li key={label} className="rounded-2xl border border-sand-3/60 bg-white p-4 text-center shadow-card">
            <span className="block font-display text-2xl font-extrabold text-night">{n}</span>
            <span className="text-xs font-bold text-muted">{label}</span>
          </li>
        ))}
      </ul>

      {NEARBY_ENABLED ? (
        <section className="mb-5 rounded-3xl border border-sand-3/60 bg-white p-5 shadow-card">
          <h2 className="mb-2 font-display text-lg font-extrabold text-night">{t("friend.handles", { name: profile.display_name })}</h2>
          {profile.handles.length ? (
            <ul className="space-y-2">
              {profile.handles.map((h) => (
                <li key={h.network}>
                  <a
                    href={handleUrl(h.network, h.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl bg-sand-2 px-3 py-2 font-bold text-night"
                  >
                    <span>{NETWORK_LABEL[h.network]}</span>
                    <span className="text-clay">@{h.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("friend.noHandles")}</p>
          )}
        </section>
      ) : null}

      <SafetyActions userId={id} name={profile.display_name} onBlocked={() => setBlocked(true)} />
    </TabScreen>
  );
}
