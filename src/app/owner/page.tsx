// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/**
 * Owner console (English only; one person uses it). Shown in Profile only to
 * the owner account; every action is checked and logged by the server
 * (src/lib/owner.ts).
 */
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { IconArrowLeft, IconBook, IconPodium, IconProfile, IconShield } from "@/components/icons";
import { Dialog, Loading } from "@/components/ui";
import { useAccount } from "@/lib/account";
import { CloudError } from "@/lib/cloud";
import { HOLIDAYS, dateIn, type DateOverrides } from "@/content/calendar";
import { PREMIUM_ENABLED, SUPPORTER_ENABLED } from "@/lib/features";
import { loadOverrides } from "@/lib/holidays";
import { dictionaryById } from "@/content/dictionary";
import {
  owner,
  useConsoleRole,
  type AuditRow,
  type GrantRow,
  type MemberRow,
  type MissedRow,
  type OrgRow,
  type Overview,
  type PersonRow,
  type RecorderRow,
  type ReportRow,
  type UserReportRow,
  type SeasonRow,
  type AnnouncementRow,
  type RequestRow,
  type StaffRow,
  type SwitchRow,
} from "@/lib/owner";
import { ROLE_HELP, STAFF_ROLES, mustRequest, tabsFor, type ConsoleRole, type RiskyAction, type StaffRole } from "@/lib/staff-roles";
import { SWITCH_KEYS } from "@/lib/notices";

/** The signed-in console role, for showing "Ask the owner" instead of risky buttons. */
const RoleCtx = createContext<ConsoleRole>("owner");
import { LOOKS, LOOK_EMOJI, activeSeason } from "@/content/seasons";
import { renewalLabel, renewalsDue } from "@/lib/renewals";
import { VoiceReview } from "@/components/VoiceReview";

type Tab = "overview" | "orgs" | "people" | "billing" | "voices" | "reports" | "words" | "holidays" | "themes" | "notices" | "requests" | "log" | "team";
const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["orgs", "Organisations"],
  ["people", "People"],
  ["billing", "Billing"],
  ["voices", "Voices"],
  ["reports", "Reports"],
  ["words", "Missed words"],
  ["holidays", "Holidays"],
  ["themes", "Themes"],
  ["notices", "Notices"],
  ["requests", "Requests"],
  ["log", "Log"],
  ["team", "Team"],
];
const TAB_LABEL = Object.fromEntries(TABS) as Record<Tab, string>;
const GROUPS: { id: string; label: string; icon: typeof IconPodium; tabs: Tab[] }[] = [
  { id: "home", label: "Home", icon: IconPodium, tabs: ["overview"] },
  { id: "people", label: "People", icon: IconProfile, tabs: ["people", "orgs", "billing", "requests"] },
  { id: "content", label: "Content", icon: IconBook, tabs: ["reports", "words", "voices", "notices", "holidays", "themes"] },
  { id: "admin", label: "Admin", icon: IconShield, tabs: ["team", "log"] },
];

const field = "w-full rounded-xl border border-sand-3 bg-white px-3 py-2 outline-none focus:border-night focus:ring-2 focus:ring-night/10";

/** The console's own flat, compact buttons (the learning screens keep their playful ones). */
const FLAT = {
  primary: "bg-night text-sand hover:bg-night/90",
  secondary: "border border-sand-3 bg-white text-night hover:bg-sand-2",
  ghost: "text-night hover:underline",
  correct: "bg-sea text-white hover:bg-sea/90",
  wrong: "bg-berry text-white hover:bg-berry/90",
} as const;
function Button({
  variant = "primary",
  block,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof FLAT; block?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${FLAT[variant]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    />
  );
}
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
  const role = useConsoleRole();
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  if (account.user === undefined || (account.user && role === undefined)) return <Loading />;
  const allowed = tabsFor(role ?? null);
  const visible = TABS.filter(([id]) => allowed.includes(id));
  const current = visible.some(([id]) => id === tab) ? tab : (visible[0]?.[0] ?? "overview");
  const groups = GROUPS.map((g) => ({ ...g, tabs: g.tabs.filter((id) => allowed.includes(id)) })).filter((g) => g.tabs.length);
  const group = groups.find((g) => g.tabs.includes(current)) ?? groups[0];
  const say = (text: string, ok = true) => setMessage({ text, ok });
  const open = (id: Tab) => {
    setTab(id);
    setMessage(null);
  };

  return (
    <main className="safe-bottom mx-auto min-h-dvh max-w-2xl pb-10">
      <header className="safe-top rounded-b-[2rem] bg-night px-4 pb-5 text-sand">
        <div className="flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => router.replace("/profile/")}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full text-sand hover:bg-white/10"
          >
            <IconArrowLeft />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-[0.2em] text-sand/60 uppercase">WolofLink</p>
            <h1 className="font-display text-2xl leading-tight font-extrabold">
              {role && role !== "owner" ? "Team console" : "Owner console"}
            </h1>
          </div>
          {role ? (
            <span className="rounded-full bg-sun px-3 py-1 text-xs font-extrabold tracking-wide text-night uppercase">{role}</span>
          ) : null}
        </div>
        {account.user && role && allowed.includes("overview") && current === "overview" ? <HeaderStats say={say} /> : null}
      </header>

      <div className="px-4">
        {!account.user || !role ? (
          <p className="mt-4 rounded-2xl border border-sand-3 bg-white p-4 text-muted">
            This page is only for the WolofLink owner and invited team members. Sign in with your team email in Profile → Account.
          </p>
        ) : (
          <>
            <nav aria-label="Console sections" className="sticky top-0 z-10 -mx-4 mb-4 bg-sand/95 px-4 pt-4 pb-2 backdrop-blur">
              <div className="grid gap-1 rounded-2xl border border-sand-3 bg-white p-1" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
                {groups.map((g) => {
                  const on = g.id === group?.id;
                  const Glyph = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => open(g.tabs[0]!)}
                      className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-extrabold transition-colors ${
                        on ? "bg-night text-sand" : "text-muted hover:bg-sand-2"
                      }`}
                    >
                      <Glyph size={20} />
                      {g.label}
                    </button>
                  );
                })}
              </div>
              {group && group.tabs.length > 1 ? (
                <div className="mt-2 flex gap-5 overflow-x-auto border-b border-sand-3 px-1" role="tablist">
                  {group.tabs.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={current === id}
                      onClick={() => open(id)}
                      className={`-mb-px shrink-0 border-b-2 py-2 text-sm font-bold ${
                        current === id ? "border-clay text-night" : "border-transparent text-muted"
                      }`}
                    >
                      {TAB_LABEL[id]}
                    </button>
                  ))}
                </div>
              ) : null}
            </nav>
            {message ? (
              <p
                role={message.ok ? "status" : "alert"}
                className={`mb-4 rounded-2xl border p-3 text-sm font-bold ${
                  message.ok ? "border-sea/30 bg-sea-soft text-sea" : "border-berry/30 bg-berry-soft text-berry"
                }`}
              >
                {message.text}
              </p>
            ) : null}
            {group && group.tabs.length === 1 ? <h2 className="mb-3 font-display text-xl font-extrabold text-night">{TAB_LABEL[current]}</h2> : null}
            <RoleCtx.Provider value={role}>
              {current === "overview" ? <OverviewTab say={say} /> : null}
              {current === "orgs" ? <OrgsTab say={say} /> : null}
              {current === "people" ? <PeopleTab say={say} /> : null}
              {current === "billing" ? <BillingTab say={say} /> : null}
              {current === "voices" ? <VoicesTab say={say} /> : null}
              {current === "reports" ? <ReportsTab say={say} /> : null}
              {current === "words" ? <WordsTab say={say} /> : null}
              {current === "holidays" ? <HolidaysTab say={say} /> : null}
              {current === "themes" ? <ThemesTab say={say} /> : null}
              {current === "log" ? <LogTab say={say} /> : null}
              {current === "team" ? <TeamTab say={say} /> : null}
              {current === "notices" ? <NoticesTab say={say} /> : null}
              {current === "requests" ? <RequestsTab say={say} /> : null}
            </RoleCtx.Provider>
          </>
        )}
      </div>
    </main>
  );
}

/** Three headline numbers in the dark header. */
function HeaderStats({ say }: { say: Say }) {
  const [o] = useLoad<Overview>(owner.overview, say);
  const stats: [string, number | string][] = [
    ["Learners", o?.learners ?? "–"],
    ["Active 7 days", o?.active7 ?? "–"],
    ["New 7 days", o?.new7 ?? "–"],
  ];
  return (
    <dl className="grid grid-cols-3 gap-2">
      {stats.map(([label, n]) => (
        <div key={label} className="rounded-2xl bg-white/10 px-3 py-2.5">
          <dt className="text-[11px] font-bold text-sand/70">{label}</dt>
          <dd className="font-display text-2xl font-extrabold">{n}</dd>
        </div>
      ))}
    </dl>
  );
}

type Say = (text: string, ok?: boolean) => void;

/** Loads data once and on demand; reports errors through `say`. */
function useLoad<T>(load: () => Promise<T>, say: Say, enabled = true): [T | null, () => void] {
  const [data, setData] = useState<T | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    if (!enabled) return;
    load()
      .then((d) => alive && setData(d))
      .catch((e) => alive && say(errText(e), false));
    return () => {
      alive = false;
    };
    // `load` is recreated each render; reload only when asked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, enabled]);
  return [data, useCallback(() => setTick((n) => n + 1), [])];
}

function Card({ children }: { children: ReactNode }) {
  return <section className="mb-3 rounded-2xl border border-sand-3 bg-white p-4">{children}</section>;
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

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

/** Do learners come back? Totals only (learners with an account; activity from synced XP). */
function RetentionCard({ say }: { say: Say }) {
  const [rows] = useLoad(owner.retention, say);
  const [cohorts] = useLoad(owner.cohorts, say);
  return (
    <Card>
      <h2 className="mb-1 font-display text-lg font-extrabold text-night">Do learners come back?</h2>
      <p className="mb-3 text-sm text-muted">
        Of the learners with an account who joined long enough ago, the share who practised again on that day or later.
        Most apps lose many people in the first week; watch the trend after each update.
      </p>
      {!rows ? (
        <Loading />
      ) : (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {rows.map((r) => (
            <div key={r.period} className="rounded-xl bg-sand p-3 text-center">
              <p className="font-display text-2xl font-extrabold text-night">{pct(r.returned, r.eligible)}</p>
              <p className="text-xs text-muted">
                after {r.period}
                <br />
                {r.returned} of {r.eligible}
              </p>
            </div>
          ))}
        </div>
      )}
      {cohorts && cohorts.length ? (
        <>
          <p className="mb-1 text-sm font-bold text-night">By week joined (still practising a week later)</p>
          <table className="w-full text-sm">
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.week_start} className="border-t border-sand-3">
                  <td className="py-1 text-muted">Week of {date(c.week_start)}</td>
                  <td className="py-1 text-right">{c.joined} joined</td>
                  <td className="py-1 text-right font-bold text-night">{pct(c.active_after_week, c.joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-muted">The most recent week can&apos;t be judged yet (less than 7 days).</p>
        </>
      ) : null}
    </Card>
  );
}

function OverviewTab({ say }: { say: Say }) {
  const role = useContext(RoleCtx);
  const [o] = useLoad<Overview>(owner.overview, say);
  if (!o) return <Loading />;
  const tiles: [string, number][] = [
    ["Organisations", o.organisations],
    ["Organisation members", o.members],
    ["Suspended accounts", o.suspended],
  ];
  return (
    <>
      <RenewalsCard say={say} />
      {role !== "support" ? <RetentionCard say={say} /> : null}
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-sand-3 bg-white p-4">
            <p className="font-display text-2xl font-extrabold text-night">{n}</p>
            <p className="text-xs font-bold text-muted">{label}</p>
          </div>
        ))}
        <p className="col-span-3 text-sm text-muted">
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
  const role = useContext(RoleCtx);
  const [ask, setAsk] = useState<{ kind: RiskyAction; target: string; label: string } | null>(null);

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

      <RequestDialog ask={ask} onClose={() => setAsk(null)} say={say} />
      <Dialog open={confirm} onClose={() => setConfirm(false)} title={`Delete ${org.name}?`}>
        <p className="mb-5 text-muted">
          This removes the organisation and all its memberships. Learners keep their accounts and progress.
        </p>
        <div className="flex flex-col gap-3">
          {mustRequest(role, "delete organisation") ? (
            <Button
              block
              variant="wrong"
              onClick={() => {
                setConfirm(false);
                setAsk({ kind: "delete organisation", target: org.id, label: org.name });
              }}
            >
              Ask owner to delete
            </Button>
          ) : (
            <Button block variant="wrong" onClick={() => void act(() => owner.deleteOrganisation(org.id), "Organisation deleted.").then(() => setConfirm(false))}>
              Delete organisation
            </Button>
          )}
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
  const role = useContext(RoleCtx);
  const [ask, setAsk] = useState<{ kind: RiskyAction; target: string; label: string } | null>(null);
  const [grants, reloadGrants] = useLoad<GrantRow[]>(owner.grants, say, role === "owner");
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
              {!p.suspended && mustRequest(role, "suspend account") ? (
                <Button variant="secondary" onClick={() => setAsk({ kind: "suspend account", target: p.user_id, label: p.email })}>
                  Ask owner to suspend
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() =>
                    void act(() => owner.setSuspended(p.user_id, !p.suspended), p.suspended ? "Account reactivated." : "Account suspended.")
                  }
                >
                  {p.suspended ? "Reactivate" : "Suspend"}
                </Button>
              )}
              {mustRequest(role, "delete account") ? (
                <Button variant="wrong" onClick={() => setAsk({ kind: "delete account", target: p.user_id, label: p.email })}>
                  Ask owner to delete
                </Button>
              ) : (
                <Button variant="wrong" onClick={() => setRemove(p)}>
                  Delete account
                </Button>
              )}
            </div>
          ) : null}
        </Card>
      ))}
      <RequestDialog ask={ask} onClose={() => setAsk(null)} say={say} />
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
          Paid access in this build: <b>{PREMIUM_ENABLED ? "Premium (paywall)" : SUPPORTER_ENABLED ? "Supporter (everything free)" : "off"}</b>
          {PREMIUM_ENABLED || SUPPORTER_ENABLED ? "." : ": everything is free for learners."} Card payments, refunds and prices for app
          subscriptions are managed in the Google Play Console and RevenueCat, not here. Supporters appear in RevenueCat
          (Customers); to thank someone without a purchase, give them Premium in People.
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

/* ── Voices ────────────────────────────────────────────────────────────── */
function VoicesTab({ say }: { say: Say }) {
  const [part, setPart] = useState<"review" | "recorders" | "blocked">("review");
  return (
    <>
      <div className="mb-3 flex gap-2">
        {(
          [
            ["review", "Review"],
            ["recorders", "Recorders"],
            ["blocked", "Blocked words"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={part === id}
            onClick={() => setPart(id)}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${part === id ? "border-night bg-night text-sand" : "border-sand-3 bg-white text-night"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {part === "review" ? <VoiceReview say={say} /> : null}
      {part === "recorders" ? <RecordersPart say={say} /> : null}
      {part === "blocked" ? <BlockedPart say={say} /> : null}
    </>
  );
}

function RecordersPart({ say }: { say: Say }) {
  const [rows, reload] = useLoad<RecorderRow[]>(owner.recorders, say);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [approver, setApprover] = useState(false);
  const save = async (e: string, n: string, a: boolean, active: boolean, done: string) => {
    try {
      await owner.saveRecorder(e, n, a, active);
      say(done);
      reload();
    } catch (err) {
      say(errText(err), false);
    }
  };
  return (
    <>
      <Card>
        <h2 className="mb-1 font-display text-lg font-extrabold text-night">Invite a recorder</h2>
        <p className="mb-2 text-sm text-muted">
          They must have created an account in the app first. Their name appears in the app&apos;s voice credits.
          Reviewers can approve other people&apos;s recordings (never their own). 20 approved lines give them a year of
          Premium automatically.
        </p>
        <div className="grid gap-2">
          <input className={field} type="email" placeholder="Their account email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={field} placeholder="Name for the credits" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={approver} onChange={(e) => setApprover(e.target.checked)} /> Also a reviewer (can approve)
          </label>
          <Button
            disabled={!email.includes("@") || !name.trim()}
            onClick={() =>
              void save(email.trim(), name.trim(), approver, true, `${name.trim()} can now record from Profile → Record voices.`).then(() => {
                setEmail("");
                setName("");
                setApprover(false);
              })
            }
          >
            Invite
          </Button>
        </div>
      </Card>
      {!rows ? <Loading /> : rows.length === 0 ? <p className="text-muted">No recorders yet.</p> : null}
      {rows?.map((r) => (
        <Card key={r.user_id}>
          <p className="font-bold text-night">
            {r.display_name} <span className="text-sm font-normal text-muted">· {r.email}</span>
          </p>
          <p className="text-sm text-muted">
            {r.approved} approved · {r.waiting} waiting · {r.rejected} rejected
            {r.can_approve ? " · reviewer" : ""}
            {!r.consented ? " · hasn't accepted the terms yet" : ""}
            {!r.active ? " · removed" : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                void save(r.email, r.display_name, !r.can_approve, r.active, r.can_approve ? "No longer a reviewer." : "Now a reviewer.")
              }
            >
              {r.can_approve ? "Remove reviewer" : "Make reviewer"}
            </Button>
            <Button
              variant={r.active ? "wrong" : "secondary"}
              onClick={() =>
                void save(r.email, r.display_name, r.can_approve, !r.active, r.active ? "Recorder removed (their approved voices stay)." : "Recorder restored.")
              }
            >
              {r.active ? "Remove" : "Restore"}
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
}

function BlockedPart({ say }: { say: Say }) {
  const [rows, reload] = useLoad<{ word: string }[]>(owner.blockedWords, say);
  const [word, setWord] = useState("");
  const set = async (w: string, add: boolean) => {
    try {
      await owner.setBlockedWord(w, add);
      say(add ? `"${w}" blocked.` : `"${w}" removed.`);
      setWord("");
      reload();
    } catch (err) {
      say(errText(err), false);
    }
  };
  return (
    <>
      <Card>
        <p className="mb-2 text-sm text-muted">
          The automatic check flags any recording whose transcript contains one of these words (accents ignored). Ask
          your Wolof reviewer to add Wolof swear words and insults here. Every recording is still heard by a person
          before it goes live.
        </p>
        <div className="flex gap-2">
          <input className={field} placeholder="Word to block" maxLength={40} value={word} onChange={(e) => setWord(e.target.value)} />
          <Button disabled={word.trim().length < 2} onClick={() => void set(word.trim(), true)}>
            Add
          </Button>
        </div>
      </Card>
      {!rows ? <Loading /> : null}
      <div className="flex flex-wrap gap-2">
        {rows?.map((r) => (
          <button
            key={r.word}
            type="button"
            onClick={() => void set(r.word, false)}
            className="rounded-full border-2 border-sand-3 bg-white px-3 py-1 text-sm"
            aria-label={`Remove ${r.word}`}
          >
            {r.word} ✕
          </button>
        ))}
      </div>
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
      <PeopleReports show={show} say={say} />
      <h3 className="mt-2 font-display text-lg font-extrabold text-night">Word reports</h3>
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

/** Reports about learners (community: names, handles, harassment). Block or suspend from People. */
function PeopleReports({ show, say }: { show: "open" | "all"; say: Say }) {
  const [rows, reload] = useLoad<UserReportRow[]>(() => owner.userReports(show), say);
  useEffect(() => reload(), [show, reload]);
  const setStatus = async (r: UserReportRow, status: UserReportRow["status"]) => {
    try {
      await owner.setUserReportStatus(r.id, status);
      say(status === "open" ? "Report reopened." : `Report marked ${status}.`);
      reload();
    } catch (e) {
      say(errText(e), false);
    }
  };
  if (!rows?.length) return null;
  return (
    <>
      <h3 className="mt-2 font-display text-lg font-extrabold text-night">Reports about people</h3>
      <p className="text-sm text-muted">
        Check the name or handle, then suspend the account in People if needed. Aim to act within 48 hours.
      </p>
      {rows.map((r) => (
        <Card key={r.id}>
          <p className="font-display font-extrabold text-night">
            {r.reported_name} <span className="text-sm font-bold text-berry">· {r.reason}</span>
          </p>
          {r.note ? <p className="mt-1 whitespace-pre-wrap text-night">“{r.note}”</p> : null}
          <p className="mt-1 text-xs text-muted">
            {new Date(r.created_at).toLocaleString()} · from {r.reporter_name} · {r.reports_against} report(s) about this person · {r.status}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {r.status === "open" ? (
              <>
                <Button onClick={() => void setStatus(r, "actioned")}>Actioned</Button>
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
          {r.who ? <span className="text-muted">by {r.who} </span> : null}
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

/* ── Team (owner only; the server refuses everyone else) ───────────────── */
function TeamTab({ say }: { say: Say }) {
  const [rows, reload] = useLoad<StaffRow[]>(owner.staff, say);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("support");
  const act = async (fn: () => Promise<void>, done: string) => {
    try {
      await fn();
      say(done);
      reload();
    } catch (e) {
      say(errText(e), false);
    }
  };
  if (!rows) return <Loading />;
  return (
    <>
      <Card>
        <h2 className="mb-1 font-display text-lg font-extrabold text-night">Invite a team member</h2>
        <p className="mb-3 text-sm text-muted">
          They sign in to the app with this email (a one-time code), then open Profile → Team console. Remove them
          here and their access ends at once.
        </p>
        <input className={`${field} mb-2`} type="email" placeholder="Their email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={`${field} mb-2`} placeholder="Their name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        <select className={`${field} mb-1`} value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <p className="mb-3 text-xs text-muted">{ROLE_HELP[role]}</p>
        <Button
          block
          disabled={!email.trim() || !name.trim()}
          onClick={() =>
            void act(() => owner.saveStaff(email, name, role, true), "Saved.").then(() => {
              setEmail("");
              setName("");
            })
          }
        >
          Save team member
        </Button>
      </Card>
      {rows.length === 0 ? <p className="text-muted">No team members yet.</p> : null}
      {rows.map((s) => (
        <Card key={s.email}>
          <p className="font-bold text-night">
            {s.name} · {s.role}
            {s.active ? "" : " (paused)"}
          </p>
          <p className="break-all text-sm text-muted">
            {s.email}
            {s.signed_up ? "" : " · hasn't created an account yet"}
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" onClick={() => void act(() => owner.saveStaff(s.email, s.name, s.role, !s.active), s.active ? "Paused." : "Resumed.")}>
              {s.active ? "Pause" : "Resume"}
            </Button>
            <Button variant="wrong" onClick={() => void act(() => owner.removeStaff(s.email), "Removed.")}>
              Remove
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
}

/* ── Two-person rule: staff ask, the owner approves ────────────────────── */
function RequestDialog({ ask, onClose, say }: { ask: { kind: RiskyAction; target: string; label: string } | null; onClose: () => void; say: Say }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!ask) return;
    setBusy(true);
    try {
      await owner.requestAction(ask.kind, ask.target, reason);
      say("Sent to the owner for approval. Nothing happens until they approve it.");
      setReason("");
      onClose();
    } catch (e) {
      say(errText(e), false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!ask} onClose={onClose} title="Ask the owner">
      <p className="mb-2 text-muted">
        {ask?.kind} · <span className="break-all">{ask?.label}</span>
      </p>
      <textarea
        className={`${field} mb-3`}
        rows={3}
        maxLength={300}
        placeholder="Why? (for example: they asked by email on 3 Nov)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex flex-col gap-3">
        <Button block disabled={busy || reason.trim().length < 3} onClick={() => void send()}>
          Send request
        </Button>
        <Button block variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}

function RequestsTab({ say }: { say: Say }) {
  const role = useContext(RoleCtx);
  const [rows, reload] = useLoad<RequestRow[]>(owner.pendingActions, say);
  const decide = async (id: number, approve: boolean) => {
    try {
      await owner.decideAction(id, approve);
      say(approve ? "Approved and done." : "Rejected.");
      reload();
    } catch (e) {
      say(errText(e), false);
    }
  };
  if (!rows) return <Loading />;
  return (
    <>
      <p className="mb-3 text-sm text-muted">
        {role === "owner"
          ? "Team members can't delete accounts or organisations themselves; they ask here. Approving does it at once and can't be undone."
          : "Requests you and your team have sent. Only the owner can approve them."}
      </p>
      {rows.length === 0 ? <p className="text-muted">No requests.</p> : null}
      {rows.map((r) => (
        <Card key={r.id}>
          <p className="font-bold text-night">
            {r.kind} · <span className="break-all">{r.target_label}</span>
          </p>
          <p className="text-sm text-ink">“{r.reason}”</p>
          <p className="text-sm text-muted">
            Asked by {r.requested_by} · {date(r.requested_at)} · {r.status}
            {r.decided_at ? ` ${date(r.decided_at)}` : ""}
          </p>
          {role === "owner" && r.status === "pending" ? (
            <div className="mt-2 flex gap-2">
              <Button variant="wrong" onClick={() => void decide(r.id, true)}>
                Approve
              </Button>
              <Button variant="secondary" onClick={() => void decide(r.id, false)}>
                Reject
              </Button>
            </div>
          ) : null}
        </Card>
      ))}
    </>
  );
}

/* ── Notices: announcements and remote off-switches ────────────────────── */
const SWITCH_HELP: Record<string, string> = {
  friends: "Friends, the weekly board and nudges (duels too)",
  duels: "Duels only",
  voices: "The recording screen for invited speakers",
  supporter: "The Supporter purchase screen (when Supporter is on in the build)",
  reports: "The “Report a problem” button",
  community: "City leagues, learners near you and friend requests",
};

const blankNotice = (): Omit<AnnouncementRow, "id"> & { id: string | null } => ({
  id: null,
  starts_on: todayIso(),
  ends_on: todayIso(),
  title: { en: "" },
  message: null,
});

function NoticesTab({ say }: { say: Say }) {
  const [rows, reload] = useLoad<AnnouncementRow[]>(owner.announcements, say);
  const [switches, reloadSwitches] = useLoad<SwitchRow[]>(owner.switches, say);
  const [edit, setEdit] = useState<(Omit<AnnouncementRow, "id"> & { id: string | null }) | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, done: string, after: () => void) => {
    setBusy(true);
    try {
      await fn();
      say(done);
      after();
    } catch (e) {
      say(errText(e), false);
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    if (!edit) return;
    const clean = (o: Record<string, string> | null) => {
      const out = Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
      return Object.keys(out).length ? out : null;
    };
    const title = clean(edit.title);
    if (!title?.en) return say("An English title is needed (the other languages fall back to it).", false);
    if (edit.ends_on < edit.starts_on) return say("The end date is before the start date.", false);
    void run(() => owner.saveAnnouncement({ ...edit, title, message: clean(edit.message) }), "Saved. Apps show it within an hour.", () => {
      setEdit(null);
      reload();
    });
  };
  const isOff = (key: string) => !!switches?.find((s) => s.key === key)?.is_off;

  return (
    <>
      <Card>
        <h2 className="mb-1 font-display text-lg font-extrabold text-night">Pause a feature</h2>
        <p className="mb-3 text-sm text-muted">
          For emergencies, without a new release: apps check within an hour (offline phones when they reconnect). This
          can only pause what the app already has; it never switches anything new on.
        </p>
        {!switches ? <Loading /> : null}
        {switches
          ? SWITCH_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3 border-t border-sand-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-night">
                    {key} {isOff(key) ? <span className="rounded-full bg-berry-soft px-2 text-xs text-berry">paused</span> : null}
                  </p>
                  <p className="text-xs text-muted">{SWITCH_HELP[key]}</p>
                </div>
                <Button
                  variant={isOff(key) ? "primary" : "secondary"}
                  disabled={busy}
                  onClick={() => void run(() => owner.setSwitch(key, !isOff(key), null), isOff(key) ? "Switched back on." : "Paused.", reloadSwitches)}
                >
                  {isOff(key) ? "Resume" : "Pause"}
                </Button>
              </div>
            ))
          : null}
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-night">Announcements</h2>
        {!edit ? <Button onClick={() => setEdit(blankNotice())}>New</Button> : null}
      </div>
      {edit ? (
        <Card>
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
                maxLength={80}
                placeholder={`Title (${LANG_LABEL[l]})${l === "en" ? ", required" : ""}`}
                value={edit.title[l] ?? ""}
                onChange={(e) => setEdit({ ...edit, title: { ...edit.title, [l]: e.target.value } })}
              />
              <input
                className={field}
                maxLength={200}
                placeholder={`Message (${LANG_LABEL[l]}), optional`}
                value={edit.message?.[l] ?? ""}
                onChange={(e) => setEdit({ ...edit, message: { ...(edit.message ?? {}), [l]: e.target.value } })}
              />
            </div>
          ))}
          <p className="mb-3 text-xs text-muted">
            Everyone sees this on the Learn screen, with or without an account. Wolof in it should be checked by your
            reviewer first. No personal details.
          </p>
          <div className="flex gap-2">
            <Button disabled={busy} onClick={save}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}
      {!rows ? <Loading /> : rows.length === 0 ? <p className="text-muted">No announcements.</p> : null}
      {rows?.map((r) => (
        <Card key={r.id}>
          <p className="font-display font-extrabold text-night">📣 {r.title.en}</p>
          {r.message?.en ? <p className="text-sm">{r.message.en}</p> : null}
          <p className="text-sm text-muted">
            {r.starts_on} → {r.ends_on} · languages: {Object.keys(r.title).join(", ")}
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setEdit({ ...r })}>
              Edit
            </Button>
            <Button variant="wrong" disabled={busy} onClick={() => void run(() => owner.deleteAnnouncement(r.id), "Deleted.", reload)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
}
