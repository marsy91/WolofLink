-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Move the membership helpers used by row-level security out of the public API
-- (they were callable as /rest/v1/rpc/is_org_*). Same logic, private schema.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.is_org_admin(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = (select auth.uid()) and m.role = 'admin'
  );
$$;

create function private.is_org_member(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m where m.org_id = org and m.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_org_admin(uuid) from public, anon;
revoke execute on function private.is_org_member(uuid) from public, anon;
grant execute on function private.is_org_admin(uuid) to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;

drop policy "Members read their organisations" on public.organisations;
create policy "Members read their organisations"
  on public.organisations for select to authenticated
  using (private.is_org_member(id));

drop policy "Learners read their own memberships" on public.memberships;
create policy "Learners read their own memberships"
  on public.memberships for select to authenticated
  using ((select auth.uid()) = user_id or private.is_org_admin(org_id));

create or replace function public.organisation_report(org uuid)
  returns table (
    user_id uuid, display_name text, role text, joined_at timestamptz,
    xp integer, lessons integer, streak integer, last_active timestamptz
  )
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_org_admin(org) then
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

drop function public.is_org_admin(uuid);
drop function public.is_org_member(uuid);
