-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of seasonal events. Expected: "SEASON TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid();
  x uuid := gen_random_uuid();
  ok boolean; n int; ev uuid;
begin
  insert into private.owners (email) values ('test-owner@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 'test-owner@example.invalid', 'authenticated', 'authenticated', now()),
    (x, 'test-x@example.invalid', 'authenticated', 'authenticated', now());
  set local role authenticated;

  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_save_season(null, 'sport', current_date, current_date + 3, '{"en":"Test"}'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learner cannot create events';

  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  ev := public.owner_save_season(null, 'sport', current_date, current_date + 3, '{"en":"Test week","fr":"Semaine test"}', '{"en":"Hello"}');
  ok := false; begin perform public.owner_save_season(null, 'sport', current_date, current_date - 1, '{"en":"Bad"}'); exception when check_violation then ok := true; end;
  assert ok, 'end before start refused';
  ok := false; begin perform public.owner_save_season(null, 'rainbow', current_date, current_date, '{"en":"Bad"}'); exception when check_violation then ok := true; end;
  assert ok, 'unknown look refused';
  ok := false; begin perform public.owner_save_season(null, 'sport', current_date, current_date, '{"fr":"Pas d''anglais"}'); exception when check_violation then ok := true; end;
  assert ok, 'English title required';

  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  select count(*) into n from public.season_events_current() e where e.id = ev;
  assert n = 1, 'anyone can read current events';

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_save_season(ev, 'festive', current_date, current_date + 1, '{"en":"Renamed"}');
  select count(*) into n from public.owner_seasons() e where e.id = ev and e.look = 'festive';
  assert n = 1, 'owner can edit';
  perform public.owner_delete_season(ev);
  select count(*) into n from public.owner_seasons() e where e.id = ev;
  assert n = 0, 'owner can delete';

  raise exception 'SEASON TESTS PASSED (rolled back)';
end $$;
