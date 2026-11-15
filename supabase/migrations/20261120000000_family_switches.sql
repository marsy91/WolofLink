-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Family play switches. Extends remote_switches_key_check to include 'family' and
-- 'family_night', inserts both as off-by-default opt-in rows, and updates app_notices
-- to serve them in the opt-in list.

-- Extend the allowed keys to include family and family_night.
alter table public.remote_switches drop constraint if exists remote_switches_key_check;
alter table public.remote_switches add constraint remote_switches_key_check
  check (key in (
    'friends', 'duels', 'voices', 'supporter', 'reports', 'community',
    'nearby', 'bot_duels', 'feedback', 'world', 'family', 'family_night'
  ));

-- Insert opt-in rows (off until the owner switches them on).
insert into public.remote_switches (key, is_off) values
  ('family',       true),
  ('family_night', true)
on conflict (key) do nothing;

-- Redefine app_notices to include the new opt-in keys.
create or replace function public.app_notices()
  returns jsonb
  language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',      a.id,
        'title',   a.title,
        'message', a.message
      ))
      from public.announcements a
      where a.starts_on <= (now() at time zone 'utc')::date
        and a.ends_on   >= (now() at time zone 'utc')::date
    ), '[]'::jsonb),
    'off', coalesce((
      select jsonb_agg(s.key)
      from public.remote_switches s
      where s.is_off = true
        and s.key in ('friends','duels','voices','supporter','reports','community','feedback','world')
    ), '[]'::jsonb),
    'on', coalesce((
      select jsonb_agg(s.key)
      from public.remote_switches s
      where s.is_off = false
        and s.key in ('nearby','bot_duels','family','family_night')
    ), '[]'::jsonb)
  );
$$;
