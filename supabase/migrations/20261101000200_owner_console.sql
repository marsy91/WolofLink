-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Owner console: one account (private.owners) can manage organisations,
-- memberships, licences and learner accounts. Every owner function checks
-- the caller on the server and records what it did in private.audit_log.
-- Safe to run more than once. Includes the private membership helpers
-- (20261101000100) so it can be applied on its own.

-- ── Private helpers (not reachable through the API) ─────────────────────────
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_org_admin(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = (select auth.uid()) and m.role = 'admin'
  );
$$;

create or replace function private.is_org_member(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m where m.org_id = org and m.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_org_admin(uuid) from public, anon;
revoke execute on function private.is_org_member(uuid) from public, anon;
grant execute on function private.is_org_admin(uuid) to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;

drop policy if exists "Members read their organisations" on public.organisations;
create policy "Members read their organisations"
  on public.organisations for select to authenticated
  using (private.is_org_member(id));

drop policy if exists "Learners read their own memberships" on public.memberships;
create policy "Learners read their own memberships"
  on public.memberships for select to authenticated
  using ((select auth.uid()) = user_id or private.is_org_admin(org_id));

-- ── Licence fields on organisations ─────────────────────────────────────────
alter table public.organisations
  add column if not exists status text not null default 'active' check (status in ('active', 'suspended')),
  add column if not exists plan text not null default 'pilot' check (plan in ('pilot', 'free', 'paid')),
  add column if not exists seats integer check (seats is null or seats between 1 and 100000),
  add column if not exists paid_until date,
  add column if not exists notes text check (notes is null or char_length(notes) <= 1000);

-- ── Owner identity and audit log ────────────────────────────────────────────
create table if not exists private.owners (email text primary key);
insert into private.owners (email) values ('racine.mars@protonmail.com') on conflict do nothing;
revoke all on private.owners from public, anon, authenticated;

create table if not exists private.audit_log (
  id     bigserial primary key,
  at     timestamptz not null default now(),
  actor  uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb
);
revoke all on private.audit_log from public, anon, authenticated;

-- True only for a signed-in user whose verified email is in private.owners.
create or replace function private.is_owner() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    join private.owners o on lower(o.email) = lower(u.email)
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;

create or replace function private.require_owner(action text, detail jsonb default '{}'::jsonb) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_owner() then
    raise exception 'owner only' using errcode = '42501';
  end if;
  insert into private.audit_log (actor, action, detail) values ((select auth.uid()), action, detail);
end;
$$;

create or replace function private.new_join_code() returns text
  language plpgsql volatile security definer set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  bytes bytea;
begin
  loop
    bytes := extensions.gen_random_bytes(8);
    code := '';
    for i in 0..7 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.organisations o where o.join_code = code);
  end loop;
  return code;
end;
$$;

revoke execute on function private.is_owner() from public, anon;
revoke execute on function private.require_owner(text, jsonb) from public, anon, authenticated;
revoke execute on function private.new_join_code() from public, anon, authenticated;
grant execute on function private.is_owner() to authenticated;

-- ── Member-facing functions (updated) ───────────────────────────────────────
create or replace function public.organisation_report(org uuid)
  returns table (
    user_id uuid, display_name text, role text, joined_at timestamptz,
    xp integer, lessons integer, streak integer, last_active timestamptz
  )
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not (private.is_org_admin(org) or private.is_owner()) then
    raise exception 'not an admin of this organisation' using errcode = '42501';
  end if;
  return query
    select m.user_id, m.display_name, m.role, m.joined_at,
           coalesce((p.data ->> 'xpTotal')::integer, 0),
           coalesce((select count(*)::integer from jsonb_object_keys(coalesce(p.data -> 'lessons', '{}'::jsonb))), 0),
           coalesce((p.data -> 'streak' ->> 'count')::integer, 0),
           p.updated_at
    from public.memberships m
    left join public.progress p on p.user_id = m.user_id
    where m.org_id = org
    order by m.display_name;
end;
$$;

-- Joining now respects suspension and the seat limit.
create or replace function public.join_organisation(code text, member_name text)
  returns table (org_id uuid, org_name text)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  org public.organisations;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(member_name, ''))) not between 1 and 60 then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  select * into org from public.organisations o
    where o.join_code = upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then
    raise exception 'unknown code' using errcode = 'P0002';
  end if;
  if org.status <> 'active' then
    raise exception 'organisation suspended' using errcode = '55000';
  end if;
  if org.seats is not null
     and not exists (select 1 from public.memberships m where m.org_id = org.id and m.user_id = uid)
     and (select count(*) from public.memberships m where m.org_id = org.id) >= org.seats then
    raise exception 'organisation full' using errcode = '54000';
  end if;
  insert into public.memberships (org_id, user_id, display_name)
    values (org.id, uid, btrim(member_name))
    on conflict on constraint memberships_pkey do update set display_name = excluded.display_name;
  return query select org.id, org.name;
end;
$$;

drop function if exists public.is_org_admin(uuid);
drop function if exists public.is_org_member(uuid);

-- ── Owner functions ─────────────────────────────────────────────────────────
-- Whether the signed-in user is the owner (shows the console in the app).
create or replace function public.owner_check() returns boolean
  language sql stable security definer set search_path = '' as $$
  select private.is_owner();
$$;

create or replace function public.owner_overview() returns jsonb
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('overview');
  return jsonb_build_object(
    'learners', (select count(*) from auth.users),
    'new7', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active7', (select count(*) from public.progress where updated_at > now() - interval '7 days'),
    'suspended', (select count(*) from auth.users where banned_until > now()),
    'organisations', (select count(*) from public.organisations),
    'members', (select count(*) from public.memberships)
  );
end;
$$;

create or replace function public.owner_organisations()
  returns table (
    id uuid, name text, join_code text, status text, plan text, seats integer,
    paid_until date, notes text, members integer, admins integer, created_at timestamptz
  )
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('list organisations');
  return query
    select o.id, o.name, o.join_code, o.status, o.plan, o.seats, o.paid_until, o.notes,
           (select count(*)::integer from public.memberships m where m.org_id = o.id),
           (select count(*)::integer from public.memberships m where m.org_id = o.id and m.role = 'admin'),
           o.created_at
    from public.organisations o
    order by o.created_at desc;
end;
$$;

create or replace function public.owner_create_organisation(org_name text, org_plan text default 'pilot', org_seats integer default null)
  returns table (id uuid, join_code text)
  language plpgsql security definer set search_path = '' as $$
declare
  new_code text := private.new_join_code();
  new_id uuid;
begin
  perform private.require_owner('create organisation', jsonb_build_object('name', org_name));
  insert into public.organisations (name, join_code, created_by, plan, seats)
    values (btrim(org_name), new_code, (select auth.uid()), org_plan, org_seats)
    returning organisations.id into new_id;
  return query select new_id, new_code;
end;
$$;

create or replace function public.owner_update_organisation(
  org uuid, org_name text, org_status text, org_plan text, org_seats integer, org_paid_until date, org_notes text
) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('update organisation', jsonb_build_object(
    'org', org, 'name', org_name, 'status', org_status, 'plan', org_plan, 'seats', org_seats, 'paid_until', org_paid_until));
  update public.organisations set
    name = btrim(org_name), status = org_status, plan = org_plan, seats = org_seats,
    paid_until = org_paid_until, notes = nullif(btrim(coalesce(org_notes, '')), '')
  where id = org;
  if not found then raise exception 'unknown organisation' using errcode = 'P0002'; end if;
end;
$$;

create or replace function public.owner_new_code(org uuid) returns text
  language plpgsql security definer set search_path = '' as $$
declare
  code text := private.new_join_code();
begin
  perform private.require_owner('new team code', jsonb_build_object('org', org));
  update public.organisations set join_code = code where id = org;
  if not found then raise exception 'unknown organisation' using errcode = 'P0002'; end if;
  return code;
end;
$$;

create or replace function public.owner_delete_organisation(org uuid) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('delete organisation', jsonb_build_object(
    'org', org, 'name', (select o.name from public.organisations o where o.id = org)));
  delete from public.organisations where id = org;
end;
$$;

create or replace function public.owner_members(org uuid)
  returns table (
    user_id uuid, email text, display_name text, role text, joined_at timestamptz,
    xp integer, lessons integer, last_active timestamptz
  )
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('list members', jsonb_build_object('org', org));
  return query
    select m.user_id, u.email::text, m.display_name, m.role, m.joined_at,
           coalesce((p.data ->> 'xpTotal')::integer, 0),
           coalesce((select count(*)::integer from jsonb_object_keys(coalesce(p.data -> 'lessons', '{}'::jsonb))), 0),
           p.updated_at
    from public.memberships m
    join auth.users u on u.id = m.user_id
    left join public.progress p on p.user_id = m.user_id
    where m.org_id = org
    order by m.role, m.display_name;
end;
$$;

create or replace function public.owner_add_member(org uuid, member_email text, member_name text, member_role text default 'member')
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid;
begin
  perform private.require_owner('add member', jsonb_build_object('org', org, 'email', member_email, 'role', member_role));
  select u.id into uid from auth.users u where lower(u.email) = lower(btrim(member_email));
  if uid is null then
    raise exception 'no account with that email' using errcode = 'P0002';
  end if;
  insert into public.memberships (org_id, user_id, role, display_name)
    values (org, uid, member_role, btrim(member_name))
    on conflict on constraint memberships_pkey do update set role = excluded.role, display_name = excluded.display_name;
end;
$$;

create or replace function public.owner_set_role(org uuid, member uuid, member_role text) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('set role', jsonb_build_object('org', org, 'user', member, 'role', member_role));
  update public.memberships set role = member_role where org_id = org and user_id = member;
end;
$$;

create or replace function public.owner_remove_member(org uuid, member uuid) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('remove member', jsonb_build_object('org', org, 'user', member));
  delete from public.memberships where org_id = org and user_id = member;
end;
$$;

create or replace function public.owner_people(search text default '')
  returns table (
    user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, suspended boolean,
    xp integer, lessons integer, last_active timestamptz, organisations text, is_owner boolean
  )
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('search people', jsonb_build_object('search', search));
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at, coalesce(u.banned_until > now(), false),
           coalesce((p.data ->> 'xpTotal')::integer, 0),
           coalesce((select count(*)::integer from jsonb_object_keys(coalesce(p.data -> 'lessons', '{}'::jsonb))), 0),
           p.updated_at,
           (select string_agg(o.name || case when m.role = 'admin' then ' (admin)' else '' end, ', ' order by o.name)
              from public.memberships m join public.organisations o on o.id = m.org_id where m.user_id = u.id),
           exists (select 1 from private.owners ow where lower(ow.email) = lower(u.email))
    from auth.users u
    left join public.progress p on p.user_id = u.id
    where coalesce(search, '') = '' or u.email ilike '%' || btrim(search) || '%'
    order by u.created_at desc
    limit 100;
end;
$$;

-- Suspending blocks sign-in and sync (Supabase bans the account); it can be undone.
create or replace function public.owner_set_suspended(member uuid, suspend boolean) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner(case when suspend then 'suspend account' else 'reactivate account' end,
    jsonb_build_object('user', member));
  if member = (select auth.uid()) then
    raise exception 'you cannot suspend your own account' using errcode = '42501';
  end if;
  update auth.users set banned_until = case when suspend then 'infinity'::timestamptz else null end where id = member;
end;
$$;

-- Permanently deletes an account with its progress and memberships.
create or replace function public.owner_delete_account(member uuid) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('delete account', jsonb_build_object(
    'user', member, 'email', (select u.email from auth.users u where u.id = member)));
  if member = (select auth.uid()) then
    raise exception 'you cannot delete your own account here' using errcode = '42501';
  end if;
  delete from auth.users where id = member;
end;
$$;

create or replace function public.owner_audit(max_rows integer default 50)
  returns table (at timestamptz, action text, detail jsonb)
  language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_owner() then
    raise exception 'owner only' using errcode = '42501';
  end if;
  return query select a.at, a.action, a.detail from private.audit_log a
    where a.action not in ('overview', 'list organisations', 'search people', 'list members')
    order by a.at desc limit least(coalesce(max_rows, 50), 500);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'owner_check()', 'owner_overview()', 'owner_organisations()',
    'owner_create_organisation(text, text, integer)',
    'owner_update_organisation(uuid, text, text, text, integer, date, text)',
    'owner_new_code(uuid)', 'owner_delete_organisation(uuid)', 'owner_members(uuid)',
    'owner_add_member(uuid, text, text, text)', 'owner_set_role(uuid, uuid, text)',
    'owner_remove_member(uuid, uuid)', 'owner_people(text)', 'owner_set_suspended(uuid, boolean)',
    'owner_delete_account(uuid)', 'owner_audit(integer)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
