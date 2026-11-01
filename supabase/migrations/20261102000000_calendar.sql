-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Holiday calendar: the owner confirms or corrects holiday dates (above all the
-- Islamic ones, which depend on moon sighting) so the app can update them
-- without a new release. Anyone, signed in or not, can read them; only the owner
-- can change them, through the functions below (checked and logged on the server).

create table if not exists public.calendar_dates (
  holiday_id text not null check (holiday_id ~ '^[a-z0-9-]{1,40}$'),
  year       integer not null check (year between 2024 and 2100),
  day        date not null,
  confirmed  boolean not null default false,
  note       text check (char_length(note) <= 200),
  updated_at timestamptz not null default now(),
  primary key (holiday_id, year),
  check (extract(year from day) = year)
);

alter table public.calendar_dates enable row level security;
revoke all on public.calendar_dates from public, anon, authenticated;
grant select on public.calendar_dates to anon, authenticated;

drop policy if exists "calendar dates are public" on public.calendar_dates;
create policy "calendar dates are public" on public.calendar_dates
  for select to anon, authenticated using (true);

-- Read for the app: this year and later only (a small payload).
create or replace function public.calendar_dates_current()
  returns table (holiday_id text, year integer, day date, confirmed boolean)
  language sql stable security invoker set search_path = '' as $$
  select c.holiday_id, c.year, c.day, c.confirmed
  from public.calendar_dates c
  where c.year >= extract(year from now())::int - 1
  order by c.day;
$$;

create or replace function public.owner_set_calendar_date(holiday text, yr integer, holiday_day date, is_confirmed boolean, holiday_note text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('calendar.set',
    jsonb_build_object('holiday', holiday, 'year', yr, 'day', holiday_day, 'confirmed', is_confirmed));
  insert into public.calendar_dates (holiday_id, year, day, confirmed, note, updated_at)
  values (holiday, yr, holiday_day, is_confirmed, nullif(trim(holiday_note), ''), now())
  on conflict (holiday_id, year) do update
    set day = excluded.day, confirmed = excluded.confirmed, note = excluded.note, updated_at = now();
end;
$$;

create or replace function public.owner_clear_calendar_date(holiday text, yr integer)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('calendar.clear', jsonb_build_object('holiday', holiday, 'year', yr));
  delete from public.calendar_dates c where c.holiday_id = holiday and c.year = yr;
end;
$$;

revoke execute on function public.calendar_dates_current() from public;
grant execute on function public.calendar_dates_current() to anon, authenticated;
revoke execute on function public.owner_set_calendar_date(text, integer, date, boolean, text) from public, anon;
revoke execute on function public.owner_clear_calendar_date(text, integer) from public, anon;
grant execute on function public.owner_set_calendar_date(text, integer, date, boolean, text) to authenticated;
grant execute on function public.owner_clear_calendar_date(text, integer) to authenticated;
