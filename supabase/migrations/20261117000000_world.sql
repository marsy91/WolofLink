-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- WolofLink World: links Wolof learners across the world without putting strangers in touch.
--
-- 1. More cities for the city leagues: Louga and Diourbel, and the cities abroad where many
--    Senegalese and Gambians live (Italy, France, Spain, Germany, North America, West and North
--    Africa). The app's list is src/content/places.ts (places.test.ts checks they match).
-- 2. A learner with an account can add the country they learn from, picked from a list
--    (never a location). Only totals are ever shown: a country appears on the map once at
--    least 3 learners chose it; smaller countries are added together as "other countries".
-- 3. world_summary(): the map totals and one shared weekly goal (XP earned this week by every
--    learner with an account). Readable without an account, so the website can show it too.
--    It is worked out at most every 10 minutes and kept in private.world_cache, so calling it
--    often costs nothing. Each learner counts for at most 2,000 XP a day, so one account
--    cannot fill the goal alone.
-- 4. The owner can pause it all with the switch "world" (on by default; the app also has a
--    build switch, NEXT_PUBLIC_WORLD, which is off).
--
-- Deleting an account deletes its country (on delete cascade).
-- Test: supabase/tests/world_test.sql (self-cancelling).

-- ── 1. More cities ──────────────────────────────────────────────────────────
create or replace function private.valid_city(city text) returns boolean
  language sql immutable set search_path = '' as $$
  select city = any (array[
    'dakar', 'thies', 'saint-louis', 'touba', 'ziguinchor', 'kaolack', 'mbour', 'louga', 'diourbel',
    'banjul', 'nouakchott', 'abidjan', 'bamako', 'casablanca',
    'london', 'paris', 'lyon', 'marseille', 'bordeaux', 'toulouse', 'brussels',
    'milan', 'rome', 'turin', 'genoa', 'brescia', 'bergamo', 'bologna', 'florence', 'naples',
    'madrid', 'barcelona', 'valencia', 'berlin', 'frankfurt', 'hamburg',
    'new-york', 'washington', 'atlanta', 'philadelphia', 'houston', 'montreal', 'toronto'
  ]);
$$;
revoke execute on function private.valid_city(text) from public, anon, authenticated;

-- ── 4. The "world" switch (a pause switch: on until the owner turns it off) ──
alter table public.remote_switches drop constraint if exists remote_switches_key_check;
alter table public.remote_switches add constraint remote_switches_key_check
  check (key in ('friends', 'duels', 'voices', 'supporter', 'reports', 'community', 'nearby', 'bot_duels', 'feedback', 'world'));
insert into public.remote_switches (key) values ('world') on conflict do nothing;

create or replace function private.world_off() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.remote_switches s where s.key = 'world' and s.is_off);
$$;
revoke execute on function private.world_off() from public, anon, authenticated;

-- ── 2. The country a learner learns from ────────────────────────────────────
create or replace function private.valid_country(code text) returns boolean
  language sql immutable set search_path = '' as $$
  select code = any (array[
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ]);
$$;
revoke execute on function private.valid_country(text) from public, anon, authenticated;

create table if not exists public.world_members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  country    text not null check (private.valid_country(country)),
  updated_at timestamptz not null default now()
);
create index if not exists world_members_country_idx on public.world_members (country);
alter table public.world_members enable row level security;
revoke all on public.world_members from public, anon, authenticated;

create table if not exists private.world_cache (
  id          integer primary key check (id = 1),
  data        jsonb not null,
  computed_at timestamptz not null
);
alter table private.world_cache enable row level security;
revoke all on private.world_cache from public, anon, authenticated;

create or replace function public.world_me()
  returns text
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  return (select w.country from public.world_members w where w.user_id = uid);
end;
$$;
revoke execute on function public.world_me() from public, anon;
grant execute on function public.world_me() to authenticated;

-- null removes the learner from the map.
create or replace function public.set_world_country(country text)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if private.world_off() then
    raise exception 'world paused' using errcode = '55000';
  end if;
  if country is null then
    delete from public.world_members w where w.user_id = uid;
  elsif not private.valid_country(country) then
    raise exception 'unknown country' using errcode = '22023';
  else
    insert into public.world_members (user_id, country) values (uid, country)
      on conflict (user_id) do update set country = excluded.country, updated_at = now();
  end if;
  -- The learner sees the change straight away.
  delete from private.world_cache;
end;
$$;
revoke execute on function public.set_world_country(text) from public, anon;
grant execute on function public.set_world_country(text) to authenticated;

-- ── 3. The map totals and the shared weekly goal ────────────────────────────
create or replace function public.world_summary()
  returns jsonb
  language plpgsql volatile security definer set search_path = '' as $$
declare
  week_start date := date_trunc('week', now() at time zone 'utc')::date;
  this_from text := to_char(week_start, 'YYYY-MM-DD');
  last_from text := to_char(week_start - 7, 'YYYY-MM-DD');
  cached private.world_cache;
  result jsonb;
begin
  if private.world_off() then
    return jsonb_build_object('paused', true);
  end if;
  select * into cached from private.world_cache c where c.id = 1;
  if found and cached.computed_at > now() - interval '10 minutes'
     and cached.data ->> 'week_start' = this_from then
    return cached.data;
  end if;

  with days as (
    select p.user_id, d.key >= this_from as this_week, least(d.value::integer, 2000) as xp
    from public.progress p
    cross join lateral jsonb_each_text(
      case when jsonb_typeof(p.data -> 'xpByDay') = 'object' then p.data -> 'xpByDay' else '{}'::jsonb end) d
    where d.key ~ '^\d{4}-\d{2}-\d{2}$' and d.value ~ '^\d{1,6}$' and d.key >= last_from
  ),
  learners as (
    select x.user_id,
           coalesce(sum(x.xp) filter (where x.this_week), 0)::integer as this_xp,
           coalesce(sum(x.xp) filter (where not x.this_week), 0)::integer as last_xp
    from days x group by x.user_id
  ),
  by_country as (
    select w.country, count(*)::integer as n, coalesce(sum(l.this_xp), 0)::integer as xp
    from public.world_members w
    left join learners l on l.user_id = w.user_id
    group by w.country
  )
  select jsonb_build_object(
    'week_start', this_from,
    'week_xp', (select coalesce(sum(l.this_xp), 0)::integer from learners l),
    'goal', greatest(5000, (ceil((select coalesce(sum(l.last_xp), 0) from learners l) * 1.1 / 1000.0) * 1000)::integer),
    'active', (select count(*)::integer from learners l where l.this_xp > 0),
    'members', (select coalesce(sum(b.n), 0)::integer from by_country b),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('c', b.country, 'n', b.n, 'xp', b.xp) order by b.n desc, b.country)
                           from by_country b where b.n >= 3), '[]'::jsonb),
    'other', jsonb_build_object(
      'countries', (select count(*)::integer from by_country b where b.n < 3),
      'n', (select coalesce(sum(b.n), 0)::integer from by_country b where b.n < 3),
      'xp', (select coalesce(sum(b.xp), 0)::integer from by_country b where b.n < 3))
  ) into result;

  insert into private.world_cache (id, data, computed_at) values (1, result, now())
    on conflict (id) do update set data = excluded.data, computed_at = excluded.computed_at;
  return result;
end;
$$;
revoke execute on function public.world_summary() from public;
grant execute on function public.world_summary() to anon, authenticated;
