-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Two-way duels: a Wolof learner can duel a Wolof speaker who is learning English or French.
-- Both get the same words; each answers in the language they are learning. The duel itself
-- does not change on the server (same entries, same points and crowns): the app builds each
-- player's questions in their own direction.
--
-- So that the duel screen can say "you answer in Wolof, Awa answers in English", a learner's
-- course (wo, en or fr) is kept on their friend profile and shown only to their friends
-- (or to someone they are in a duel with). Nothing else about it is visible.
--
-- Test: supabase/tests/two_way_duels_test.sql (self-cancelling).

alter table public.friend_profiles
  add column if not exists learning text not null default 'wo' check (learning in ('wo', 'en', 'fr'));

-- The app tells the server which course the learner follows (only when it changes).
create or replace function public.set_learning(target text)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if target is null or target not in ('wo', 'en', 'fr') then
    raise exception 'unknown course' using errcode = '22023';
  end if;
  update public.friend_profiles p set learning = target where p.user_id = uid and p.learning is distinct from target;
end;
$$;
revoke execute on function public.set_learning(text) from public, anon;
grant execute on function public.set_learning(text) to authenticated;

-- A friend's course, or the course of the other player in one of your duels; null otherwise.
create or replace function public.friend_learning(friend uuid)
  returns text
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if friend is null or friend = uid or private.is_blocked(uid, friend) then
    return null;
  end if;
  if not (private.are_friends(uid, friend) or exists (
      select 1 from public.duels d
      where (d.challenger = uid and d.opponent = friend) or (d.challenger = friend and d.opponent = uid))) then
    return null;
  end if;
  return (select p.learning from public.friend_profiles p where p.user_id = friend);
end;
$$;
revoke execute on function public.friend_learning(uuid) from public, anon;
grant execute on function public.friend_learning(uuid) to authenticated;
