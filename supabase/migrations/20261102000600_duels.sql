-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Word duels between friends (turn-based): the challenger plays 10 questions and
-- sends the duel; the friend plays the same questions within 3 days without seeing
-- the challenger's score. The higher score wins trophies.
-- Trophies: win +30, draw +15, loss +5 (everyone who plays gains something).

alter table public.friend_profiles add column if not exists trophies integer not null default 0;

create table if not exists public.duels (
  id               uuid primary key default gen_random_uuid(),
  challenger       uuid not null references auth.users (id) on delete cascade,
  opponent         uuid not null references auth.users (id) on delete cascade,
  seed             integer not null,
  entries          text[] not null check (cardinality(entries) = 10),
  challenger_score integer not null check (challenger_score between 0 and 1500),
  opponent_score   integer check (opponent_score between 0 and 1500),
  status           text not null default 'waiting' check (status in ('waiting', 'done', 'declined')),
  created_at       timestamptz not null default now(),
  finished_at      timestamptz,
  check (challenger <> opponent)
);
create index if not exists duels_challenger_idx on public.duels (challenger, created_at desc);
create index if not exists duels_opponent_idx on public.duels (opponent, status, created_at desc);

alter table public.duels enable row level security;
revoke all on public.duels from public, anon, authenticated;

create or replace function public.create_duel(friend uuid, duel_seed integer, duel_entries text[], score integer)
  returns uuid
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  saved uuid;
begin
  if uid is null or not private.are_friends(uid, friend) then
    raise exception 'not friends' using errcode = '42501';
  end if;
  if cardinality(duel_entries) <> 10
     or exists (select 1 from unnest(duel_entries) e where e !~ '^[a-zA-Z0-9._:-]{1,60}$') then
    raise exception 'bad questions' using errcode = '22023';
  end if;
  if score not between 0 and 1500 then
    raise exception 'bad score' using errcode = '22023';
  end if;
  if (select count(*) from public.duels d where d.challenger = uid and d.created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many duels today' using errcode = '54000';
  end if;
  if (select count(*) from public.duels d where d.challenger = uid and d.opponent = friend and d.status = 'waiting'
        and d.created_at > now() - interval '3 days') >= 3 then
    raise exception 'too many open duels with this friend' using errcode = '54000';
  end if;
  insert into public.duels (challenger, opponent, seed, entries, challenger_score)
  values (uid, friend, duel_seed, duel_entries, score)
  returning id into saved;
  return saved;
end;
$$;

-- Duels from the last 30 days. The challenger's score stays hidden from the
-- opponent until they have played. A waiting duel older than 3 days is 'expired'.
create or replace function public.my_duels()
  returns table (id uuid, other_name text, i_challenged boolean, my_score integer, their_score integer,
                 status text, seed integer, entries text[], created_at timestamptz)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  return query
    select d.id,
           coalesce(fp.display_name, '?'),
           d.challenger = uid,
           case when d.challenger = uid then d.challenger_score else d.opponent_score end,
           case when d.challenger = uid then d.opponent_score
                when d.status = 'done' then d.challenger_score else null end,
           case when d.status = 'waiting' and d.created_at < now() - interval '3 days' then 'expired' else d.status end,
           d.seed, d.entries, d.created_at
    from public.duels d
    left join public.friend_profiles fp on fp.user_id = case when d.challenger = uid then d.opponent else d.challenger end
    where uid in (d.challenger, d.opponent) and d.created_at > now() - interval '30 days'
    order by d.created_at desc
    limit 50;
end;
$$;

create or replace function public.play_duel(duel uuid, score integer)
  returns table (my_score integer, their_score integer, result text, trophies_won integer)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  d public.duels;
  mine integer;
  theirs integer;
begin
  select * into d from public.duels x where x.id = duel for update;
  if d.id is null or d.opponent <> uid then
    raise exception 'duel not found' using errcode = 'P0002';
  end if;
  if d.status <> 'waiting' or d.created_at < now() - interval '3 days' then
    raise exception 'this duel is over' using errcode = '55000';
  end if;
  if score not between 0 and 1500 then
    raise exception 'bad score' using errcode = '22023';
  end if;
  update public.duels x set opponent_score = score, status = 'done', finished_at = now() where x.id = duel;
  mine := case when score > d.challenger_score then 30 when score = d.challenger_score then 15 else 5 end;
  theirs := case when d.challenger_score > score then 30 when score = d.challenger_score then 15 else 5 end;
  update public.friend_profiles p set trophies = p.trophies + mine where p.user_id = uid;
  update public.friend_profiles p set trophies = p.trophies + theirs where p.user_id = d.challenger;
  return query select score, d.challenger_score,
    case when score > d.challenger_score then 'won' when score = d.challenger_score then 'draw' else 'lost' end, mine;
end;
$$;

create or replace function public.decline_duel(duel uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  update public.duels x set status = 'declined', finished_at = now()
  where x.id = duel and x.opponent = (select auth.uid()) and x.status = 'waiting';
end;
$$;

-- The weekly board now also shows trophies (return type changes, so recreate it).
drop function if exists public.friends_board();
create function public.friends_board()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, last_active timestamptz,
                 is_me boolean, trophies integer)
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
           coalesce((pr.data -> 'streak' ->> 'count')::integer, 0), pr.updated_at, fp.user_id = uid, fp.trophies
    from people x
    join public.friend_profiles fp on fp.user_id = x.id
    left join public.progress pr on pr.user_id = x.id
    order by 3 desc, 2;
end;
$$;

revoke execute on function public.create_duel(uuid, integer, text[], integer) from public, anon;
revoke execute on function public.my_duels() from public, anon;
revoke execute on function public.play_duel(uuid, integer) from public, anon;
revoke execute on function public.decline_duel(uuid) from public, anon;
revoke execute on function public.friends_board() from public, anon;
grant execute on function public.create_duel(uuid, integer, text[], integer) to authenticated;
grant execute on function public.my_duels() to authenticated;
grant execute on function public.play_duel(uuid, integer) to authenticated;
grant execute on function public.decline_duel(uuid) to authenticated;
grant execute on function public.friends_board() to authenticated;
