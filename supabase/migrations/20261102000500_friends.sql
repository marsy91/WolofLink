-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Friends and a weekly ranking between friends only.
-- - Each learner (with an account) picks a display name and gets a friend code.
-- - Two people become friends when one enters the other's code. No public list,
--   no search, no chat: strangers can't find anyone.
-- - Friends see each other's chosen name, XP this week (Monday to Sunday), streak and
--   when they last practised. Never emails.
-- - Either friend can remove the other; nudges are limited to one per friend per day.

create table if not exists public.friend_profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 30),
  friend_code  text not null unique check (friend_code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'),
  created_at   timestamptz not null default now()
);

create table if not exists public.friendships (
  user_a     uuid not null references auth.users (id) on delete cascade,
  user_b     uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create index if not exists friendships_b_idx on public.friendships (user_b);

create table if not exists public.nudges (
  id         bigserial primary key,
  from_user  uuid not null references auth.users (id) on delete cascade,
  to_user    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  seen_at    timestamptz
);
create index if not exists nudges_to_idx on public.nudges (to_user, seen_at, created_at desc);

alter table public.friend_profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.nudges enable row level security;
revoke all on public.friend_profiles, public.friendships, public.nudges from public, anon, authenticated;

-- ── Helpers ─────────────────────────────────────────────────────────────────
create or replace function private.are_friends(a uuid, b uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.friendships f where f.user_a = least(a, b) and f.user_b = greatest(a, b));
$$;

-- A name is refused when it contains a blocked word (the voices block list).
create or replace function private.name_is_clean(name text) returns boolean
  language sql stable security definer set search_path = '' as $$
  select not exists (
    select 1 from public.blocked_words b
    where translate(lower(name), 'àâäéèêëîïôöùûüçñŋ', 'aaaeeeeiioouuucnn') ~* ('(^|[^a-z])' || b.word || '([^a-z]|$)')
       or (char_length(b.word) >= 5 and translate(lower(name), 'àâäéèêëîïôöùûüçñŋ', 'aaaeeeeiioouuucnn') like '%' || b.word || '%')
  );
$$;

create or replace function private.new_friend_code() returns text
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
    exit when not exists (select 1 from public.friend_profiles p where p.friend_code = code);
  end loop;
  return code;
end;
$$;

-- XP since Monday (UTC, which is Senegal's time zone) from the synced progress.
create or replace function private.week_xp(member uuid) returns integer
  language sql stable security definer set search_path = '' as $$
  select coalesce(sum(case when d.value ~ '^\d{1,6}$' then d.value::integer else 0 end), 0)::integer
  from public.progress p
  cross join lateral jsonb_each_text(case when jsonb_typeof(p.data -> 'xpByDay') = 'object' then p.data -> 'xpByDay' else '{}'::jsonb end) d
  where p.user_id = member
    and d.key ~ '^\d{4}-\d{2}-\d{2}$'
    and d.key >= to_char(date_trunc('week', now() at time zone 'utc'), 'YYYY-MM-DD');
$$;

revoke execute on function private.are_friends(uuid, uuid) from public, anon, authenticated;
revoke execute on function private.name_is_clean(text) from public, anon, authenticated;
revoke execute on function private.new_friend_code() from public, anon, authenticated;
revoke execute on function private.week_xp(uuid) from public, anon, authenticated;

-- ── Functions for the app ───────────────────────────────────────────────────
create or replace function public.my_friend_card()
  returns table (display_name text, friend_code text)
  language sql stable security definer set search_path = '' as $$
  select p.display_name, p.friend_code from public.friend_profiles p where p.user_id = (select auth.uid());
$$;

create or replace function public.set_friend_name(name text)
  returns table (display_name text, friend_code text)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  clean text := btrim(regexp_replace(name, '\s+', ' ', 'g'));
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if char_length(clean) not between 1 and 30 then
    raise exception 'name must be 1 to 30 characters' using errcode = '22023';
  end if;
  if not private.name_is_clean(clean) then
    raise exception 'please choose another name' using errcode = '22023';
  end if;
  insert into public.friend_profiles (user_id, display_name, friend_code)
  values (uid, clean, private.new_friend_code())
  on conflict (user_id) do update set display_name = excluded.display_name;
  return query select p.display_name, p.friend_code from public.friend_profiles p where p.user_id = uid;
end;
$$;

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
  if other.user_id is null then
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

create or replace function public.remove_friend(friend uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  delete from public.friendships f where f.user_a = least(uid, friend) and f.user_b = greatest(uid, friend);
end;
$$;

-- The weekly ranking: me and my friends, most XP this week first.
create or replace function public.friends_board()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, last_active timestamptz, is_me boolean)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  return query
    with people as (
      select uid as id
      union
      select case when f.user_a = uid then f.user_b else f.user_a end from public.friendships f where uid in (f.user_a, f.user_b)
    )
    select fp.user_id, fp.display_name, private.week_xp(fp.user_id),
           coalesce((pr.data -> 'streak' ->> 'count')::integer, 0), pr.updated_at, fp.user_id = uid
    from people x
    join public.friend_profiles fp on fp.user_id = x.id
    left join public.progress pr on pr.user_id = x.id
    order by 3 desc, 2;
end;
$$;

create or replace function public.nudge_friend(friend uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null or not private.are_friends(uid, friend) then
    raise exception 'not friends' using errcode = '42501';
  end if;
  if exists (select 1 from public.nudges n where n.from_user = uid and n.to_user = friend and n.created_at > now() - interval '20 hours') then
    raise exception 'already nudged today' using errcode = '54000';
  end if;
  insert into public.nudges (from_user, to_user) values (uid, friend);
end;
$$;

-- Unseen nudges from the last week (from people who are still friends); marks them seen.
create or replace function public.my_nudges()
  returns table (from_name text, sent_at timestamptz)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  return query
    with fresh as (
      update public.nudges n set seen_at = now()
      where n.to_user = uid and n.seen_at is null and n.created_at > now() - interval '7 days'
        and private.are_friends(uid, n.from_user)
      returning n.from_user, n.created_at
    )
    select fp.display_name, fresh.created_at from fresh join public.friend_profiles fp on fp.user_id = fresh.from_user
    order by fresh.created_at desc;
end;
$$;

revoke execute on function public.my_friend_card() from public, anon;
revoke execute on function public.set_friend_name(text) from public, anon;
revoke execute on function public.add_friend(text) from public, anon;
revoke execute on function public.remove_friend(uuid) from public, anon;
revoke execute on function public.friends_board() from public, anon;
revoke execute on function public.nudge_friend(uuid) from public, anon;
revoke execute on function public.my_nudges() from public, anon;
grant execute on function public.my_friend_card() to authenticated;
grant execute on function public.set_friend_name(text) to authenticated;
grant execute on function public.add_friend(text) to authenticated;
grant execute on function public.remove_friend(uuid) to authenticated;
grant execute on function public.friends_board() to authenticated;
grant execute on function public.nudge_friend(uuid) to authenticated;
grant execute on function public.my_nudges() to authenticated;
