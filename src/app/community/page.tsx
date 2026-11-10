// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Paused } from "@/components/Paused";
import { Button, Loading, TabScreen } from "@/components/ui";
import { areaName, areasOf, CITIES, cityById, type COMPASS_AREAS } from "@/content/places";
import { useAccount } from "@/lib/account";
import {
  community,
  handleIsValid,
  NETWORKS,
  type CommunityMe,
  type FriendRequest,
  type Handle,
  type LeagueRow,
  type Network,
  type NearbyRow,
} from "@/lib/community";
import { friends } from "@/lib/friends";
import { useSwitchOff, useSwitchOn } from "@/lib/notices";
import { useStore } from "@/lib/store";

const field = "w-full rounded-2xl border border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay";
const NETWORK_LABEL: Record<Network, string> = { instagram: "Instagram", tiktok: "TikTok", x: "X", snapchat: "Snapchat" };

type PersonRow = { user_id: string; display_name: string; week_xp: number; streak: number; is_friend: boolean; requested: boolean; is_me?: boolean };

function Switch({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="font-bold text-night">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-40 ${checked ? "bg-sea" : "bg-sand-3"}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-7" : "left-1"}`} />
      </button>
    </label>
  );
}

export default function CommunityPage() {
  const { t } = useStore();
  const { user } = useAccount();
  const communityOff = useSwitchOff("community");
  const friendsOff = useSwitchOff("friends");
  const nearbyOn = useSwitchOn("nearby");
  const [me, setMe] = useState<CommunityMe | null | undefined>(undefined);
  const [league, setLeague] = useState<LeagueRow[]>([]);
  const [nearby, setNearby] = useState<NearbyRow[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [handles, setHandles] = useState<Partial<Record<Network, Handle>>>({});
  const [blocks, setBlocks] = useState<{ user_id: string; display_name: string }[]>([]);
  const [draft, setDraft] = useState({ city: "", showCity: false, adult: false, area: "", showNearby: false });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasName, setHasName] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    try {
      const card = await friends.myCard();
      setHasName(!!card);
      if (!card) return setMe(null);
      const m = await community.me();
      setMe(m);
      setDraft({
        city: m?.home_city ?? "",
        showCity: !!m?.show_city,
        adult: !!m?.adult_confirmed,
        area: m?.nearby_area ?? "",
        showNearby: !!m?.show_nearby,
      });
      const [l, r, b] = await Promise.all([community.league(), community.requests(), community.blocks()]);
      setLeague(l);
      setRequests(r);
      setBlocks(b);
      if (nearbyOn) {
        const [n, h] = await Promise.all([community.nearby(), community.myHandles()]);
        setNearby(n);
        setHandles(Object.fromEntries(h.map((x) => [x.network, x])));
      }
    } catch {
      setMe(null);
    }
  }, [nearbyOn]);

  useEffect(() => {
    if (user) void Promise.resolve().then(load);
  }, [user, load]);

  const fail = (e: unknown) => {
    const msg = (e as Error)?.message ?? "";
    setMessage({
      text: /too many/.test(msg)
        ? t("community.tooMany")
        : /paused/.test(msg)
          ? t("community.paused")
          : /adults only/.test(msg)
            ? t("community.adultsOnly")
            : t("community.error"),
      ok: false,
    });
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await community.setCommunity(draft.city || null, draft.showCity, draft.adult);
      if (nearbyOn) {
        const area = draft.city && draft.area.startsWith(`${draft.city}/`) ? draft.area : null;
        await community.setNearby(area, !!area && draft.adult && draft.showNearby);
      }
      setMessage({ text: t("community.saved"), ok: true });
      await load();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const request = async (row: PersonRow) => {
    try {
      await community.request(row.user_id);
      setMessage({ text: t("community.requestSent", { name: row.display_name }), ok: true });
      await load();
    } catch (e) {
      fail(e);
    }
  };

  const respond = async (r: FriendRequest, accept: boolean) => {
    try {
      await community.respond(r.id, accept);
      await load();
    } catch (e) {
      fail(e);
    }
  };

  const saveHandle = async (network: Network, handle: string, visible: boolean) => {
    if (!handleIsValid(handle)) {
      setMessage({ text: t("community.badHandle"), ok: false });
      return;
    }
    try {
      await community.saveHandle(network, handle, visible);
      setMessage({ text: t("community.saved"), ok: true });
    } catch (e) {
      fail(e);
    }
  };

  if (communityOff || friendsOff) return <Paused />;
  if (user === undefined || (user && me === undefined)) return <Loading />;
  if (!user || !hasName) {
    return (
      <TabScreen title={t("community.title")}>
        <p className="mb-4 rounded-2xl bg-white p-4 text-muted shadow-card">{t("friends.needAccount")}</p>
        <Link href={user ? "/friends/" : "/account/"} className="block text-center font-bold text-clay underline">
          {user ? t("friends.title") : t("friends.createAccount")}
        </Link>
      </TabScreen>
    );
  }

  const cityName = (id: string) => cityById.get(id)?.name ?? id;
  const areaLabel = (id: string) => areaName(id) ?? t(`community.area.${id.split("/")[1] as (typeof COMPASS_AREAS)[number]}`);
  const personRow = (r: PersonRow, rank?: number) => (
    <li
      key={r.user_id}
      className={`flex items-center gap-3 rounded-2xl border p-3 ${r.is_me ? "border-clay bg-sun-soft" : "border-sand-3/60 bg-white shadow-card"}`}
    >
      {rank ? <span className="w-7 text-center font-display text-lg font-extrabold text-night">{rank}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-night">
          {r.display_name}
          {r.is_me ? ` (${t("friends.you")})` : ""}
        </span>
        <span className="text-sm text-muted">
          {t("friends.xp", { n: r.week_xp })}
          {r.streak > 0 ? ` · ${t("friend.streak")} ${r.streak}` : ""}
        </span>
      </span>
      {r.is_me ? null : r.is_friend ? (
        <Link href={`/friend/?id=${encodeURIComponent(r.user_id)}`} className="rounded-xl bg-sea-soft px-3 py-2 text-sm font-bold text-sea">
          {t("friend.view")}
        </Link>
      ) : r.requested ? (
        <span className="rounded-xl bg-sand-2 px-3 py-2 text-sm font-bold text-muted">{t("community.requested")}</span>
      ) : (
        <button type="button" onClick={() => void request(r)} className="rounded-xl bg-clay px-3 py-2 text-sm font-bold text-white">
          {t("community.addFriend")}
        </button>
      )}
    </li>
  );

  return (
    <TabScreen title={t("community.title")}>
      {message ? (
        <p
          role={message.ok ? "status" : "alert"}
          className={`mb-4 rounded-2xl p-3 text-sm font-bold ${message.ok ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"}`}
        >
          {message.text}
        </p>
      ) : null}

      {requests.length ? (
        <section className="mb-5" aria-labelledby="req-h">
          <h2 id="req-h" className="mb-2 font-display text-xl font-extrabold text-night">
            {t("community.requestsTitle")}
          </h2>
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-2xl border border-sand-3/60 bg-white p-3 shadow-card">
                <span className="min-w-0 flex-1 truncate font-bold text-night">{r.from_name}</span>
                <button type="button" onClick={() => void respond(r, true)} className="rounded-xl bg-clay px-3 py-2 text-sm font-bold text-white">
                  {t("community.accept")}
                </button>
                <button
                  type="button"
                  onClick={() => void respond(r, false)}
                  className="rounded-xl border border-sand-3 px-3 py-2 text-sm font-bold text-night"
                >
                  {t("community.decline")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-5" aria-labelledby="league-h">
        <h2 id="league-h" className="mb-1 font-display text-xl font-extrabold text-night">
          {me?.show_city && me.home_city ? t("community.leagueTitle", { city: cityName(me.home_city) }) : t("community.cardTitle")}
        </h2>
        <p className="mb-3 text-sm text-muted">{me?.show_city ? t("community.leagueHint") : t("community.leagueOff")}</p>
        {me?.show_city ? (
          league.length > 1 ? (
            <ol className="space-y-2">{league.map((r, i) => personRow(r, i + 1))}</ol>
          ) : (
            <p className="rounded-2xl bg-white p-4 text-muted shadow-card">{t("community.leagueEmpty")}</p>
          )
        ) : null}
      </section>

      {nearbyOn ? (
        <section className="mb-5" aria-labelledby="near-h">
          <h2 id="near-h" className="mb-1 font-display text-xl font-extrabold text-night">
            {t("community.nearbyTitle")}
          </h2>
          <p className="mb-3 text-sm text-muted">{me?.show_nearby ? t("community.nearbyHint") : t("community.nearbyOff")}</p>
          {me?.show_nearby ? (
            nearby.length ? (
              <ul className="space-y-2">{nearby.map((r) => personRow(r))}</ul>
            ) : (
              <p className="rounded-2xl bg-white p-4 text-muted shadow-card">{t("community.nearbyEmpty")}</p>
            )
          ) : null}
        </section>
      ) : null}

      <section className="mb-5 rounded-3xl border border-sand-3/60 bg-white p-5 shadow-card" aria-labelledby="vis-h">
        <h2 id="vis-h" className="mb-1 font-display text-lg font-extrabold text-night">
          {t("community.settings")}
        </h2>
        <p className="mb-3 text-sm text-muted">{t("community.settingsHint")}</p>
        <label className="mb-2 block">
          <span className="mb-1 block text-sm font-bold text-muted">{t("community.city")}</span>
          <select className={field} value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value, area: "" }))}>
            <option value="">{t("community.noCity")}</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Switch
          label={t("community.adult")}
          checked={draft.adult}
          onChange={(v) => setDraft((d) => ({ ...d, adult: v, showCity: v && d.showCity, showNearby: v && d.showNearby }))}
        />
        {!draft.adult ? (
          <>
            <p className="mb-1 text-xs text-muted">{t("community.adultNeeded")}</p>
            <p className="mb-2 rounded-xl bg-sand-2 p-3 text-sm font-bold text-night">{t("community.kidsSafety")}</p>
          </>
        ) : null}
        <Switch
          label={t("community.showCity")}
          checked={draft.showCity}
          disabled={!draft.city || !draft.adult}
          onChange={(v) => setDraft((d) => ({ ...d, showCity: v }))}
        />
        {nearbyOn ? (
          <>
            <label className="mt-2 mb-2 block">
              <span className="mb-1 block text-sm font-bold text-muted">{t("community.area")}</span>
              <select className={field} value={draft.area} disabled={!draft.city} onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}>
                <option value="">{t("community.noArea")}</option>
                {areasOf(draft.city).map((a) => (
                  <option key={a} value={a}>
                    {areaLabel(a)}
                  </option>
                ))}
              </select>
            </label>
            <Switch
              label={t("community.showNearby")}
              checked={draft.showNearby}
              disabled={!draft.area || !draft.adult}
              onChange={(v) => setDraft((d) => ({ ...d, showNearby: v }))}
            />
          </>
        ) : null}
        <Button block className="mt-3" disabled={busy} onClick={() => void save()}>
          {t("community.save")}
        </Button>
      </section>

      {nearbyOn && me?.adult_confirmed ? (
        <section className="mb-5 rounded-3xl border border-sand-3/60 bg-white p-5 shadow-card" aria-labelledby="handles-h">
          <h2 id="handles-h" className="mb-1 font-display text-lg font-extrabold text-night">
            {t("community.handlesTitle")}
          </h2>
          <p className="mb-3 text-sm text-muted">{t("community.handlesHint")}</p>
          {NETWORKS.map((n) => (
            <HandleRow key={`${n}-${handles[n]?.handle ?? ""}`} network={n} label={NETWORK_LABEL[n]} initial={handles[n]} onSave={saveHandle} />
          ))}
        </section>
      ) : null}

      {blocks.length ? (
        <section className="mb-5" aria-labelledby="blocks-h">
          <h2 id="blocks-h" className="mb-2 font-display text-lg font-extrabold text-night">
            {t("community.blockedTitle")}
          </h2>
          <ul className="space-y-2">
            {blocks.map((b) => (
              <li key={b.user_id} className="flex items-center gap-2 rounded-2xl border border-sand-3/60 bg-white p-3">
                <span className="min-w-0 flex-1 truncate text-night">{b.display_name}</span>
                <button
                  type="button"
                  onClick={() => void community.unblock(b.user_id).then(load)}
                  className="rounded-xl border border-sand-3 px-3 py-2 text-sm font-bold text-night"
                >
                  {t("community.unblock")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </TabScreen>
  );
}

function HandleRow({
  network,
  label,
  initial,
  onSave,
}: {
  network: Network;
  label: string;
  initial?: Handle;
  onSave: (n: Network, h: string, v: boolean) => Promise<void>;
}) {
  const { t } = useStore();
  const [handle, setHandle] = useState(initial?.handle ?? "");
  const [visible, setVisible] = useState(!!initial?.visible);
  return (
    <div className="mb-3 border-b border-sand-3/50 pb-3 last:border-0">
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-muted">{label}</span>
        <input
          className={field}
          value={handle}
          maxLength={31}
          placeholder="@"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => setHandle(e.target.value)}
          onBlur={() => {
            if (handle !== (initial?.handle ?? "")) void onSave(network, handle, visible);
          }}
        />
      </label>
      <Switch
        label={t("community.handleVisible")}
        checked={visible}
        disabled={!handle.trim()}
        onChange={(v) => {
          setVisible(v);
          void onSave(network, handle, v);
        }}
      />
    </div>
  );
}
