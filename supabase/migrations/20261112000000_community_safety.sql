-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Community safety. Children use WolofLink, so contact between strangers is kept
-- to adults who opted in, and the riskier parts start switched off.
--
-- 1. "Learners near you" and social handles start OFF. The owner switches them on
--    in the console (switch "nearby"); the database refuses them until then.
-- 2. Friend requests only go between adults who are both visible in a league or
--    the nearby list. Nobody can send a request to a child, even with their id.
--    Under-18s add friends only in person, by code or QR code.
-- 3. Social handles are adults only: a child cannot add one, and a child never
--    sees a friend's handles.
-- 4. Anyone reported as under 18, or reported by 3 different people, disappears
--    from leagues and the nearby list until the report is reviewed.
-- 5. The owner can remove someone from the community (no leagues, nearby,
--    requests, handles or new friends).
-- 6. Guessing friend codes is limited to 20 wrong codes a day.

-- ── 1. The "nearby" switch (an on-switch: off until the owner turns it on) ──
alter table public.remote_switches drop constraint if exists remote_switches_key_check;
alter table public.remote_switches add constraint remote_switches_key_check
  check (key in ('friends', 'duels', 'voices', 'supporter', 'reports', 'community', 'nearby'));
insert into public.remote_switches (key, is_off, note) values ('nearby', true, 'Off until the owner switches it on')
  on conflict do nothing;

-- Apps read "on" for switches that are off by default.
create or replace function public.app_notices() returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'message', a.message) order by a.starts_on desc)
      from public.announcements a
      where a.starts_on <= current_date and a.ends_on >= current_date), '[]'::jsonb),
    'off', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s where s.is_off and s.key <> 'nearby'), '[]'::jsonb),
    'on', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s where not s.is_off and s.key = 'nearby'), '[]'::jsonb)
  );
$$;

create or replace function private.nearby_on() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.remote_switches s where s.key = 'nearby' and not s.is_off)
     and not private.community_off();
$$;

-- ── Safety state ────────────────────────────────────────────────────────────
alter table public.friend_profiles
  add column if not exists community_restricted boolean not null default false;

create table if not exists public.friend_code_misses (
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists friend_code_misses_idx on public.friend_code_misses (user_id, created_at);
alter table public.friend_code_misses enable row level security;
revoke all on public.friend_code_misses from public, anon, authenticated;

-- Hidden from leagues, the nearby list and requests: removed by the owner, reported
-- as under 18, or reported by 3 different people (until the reports are reviewed).
create or replace function private.hidden_from_discovery(u uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select coalesce((select p.community_restricted from public.friend_profiles p where p.user_id = u), true)
      or exists (select 1 from public.user_reports r where r.reported = u and r.status = 'open' and r.reason = 'underage')
      or (select count(distinct r.reporter) from public.user_reports r where r.reported = u and r.status = 'open') >= 3;
$$;

-- An adult who can be found right now in a league or the nearby list.
create or replace function private.discoverable(u uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friend_profiles p
    where p.user_id = u and p.adult_confirmed
      and ((p.show_city and p.home_city is not null)
           or (p.show_nearby and p.nearby_until >= current_date and private.nearby_on()))
  ) and not private.hidden_from_discovery(u);
$$;

create or replace function private.is_adult(u uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select coalesce((select p.adult_confirmed and not p.community_restricted from public.friend_profiles p where p.user_id = u), false);
$$;

revoke execute on function private.nearby_on() from public, anon, authenticated;
revoke execute on function private.hidden_from_discovery(uuid) from public, anon, authenticated;
revoke execute on function private.discoverable(uuid) from public, anon, authenticated;
revoke execute on function private.is_adult(uuid) from public, anon, authenticated;

-- ── Adding by code: wrong codes are limited; removed people cannot add ──────
-- An unknown (or blocked) code now returns null instead of an error, so the
-- wrong guess is recorded.
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
  if exists (select 1 from public.friend_profiles p where p.user_id = uid and p.community_restricted) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if (select count(*) from public.friend_code_misses m where m.user_id = uid and m.created_at > now() - interval '1 day') >= 20 then
    raise exception 'too many attempts' using errcode = '54000';
  end if;
  select * into other from public.friend_profiles p where p.friend_code = upper(btrim(code));
  if other.user_id is null or private.is_blocked(uid, other.user_id) then
    insert into public.friend_code_misses (user_id) values (uid);
    return null;
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

-- ── Settings: saying "not 18+" hides handles at once ────────────────────────
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
      nearby_area = case when city is not null and p.nearby_area like city || '/%' then p.nearby_area end,
      show_nearby = case when city is not null and p.nearby_area like city || '/%' and coalesce(adult, false) then p.show_nearby else false end
  where p.user_id = uid;
  if not coalesce(adult, false) then
    update public.social_handles h set visible = false where h.user_id = uid;
    update public.friend_requests r set status = 'declined' where r.status = 'pending' and uid in (r.from_user, r.to_user);
  end if;
end;
$$;

create or replace function public.set_nearby(area text, show boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  me public.friend_profiles;
begin
  select * into me from public.friend_profiles p where p.user_id = uid;
  if coalesce(show, false) and not private.nearby_on() then
    raise exception 'paused' using errcode = '55000';
  end if;
  if area is not null and (me.home_city is null or area not like me.home_city || '/%'
                           or area !~ '^[a-z][a-z-]{1,30}/[a-z0-9][a-z0-9-]{1,40}$') then
    raise exception 'unknown area' using errcode = '22023';
  end if;
  if coalesce(show, false) and (area is null or not me.adult_confirmed or me.community_restricted) then
    raise exception 'adults only' using errcode = '42501';
  end if;
  update public.friend_profiles p
  set nearby_area = area,
      show_nearby = coalesce(show, false),
      nearby_until = case when coalesce(show, false) then current_date + 30 end
  where p.user_id = uid;
end;
$$;

-- ── Leagues and nearby: hidden people removed ───────────────────────────────
create or replace function public.city_league()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, is_me boolean, is_friend boolean, requested boolean)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  me public.friend_profiles;
begin
  select * into me from public.friend_profiles p where p.user_id = uid;
  if private.community_off() or me.home_city is null or not me.show_city or not me.adult_confirmed
     or private.hidden_from_discovery(uid) then
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
        and (p.user_id = uid or not private.hidden_from_discovery(p.user_id))
    ) x
    order by x.wxp desc, x.display_name
    limit 20;
end;
$$;

create or replace function public.nearby_learners()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, is_friend boolean, requested boolean)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  me public.friend_profiles;
begin
  select * into me from public.friend_profiles p where p.user_id = uid;
  if not private.nearby_on() or me.nearby_area is null or not me.show_nearby
     or coalesce(me.nearby_until < current_date, true) or not me.adult_confirmed
     or private.hidden_from_discovery(uid) then
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
      and not private.hidden_from_discovery(p.user_id)
    order by p.created_at desc
    limit 50;
end;
$$;

-- ── Requests: adults who can both be found, nobody else ─────────────────────
create or replace function public.send_friend_request(target uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if private.community_off() then
    raise exception 'paused' using errcode = '55000';
  end if;
  if not private.discoverable(uid) then
    raise exception 'adults only' using errcode = '42501';
  end if;
  -- Children, hidden people and anyone not in a league or the nearby list look "not found".
  if target = uid or private.is_blocked(uid, target) or not private.discoverable(target) then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  if private.are_friends(uid, target) then
    raise exception 'already friends' using errcode = '22023';
  end if;
  if (select count(*) from public.friend_requests r where r.from_user = uid and r.created_at > now() - interval '1 day') >= 20 then
    raise exception 'too many requests' using errcode = '54000';
  end if;
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
      and private.is_adult(uid) and private.is_adult(r.from_user) and not private.hidden_from_discovery(r.from_user)
    order by r.created_at desc limit 50;
end;
$$;

create or replace function public.respond_friend_request(request bigint, accept boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  r public.friend_requests;
  allowed boolean;
begin
  select * into r from public.friend_requests x where x.id = request and x.to_user = uid and x.status = 'pending' for update;
  if r.id is null then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  allowed := accept and not private.is_blocked(uid, r.from_user)
             and private.is_adult(uid) and private.is_adult(r.from_user)
             and not private.hidden_from_discovery(r.from_user);
  update public.friend_requests x set status = case when allowed then 'accepted' else 'declined' end where x.id = request;
  if allowed then
    insert into public.friendships (user_a, user_b) values (least(uid, r.from_user), greatest(uid, r.from_user)) on conflict do nothing;
  end if;
end;
$$;

-- ── Handles: adults only, both ways, and only while "nearby" is on ──────────
create or replace function public.friend_profile(friend uuid)
  returns table (display_name text, week_xp integer, streak integer, xp_total integer, lessons integer, home_city text, handles jsonb)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := private.require_profile();
  show_handles boolean;
begin
  if not private.are_friends(uid, friend) or private.is_blocked(uid, friend) then
    raise exception 'friends only' using errcode = '42501';
  end if;
  show_handles := private.nearby_on() and private.is_adult(uid) and private.is_adult(friend);
  return query
    select p.display_name, private.week_xp(p.user_id),
           coalesce((pr.data -> 'streak' ->> 'count')::integer, 0),
           coalesce((pr.data ->> 'xpTotal')::integer, 0),
           coalesce((select count(*)::integer from jsonb_object_keys(case when jsonb_typeof(pr.data -> 'lessons') = 'object' then pr.data -> 'lessons' else '{}'::jsonb end)), 0),
           case when p.show_city then p.home_city end,
           case when show_handles then
             coalesce((select jsonb_agg(jsonb_build_object('network', h.network, 'handle', h.handle) order by h.network)
                       from public.social_handles h where h.user_id = p.user_id and h.visible), '[]'::jsonb)
           else '[]'::jsonb end
    from public.friend_profiles p left join public.progress pr on pr.user_id = p.user_id
    where p.user_id = friend;
end;
$$;

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
  if not private.nearby_on() then
    raise exception 'paused' using errcode = '55000';
  end if;
  if not private.is_adult(uid) then
    raise exception 'adults only' using errcode = '42501';
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

-- ── Reports: only about real people, never yourself ─────────────────────────
create or replace function public.report_user(target uuid, reason text, note text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.require_profile();
begin
  if target is null or target = uid or not exists (select 1 from public.friend_profiles p where p.user_id = target) then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  if (select count(*) from public.user_reports r where r.reporter = uid and r.created_at > now() - interval '1 day') >= 5 then
    raise exception 'too many reports' using errcode = '54000';
  end if;
  insert into public.user_reports (reporter, reported, reason, note)
  values (uid, target, reason, nullif(left(btrim(coalesce(note, '')), 500), ''));
end;
$$;

-- ── Owner console: see and remove people from the community ─────────────────
drop function if exists public.owner_user_reports(text, integer);
create function public.owner_user_reports(report_status text default 'open', max_rows integer default 200)
  returns table (id bigint, created_at timestamptz, reason text, note text, status text,
                 reported uuid, reported_name text, reporter_name text, reports_against integer, reported_restricted boolean)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read reports');
  return query
    select r.id, r.created_at, r.reason, r.note, r.status, r.reported,
           coalesce(pd.display_name, '?'), coalesce(pr.display_name, '?'),
           (select count(*)::integer from public.user_reports x where x.reported = r.reported),
           coalesce(pd.community_restricted, false)
    from public.user_reports r
    left join public.friend_profiles pd on pd.user_id = r.reported
    left join public.friend_profiles pr on pr.user_id = r.reporter
    where report_status = 'all' or r.status = report_status
    order by r.created_at desc
    limit least(greatest(max_rows, 1), 500);
end;
$$;

-- Owner only (staff roles do not include it). Removing someone hides them
-- everywhere, cancels their pending requests and hides their handles.
create or replace function public.owner_set_community_restriction(target uuid, restricted boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('restrict user', jsonb_build_object('user', target, 'restricted', restricted));
  update public.friend_profiles p
  set community_restricted = coalesce(restricted, false),
      show_city = case when restricted then false else p.show_city end,
      show_nearby = case when restricted then false else p.show_nearby end
  where p.user_id = target;
  if restricted then
    update public.social_handles h set visible = false where h.user_id = target;
    update public.friend_requests r set status = 'declined' where r.status = 'pending' and target in (r.from_user, r.to_user);
  end if;
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.owner_user_reports(text, integer)', 'public.owner_set_community_restriction(uuid, boolean)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
