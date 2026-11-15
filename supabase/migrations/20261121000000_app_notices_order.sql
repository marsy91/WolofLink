-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Restore app_notices after the family switches migration (20261120000000) rewrote it.
-- That rewrite dropped the newest-first order of announcements and the sorted switch
-- lists, and listed the pausable keys by hand. This puts back the original definition
-- (20261114000000_bot_duels_switch.sql) with family and family_night added to the
-- opt-in keys. Same signature and owner, so existing grants stay as they are.
create or replace function public.app_notices() returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'message', a.message) order by a.starts_on desc)
      from public.announcements a
      where a.starts_on <= current_date and a.ends_on >= current_date), '[]'::jsonb),
    'off', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s
                     where s.is_off and s.key not in ('nearby', 'bot_duels', 'family', 'family_night')), '[]'::jsonb),
    'on', coalesce((select jsonb_agg(s.key order by s.key) from public.remote_switches s
                    where not s.is_off and s.key in ('nearby', 'bot_duels', 'family', 'family_night')), '[]'::jsonb)
  );
$$;
