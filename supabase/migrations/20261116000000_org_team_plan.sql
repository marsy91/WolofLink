-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Team plan for organisations: closes a loophole and gives organisation admins their dashboard.
--
-- 1. Signed-in learners could call create_organisation() directly with the public app key and get
--    an organisation on the pilot plan with no end date and no seat limit (and Premium for everyone
--    in it). The app no longer uses that function: organisations are created in the owner console
--    (owner_create_organisation). It is now owner-only.
-- 2. Members could read every column of their organisation, including the owner's private notes,
--    plan and paid-until date. They can now read only its id and name.
-- 3. org_admin_summary(): the organisations the caller administers, with the team code, plan,
--    seats, member count and whether the Team plan is active (shown on the dashboard).
-- 4. organisation_report() now needs an active Team plan (pilot or paid, not suspended, not past
--    its paid-until date). The owner can always read it, as before.
--
-- Test: supabase/tests/org_team_plan_test.sql (self-cancelling).

-- ── 1. Close the create_organisation loophole ───────────────────────────────
revoke execute on function public.create_organisation(text, text) from authenticated;

-- ── 2. Members see only the organisation's id and name ──────────────────────
revoke select on public.organisations from authenticated;
grant select (id, name) on public.organisations to authenticated;

-- ── Helper: is the organisation's Team plan active today? ───────────────────
create or replace function private.team_plan_active(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organisations o
    where o.id = org and o.status = 'active' and o.plan in ('pilot', 'paid')
      and (o.paid_until is null or o.paid_until >= current_date)
  );
$$;
revoke execute on function private.team_plan_active(uuid) from public, anon;
grant execute on function private.team_plan_active(uuid) to authenticated;

-- ── 3. The organisations the caller administers ─────────────────────────────
create or replace function public.org_admin_summary()
  returns table (
    org_id uuid, org_name text, join_code text, plan text, seats integer,
    paid_until date, members integer, team_active boolean
  )
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  return query
    select o.id, o.name, o.join_code, o.plan, o.seats, o.paid_until,
           (select count(*)::integer from public.memberships x where x.org_id = o.id),
           private.team_plan_active(o.id)
    from public.memberships m
    join public.organisations o on o.id = m.org_id
    where m.user_id = uid and m.role = 'admin'
    order by o.name;
end;
$$;
revoke execute on function public.org_admin_summary() from public, anon;
grant execute on function public.org_admin_summary() to authenticated;

-- ── 4. The progress report needs an active Team plan ────────────────────────
create or replace function public.organisation_report(org uuid)
  returns table (
    user_id uuid, display_name text, role text, joined_at timestamptz,
    xp integer, lessons integer, streak integer, last_active timestamptz
  )
  language plpgsql stable security definer set search_path = '' as $$
begin
  if private.is_owner() then
    null;
  elsif not private.is_org_admin(org) then
    raise exception 'not an admin of this organisation' using errcode = '42501';
  elsif not private.team_plan_active(org) then
    raise exception 'team plan inactive' using errcode = '55000';
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
revoke execute on function public.organisation_report(uuid) from public, anon;
grant execute on function public.organisation_report(uuid) to authenticated;
