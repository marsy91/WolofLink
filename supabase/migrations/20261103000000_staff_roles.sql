-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Staff roles for the owner console. The owner can invite team members with a
-- limited role. Every function in the console already goes through
-- private.require_owner(action); that gate now also lets a staff member through
-- ONLY if their role is allowed that action. Anything not listed below stays
-- owner-only, so new functions are safe by default. Every action is logged with
-- who did it. Safe to run more than once.

create table if not exists private.staff (
  email    text primary key,
  name     text not null check (char_length(btrim(name)) between 1 and 60),
  role     text not null check (role in ('admin', 'reviewer', 'support', 'analyst')),
  active   boolean not null default true,
  added_at timestamptz not null default now()
);
revoke all on private.staff from public, anon, authenticated;

-- 'owner', a staff role, or null. Needs a confirmed email, like the owner check.
create or replace function private.staff_role() returns text
  language sql stable security definer set search_path = '' as $$
  select case
    when private.is_owner() then 'owner'
    else (
      select s.role from private.staff s
      join auth.users u on lower(u.email) = lower(s.email)
      where u.id = (select auth.uid()) and u.email_confirmed_at is not null and s.active
    )
  end;
$$;

-- What each role may do. Unlisted actions are owner-only.
create or replace function private.role_allows(staff_role text, action text) returns boolean
  language sql immutable set search_path = '' as $$
  select case staff_role
    when 'owner' then true
    -- Admin: everything except destructive, money and team actions.
    when 'admin' then action not in ('delete account', 'delete organisation', 'grants')
                      and action not like 'staff.%'
    -- Reviewer: reads reports and missed words, marks reports done.
    when 'reviewer' then action in ('read reports', 'report status', 'read missed words', 'read blocked words')
    -- Support: helps learners and organisations, handles reports.
    when 'support' then action in ('overview', 'search people', 'list organisations', 'list members',
                                   'read reports', 'report status')
    -- Analyst: numbers only.
    when 'analyst' then action in ('overview', 'read retention', 'read cohorts', 'read missed words',
                                   'list organisations')
    else false
  end;
$$;

create or replace function private.require_owner(action text, detail jsonb default '{}'::jsonb) returns void
  language plpgsql security definer set search_path = '' as $$
declare r text := private.staff_role();
begin
  if r is null or not private.role_allows(r, action) then
    raise exception 'owner only' using errcode = '42501';
  end if;
  insert into private.audit_log (actor, action, detail) values ((select auth.uid()), action, detail);
end;
$$;

revoke execute on function private.staff_role() from public, anon;
revoke execute on function private.role_allows(text, text) from public, anon, authenticated;
revoke execute on function private.require_owner(text, jsonb) from public, anon, authenticated;
grant execute on function private.staff_role() to authenticated;

-- ── Console functions ───────────────────────────────────────────────────────
-- The signed-in user's console role, or null.
create or replace function public.owner_role() returns text
  language sql stable security definer set search_path = '' as $$
  select private.staff_role();
$$;

create or replace function public.owner_staff()
  returns table (email text, name text, role text, active boolean, added_at timestamptz, signed_up boolean)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('staff.read');
  return query
    select s.email, s.name, s.role, s.active, s.added_at,
           exists (select 1 from auth.users u where lower(u.email) = lower(s.email))
    from private.staff s order by s.added_at;
end;
$$;

create or replace function public.owner_save_staff(member_email text, member_name text, member_role text, is_active boolean default true)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare e text := lower(btrim(coalesce(member_email, '')));
begin
  perform private.require_owner('staff.save', jsonb_build_object('email', e, 'role', member_role, 'active', is_active));
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if exists (select 1 from private.owners o where lower(o.email) = e) then
    raise exception 'that is the owner account' using errcode = '22023';
  end if;
  insert into private.staff (email, name, role, active)
    values (e, btrim(member_name), member_role, coalesce(is_active, true))
    on conflict (email) do update set name = excluded.name, role = excluded.role, active = excluded.active;
end;
$$;

create or replace function public.owner_remove_staff(member_email text) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('staff.remove', jsonb_build_object('email', lower(btrim(member_email))));
  delete from private.staff where lower(email) = lower(btrim(member_email));
end;
$$;

-- The change log now shows who did each action (admins and the owner may read it).
drop function if exists public.owner_audit(integer);
create or replace function public.owner_audit(max_rows integer default 50)
  returns table (at timestamptz, action text, detail jsonb, who text)
  language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(private.staff_role(), '') not in ('owner', 'admin') then
    raise exception 'owner only' using errcode = '42501';
  end if;
  return query
    select a.at, a.action, a.detail, coalesce(u.email::text, 'unknown')
    from private.audit_log a left join auth.users u on u.id = a.actor
    where a.action not in ('overview', 'list organisations', 'search people', 'list members', 'staff.read')
    order by a.at desc limit least(coalesce(max_rows, 50), 500);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'owner_role()', 'owner_staff()', 'owner_save_staff(text, text, text, boolean)',
    'owner_remove_staff(text)', 'owner_audit(integer)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
