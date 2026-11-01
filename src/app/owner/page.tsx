// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Owner console (English only; one person uses it). Shown in Profile only to
 * the owner account; every action is checked and logged by the server
 * (src/lib/owner.ts).
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { IconArrowLeft } from "@/components/icons";
import { Button, Dialog, Loading } from "@/components/ui";
import { useAccount } from "@/lib/account";
import { CloudError } from "@/lib/cloud";
import { HOLIDAYS, dateIn, type DateOverrides } from "@/content/calendar";
import { PREMIUM_ENABLED } from "@/lib/features";
import { loadOverrides } from "@/lib/holidays";
import { dictionaryById } from "@/content/dictionary";
import {
  owner,
  useIsOwner,
  type AuditRow,
  type GrantRow,
  type MemberRow,
  type MissedRow,
  type OrgRow,
  type Overview,
  type PersonRow,
  type ReportRow,
  type SeasonRow,
} from "@/lib/owner";
import { LOOKS, LOOK_EMOJI, activeSeason } from "@/content/seasons";
import { renewalLabel, renewalsDue } from "@/lib/renewals";

type Tab = "overview" | "orgs" | "people" | "billing" | "reports" | "words" | "holidays" | "themes" | "log";
const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["orgs", "Organisations"],
  ["people", "People"],
  ["billing", "Billing"],
  ["reports", "Reports"],
  ["words", "Missed words"],
  ["holidays", "Holidays"],
  ["themes", "Themes"],
  ["log", "Log"],
];

const field = "w-full rounded-xl border-2 border-sand-3 bg-white px-3 py-2 outline-none focus:border-clay";
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—");
const errText = (e: unknown) =>
  e instanceof CloudError
    ? e.kind === "forbidden"
      ? "Not allowed. Are you signed in with the owner account?"
      : e.kind === "not_found"
        ? "Not found. (For “add member”, the person must have created an account first.)"
        : e.message
    : String(e);

export default function OwnerPage() {
  const router = useRouter();
  const account = useAccount();
  const isOwner = useIsOwner();
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  if (account.user === undefined) return <Loading />;
  const say = (text: string, ok = true) => setMessage({ text, ok });

  return (
    <main className="safe-top safe-bottom mx-auto min-h-dvh max-w-2xl px-4 pb-10">
      <div className="flex items-center gap-2 py-3">
        <button
          type="button"
          onClick={() => router.replace("/profile/")}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full text-night hover:bg-sand-2"
        >
          <IconArrowLeft />
        </button>
        <h1 className="font-display text-2xl font-extrabold text-night">Owner console</h1>
      </div>

      {!account.user || !isOwner ? (
        <p className="rounded-2xl bg-white p-4 text-muted">
          This page is only for the WolofLink owner. Sign in with the owner email in Profile → Account.
        </p>
      ) : (
        <>
          <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4" aria-label="Owner sections">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => {
                  setTab(id);
                  setMessage(null);
                }}
                className={`shrink-0 rounded-full border-2 px-4 py-2 font-bold ${
                  tab === id ? "border-clay bg-clay text-white" : "border-sand-3 bg-white text-night"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          {message ? (
            <p
              role={message.ok ? "status" : "alert"}
              className={`mb-4 rounded-2xl p-3 ${message.ok ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"}`}
            >
              {message.text}
            </p>
          ) : null}
          {tab === "overview" ? <OverviewTab say={say} /> : null}
          {tab === "orgs" ? <OrgsTab say={say} /> : null}
          {tab === "people" ? <PeopleTab say={say} /> : null}
          {tab === "billing" ? <BillingTab say={say} /> : null}
          {tab === "reports" ? <ReportsTab say={say} /> : null}
          {tab === "words" ? <WordsTab say={say} /> : null}
          {tab === "holidays" ? <HolidaysTab say={say} /> : null}
          {tab === "themes" ? <ThemesTab say={say} /> : null}
          {tab === "log" ? <LogTab say={say} /> : null}
        </>
      )}
    </main>
  );
}

type Say = (text: string, ok?: boolean) => void;

/** Loads data once and on demand; reports errors through `say`. */
function useLoad<T>(load: () => Promise<T>, say: Say): [T | null, () => void] {
  const [data, setData] = useState<T | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    load()
      .then((d) => alive && setData(d))
      .catch((e) => alive && say(errText(e), false));
    return () => {
      alive = false;
    };
    // `load` is recreated each render; reload only when asked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  return [data, useCallback(() => setTick((n) => n + 1), [])];
}

function Card({ children }: { children: ReactNode }) {
  return <section className="mb-3 rounded-2xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">{children}</section>;
}

/* ── Overview ──────────────────────────────────────────────────────────── */
function RenewalsCard({ say, showEmpty = false }: { say: Say; showEmpty?: boolean }) {
  const [orgs] = useLoad<OrgRow[]>(owner.organisations, say);
  if (!orgs) return null;
  const due = renewalsDue(orgs, new Date());
  if (!due.length && !showEmpty) return null;
  return (
    <Card>
      <h2 className="mb-1 font-display text-lg font-extrabold text-night">Renewals due</h2>
      {due.length === 0 ? (
        <p className="text-sm text-muted">No paid plan or pilot ends in the next 30 days.</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted">Paid plans and pilots ending within 30 days. Email them about renewing, then update “paid until” in Organisations.</p>
          <ul className="divide-y divide-sand-3">
            {due.map(({ org, daysLeft }) => (
              <li key={org.id} className="py-2">
                <span className="font-bold text-night">{org.name}</span>{" "}
                <span className={`text-sm font-bold ${daysLeft < 0 ? "text-berry" : daysLeft <= 7 ? "text-clay" : "text-muted"}`}>
                  {org.plan} · {renewalLabel(daysLeft)} ({date(org.paid_until)})
                </span>
                <span className="block text-sm text-muted">
                  {org.members}
                  {org.seats ? ` / ${org.seats}` : ""} members{org.notes ? ` · ${org.notes}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function OverviewTab({ say }: { say: Say }) {
  const [o] = useLoad<Overview>(owner.overview, say);
  if (!o) return <Loading />;
  const tiles: [string, number][] = [
    ["Learners with an account", o.learners],
    ["New this week", o.new7],
    ["Active this week", o.active7],
    ["Organisations", o.organisations],
    ["Organisation members", o.members],
    ["Suspended accounts", o.suspended],
  ];
  return (
    <>
      <RenewalsCard say={say} />
      <div className="grid grid-cols-2 gap-3">
        {tiles.map(([label, n]) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-[0_3px_0_var(--color-sand-3)]">
            <p className="font-display text-3xl font-extrabold text-night">{n}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
        <p className="col-span-2 text-sm text-muted">
          Learners without an account use the app offline and aren&apos;t counted here.
        </p>
      </div>
    </>
  );
}

/* ── Organisations ─────────────────────────────────────────────────────── */
function OrgsTab({ say }: { say: Say }) {
  const [orgs, reload] = useLoad<OrgRow[]>(owner.organisations, say);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<OrgRow["plan"]>("pilot");
  const [seats, setSeats] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const create = async () => {
    try {
      const rows = await owner.createOrganisation(name.trim(), plan, seats ? Number(seats) : null);
      say(`Created “${name.trim()}”. Team code: ${rows[0]?.join_code ?? ""}`);
      setName("");
      setSeats("");
      reload();
    } catch (e) {
      say(errText(e), false);
    }
  };

  return (
    <>
      <Card>
        <h2 className="mb-2 font-display text-lg font-extrabold text-night">New organisation</h2>
        <div className="space-y-2">
          <input className={field} placeholder="Name, e.g. Embassy of …" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <select className={field} value={plan} onChange={(e) => setPlan(e.target.value as OrgRow["plan"])}>
              <option value="pilot">Pilot</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <input
              className={field}
              inputMode="numeric"
              placeholder="Seats (empty = no limit)"
              value={seats}
              onChange={(e) => setSeats(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <Button block disabled={name.trim().length < 2} onClick={() => void create()}>
            Create and get a team code
          </Button>
        </div>
      </Card>
      {!orgs ? <Loading /> : orgs.length === 0 ? <p className="text-muted">No organisations yet.</p> : null}
      {orgs?.map((o) => (
        <OrgCard key={o.id} org={o} open={open === o.id} onToggle={() => setOpen(open === o.id ? null : o.id)} say={say} reload={reload} />
      ))}
    </>
  );
}

function OrgCard({ org, open, onToggle, say, reload }: { org: OrgRow; open: boolean; onToggle: () => void; say: Say; reload: () => void }) {
  const [edit, setEdit] = useState(org);
  const [members, setMembers] = useState<MemberRow[] | null>(null);
  const [email, setEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [confirm, setConfirm] = useState(false);

  const loadMembers = useCallback(() => {
    owner.members(org.id).then(setMembers).catch((e) => say(errText(e), false));
  }, [org.id, say]);

  const act = async (fn: () => Promise<unknown>, done: string, refreshMembers = false) => {
    try {
      await fn();
      say(done);
      reload();
      if (refreshMembers) loadMembers();
    } catch (e) {
      say(errText(e), false);
    }
  };

  const expired = org.paid_until && new Date(org.paid_until) < new Date();
  return (
    <Card>
      <button
        type="button"
        onClick={() => {
          onToggle();
          if (!open && !members) loadMembers();
        }}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-extrabold text-night">{org.name}</span>
          <span className="text-sm text-muted">
            {org.members}
            {org.seats ? ` / ${org.seats}` : ""} members · {org.plan}
            {org.paid_until ? ` · paid until ${date(org.paid_until)}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-mono text-lg font-bold tracking-widest text-night">{org.join_code}</span>
          <span
            className={`inline-block rounded-full px-2 text-xs font-bold ${
              org.status === "active" ? "bg-sea-soft text-sea" : "bg-berry-soft text-berry"
            }`}
          >
            {org.status}
          </span>
          {expired ? <span className="ml-1 inline-block rounded-full bg-berry-soft px-2 text-xs font-bold text-berry">expired</span> : null}
        </span>
      </button>

      {open ? (
        <div className="mt-4 space-y-3 border-t-2 border-sand-2 pt-4">
          <input className={field} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} aria-label="Name" />
          <div className="grid grid-cols-2 gap-2">
            <select className={field} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as OrgRow["status"] })} aria-label="Status">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select className={field} value={edit.plan} onChange={(e) => setEdit({ ...edit, plan: e.target.value as OrgRow["plan"] })} aria-label="Plan">
              <option value="pilot">Pilot</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <input
              className={field}
              inputMode="numeric"
              placeholder="Seats (empty = no limit)"
              aria-label="Seats"
              value={edit.seats ?? ""}
              onChange={(e) => setEdit({ ...edit, seats: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })}
            />
            <input
              className={field}
              type="date"
              aria-label="Paid until"
              value={edit.paid_until ?? ""}
              onChange={(e) => setEdit({ ...edit, paid_until: e.target.value || null })}
            />
          </div>
          <textarea
            className={field}
            rows={2}
            placeholder="Notes (contact, invoice number…)"
            value={edit.notes ?? ""}
            onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void act(() => owner.updateOrganisation(edit), "Saved.")}>Save</Button>
            <Button variant="secondary" onClick={() => void act(() => owner.newCode(org.id), "New team code issued; the old one stops working.")}>
              New code
            </Button>
            <Button variant="wrong" onClick={() => setConfirm(true)}>
              Delete
            </Button>
          </div>

          <h3 className="pt-2 font-display font-extrabold text-night">Members</h3>
          {!members ? <Loading /> : members.length === 0 ? <p className="text-sm text-muted">No members yet. Share the team code.</p> : null}
          <ul className="space-y-2">
            {members?.map((m) => (
              <li key={m.user_id} className="rounded-xl border-2 border-sand-3 p-3">
                <p className="font-bold text-night">
                  {m.display_name} {m.role === "admin" ? <span className="text-sm text-clay">(admin)</span> : null}
                </p>
                <p className="text-sm break-all text-muted">{m.email}</p>
                <p className="text-sm text-muted">
                  {m.xp} XP · {m.lessons} lessons · last active {date(m.last_active)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void act(
                        () => owner.setRole(org.id, m.user_id, m.role === "admin" ? "member" : "admin"),
                        m.role === "admin" ? "Now a member." : "Now an admin.",
                        true,
                      )
                    }
                  >
                    {m.role === "admin" ? "Make member" : "Make admin"}
                  </Button>
                  <Button variant="secondary" onClick={() => void act(() => owner.removeMember(org.id, m.user_id), "Removed.", true)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-2 rounded-xl bg-sand-2 p-3">
            <p className="text-sm font-bold text-night">Add someone who already has an account</p>
            <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={field} placeholder="Name shown to the organisation" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={!email.trim() || !memberName.trim()}
                onClick={() => void act(() => owner.addMember(org.id, email, memberName, "member"), "Added.", true)}
              >
                Add as member
              </Button>
              <Button
                variant="secondary"
                disabled={!email.trim() || !memberName.trim()}
                onClick={() => void act(() => owner.addMember(org.id, email, memberName, "admin"), "Added as admin.", true)}
              >
                Add as admin
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={confirm} onClose={() => setConfirm(false)} title={`Delete ${org.name}?`}>
        <p className="mb-5 text-muted">
          This removes the organisation and all its memberships. Learners keep their accounts and progress.
        </p>
        <div className="flex flex-col gap-3">
          <Button block variant="wrong" onClick={() => void act(() => owner.deleteOrganisation(org.id), "Organisation deleted.").then(() => setConfirm(false))}>
            Delete organisation
          </Button>
          <Button block variant="secondary" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}

/* ── People ────────────────────────────────────────────────────────────── */
/** Unlock-all and Premium for one account. */
const PREMIUM_CHOICES: [string, string][] = [
  ["none", "No Premium"],
  ["1m", "Premium for 1 month"],
  ["3m", "Premium for 3 months"],
  ["1y", "Premium for 1 year"],
  ["forever", "Premium, no end date"],
];

function premiumEnd(choice: string, from = new Date()): string | null {
  const d = new Date(from);
  if (choice === "1m") d.setMonth(d.getMonth() + 1);
  else if (choice === "3m") d.setMonth(d.getMonth() + 3);
  else if (choice === "1y") d.setFullYear(d.getFullYear() + 1);
  else return null;
  return d.toISOString();
}

function GrantEditor({ person, grant, say, onSaved }: { person: PersonRow; grant?: GrantRow; say: Say; onSaved: () => void }) {
  const active = !!grant?.premium && (!grant.premium_until || new Date(grant.premium_until) > new Date());
  const [unlockAll, setUnlockAll] = useState(grant?.unlock_all ?? false);
  const [choice, setChoice] = useState(active ? "keep" : "none");
  const [busy, setBusy] = useState(false);
  const status = [
    grant?.unlock_all ? "All units unlocked" : null,
    active ? (grant!.premium_until ? `Premium until ${date(grant!.premium_until)}` : "Premium, no end date") : null,
    grant?.premium && !active ? "Premium ended" : null,
  ].filter(Boolean);
  const save = async () => {
    setBusy(true);
    try {
      const premium = choice === "keep" ? active : choice !== "none";
      const until = choice === "keep" ? (grant?.premium_until ?? null) : premiumEnd(choice);
      await owner.setGrants(person.user_id, unlockAll, premium, until, grant?.note ?? null);
      say(`Access updated for ${person.email}. It applies next time they open the app.`);
      onSaved();
    } catch (e) {
      say(errText(e), false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-2 rounded-xl bg-sand p-3">
      <p className="mb-2 text-sm font-bold text-night">{status.length ? status.join(" · ") : "No extra access"}</p>
      <label className="mb-2 flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={unlockAll} onChange={(e) => setUnlockAll(e.target.checked)} /> Unlock all units
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Premium" className={`${field} w-auto text-sm`} value={choice} onChange={(e) => setChoice(e.target.value)}>
          {active ? <option value="keep">Keep current Premium</option> : null}
          {PREMIUM_CHOICES.map(([v, label]) => (
            <option key={v} value={v}>
              {v === "none" && active ? "Remove Premium" : label}
            </option>
          ))}
        </select>
        <Button disabled={busy} onClick={() => void save()}>
          Save access
        </Button>
      </div>
    </div>
  );
}

function PeopleTab({ say }: { say: Say }) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<PersonRow[] | null>(null);
  const [remove, setRemove] = useState<PersonRow | null>(null);
  const [grants, reloadGrants] = useLoad<GrantRow[]>(owner.grants, say);
  const grantOf = (id: string) => grants?.find((g) => g.user_id === id);

  const find = useCallback(
    (q: string) => {
      owner.people(q).then(setRows).catch((e) => say(errText(e), false));
    },
    [say],
  );
  useEffect(() => {
    let alive = true;
    owner
      .people("")
      .then((r) => alive && setRows(r))
      .catch((e) => alive && say(errText(e), false));
    return () => {
      alive = false;
    };
  }, [say]);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      say(done);
      find(search);
    } catch (e) {
      say(errText(e), false);
    }
  };

  return (
    <>
      <div className="mb-3 flex gap-2">
        <input
          className={field}
          type="search"
          placeholder="Search by email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && find(search)}
        />
        <Button onClick={() => find(search)}>Search</Button>
      </div>
      {!rows ? <Loading /> : rows.length === 0 ? <p className="text-muted">Nobody found.</p> : null}
      {rows?.map((p) => (
        <Card key={p.user_id}>
          <p className="font-bold break-all text-night">
            {p.email} {p.is_owner ? <span className="text-sm text-clay">(owner)</span> : null}
            {p.suspended ? <span className="ml-1 rounded-full bg-berry-soft px-2 text-xs font-bold text-berry">suspended</span> : null}
          </p>
          <p className="text-sm text-muted">
            Joined {date(p.created_at)} · last active {date(p.last_active ?? p.last_sign_in_at)}
          </p>
          <p className="text-sm text-muted">
            {p.xp} XP · {p.lessons} lessons{p.organisations ? ` · ${p.organisations}` : ""}
          </p>
          {p.is_owner ? (
            <p className="mt-1 text-sm font-bold text-sea">All units unlocked · Premium (owner)</p>
          ) : grants ? (
            <GrantEditor person={p} grant={grantOf(p.user_id)} say={say} onSaved={reloadGrants} />
          ) : null}
          {!p.is_owner ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  void act(() => owner.setSuspended(p.user_id, !p.suspended), p.suspended ? "Account reactivated." : "Account suspended.")
                }
              >
                {p.suspended ? "Reactivate" : "Suspend"}
              </Button>
              <Button variant="wrong" onClick={() => setRemove(p)}>
                Delete account
              </Button>
            </div>
          ) : null}
        </Card>
      ))}
      <Dialog open={!!remove} onClose={() => setRemove(null)} title="Delete this account?">
        <p className="mb-5 text-muted">
          {remove?.email}: their account, cloud progress and memberships are deleted permanently. Use Suspend if you might
          want to undo it.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            block
            variant="wrong"
            onClick={() => remove && void act(() => owner.deleteAccount(remove.user_id), "Account deleted.").then(() => setRemove(null))}
          >
            Delete permanently
          </Button>
          <Button block variant="secondary" onClick={() => setRemove(null)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/* ── Billing ───────────────────────────────────────────────────────────── */
function BillingTab({ say }: { say: Say }) {
  const [orgs] = useLoad<OrgRow[]>(owner.organisations, say);
  const today = new Date();
  return (
    <>
      <Card>
        <h2 className="mb-1 font-display text-lg font-extrabold text-night">App subscriptions</h2>
        <p className="text-sm text-muted">
          Premium is <b>{PREMIUM_ENABLED ? "on" : "off"}</b> in this build
          {PREMIUM_ENABLED ? "." : ": everything is free for learners."} Card payments, refunds and prices for app
          subscriptions are managed in the Google Play Console and RevenueCat, not here.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="rounded-xl border-2 border-sand-3 px-3 py-2 font-bold text-clay" href="https://play.google.com/console" target="_blank" rel="noreferrer">
            Play Console
          </a>
          <a className="rounded-xl border-2 border-sand-3 px-3 py-2 font-bold text-clay" href="https://app.revenuecat.com" target="_blank" rel="noreferrer">
            RevenueCat
          </a>
        </div>
      </Card>
      <RenewalsCard say={say} showEmpty />
      <h2 className="mb-2 font-display text-lg font-extrabold text-night">Organisation licences</h2>
      <p className="mb-3 text-sm text-muted">Change a plan, seats or paid-until date in the Organisations tab.</p>
      {!orgs ? <Loading /> : null}
      {orgs?.map((o) => {
        const expired = o.paid_until && new Date(o.paid_until) < today;
        return (
          <Card key={o.id}>
            <p className="font-bold text-night">{o.name}</p>
            <p className={`text-sm ${expired ? "font-bold text-berry" : "text-muted"}`}>
              {o.plan} · {o.members}
              {o.seats ? ` / ${o.seats}` : ""} seats used · paid until {date(o.paid_until)}
              {expired ? " (expired)" : ""} · {o.status}
            </p>
            {o.notes ? <p className="text-sm text-muted">{o.notes}</p> : null}
          </Card>
        );
      })}
    </>
  );
}

/* ── Reports ───────────────────────────────────────────────────────────── */
const PROBLEM_LABEL: Record<ReportRow["problem"], string> = {
  spelling: "Wolof spelling or wording",
  translation: "Translation",
  audio: "Audio",
  other: "Other",
};

function WordLine({ id }: { id: string }) {
  const e = dictionaryById.get(id);
  return e ? (
    <span>
      <span lang="wo" className="font-display font-extrabold text-night">
        {e.wo}
      </span>{" "}
      <span className="text-muted">· {e.tr.en}</span> <span className="text-xs text-muted/70">({id})</span>
    </span>
  ) : (
    <span className="font-bold text-night">{id}</span>
  );
}

function ReportsTab({ say }: { say: Say }) {
  const [show, setShow] = useState<"open" | "all">("open");
  const [rows, reload] = useLoad<ReportRow[]>(() => owner.reports(show), say);
  // Reload when the filter changes.
  useEffect(() => reload(), [show, reload]);
  const setStatus = async (r: ReportRow, status: ReportRow["status"]) => {
    try {
      await owner.setReportStatus(r.id, status);
      say(status === "open" ? "Report reopened." : `Report marked ${status}.`);
      reload();
    } catch (e) {
      say(errText(e), false);
    }
  };
  return (
    <>
      <Card>
        <p className="text-sm text-muted">
          Learners send these from a lesson or the dictionary. Fix the word in the course (or ask your Wolof reviewer),
          then mark the report fixed. Reports carry no name or email.
        </p>
        <div className="mt-3 flex gap-2">
          {(["open", "all"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={show === v}
              onClick={() => setShow(v)}
              className={`rounded-full border-2 px-4 py-1.5 font-bold ${show === v ? "border-clay bg-clay text-white" : "border-sand-3 bg-white text-night"}`}
            >
              {v === "open" ? "Open" : "All"}
            </button>
          ))}
        </div>
      </Card>
      {!rows ? <Loading /> : null}
      {rows?.length === 0 ? <p className="text-muted">{show === "open" ? "No open reports." : "No reports yet."}</p> : null}
      {rows?.map((r) => (
        <Card key={r.id}>
          <WordLine id={r.entry_id} />
          <p className="mt-1 text-sm font-bold text-clay">{PROBLEM_LABEL[r.problem] ?? r.problem}</p>
          {r.comment ? <p className="mt-1 whitespace-pre-wrap text-night">“{r.comment}”</p> : null}
          <p className="mt-1 text-xs text-muted">
            {new Date(r.created_at).toLocaleString()} · {r.ui_lang ?? "?"} · app {r.app_version ?? "?"} ·{" "}
            {r.from_account ? "signed-in learner" : "no account"} · {r.status}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {r.status === "open" ? (
              <>
                <Button onClick={() => void setStatus(r, "fixed")}>Fixed</Button>
                <Button variant="ghost" onClick={() => void setStatus(r, "dismissed")}>
                  Dismiss
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => void setStatus(r, "open")}>
                Reopen
              </Button>
            )}
          </div>
        </Card>
      ))}
    </>
  );
}

/* ── Missed words ──────────────────────────────────────────────────────── */
function WordsTab({ say }: { say: Say }) {
  const [minAttempts, setMinAttempts] = useState(10);
  const [rows, reload] = useLoad<MissedRow[]>(() => owner.missedWords(minAttempts), say);
  useEffect(() => reload(), [minAttempts, reload]);
  return (
    <>
      <Card>
        <p className="text-sm text-muted">
          The words learners get wrong most often, from the progress of learners with an account. A word almost everyone
          misses usually has a mistake, unclear audio or a confusing translation: check it first with your Wolof
          reviewer. Only totals are shown, never individual learners.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold">
          Only words answered at least
          <select className={`${field} w-auto`} value={minAttempts} onChange={(e) => setMinAttempts(Number(e.target.value))}>
            {[5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          times
        </label>
      </Card>
      {!rows ? <Loading /> : null}
      {rows?.length === 0 ? <p className="text-muted">Not enough answers yet. Try a lower minimum.</p> : null}
      {rows?.length ? (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.entry_id} className="rounded-xl bg-white p-3">
              <span className="mr-2 font-bold text-muted">{i + 1}.</span>
              <WordLine id={r.entry_id} />
              <span className="mt-1 block text-sm">
                <span className={`font-bold ${r.miss_rate >= 0.5 ? "text-berry" : r.miss_rate >= 0.3 ? "text-clay" : "text-night"}`}>
                  {Math.round(r.miss_rate * 100)}% wrong
                </span>{" "}
                <span className="text-muted">
                  · {r.wrong_total} wrong / {r.right_total + r.wrong_total} answers · {r.learners} learner{r.learners === 1 ? "" : "s"}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
}

/* ── Themes ────────────────────────────────────────────────────────────── */
const LANGS = ["en", "fr", "es", "de", "it"] as const;
const LANG_LABEL: Record<(typeof LANGS)[number], string> = { en: "English", fr: "French", es: "Spanish", de: "German", it: "Italian" };
const todayIso = () => new Date().toISOString().slice(0, 10);
const blankSeason = (): Omit<SeasonRow, "id"> & { id: string | null } => ({
  id: null,
  look: "festive",
  starts_on: todayIso(),
  ends_on: todayIso(),
  title: { en: "" },
  message: null,
});

function ThemesTab({ say }: { say: Say }) {
  const [rows, reload] = useLoad<SeasonRow[]>(owner.seasons, say);
  const [edit, setEdit] = useState<(Omit<SeasonRow, "id"> & { id: string | null }) | null>(null);
  const [busy, setBusy] = useState(false);
  const holidayNow = activeSeason(new Date());

  const save = async () => {
    if (!edit) return;
    const clean = (o: Record<string, string> | null) => {
      const out = Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
      return Object.keys(out).length ? out : null;
    };
    const title = clean(edit.title);
    if (!title?.en) return say("An English title is needed (the other languages fall back to it).", false);
    if (edit.ends_on < edit.starts_on) return say("The end date is before the start date.", false);
    setBusy(true);
    try {
      await owner.saveSeason({ ...edit, title, message: clean(edit.message) });
      say("Theme saved. Apps pick it up within a few hours.");
      setEdit(null);
      reload();
    } catch (e) {
      say(errText(e), false);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    try {
      await owner.deleteSeason(id);
      say("Theme deleted.");
      reload();
    } catch (e) {
      say(errText(e), false);
    }
  };

  return (
    <>
      <Card>
        <p className="text-sm text-muted">
          Holiday themes (Ramadan, Korité, Tabaski, Independence Day, Tamxarit, the Magal, Gamou, New Year, Christmas)
          switch on by themselves from the holiday dates. Add your own here for other events: they show a banner on the
          Learn screen and a coloured stripe, and take priority over holiday themes. Learners can turn themes off in
          Settings.
        </p>
        <p className="mt-2 text-sm font-bold text-night">
          Built-in theme today: {holidayNow ? `${holidayNow.title.en} (${holidayNow.look})` : "none"}
        </p>
        {!edit ? (
          <Button className="mt-3" onClick={() => setEdit(blankSeason())}>
            New theme
          </Button>
        ) : null}
      </Card>

      {edit ? (
        <Card>
          <h2 className="mb-2 font-display text-lg font-extrabold text-night">{edit.id ? "Edit theme" : "New theme"}</h2>
          <p className="mb-1 text-sm font-bold">Look</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {LOOKS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={edit.look === l}
                onClick={() => setEdit({ ...edit, look: l })}
                className={`season-${l} rounded-xl px-3 py-2 text-sm font-bold ${edit.look === l ? "ring-4 ring-sun" : ""}`}
              >
                {LOOK_EMOJI[l]} {l}
              </button>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap gap-3">
            <label className="text-sm font-bold">
              From
              <input type="date" className={`${field} mt-1`} value={edit.starts_on} onChange={(e) => setEdit({ ...edit, starts_on: e.target.value })} />
            </label>
            <label className="text-sm font-bold">
              To (inclusive)
              <input type="date" className={`${field} mt-1`} value={edit.ends_on} onChange={(e) => setEdit({ ...edit, ends_on: e.target.value })} />
            </label>
          </div>
          {LANGS.map((l) => (
            <div key={l} className="mb-2 grid gap-1 sm:grid-cols-2 sm:gap-2">
              <input
                className={field}
                maxLength={60}
                placeholder={`Title (${LANG_LABEL[l]})${l === "en" ? ", required" : ""}`}
                value={edit.title[l] ?? ""}
                onChange={(e) => setEdit({ ...edit, title: { ...edit.title, [l]: e.target.value } })}
              />
              <input
                className={field}
                maxLength={140}
                placeholder={`Message (${LANG_LABEL[l]}), optional`}
                value={edit.message?.[l] ?? ""}
                onChange={(e) => setEdit({ ...edit, message: { ...(edit.message ?? {}), [l]: e.target.value } })}
              />
            </div>
          ))}
          <p className="mb-3 text-xs text-muted">
            Don&apos;t use protected event names or logos (for example Olympic names, rings or mascots). Wolof in a
            message should be checked by your reviewer first.
          </p>
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => void save()}>
              Save theme
            </Button>
            <Button variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      {!rows ? <Loading /> : rows.length === 0 ? <p className="text-muted">No themes of your own yet.</p> : null}
      {rows?.map((r) => (
        <Card key={r.id}>
          <div className={`season-${r.look} mb-2 rounded-xl p-3`}>
            <p className="font-display font-extrabold">
              {LOOK_EMOJI[r.look as keyof typeof LOOK_EMOJI] ?? ""} {r.title.en}
            </p>
            {r.message?.en ? <p className="text-sm">{r.message.en}</p> : null}
          </div>
          <p className="text-sm text-muted">
            {r.starts_on} → {r.ends_on} · {r.look} · languages: {Object.keys(r.title).join(", ")}
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setEdit({ ...r })}>
              Edit
            </Button>
            <Button variant="wrong" onClick={() => void remove(r.id)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
}

/* ── Holidays ──────────────────────────────────────────────────────────── */
function HolidaysTab({ say }: { say: Say }) {
  const [overrides, reload] = useLoad<DateOverrides>(() => loadOverrides({ force: true }), say);
  const year = new Date().getFullYear();
  const [shownYear, setShownYear] = useState(year);
  if (!overrides) return <Loading />;
  return (
    <>
      <Card>
        <p className="text-sm text-muted">
          Islamic dates are estimates until you confirm them (usually after the moon-sighting announcement a day or two
          before). Fixed holidays and Easter dates are calculated automatically; change them only if the government moves
          a holiday. Changes reach every app within a few hours, without an update.
        </p>
        <div className="mt-3 flex gap-2">
          {[year, year + 1].map((y) => (
            <button
              key={y}
              type="button"
              aria-pressed={shownYear === y}
              onClick={() => setShownYear(y)}
              className={`rounded-full border-2 px-4 py-1.5 font-bold ${shownYear === y ? "border-clay bg-clay text-white" : "border-sand-3 bg-white text-night"}`}
            >
              {y}
            </button>
          ))}
        </div>
      </Card>
      {HOLIDAYS.map((h) => (
        <HolidayRow key={`${h.id}:${shownYear}`} id={h.id} year={shownYear} overrides={overrides} say={say} onSaved={reload} />
      ))}
    </>
  );
}

function HolidayRow({ id, year, overrides, say, onSaved }: { id: string; year: number; overrides: DateOverrides; say: Say; onSaved: () => void }) {
  const holiday = HOLIDAYS.find((h) => h.id === id)!;
  const current = dateIn(holiday, year, overrides);
  const online = overrides[`${id}:${year}`];
  const [day, setDay] = useState(current?.date ?? "");
  const [confirmed, setConfirmed] = useState(online?.confirmed ?? holiday.kind !== "lunar");
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await fn();
      say(done);
      onSaved();
    } catch (e) {
      say(errText(e), false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <p className="font-bold text-night">
        {holiday.emoji} {holiday.title.en}
      </p>
      <p className="mb-2 text-sm text-muted">
        {current ? `${current.date} · ${current.status}` : "No estimate for this year"}
        {online ? " (set online)" : holiday.kind === "lunar" ? " (built-in estimate)" : " (calculated)"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label={`${holiday.title.en} date`}
          className={`${field} w-auto`}
          value={day}
          min={`${year}-01-01`}
          max={`${year}-12-31`}
          onChange={(e) => setDay(e.target.value)}
        />
        <label className="flex items-center gap-2 font-bold">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> Confirmed
        </label>
        <Button
          disabled={busy || !day.startsWith(`${year}-`)}
          onClick={() => void run(() => owner.setHolidayDate(id, year, day, confirmed), `${holiday.title.en} ${year}: saved.`)}
        >
          Save
        </Button>
        {online ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-xl border-2 border-sand-3 px-3 py-2 font-bold text-clay"
            onClick={() => void run(() => owner.clearHolidayDate(id, year), `${holiday.title.en} ${year}: back to the built-in date.`)}
          >
            Reset
          </button>
        ) : null}
      </div>
    </Card>
  );
}

/* ── Log ───────────────────────────────────────────────────────────────── */
function LogTab({ say }: { say: Say }) {
  const [rows] = useLoad<AuditRow[]>(owner.audit, say);
  if (!rows) return <Loading />;
  if (rows.length === 0) return <p className="text-muted">No changes yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r, i) => (
        <li key={i} className="rounded-xl bg-white p-3 text-sm">
          <span className="font-bold text-night">{r.action}</span>{" "}
          <span className="text-muted">· {new Date(r.at).toLocaleString()}</span>
          <span className="block break-all text-muted">
            {Object.entries(r.detail)
              .filter(([, v]) => v !== null && v !== "")
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(" · ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
