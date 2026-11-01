-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Access the owner gives to a learner's account, without a store purchase:
-- - unlock_all: every lesson and dialogue is open, without finishing earlier ones;
-- - premium: Premium (all units, unlimited drops), forever or until a date.
-- The owner always has both. Members of an active paid or pilot organisation
-- (still within its paid-until date) get Premium too.
-- Only the owner can change grants (checked and logged on the server).

create table if not exists public.account_grants (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  unlock_all    boolean not null default false,
  premium       boolean not null default false,
  premium_until timestamptz,
  note          text check (char_length(note) <= 200),
  updated_at    timestamptz not null default now()
);
alter table public.account_grants enable row level security;
revoke all on public.account_grants from public, anon, authenticated;

-- What the signed-in learner has. Called by the app after sign-in.
create or replace function public.my_grants()
  returns table (unlock_all boolean, premium boolean, premium_until timestamptz, source text)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  g public.account_grants;
  org_premium boolean;
begin
  if uid is null then
    return query select false, false, null::timestamptz, 'none'::text;
    return;
  end if;
  if private.is_owner() then
    return query select true, true, null::timestamptz, 'owner'::text;
    return;
  end if;
  select * into g from public.account_grants a where a.user_id = uid;
  select exists (
    select 1 from public.memberships m
    join public.organisations o on o.id = m.org_id
    where m.user_id = uid and o.status = 'active' and o.plan in ('paid', 'pilot')
      and (o.paid_until is null or o.paid_until >= current_date)
  ) into org_premium;
  if coalesce(g.premium, false) and (g.premium_until is null or g.premium_until > now()) then
    return query select coalesce(g.unlock_all, false), true, g.premium_until, 'granted'::text;
  elsif org_premium then
    return query select coalesce(g.unlock_all, false), true, null::timestamptz, 'organisation'::text;
  else
    return query select coalesce(g.unlock_all, false), false, null::timestamptz, 'none'::text;
  end if;
end;
$$;

create or replace function public.owner_set_grants(member uuid, grant_unlock_all boolean, grant_premium boolean,
                                                   grant_premium_until timestamptz default null, grant_note text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('grants', jsonb_build_object('member', member, 'unlock_all', grant_unlock_all,
    'premium', grant_premium, 'premium_until', grant_premium_until));
  if not exists (select 1 from auth.users u where u.id = member) then
    raise exception 'account not found' using errcode = 'P0002';
  end if;
  if not grant_unlock_all and not grant_premium then
    delete from public.account_grants a where a.user_id = member;
    return;
  end if;
  insert into public.account_grants (user_id, unlock_all, premium, premium_until, note, updated_at)
  values (member, grant_unlock_all, grant_premium, case when grant_premium then grant_premium_until end,
          nullif(trim(grant_note), ''), now())
  on conflict (user_id) do update
    set unlock_all = excluded.unlock_all, premium = excluded.premium, premium_until = excluded.premium_until,
        note = excluded.note, updated_at = now();
end;
$$;

create or replace function public.owner_grants()
  returns table (user_id uuid, email text, unlock_all boolean, premium boolean, premium_until timestamptz, note text)
  language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_owner('read grants');
  return query
    select a.user_id, u.email::text, a.unlock_all, a.premium, a.premium_until, a.note
    from public.account_grants a join auth.users u on u.id = a.user_id
    order by u.email;
end;
$$;

revoke execute on function public.my_grants() from public, anon;
revoke execute on function public.owner_set_grants(uuid, boolean, boolean, timestamptz, text) from public, anon;
revoke execute on function public.owner_grants() from public, anon;
grant execute on function public.my_grants() to authenticated;
grant execute on function public.owner_set_grants(uuid, boolean, boolean, timestamptz, text) to authenticated;
grant execute on function public.owner_grants() to authenticated;
