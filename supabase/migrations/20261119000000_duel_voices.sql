-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Voice swap in two-way duels. In a duel between a Wolof learner and a Wolof speaker, each
-- player may record ONE of the duel's words in the language they speak well (the Wolof speaker
-- in Wolof, the learner in English or French). The other player hears it and guesses the word.
--
-- Safety rules, all checked here:
--  * Only between two adults (18+ confirmed, not removed from the community) who are friends,
--    have not blocked each other, and are playing a two-way duel together.
--  * Only a word from that duel: no free speech. One clip per player per duel, at most 60 KB
--    (about 4 seconds).
--  * Only the other player can hear it. A clip is deleted 10 minutes after it is first heard,
--    and after 3 days in any case. Deleting the account or the duel deletes it too.
--  * Reporting a clip deletes it at once and files a report for the owner.
--  * The owner can pause it with the existing "duels" switch.
--
-- Test: supabase/tests/duel_voices_test.sql (self-cancelling).

create table if not exists public.duel_voices (
  duel_id    uuid not null references public.duels (id) on delete cascade,
  speaker    uuid not null references auth.users (id) on delete cascade,
  entry_id   text not null check (char_length(entry_id) between 1 and 60),
  lang       text not null check (lang in ('wo', 'en', 'fr')),
  mime       text not null check (mime in ('audio/webm', 'audio/ogg', 'audio/mp4')),
  audio      bytea not null check (octet_length(audio) between 200 and 61440),
  created_at timestamptz not null default now(),
  heard_at   timestamptz,
  primary key (duel_id, speaker)
);
create index if not exists duel_voices_created_idx on public.duel_voices (created_at);
alter table public.duel_voices enable row level security;
revoke all on public.duel_voices from public, anon, authenticated;

-- A clip report has its own reason.
alter table public.user_reports drop constraint if exists user_reports_reason_check;
alter table public.user_reports add constraint user_reports_reason_check
  check (reason in ('harassment', 'spam', 'inappropriate name', 'inappropriate handle', 'underage', 'other', 'inappropriate voice'));

-- Deletes clips that were heard more than 10 minutes ago, and all clips older than 3 days.
create or replace function private.purge_duel_voices() returns void
  language sql security definer set search_path = '' as $$
  delete from public.duel_voices v
  where v.created_at < now() - interval '3 days'
     or (v.heard_at is not null and v.heard_at < now() - interval '10 minutes');
$$;
revoke execute on function private.purge_duel_voices() from public, anon, authenticated;

-- Every new duel also clears old clips, so nothing waits for a scheduled job.
create or replace function private.purge_duel_voices_trigger() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.purge_duel_voices();
  return null;
end;
$$;
revoke execute on function private.purge_duel_voices_trigger() from public, anon, authenticated;
drop trigger if exists duels_purge_voices on public.duels;
create trigger duels_purge_voices after insert on public.duels
  for each statement execute function private.purge_duel_voices_trigger();

-- The other player of a duel the caller may swap voices in, or null.
create or replace function private.voice_partner(duel uuid, uid uuid) returns uuid
  language plpgsql stable security definer set search_path = '' as $$
declare
  d public.duels;
  other uuid;
  mine text;
  theirs text;
begin
  select * into d from public.duels x where x.id = duel;
  if not found or d.status = 'declined' or d.created_at < now() - interval '3 days' then
    return null;
  end if;
  if d.challenger = uid then other := d.opponent;
  elsif d.opponent = uid then other := d.challenger;
  else return null;
  end if;
  if not private.is_adult(uid) or not private.is_adult(other)
     or not private.are_friends(uid, other) or private.is_blocked(uid, other) then
    return null;
  end if;
  select p.learning into mine from public.friend_profiles p where p.user_id = uid;
  select p.learning into theirs from public.friend_profiles p where p.user_id = other;
  -- A two-way duel: exactly one of the two is learning Wolof.
  if mine is null or theirs is null or (mine = 'wo') = (theirs = 'wo') then
    return null;
  end if;
  return other;
end;
$$;
revoke execute on function private.voice_partner(uuid, uuid) from public, anon, authenticated;

-- Record (or re-record) your word for the other player. `audio` is base64.
create or replace function public.send_duel_voice(duel uuid, entry text, lang text, mime text, audio text)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  other uuid;
  mine text;
  theirs text;
  bytes bytea;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if exists (select 1 from public.remote_switches s where s.key = 'duels' and s.is_off) then
    raise exception 'duels paused' using errcode = '55000';
  end if;
  perform private.purge_duel_voices();
  other := private.voice_partner(duel, uid);
  if other is null then
    raise exception 'voice swap not allowed' using errcode = '42501';
  end if;
  if not exists (select 1 from public.duels d where d.id = duel and entry = any (d.entries)) then
    raise exception 'not a word from this duel' using errcode = '22023';
  end if;
  -- You record in the language you speak well: Wolof speakers in Wolof, learners in the
  -- language their partner is learning.
  select p.learning into mine from public.friend_profiles p where p.user_id = uid;
  select p.learning into theirs from public.friend_profiles p where p.user_id = other;
  if lang is distinct from (case when mine = 'wo' then theirs else 'wo' end) then
    raise exception 'wrong language for this clip' using errcode = '22023';
  end if;
  begin
    bytes := decode(audio, 'base64');
  exception when others then
    raise exception 'bad audio' using errcode = '22023';
  end;
  insert into public.duel_voices (duel_id, speaker, entry_id, lang, mime, audio)
  values (duel, uid, entry, lang, mime, bytes)
  on conflict (duel_id, speaker) do update
    set entry_id = excluded.entry_id, lang = excluded.lang, mime = excluded.mime, audio = excluded.audio,
        created_at = now(), heard_at = null;
end;
$$;
revoke execute on function public.send_duel_voice(uuid, text, text, text, text) from public, anon;
grant execute on function public.send_duel_voice(uuid, text, text, text, text) to authenticated;

-- The other player's clip for you in this duel (base64), if there is one. Marks it heard.
create or replace function public.get_duel_voice(duel uuid)
  returns table (entry_id text, lang text, mime text, audio text)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  other uuid;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  perform private.purge_duel_voices();
  other := private.voice_partner(duel, uid);
  if other is null then
    return;
  end if;
  update public.duel_voices v set heard_at = coalesce(v.heard_at, now())
  where v.duel_id = duel and v.speaker = other;
  return query
    select v.entry_id, v.lang, v.mime, encode(v.audio, 'base64')
    from public.duel_voices v where v.duel_id = duel and v.speaker = other;
end;
$$;
revoke execute on function public.get_duel_voice(uuid) from public, anon;
grant execute on function public.get_duel_voice(uuid) to authenticated;

-- Duels with a clip waiting for you (not heard yet), for the Friends screen.
create or replace function public.my_duel_voices()
  returns table (duel_id uuid, speaker_name text)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  return query
    select v.duel_id, p.display_name
    from public.duel_voices v
    join public.duels d on d.id = v.duel_id
    join public.friend_profiles p on p.user_id = v.speaker
    where (d.challenger = uid or d.opponent = uid) and v.speaker <> uid and v.heard_at is null
      and v.created_at >= now() - interval '3 days'
      and private.voice_partner(v.duel_id, uid) = v.speaker;
end;
$$;
revoke execute on function public.my_duel_voices() from public, anon;
grant execute on function public.my_duel_voices() to authenticated;

-- Report the other player's clip: it is deleted at once and a report goes to the owner.
create or replace function public.report_duel_voice(duel uuid, note text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  other uuid;
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  select case when d.challenger = uid then d.opponent when d.opponent = uid then d.challenger end
    into other from public.duels d where d.id = duel;
  if other is null then
    raise exception 'duel not found' using errcode = '22023';
  end if;
  delete from public.duel_voices v where v.duel_id = duel and v.speaker = other;
  insert into public.user_reports (reporter, reported, reason, note)
  values (uid, other, 'inappropriate voice', nullif(left(btrim(coalesce(note, '')), 500), ''));
end;
$$;
revoke execute on function public.report_duel_voice(uuid, text) from public, anon;
grant execute on function public.report_duel_voice(uuid, text) to authenticated;
