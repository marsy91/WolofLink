-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the holiday calendar. Paste into Supabase → SQL Editor
-- and run. It aborts on purpose so NOTHING is saved.
-- Expected: "CALENDAR TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid();
  x uuid := gen_random_uuid();
  ok boolean; n int; yr int := extract(year from now())::int + 1;
begin
  insert into private.owners (email) values ('test-owner@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 'test-owner@example.invalid', 'authenticated', 'authenticated', now()),
    (x, 'test-x@example.invalid', 'authenticated', 'authenticated', now());
  set local role authenticated;

  -- A normal user can read but not write.
  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_set_calendar_date('tabaski', yr, make_date(yr, 5, 17), true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'normal user cannot set dates';
  ok := false; begin insert into public.calendar_dates (holiday_id, year, day) values ('tabaski', yr, make_date(yr, 5, 17)); exception when insufficient_privilege then ok := true; end;
  assert ok, 'normal user cannot insert directly';

  -- The owner sets, corrects and clears a date.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_set_calendar_date('tabaski', yr, make_date(yr, 5, 17), false, 'estimate');
  perform public.owner_set_calendar_date('tabaski', yr, make_date(yr, 5, 18), true);
  select count(*) into n from public.calendar_dates_current() c where c.holiday_id = 'tabaski' and c.day = make_date(yr, 5, 18) and c.confirmed;
  assert n = 1, 'owner can confirm a date';
  ok := false; begin perform public.owner_set_calendar_date('tabaski', yr, make_date(yr + 1, 5, 18), true); exception when check_violation then ok := true; end;
  assert ok, 'date must fall in the given year';

  -- Signed-out visitors can read.
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  select count(*) into n from public.calendar_dates_current() c where c.holiday_id = 'tabaski';
  assert n = 1, 'anyone can read dates';
  ok := false; begin perform public.owner_clear_calendar_date('tabaski', yr); exception when insufficient_privilege then ok := true; end;
  assert ok, 'anon cannot clear dates';

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_clear_calendar_date('tabaski', yr);
  select count(*) into n from public.calendar_dates_current() c where c.holiday_id = 'tabaski' and c.year = yr;
  assert n = 0, 'owner can clear a date';

  raise exception 'CALENDAR TESTS PASSED (rolled back)';
end $$;
