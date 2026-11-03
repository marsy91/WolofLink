-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- 1. Announcements: short notices the console shows on the Learn screen.
-- 2. Remote off-switches: pause a feature for everyone without a new release.
--    They can only switch OFF what the build already has; they never turn on
--    anything new.
-- 3. Approval requests (two-person rule): staff can ask for a risky action
--    (delete or suspend an account, delete an organisation); only the owner can
--    approve it, and approving runs it.
-- Requires 20261103000000_staff_roles.sql. Safe to run more than once.

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      jsonb not null,
  message    jsonb,
  starts_on  date not null,
  ends_on    date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on and ends_on - starts_on <= 92),
  check (jsonb_typeof(title) = 'object' and char_length(coalesce(title ->> 'en', '')) between 1 and 80),
  check (message is null or jsonb_typeof(message) = 'object'),
  check (char_length(title::text) <= 800 and char_length(coalesce(message::text, '')) <= 2000)
);
alter table public.announcements enable row level security;
revoke all on public.announcements from public, anon, authenticated;

create table if not exists public.remote_switches (
  key        text primary key check (key in ('friends', 'duels', 'voices', 'supporter', 'reports')),
  is_off     boolean not null default false,
  note       text check (note is null or char_length(note) <= 200),
  updated_at timestamptz not null default now()
);
alter table public.remote_switches enable row level security;
revoke all on public.remote_switches from public, anon, authenticated;

create table if not exists private.pending_actions (
  id           bigserial primary key,
  kind         text not null check (kind in ('delete account', 'suspend account', 'delete organisation')),
  target       uuid not null,
  reason       text not null check (char_length(btrim(reason)) between 3 and 300),
  requested_by uuid not null,
  requested_at timestamptz not null default now(),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_at   timestamptz
);
revoke all on private.pending_actions from public, anon, authenticated;

-- ── Roles: who may do the new actions ──────────────────────────────────────
-- Admin already gets everything not excluded. Support may also request actions.
create or replace function private.role_allows(staff_role text, action text) returns boolean
  language sql immutable set search_path = '' as $$
  select case staff_role
    when 'owner' then true
    when 'admin' then action not in ('delete account', 'delete organisation', 'grants')
                      and action not like 'staff.%'
    when 'reviewer' then action in ('read reports', 'report status', 'read missed words', 'read blocked words')
    when 'support' then action in ('overview', 'search people', 'list organisations', 'list members',
                                   'read reports', 'report status', 'request action', 'read requests')
    when 'analyst' then action in ('overview', 'read retention', 'read cohorts', 'read missed words',
                                   'list organisations')
    else false
  end;
$$;
revoke execute on function private.role_allows(text, text) from public, anon, authenticated;

-- ── What every copy of the app reads (no account needed, no personal data) ──
create or replace function public.app_notices() returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'message', a.message) order by a.starts_on desc)
      from public.announcements a
      where a.starts_on <= current_date and a.ends_on >= current_date), '[]'::jsonb),
    'off', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s where s.is_off), '[]'::jsonb)
  );
$$;
revoke execute on function public.app_notices() from public;
grant execute on function public.app_notices() to anon, authenticated;

-- ── Console: announcements ─────────────────────────────────────────────────
create or replace function public.owner_announcements()
  returns table (id uuid, title jsonb, message jsonb, starts_on date, ends_on date)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read announcements');
  return query select a.id, a.title, a.message, a.starts_on, a.ends_on from public.announcements a
    where a.ends_on >= current_date - 30 order by a.starts_on desc;
end;
$$;

create or replace function public.owner_save_announcement(item uuid, item_title jsonb, item_message jsonb, item_start date, item_end date)
  returns uuid
  language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  perform private.require_owner('announcement.save', jsonb_build_object('id', item, 'title', item_title ->> 'en'));
  if item is null then
    insert into public.announcements (title, message, starts_on, ends_on)
      values (item_title, item_message, item_start, item_end) returning id into new_id;
  else
    update public.announcements set title = item_title, message = item_message, starts_on = item_start, ends_on = item_end
      where id = item returning id into new_id;
    if new_id is null then raise exception 'not found' using errcode = 'P0002'; end if;
  end if;
  return new_id;
end;
$$;

create or replace function public.owner_delete_announcement(item uuid) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('announcement.delete', jsonb_build_object('id', item));
  delete from public.announcements where id = item;
end;
$$;

-- ── Console: remote switches ───────────────────────────────────────────────
create or replace function public.owner_switches()
  returns table (key text, is_off boolean, note text, updated_at timestamptz)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read switches');
  return query select s.key, s.is_off, s.note, s.updated_at from public.remote_switches s order by s.key;
end;
$$;

create or replace function public.owner_set_switch(switch_key text, turn_off boolean, switch_note text default null) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('switch.set', jsonb_build_object('key', switch_key, 'off', turn_off, 'note', switch_note));
  insert into public.remote_switches (key, is_off, note, updated_at) values (switch_key, turn_off, nullif(btrim(switch_note), ''), now())
    on conflict (key) do update set is_off = excluded.is_off, note = excluded.note, updated_at = now();
end;
$$;

-- ── Console: approval requests (two-person rule) ───────────────────────────
create or replace function public.owner_request_action(action_kind text, action_target uuid, action_reason text)
  returns bigint
  language plpgsql security definer set search_path = '' as $$
declare new_id bigint;
begin
  perform private.require_owner('request action',
    jsonb_build_object('kind', action_kind, 'target', action_target, 'reason', action_reason));
  if action_kind in ('delete account', 'suspend account') and action_target = (select auth.uid()) then
    raise exception 'not on your own account' using errcode = '42501';
  end if;
  insert into private.pending_actions (kind, target, reason, requested_by)
    values (action_kind, action_target, btrim(action_reason), (select auth.uid())) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.owner_pending_actions()
  returns table (id bigint, kind text, target uuid, target_label text, reason text, requested_by text,
                 requested_at timestamptz, status text, decided_at timestamptz)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read requests');
  return query
    select p.id, p.kind, p.target,
           coalesce((select u.email::text from auth.users u where u.id = p.target),
                    (select o.name from public.organisations o where o.id = p.target), 'gone'),
           p.reason, coalesce((select u.email::text from auth.users u where u.id = p.requested_by), 'unknown'),
           p.requested_at, p.status, p.decided_at
    from private.pending_actions p
    where p.status = 'pending' or p.decided_at > now() - interval '30 days'
    order by (p.status = 'pending') desc, p.requested_at desc
    limit 100;
end;
$$;

-- Owner only ('staff.' actions are never allowed to staff). The owner can't approve
-- a request they made themselves (they can just do it directly).
create or replace function public.owner_decide_action(request bigint, approve boolean) returns void
  language plpgsql security definer set search_path = '' as $$
declare p private.pending_actions;
begin
  perform private.require_owner('staff.decide', jsonb_build_object('request', request, 'approve', approve));
  select * into p from private.pending_actions a where a.id = request for update;
  if not found or p.status <> 'pending' then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  if p.requested_by = (select auth.uid()) then
    raise exception 'a second person must approve' using errcode = '42501';
  end if;
  if approve then
    if p.kind = 'delete account' then perform public.owner_delete_account(p.target);
    elsif p.kind = 'suspend account' then perform public.owner_set_suspended(p.target, true);
    elsif p.kind = 'delete organisation' then perform public.owner_delete_organisation(p.target);
    end if;
  end if;
  update private.pending_actions set status = case when approve then 'approved' else 'rejected' end, decided_at = now()
    where id = request;
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'owner_announcements()', 'owner_save_announcement(uuid, jsonb, jsonb, date, date)',
    'owner_delete_announcement(uuid)', 'owner_switches()', 'owner_set_switch(text, boolean, text)',
    'owner_request_action(text, uuid, text)', 'owner_pending_actions()', 'owner_decide_action(bigint, boolean)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
