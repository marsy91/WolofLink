// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArenaCard } from "@/components/ArenaCard";
import { QrFriend } from "@/components/QrFriend";
import { useFriendPushToggle } from "@/components/PushInit";
import { Button, Dialog, Loading, TabScreen } from "@/components/ui";
import { useAccount } from "@/lib/account";
import { CloudError } from "@/lib/cloud";
import { duelState, duels, type DuelRow, type DuelWords } from "@/lib/duels";
import { formatCode, friends, normaliseCode, ranks, type BoardRow, type FriendCard } from "@/lib/friends";
import { SUPPORTER_ENABLED } from "@/lib/features";
import { useSwitchOff } from "@/lib/notices";
import { Paused } from "@/components/Paused";
import { usePremium } from "@/lib/premium-context";
import { useStore } from "@/lib/store";

const field = "w-full rounded-2xl border-2 border-sand-3 bg-white px-4 py-3 text-base outline-none focus:border-clay";
const MEDALS = ["🥇", "🥈", "🥉"];

export default function FriendsPage() {
  const { progress, t } = useStore();
  const { user } = useAccount();
  const [card, setCard] = useState<FriendCard | null | undefined>(undefined);
  const [board, setBoard] = useState<BoardRow[] | null>(null);
  const [name, setName] = useState(progress.profile?.name ?? "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [nudged, setNudged] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<BoardRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [duelRows, setDuelRows] = useState<DuelRow[] | null>(null);
  const [duelWords, setDuelWords] = useState<DuelWords | null>(null);
  const push = useFriendPushToggle();
  const { premium } = usePremium();
  const [pushDenied, setPushDenied] = useState(false);
  const friendsOff = useSwitchOff("friends");
  const duelsOff = useSwitchOff("duels");
  const communityOff = useSwitchOff("community");

  const loadBoard = useCallback(() => {
    friends
      .board()
      .then(setBoard)
      .catch(() => setBoard([]));
    duels
      .list()
      .then(setDuelRows)
      .catch(() => setDuelRows([]));
    duels
      .myWords()
      .then(setDuelWords)
      .catch(() => setDuelWords(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    friends
      .myCard()
      .then((c) => {
        if (!alive) return;
        setCard(c);
        if (c) loadBoard();
      })
      .catch(() => alive && setCard(null));
    return () => {
      alive = false;
    };
  }, [user, loadBoard]);

  const fail = (e: unknown) => {
    const kind = e instanceof CloudError ? e.kind : "unknown";
    const msg = (e as Error)?.message ?? "";
    const text =
      kind === "unknown_code"
        ? t("friends.unknownCode")
        : /own code/.test(msg)
          ? t("friends.ownCode")
          : /too many attempts/.test(msg)
            ? t("friends.tooManyCodes")
            : /already nudged/.test(msg)
            ? t("friends.alreadyNudged")
            : /another name/.test(msg)
              ? t("friends.badName")
              : kind === "network"
                ? t("friends.offline")
                : t("friends.error");
    setMessage({ text, ok: false });
  };

  if (friendsOff) return <Paused />;
  if (user === undefined) return <Loading />;
  if (!user) {
    return (
      <TabScreen title={t("friends.title")}>
        <p className="mb-4 rounded-2xl bg-white p-4 text-muted">{t("friends.needAccount")}</p>
        <Link href="/account/" className="block text-center font-bold text-clay underline">
          {t("friends.createAccount")}
        </Link>
      </TabScreen>
    );
  }
  if (card === undefined) return <Loading />;

  const saveName = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const c = await friends.setName(name);
      setCard(c);
      loadBoard();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  if (!card) {
    return (
      <TabScreen title={t("friends.title")}>
        <section className="rounded-3xl bg-white p-5">
          <p className="mb-3 text-ink">{t("friends.intro")}</p>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-bold text-muted">{t("friends.nameLabel")}</span>
            <input className={field} maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {message ? (
            <p role="alert" className="mb-3 text-sm font-bold text-berry">
              {message.text}
            </p>
          ) : null}
          <Button block disabled={busy || !name.trim()} onClick={() => void saveName()}>
            {t("friends.start")}
          </Button>
          <p className="mt-3 text-xs text-muted">{t("friends.privacy")}</p>
        </section>
      </TabScreen>
    );
  }

  const share = async () => {
    const text = t("friends.shareText", { code: formatCode(card.friend_code) });
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setMessage({ text: t("friends.copied"), ok: true });
      }
    } catch {
      // Sharing cancelled.
    }
  };

  const add = async (fromQr?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const friendName = await friends.add(fromQr ?? code);
      setMessage({ text: t("friends.added", { name: friendName }), ok: true });
      setCode("");
      loadBoard();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const nudge = async (row: BoardRow) => {
    try {
      await friends.nudge(row.user_id);
      setNudged((s) => new Set(s).add(row.user_id));
      setMessage({ text: t("friends.nudged", { name: row.display_name }), ok: true });
    } catch (e) {
      fail(e);
    }
  };

  const remove = async (row: BoardRow) => {
    try {
      await friends.remove(row.user_id);
      setRemoving(null);
      loadBoard();
    } catch (e) {
      fail(e);
    }
  };

  const places = board ? ranks(board) : [];
  return (
    <TabScreen title={t("friends.title")}>
      {push.supported && !push.on ? (
        <section className="mb-4 flex items-center gap-3 rounded-3xl border-2 border-sun/50 bg-sun-soft p-4">
          <span aria-hidden className="text-2xl">
            🔔
          </span>
          <p className="min-w-0 flex-1 text-sm font-bold text-night">{pushDenied ? t("push.denied") : t("push.card")}</p>
          {!pushDenied ? (
            <Button onClick={() => void push.set(true).then((r) => setPushDenied(r === "denied"))}>{t("push.turnOn")}</Button>
          ) : null}
        </section>
      ) : null}

      {board ? <ArenaCard trophies={board.find((r) => r.is_me)?.trophies ?? 0} words={duelWords} /> : null}

      <section className="mb-4 rounded-3xl bg-night p-5 text-sand">
        <p className="text-sm font-bold text-sand/80">{t("friends.yourCode")}</p>
        <p className="font-display text-3xl font-extrabold tracking-widest">{formatCode(card.friend_code)}</p>
        <p className="mb-3 text-sm text-sand/80">{t("friends.codeHint", { name: card.display_name })}</p>
        <button
          type="button"
          onClick={() => void share()}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-sun font-display font-extrabold text-night"
        >
          {t("friends.share")}
        </button>
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4">
        <label className="mb-2 block text-sm font-bold text-muted" htmlFor="friend-code">
          {t("friends.addLabel")}
        </label>
        <div className="flex gap-2">
          <input
            id="friend-code"
            className={`${field} tracking-widest uppercase`}
            placeholder="ABCD 2345"
            value={code}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button disabled={busy || normaliseCode(code).length !== 8} onClick={() => void add()}>
            {t("friends.add")}
          </Button>
        </div>
      </section>

      <QrFriend code={card.friend_code} onCode={(c) => void add(c)} />

      {communityOff ? null : (
        <Link href="/community/" className="mb-4 flex items-center gap-3 rounded-3xl border border-sand-3/60 bg-white p-4 shadow-card active:translate-y-[1px]">
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-extrabold text-night">{t("community.cardTitle")}</span>
            <span className="text-sm text-muted">{t("community.card")}</span>
          </span>
          <span aria-hidden className="text-clay">→</span>
        </Link>
      )}

      {message ? (
        <p role={message.ok ? "status" : "alert"} className={`mb-4 rounded-2xl p-3 text-sm font-bold ${message.ok ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"}`}>
          {message.text}
        </p>
      ) : null}

      {!duelsOff && duelRows && duelRows.length ? (
        <section className="mb-5">
          <h2 className="mb-2 font-display text-xl font-extrabold text-night">⚔️ {t("duel.listTitle")}</h2>
          <ul className="space-y-2">
            {duelRows.slice(0, 8).map((d) => {
              const st = duelState(d);
              return (
                <li key={d.id} className="flex items-center gap-3 rounded-2xl border-2 border-sand-3 bg-white p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-night">{d.other_name}</span>
                    <span className="text-sm text-muted">
                      {t(`duel.state.${st}`)}
                      {st === "won" || st === "lost" || st === "draw"
                        ? d.my_crowns != null && d.their_crowns != null
                          ? ` · 👑 ${d.my_crowns} – ${d.their_crowns}`
                          : ` · ${d.my_score} – ${d.their_score}`
                        : ""}
                    </span>
                  </span>
                  {st === "your-turn" ? (
                    <Link href={`/duel/?id=${encodeURIComponent(d.id)}`} className="rounded-xl bg-clay px-3 py-2 text-sm font-extrabold text-white">
                      {t("duel.play")}
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <h2 className="mb-1 font-display text-xl font-extrabold text-night">{t("friends.weekTitle")}</h2>
      <p className="mb-3 text-sm text-muted">{t("friends.weekHint")}</p>
      {!board ? (
        <Loading />
      ) : board.length <= 1 ? (
        <p className="rounded-2xl bg-white p-4 text-muted">{t("friends.none")}</p>
      ) : null}
      {board && board.length > 0 ? (
        <ol className="space-y-2">
          {board.map((r, i) => (
            <li
              key={r.user_id}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${r.is_me ? "border-clay bg-sun-soft" : "border-sand-3 bg-white"}`}
            >
              <span className="w-8 text-center font-display text-xl font-extrabold text-night">{MEDALS[places[i]! - 1] ?? places[i]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-night">
                  {r.is_me ? r.display_name : (
                    <Link href={`/friend/?id=${encodeURIComponent(r.user_id)}`} className="underline decoration-sand-3 underline-offset-4">
                      {r.display_name}
                    </Link>
                  )}
                  {r.is_me ? ` (${t("friends.you")})` : ""}
                  {r.is_me && SUPPORTER_ENABLED && premium ? " 💛" : ""}
                </span>
                <span className="text-sm text-muted">
                  {t("friends.xp", { n: r.week_xp })}
                  {r.streak > 0 ? ` · 🔥 ${r.streak}` : ""}
                  {r.trophies ? ` · 🏆 ${r.trophies}` : ""}
                  {r.week_crowns ? ` · 👑 ${r.week_crowns}` : ""}
                </span>
              </span>
              {!r.is_me ? (
                <>
                  {duelsOff ? null : (
                  <Link
                    href={`/duel/?friend=${encodeURIComponent(r.user_id)}&name=${encodeURIComponent(r.display_name)}`}
                    aria-label={t("duel.challenge", { name: r.display_name })}
                    className="rounded-xl bg-night px-3 py-2 text-sm font-bold text-sand"
                  >
                    ⚔️
                  </Link>
                  )}
                  <button
                    type="button"
                    disabled={nudged.has(r.user_id)}
                    onClick={() => void nudge(r)}
                    aria-label={t("friends.nudge")}
                    className="rounded-xl bg-sea-soft px-3 py-2 text-sm font-bold text-sea disabled:opacity-50"
                  >
                    👋
                  </button>
                  <button
                    type="button"
                    aria-label={t("friends.remove", { name: r.display_name })}
                    onClick={() => setRemoving(r)}
                    className="grid h-9 w-9 place-items-center rounded-xl text-muted"
                  >
                    ✕
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      <Dialog open={!!removing} onClose={() => setRemoving(null)} title={t("friends.removeTitle")}>
        <p className="mb-5 text-muted">{t("friends.removeBody", { name: removing?.display_name ?? "" })}</p>
        <div className="flex flex-col gap-3">
          <Button block variant="wrong" onClick={() => removing && void remove(removing)}>
            {t("friends.removeConfirm")}
          </Button>
          <Button block variant="secondary" onClick={() => setRemoving(null)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Dialog>
    </TabScreen>
  );
}
