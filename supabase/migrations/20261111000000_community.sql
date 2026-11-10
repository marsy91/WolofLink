-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Community: city leagues, learners in your area, friend requests, friends-only
-- profiles with social handles, blocking and reporting.
--
-- Privacy rules (enforced here, not just on screen):
-- - No coordinates are ever stored: only a city id and a neighbourhood id picked from
--   the app's list. Nothing here can hold a latitude or longitude.
-- - Everything is off by default; a learner opts in to each part.
-- - Leagues and the nearby list only ever show adults (adult_confirmed) who opted in.
-- - Strangers see a display name, week XP and streak only. Profiles and social handles
--   need a mutual friendship; handles also need their own "visible" switch.
-- - Blocking is two-way invisibility: neither person appears to the other anywhere.
-- - "Show me nearby" lapses after 30 days without being renewed.

-- ── Tables ──────────────────────────────────────────────────────────────────
alter table public.friend_profiles
  add column if not exists home_city text check (home_city is null or home_city ~ '^[a-z][a-z-]{1,30}$'),
  add column if not exists show_city boolean not null default false,
  add column if not exists adult_confirmed boolean not null default false,
  add column if not exists nearby_area text check (nearby_area is null or nearby_area ~ '^[a-z][a-z-]{1,30}/[a-z0-9][a-z0-9-]{1,40}$'),
  add column if not exists show_nearby boolean not null default false,
  add column if not exists nearby_until date;
create index if not exists friend_profiles_city_idx on public.friend_profiles (home_city) where show_city;
create index if not exists friend_profiles_area_idx on public.friend_profiles (nearby_area) where show_nearby;

create table if not exists public.friend_requests (
  id         bigserial primary key,
  from_user  uuid not null references auth.users (id) on delete cascade,
  to_user    uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);
create unique index if not exists friend_requests_pending_idx on public.friend_requests (from_user, to_user) where status = 'pending';
create index if not exists friend_requests_to_idx on public.friend_requests (to_user, status);

create table if not exists public.blocks (
  blocker    uuid not null references auth.users (id) on delete cascade,
  blocked    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
create index if not exists blocks_blocked_idx on public.blocks (blocked);

create table if not exists public.social_handles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  network    text not null check (network in ('instagram', 'tiktok', 'x', 'snapchat')),
  handle     text not null check (handle ~ '^[A-Za-z0-9._]{1,30}$'),
  visible    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, network)
);

create table if not exists public.user_reports (
  id         bigserial primary key,
  reporter   uuid references auth.users (id) on delete set null,
  reported   uuid references auth.users (id) on delete set null,
  reason     text not null check (reason in ('harassment', 'spam', 'inappropriate name', 'inappropriate handle', 'underage', 'other')),
  note       text check (note is null or char_length(note) <= 500),
  status     text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists user_reports_status_idx on public.user_reports (status, created_at desc);

alter table public.friend_requests enable row level security;
alter table public.blocks enable row level security;
alter table public.social_handles enable row level security;
alter table public.user_reports enable row level security;
revoke all on public.friend_requests, public.blocks, public.social_handles, public.user_reports from public, anon, authenticated;

-- The owner can pause the community features (leagues, nearby, requests) remotely.
alter table public.remote_switches drop constraint if exists remote_switches_key_check;
alter table public.remote_switches add constraint remote_switches_key_check
  check (key in ('friends', 'duels', 'voices', 'supporter', 'reports', 'community'));
insert into public.remote_switches (key) values ('community') on conflict do nothing;

-- ── Helpers ─────────────────────────────────────────────────────────────────
-- Cities offered in the app (keep in sync with src/content/places.ts; a test checks).
create or replace function private.valid_city(city text) returns boolean
  language sql immutable set search_path = '' as $$
  select city = any (array[
    'dakar', 'thies', 'saint-louis', 'touba', 'ziguinchor', 'kaolack', 'mbour',
    'banjul', 'nouakchott', 'london', 'paris', 'new-york', 'washington', 'montreal',
    'milan', 'rome', 'madrid', 'barcelona', 'brussels', 'berlin'
  ]);
$$;

create or replace function private.is_blocked(a uuid, b uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.blocks x where (x.blocker = a and x.blocked = b) or (x.blocker = b and x.blocked = a));
$$;

create or replace function private.community_off() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.remote_switches s where s.key in ('community', 'friends') and s.is_off);
$$;

create or replace function private.require_profile() returns uuid
  language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null or not exists (select 1 from public.friend_profiles p where p.user_id = uid) then
    raise exception 'choose your name first' using errcode = '42501';
  end if;
  return uid;
end;
$$;

revoke execute on function private.valid_city(text) from public, anon, authenticated;
revoke execute on function private.is_blocked(uuid, uuid) from public, anon, authenticated;
revoke execute on function private.community_off() from public, anon, authenticated;
revoke execute on function private.require_profile() from public, anon, authenticated;

-- Adding by friend code (or QR code, which carries the same code) refuses blocked people.
create or replace function public.add_friend(code text)
  returns text
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  other public.friend_profiles;
begin
  if uid is null or not exists (select 1 from public.friend_profiles p where p.user_id = uid) then
    raise exception 'choose your name first' using errcode = '42501';
  end if;
  select * into other from public.friend_profiles p where p.friend_code = upper(btrim(code));
  if other.user_id is null or private.is_blocked(uid, other.user_id) then
    raise exception 'unknown code' using errcode = 'P0002';
  end if;
  if other.user_id = uid then
    raise exception 'that is your own code' using errcode = '22023';
  end if;
  if (select count(*) from public.friendships f where uid in (f.user_a, f.user_b)) >= 100
     or (select count(*) from public.friendships f where other.user_id in (f.user_a, f.user_b)) >= 100 then
    raise exception 'friend list full' using errcode = '54000';
  end if;
  insert into public.friendships (user_a, user_b) values (least(uid, other.user_id), greatest(uid, other.user_id))
  on conflict do nothing;
  return other.display_name;
end;
$$;

-- ── My community settings ───────────────────────────────────────────────────
create or replace function public.community_me()
  returns table (home_city text, show_city boolean, adult_confirmed boolean, nearby_area text, show_nearby boolean, nearby_until date)
  language sql stable security definer set search_path = '' as $$
  select p.home_city, p.show_city, p.adult_confirmed, p.nearby_area,
         p.show_nearby and coalesce(p.nearby_until >= current_date, false), p.nearby_until
  from public.friend_profiles p where p.user_id = (select auth.uid());
$$;

-- City (null = none), whether it shows in the league, and the 18+ confirmation.
create or replace function public.set_community(city text, show_city boolean, adult boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if city is not null and not private.valid_city(city) then
    raise exception 'unknown city' using errcode = '22023';
  end if;
  update public.friend_profiles p
  set home_city = city,
      show_city = coalesce(set_community.show_city, false) and city is not null and coalesce(adult, false),
      adult_confirmed = coalesce(adult, false),
      -- Changing or clearing the city also clears the neighbourhood.
      nearby_area = case when city is not null and p.nearby_area like city || '/%' then p.nearby_area end,
      show_nearby = case when city is not null and p.nearby_area like city || '/%' and coalesce(adult, false) then p.show_nearby else false end
  where p.user_id = uid;
end;
$$;

-- Neighbourhood (must be in the learner's city) and "show me nearby" (30 days).
create or replace function public.set_nearby(area text, show boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  me public.friend_profiles;
begin
  select * into me from public.friend_profiles p where p.user_id = uid;
  if area is not null and (me.home_city is null or area not like me.home_city || '/%'
                           or area !~ '^[a-z][a-z-]{1,30}/[a-z0-9][a-z0-9-]{1,40}$') then
    raise exception 'unknown area' using errcode = '22023';
  end if;
  if coalesce(show, false) and (area is null or not me.adult_confirmed) then
    raise exception 'adults only' using errcode = '42501';
  end if;
  update public.friend_profiles p
  set nearby_area = area,
      show_nearby = coalesce(show, false),
      nearby_until = case when coalesce(show, false) then current_date + 30 end
  where p.user_id = uid;
end;
$$;

-- ── Leagues and the nearby list ─────────────────────────────────────────────
-- This week's top 20 in my city (only adults who show their city), plus me.
create or replace function public.city_league()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, is_me boolean, is_friend boolean, requested boolean)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  me public.friend_profiles;
begin
  select * into me from public.friend_profiles p where p.user_id = uid;
  if private.community_off() or me.home_city is null or not me.show_city or not me.adult_confirmed then
    return;
  end if;
  return query
    select x.user_id, x.display_name, x.wxp, x.streak, x.user_id = uid,
           private.are_friends(uid, x.user_id),
           exists (select 1 from public.friend_requests r where r.from_user = uid and r.to_user = x.user_id and r.status = 'pending')
    from (
      select p.user_id, p.display_name, private.week_xp(p.user_id) as wxp,
             coalesce((pr.data -> 'streak' ->> 'count')::integer, 0) as streak
      from public.friend_profiles p
      left join public.progress pr on pr.user_id = p.user_id
      where p.home_city = me.home_city and p.show_city and p.adult_confirmed
        and not private.is_blocked(uid, p.user_id)
    ) x
    order by x.wxp desc, x.display_name
    limit 20;
end;
$$;

-- Learners in my neighbourhood who switched on "show me nearby". No distances.
create or replace function public.nearby_learners()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, is_friend boolean, requested boolean)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  me public.friend_profiles;
begin
  select * into me from public.friend_profiles p where p.user_id = uid;
  if private.community_off() or me.nearby_area is null or not me.show_nearby
     or coalesce(me.nearby_until < current_date, true) or not me.adult_confirmed then
    return;
  end if;
  return query
    select p.user_id, p.display_name, private.week_xp(p.user_id),
           coalesce((pr.data -> 'streak' ->> 'count')::integer, 0),
           private.are_friends(uid, p.user_id),
           exists (select 1 from public.friend_requests r where r.from_user = uid and r.to_user = p.user_id and r.status = 'pending')
    from public.friend_profiles p
    left join public.progress pr on pr.user_id = p.user_id
    where p.nearby_area = me.nearby_area and p.show_nearby and p.adult_confirmed
      and p.nearby_until >= current_date and p.user_id <> uid
      and not private.is_blocked(uid, p.user_id)
    order by p.created_at desc
    limit 50;
end;
$$;

-- ── Friend requests ─────────────────────────────────────────────────────────
create or replace function public.send_friend_request(target uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if private.community_off() then
    raise exception 'paused' using errcode = '55000';
  end if;
  if target = uid or not exists (select 1 from public.friend_profiles p where p.user_id = target)
     or private.is_blocked(uid, target) then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  if private.are_friends(uid, target) then
    raise exception 'already friends' using errcode = '22023';
  end if;
  if (select count(*) from public.friend_requests r where r.from_user = uid and r.created_at > now() - interval '1 day') >= 20 then
    raise exception 'too many requests' using errcode = '54000';
  end if;
  -- They already asked me: accept straight away.
  if exists (select 1 from public.friend_requests r where r.from_user = target and r.to_user = uid and r.status = 'pending') then
    update public.friend_requests r set status = 'accepted' where r.from_user = target and r.to_user = uid and r.status = 'pending';
    insert into public.friendships (user_a, user_b) values (least(uid, target), greatest(uid, target)) on conflict do nothing;
    return;
  end if;
  insert into public.friend_requests (from_user, to_user) values (uid, target) on conflict do nothing;
end;
$$;

create or replace function public.my_friend_requests()
  returns table (id bigint, from_user uuid, from_name text, created_at timestamptz)
  language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  return query
    select r.id, r.from_user, p.display_name, r.created_at
    from public.friend_requests r join public.friend_profiles p on p.user_id = r.from_user
    where r.to_user = uid and r.status = 'pending' and not private.is_blocked(uid, r.from_user)
    order by r.created_at desc limit 50;
end;
$$;

create or replace function public.respond_friend_request(request bigint, accept boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  r public.friend_requests;
begin
  select * into r from public.friend_requests x where x.id = request and x.to_user = uid and x.status = 'pending' for update;
  if r.id is null then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  update public.friend_requests x set status = case when accept then 'accepted' else 'declined' end where x.id = request;
  if accept and not private.is_blocked(uid, r.from_user) then
    insert into public.friendships (user_a, user_b) values (least(uid, r.from_user), greatest(uid, r.from_user)) on conflict do nothing;
  end if;
end;
$$;

-- ── Friends-only profile and social handles ─────────────────────────────────
create or replace function public.friend_profile(friend uuid)
  returns table (display_name text, week_xp integer, streak integer, xp_total integer, lessons integer, home_city text, handles jsonb)
  language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if not private.are_friends(uid, friend) or private.is_blocked(uid, friend) then
    raise exception 'friends only' using errcode = '42501';
  end if;
  return query
    select p.display_name, private.week_xp(p.user_id),
           coalesce((pr.data -> 'streak' ->> 'count')::integer, 0),
           coalesce((pr.data ->> 'xpTotal')::integer, 0),
           coalesce((select count(*)::integer from jsonb_object_keys(case when jsonb_typeof(pr.data -> 'lessons') = 'object' then pr.data -> 'lessons' else '{}'::jsonb end)), 0),
           case when p.show_city then p.home_city end,
           coalesce((select jsonb_agg(jsonb_build_object('network', h.network, 'handle', h.handle) order by h.network)
                     from public.social_handles h where h.user_id = p.user_id and h.visible), '[]'::jsonb)
    from public.friend_profiles p left join public.progress pr on pr.user_id = p.user_id
    where p.user_id = friend;
end;
$$;

create or replace function public.my_handles()
  returns table (network text, handle text, visible boolean)
  language sql stable security definer set search_path = '' as $$
  select h.network, h.handle, h.visible from public.social_handles h where h.user_id = (select auth.uid()) order by h.network;
$$;

-- Saves one handle; an empty handle removes it.
create or replace function public.save_handle(network text, handle text, visible boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  uid uuid := private.require_profile();
  clean text := btrim(regexp_replace(coalesce(handle, ''), '^@', ''));
begin
  if save_handle.network not in ('instagram', 'tiktok', 'x', 'snapchat') then
    raise exception 'unknown network' using errcode = '22023';
  end if;
  if clean = '' then
    delete from public.social_handles h where h.user_id = uid and h.network = save_handle.network;
    return;
  end if;
  if clean !~ '^[A-Za-z0-9._]{1,30}$' then
    raise exception 'invalid handle' using errcode = '22023';
  end if;
  if not private.name_is_clean(replace(replace(clean, '.', ' '), '_', ' ')) then
    raise exception 'please choose another handle' using errcode = '22023';
  end if;
  insert into public.social_handles (user_id, network, handle, visible, updated_at)
  values (uid, save_handle.network, clean, coalesce(save_handle.visible, false), now())
  on conflict (user_id, network) do update set handle = excluded.handle, visible = excluded.visible, updated_at = now();
end;
$$;

-- ── Blocking and reporting ──────────────────────────────────────────────────
create or replace function public.block_user(target uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if target = uid then
    raise exception 'cannot block yourself' using errcode = '22023';
  end if;
  insert into public.blocks (blocker, blocked) values (uid, target) on conflict do nothing;
  delete from public.friendships f where f.user_a = least(uid, target) and f.user_b = greatest(uid, target);
  update public.friend_requests r set status = 'declined'
  where r.status = 'pending' and ((r.from_user = uid and r.to_user = target) or (r.from_user = target and r.to_user = uid));
end;
$$;

create or replace function public.unblock_user(target uuid)
  returns void
  language sql security definer set search_path = '' as $$
  delete from public.blocks b where b.blocker = (select auth.uid()) and b.blocked = target;
$$;

create or replace function public.my_blocks()
  returns table (user_id uuid, display_name text)
  language sql stable security definer set search_path = '' as $$
  select b.blocked, coalesce(p.display_name, '?')
  from public.blocks b left join public.friend_profiles p on p.user_id = b.blocked
  where b.blocker = (select auth.uid()) order by b.created_at desc;
$$;

create or replace function public.report_user(target uuid, reason text, note text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if (select count(*) from public.user_reports r where r.reporter = uid and r.created_at > now() - interval '1 day') >= 5 then
    raise exception 'too many reports' using errcode = '54000';
  end if;
  insert into public.user_reports (reporter, reported, reason, note)
  values (uid, target, reason, nullif(left(btrim(coalesce(note, '')), 500), ''));
end;
$$;

-- ── Owner console ───────────────────────────────────────────────────────────
create or replace function public.owner_user_reports(report_status text default 'open', max_rows integer default 200)
  returns table (id bigint, created_at timestamptz, reason text, note text, status text,
                 reported uuid, reported_name text, reporter_name text, reports_against integer)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read reports');
  return query
    select r.id, r.created_at, r.reason, r.note, r.status, r.reported,
           coalesce(pd.display_name, '?'), coalesce(pr.display_name, '?'),
           (select count(*)::integer from public.user_reports x where x.reported = r.reported)
    from public.user_reports r
    left join public.friend_profiles pd on pd.user_id = r.reported
    left join public.friend_profiles pr on pr.user_id = r.reporter
    where report_status = 'all' or r.status = report_status
    order by r.created_at desc
    limit least(greatest(max_rows, 1), 500);
end;
$$;

create or replace function public.owner_set_user_report_status(report bigint, new_status text)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('report status', jsonb_build_object('user_report', report, 'status', new_status));
  update public.user_reports r set status = new_status where r.id = report;
end;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'public.community_me()', 'public.set_community(text, boolean, boolean)', 'public.set_nearby(text, boolean)',
    'public.city_league()', 'public.nearby_learners()', 'public.send_friend_request(uuid)',
    'public.my_friend_requests()', 'public.respond_friend_request(bigint, boolean)', 'public.friend_profile(uuid)',
    'public.my_handles()', 'public.save_handle(text, text, boolean)', 'public.block_user(uuid)',
    'public.unblock_user(uuid)', 'public.my_blocks()', 'public.report_user(uuid, text, text)',
    'public.owner_user_reports(text, integer)', 'public.owner_set_user_report_status(bigint, text)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
