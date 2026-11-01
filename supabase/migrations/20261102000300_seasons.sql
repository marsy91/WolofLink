-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Seasonal themes the owner schedules (holiday themes are built into the app).
-- Anyone can read current and upcoming events; only the owner can change them.

create table if not exists public.season_events (
  id         uuid primary key default gen_random_uuid(),
  look       text not null check (look in ('ramadan', 'festive', 'faith', 'flag', 'sport', 'nature')),
  starts_on  date not null,
  ends_on    date not null,
  title      jsonb not null,
  message    jsonb,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on and ends_on - starts_on <= 92),
  check (jsonb_typeof(title) = 'object' and char_length(coalesce(title ->> 'en', '')) between 1 and 60),
  check (message is null or jsonb_typeof(message) = 'object'),
  check (char_length(title::text) <= 600 and char_length(coalesce(message::text, '')) <= 1200)
);
alter table public.season_events enable row level security;
revoke all on public.season_events from public, anon, authenticated;

create or replace function public.season_events_current()
  returns table (id uuid, look text, starts_on date, ends_on date, title jsonb, message jsonb)
  language sql stable security definer set search_path = '' as $$
  select e.id, e.look, e.starts_on, e.ends_on, e.title, e.message
  from public.season_events e
  where e.ends_on >= current_date - 1 and e.starts_on <= current_date + 60
  order by e.starts_on;
$$;

create or replace function public.owner_seasons()
  returns table (id uuid, look text, starts_on date, ends_on date, title jsonb, message jsonb)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read seasons');
  return query
    select e.id, e.look, e.starts_on, e.ends_on, e.title, e.message
    from public.season_events e order by e.starts_on desc limit 200;
end;
$$;

create or replace function public.owner_save_season(event uuid, event_look text, event_start date, event_end date,
                                                    event_title jsonb, event_message jsonb default null)
  returns uuid
  language plpgsql security definer set search_path = '' as $$
declare
  saved uuid;
begin
  perform private.require_owner('season.save', jsonb_build_object('event', event, 'look', event_look,
    'start', event_start, 'end', event_end, 'title', event_title ->> 'en'));
  if event is null then
    insert into public.season_events (look, starts_on, ends_on, title, message)
    values (event_look, event_start, event_end, event_title, event_message)
    returning id into saved;
  else
    update public.season_events e
      set look = event_look, starts_on = event_start, ends_on = event_end, title = event_title, message = event_message
      where e.id = event
      returning e.id into saved;
    if saved is null then
      raise exception 'event not found' using errcode = 'P0002';
    end if;
  end if;
  return saved;
end;
$$;

create or replace function public.owner_delete_season(event uuid)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('season.delete', jsonb_build_object('event', event));
  delete from public.season_events e where e.id = event;
end;
$$;

revoke execute on function public.season_events_current() from public;
grant execute on function public.season_events_current() to anon, authenticated;
revoke execute on function public.owner_seasons() from public, anon;
revoke execute on function public.owner_save_season(uuid, text, date, date, jsonb, jsonb) from public, anon;
revoke execute on function public.owner_delete_season(uuid) from public, anon;
grant execute on function public.owner_seasons() to authenticated;
grant execute on function public.owner_save_season(uuid, text, date, date, jsonb, jsonb) to authenticated;
grant execute on function public.owner_delete_season(uuid) to authenticated;
