-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Organisations (NGOs, embassies, schools) and their team codes.
--
-- Learners join with an 8-character code and choose the name their
-- organisation sees. Admins get a summary report of their members' progress
-- (XP, lessons, streak, last activity); never emails or raw progress.
-- Clients never write these tables directly: everything goes through the
-- security-definer functions below, and RLS limits what can be read.

create table public.organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 2 and 80),
  join_code  text not null unique check (join_code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id       uuid not null references public.organisations (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'member' check (role in ('member', 'admin')),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  joined_at    timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);

comment on table public.organisations is 'WolofLink organisations; join_code is shared by the admin with their team.';
comment on table public.memberships is 'Who belongs to which organisation, with the name shown to its admins.';

alter table public.organisations enable row level security;
alter table public.memberships enable row level security;

-- Helper for policies: avoids a policy on memberships querying memberships (recursion).
create function public.is_org_admin(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = (select auth.uid()) and m.role = 'admin'
  );
$$;

create function public.is_org_member(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m where m.org_id = org and m.user_id = (select auth.uid())
  );
$$;

-- Members can see the organisations they belong to (name; the code only matters to admins,
-- and members already know it).
create policy "Members read their organisations"
  on public.organisations for select to authenticated
  using (public.is_org_member(id));

-- Learners see their own memberships; admins see their organisation's.
create policy "Learners read their own memberships"
  on public.memberships for select to authenticated
  using ((select auth.uid()) = user_id or public.is_org_admin(org_id));

-- Learners can leave an organisation at any time.
create policy "Learners leave organisations"
  on public.memberships for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.organisations, public.memberships from anon;
revoke insert, update, delete on public.organisations from authenticated;
revoke insert, update on public.memberships from authenticated;
grant select on public.organisations to authenticated;
grant select, delete on public.memberships to authenticated;

-- Join with a team code (case and spaces ignored). Re-joining just updates the name.
create function public.join_organisation(code text, member_name text)
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
  insert into public.memberships (org_id, user_id, display_name)
    values (org.id, uid, btrim(member_name))
    on conflict on constraint memberships_pkey do update set display_name = excluded.display_name;
  return query select org.id, org.name;
end;
$$;

-- Create an organisation; the creator becomes its admin. Returns the team code.
create function public.create_organisation(org_name text, admin_name text)
  returns table (org_id uuid, join_code text)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  new_code text;
  new_id uuid;
  bytes bytea;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if (select count(*) from public.organisations o where o.created_by = uid) >= 20 then
    raise exception 'too many organisations' using errcode = '54000';
  end if;
  loop
    bytes := extensions.gen_random_bytes(8);
    new_code := '';
    for i in 0..7 loop
      new_code := new_code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.organisations o where o.join_code = new_code);
  end loop;
  insert into public.organisations (name, join_code, created_by)
    values (btrim(org_name), new_code, uid) returning id into new_id;
  insert into public.memberships (org_id, user_id, role, display_name)
    values (new_id, uid, 'admin', btrim(admin_name));
  return query select new_id, new_code;
end;
$$;

-- Admin report: one summary row per member. Raises for anyone who isn't an admin.
create function public.organisation_report(org uuid)
  returns table (
    user_id uuid, display_name text, role text, joined_at timestamptz,
    xp integer, lessons integer, streak integer, last_active timestamptz
  )
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_org_admin(org) then
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

revoke execute on function public.join_organisation(text, text) from public, anon;
revoke execute on function public.create_organisation(text, text) from public, anon;
revoke execute on function public.organisation_report(uuid) from public, anon;
revoke execute on function public.is_org_admin(uuid) from public, anon;
revoke execute on function public.is_org_member(uuid) from public, anon;
grant execute on function public.join_organisation(text, text) to authenticated;
grant execute on function public.create_organisation(text, text) to authenticated;
grant execute on function public.organisation_report(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
