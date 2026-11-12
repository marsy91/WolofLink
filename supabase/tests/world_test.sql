-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of WolofLink World. Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "WORLD TESTS PASSED (rolled back)".
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  d uuid := gen_random_uuid(); e uuid := gen_random_uuid();
  today text := to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  last_week text := to_char((now() at time zone 'utc')::date - 7, 'YYYY-MM-DD');
  s jsonb; s2 jsonb; ok boolean; base_xp integer; base_members integer; base_goal_last integer;
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (a, 't-wa@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 't-wb@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 't-wc@example.invalid', 'authenticated', 'authenticated', now()),
    (d, 't-wd@example.invalid', 'authenticated', 'authenticated', now()),
    (e, 't-we@example.invalid', 'authenticated', 'authenticated', now());
  insert into public.remote_switches (key, is_off) values ('world', false) on conflict (key) do update set is_off = false;

  -- What is already there (the live database may have real learners).
  delete from private.world_cache;
  s := public.world_summary();
  base_xp := (s ->> 'week_xp')::integer;
  base_members := (s ->> 'members')::integer;
  delete from private.world_cache;

  -- a, b and c learn from Senegal, d from Italy, e has no country. e earns 5,000 XP in one day.
  insert into public.progress (user_id, data) values
    (a, jsonb_build_object('xpByDay', jsonb_build_object(today, 100))),
    (b, jsonb_build_object('xpByDay', jsonb_build_object(today, 50))),
    (c, jsonb_build_object('xpByDay', jsonb_build_object(today, 'lots'))),
    (d, jsonb_build_object('xpByDay', jsonb_build_object(today, 30))),
    (e, jsonb_build_object('xpByDay', jsonb_build_object(today, 5000, 'not-a-day', 9)));

  -- Without an account: totals only.
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  ok := false; begin perform count(*) from public.world_members; exception when insufficient_privilege then ok := true; end;
  assert ok, 'the table is not readable';
  ok := false; begin perform public.set_world_country('SN'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'a country needs an account';
  ok := false; begin perform public.world_me(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'world_me needs an account';

  -- Signed in: pick, change, check.
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  assert public.world_me() is null, 'no country yet';
  ok := false; begin perform public.set_world_country('ZZ'); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'unknown country refused';
  ok := false; begin perform public.set_world_country('sn'); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'codes are upper case';
  perform public.set_world_country('FR');
  perform public.set_world_country('SN');
  assert public.world_me() = 'SN', 'changed to Senegal';
  ok := false; begin perform count(*) from public.world_members; exception when insufficient_privilege then ok := true; end;
  assert ok, 'learners cannot read the table either';
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_world_country('SN');
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform public.set_world_country('SN');
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  perform public.set_world_country('IT');

  -- The summary: Senegal shown (3 learners), Italy folded into "other countries".
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  s := public.world_summary();
  assert (s ->> 'week_start') <= today, 'week start';
  assert (s ->> 'members')::integer = base_members + 4, 'four new members: ' || s::text;
  assert (s ->> 'week_xp')::integer = base_xp + 100 + 50 + 30 + 2000, 'XP this week with the daily cap: ' || s::text;
  select exists (select 1 from jsonb_array_elements(s -> 'countries') x where x ->> 'c' = 'SN' and (x ->> 'n')::integer >= 3)
    into ok;
  assert ok, 'Senegal is on the map: ' || s::text;
  select not exists (select 1 from jsonb_array_elements(s -> 'countries') x where (x ->> 'n')::integer < 3) into ok;
  assert ok, 'no country with fewer than 3 learners is shown';
  assert (s -> 'other' ->> 'n')::integer >= 1, 'Italy counted under other countries';
  assert (s ->> 'goal')::integer >= 5000, 'the goal is at least 5,000';
  assert s ? 'active', 'active learners counted';

  -- Kept for 10 minutes: more XP does not change it until then.
  reset role;
  update public.progress set data = jsonb_build_object('xpByDay', jsonb_build_object(today, 700, last_week, 1000)) where user_id = d;
  set local role anon;
  s2 := public.world_summary();
  assert s2 = s, 'served from the cache';

  -- Changing a country refreshes it; null leaves the map.
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  perform public.set_world_country(null);
  assert public.world_me() is null, 'left the map';
  s2 := public.world_summary();
  assert (s2 ->> 'members')::integer = base_members + 3, 'three members after d left: ' || s2::text;
  assert (s2 ->> 'week_xp')::integer = base_xp + 100 + 50 + 700 + 2000, 'everyone with an account counts: ' || s2::text;

  -- The owner can pause it.
  reset role;
  update public.remote_switches set is_off = true where key = 'world';
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  assert public.world_summary() = '{"paused": true}'::jsonb, 'paused summary';
  ok := false; begin perform public.set_world_country('SN'); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'no changes while paused';

  -- Deleting the account deletes the country.
  reset role;
  delete from auth.users where id = a;
  assert not exists (select 1 from public.world_members w where w.user_id = a), 'deleted with the account';

  -- New league cities.
  assert private.valid_city('turin') and private.valid_city('louga') and private.valid_city('toronto'), 'new cities';
  assert private.valid_city('dakar') and not private.valid_city('atlantis'), 'old cities kept';

  raise exception 'WORLD TESTS PASSED (rolled back)';
end $$;
