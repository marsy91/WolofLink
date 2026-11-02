-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- 1. Retention for the owner console: of the learners who created an account at
--    least N days ago, how many came back on day N or later (day 1, 7, 30), and the
--    last 8 weekly sign-up groups. Totals only, never individual learners. Activity
--    comes from the XP-per-day already in synced progress.
-- 2. Push tokens: a device registers for friend notifications (duels, nudges).
--    The notify-friend edge function reads them with the service role; nobody else can.

create or replace function public.owner_retention()
  returns table (period text, eligible integer, returned integer)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read retention');
  return query
    with learners as (
      select u.id, (u.created_at at time zone 'utc')::date as joined,
             coalesce((select array_agg(d.key::date) from jsonb_each(
               case when jsonb_typeof(p.data -> 'xpByDay') = 'object' then p.data -> 'xpByDay' else '{}'::jsonb end) d
               where d.key ~ '^\d{4}-\d{2}-\d{2}$'), '{}') as days
      from auth.users u left join public.progress p on p.user_id = u.id
    ),
    periods(label, n) as (values ('day 1', 1), ('day 7', 7), ('day 30', 30))
    select pr.label,
           count(*) filter (where l.joined <= current_date - pr.n)::integer,
           count(*) filter (where l.joined <= current_date - pr.n
                              and exists (select 1 from unnest(l.days) x where x >= l.joined + pr.n))::integer
    from periods pr cross join learners l
    group by pr.label, pr.n
    order by pr.n;
end;
$$;

-- Weekly sign-up groups: how many joined that week, and how many practised again 7+ days after joining.
create or replace function public.owner_cohorts()
  returns table (week_start date, joined integer, active_after_week integer)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read cohorts');
  return query
    with learners as (
      select (u.created_at at time zone 'utc')::date as joined,
             coalesce((select array_agg(d.key::date) from jsonb_each(
               case when jsonb_typeof(p.data -> 'xpByDay') = 'object' then p.data -> 'xpByDay' else '{}'::jsonb end) d
               where d.key ~ '^\d{4}-\d{2}-\d{2}$'), '{}') as days
      from auth.users u left join public.progress p on p.user_id = u.id
      where u.created_at > now() - interval '9 weeks'
    )
    select date_trunc('week', l.joined)::date,
           count(*)::integer,
           count(*) filter (where exists (select 1 from unnest(l.days) x where x >= l.joined + 7))::integer
    from learners l
    group by 1
    order by 1 desc
    limit 8;
end;
$$;

create table if not exists public.push_tokens (
  token      text primary key check (char_length(token) between 20 and 4096),
  user_id    uuid not null references auth.users (id) on delete cascade,
  platform   text not null check (platform in ('android', 'ios')),
  lang       text not null default 'en' check (lang in ('en', 'fr', 'es', 'de', 'it')),
  updated_at timestamptz not null default now()
);
create index if not exists push_tokens_user_idx on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;
revoke all on public.push_tokens from public, anon, authenticated;

create or replace function public.save_push_token(device_token text, device_platform text, device_lang text)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  insert into public.push_tokens (token, user_id, platform, lang, updated_at)
  values (device_token, uid, device_platform, device_lang, now())
  on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform,
                                     lang = excluded.lang, updated_at = now();
  -- Keep at most 5 devices per person.
  delete from public.push_tokens t where t.user_id = uid and t.token not in (
    select x.token from public.push_tokens x where x.user_id = uid order by x.updated_at desc limit 5);
end;
$$;

create or replace function public.forget_push_token(device_token text)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  delete from public.push_tokens t where t.token = device_token and t.user_id = (select auth.uid());
end;
$$;

revoke execute on function public.owner_retention() from public, anon;
revoke execute on function public.owner_cohorts() from public, anon;
revoke execute on function public.save_push_token(text, text, text) from public, anon;
revoke execute on function public.forget_push_token(text) from public, anon;
grant execute on function public.owner_retention() to authenticated;
grant execute on function public.owner_cohorts() to authenticated;
grant execute on function public.save_push_token(text, text, text) to authenticated;
grant execute on function public.forget_push_token(text) to authenticated;
