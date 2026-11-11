-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- "Duel the computer": a practice duel against a computer opponent, played on the
-- phone (no scores are stored on the server). Off for learners until the owner
-- switches it on in the console (switch "bot_duels"); the owner can always try it.

alter table public.remote_switches drop constraint if exists remote_switches_key_check;
alter table public.remote_switches add constraint remote_switches_key_check
  check (key in ('friends', 'duels', 'voices', 'supporter', 'reports', 'community', 'nearby', 'bot_duels'));
insert into public.remote_switches (key, is_off, note) values ('bot_duels', true, 'Off until the owner switches it on')
  on conflict do nothing;

-- Apps read "on" for switches that are off by default (nearby, bot_duels).
create or replace function public.app_notices() returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'message', a.message) order by a.starts_on desc)
      from public.announcements a
      where a.starts_on <= current_date and a.ends_on >= current_date), '[]'::jsonb),
    'off', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s
                     where s.is_off and s.key not in ('nearby', 'bot_duels')), '[]'::jsonb),
    'on', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s
                    where not s.is_off and s.key in ('nearby', 'bot_duels')), '[]'::jsonb)
  );
$$;
