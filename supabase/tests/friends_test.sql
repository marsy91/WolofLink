-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of friends. Expected: "FRIEND TESTS PASSED (rolled back)".
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  ca text; cb text; ok boolean; n int; nm text;
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (a, 'test-a@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 'test-b@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 'test-c@example.invalid', 'authenticated', 'authenticated', now());
  insert into public.progress (user_id, data) values
    (a, jsonb_build_object('xpByDay', jsonb_build_object(to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 40, '2020-01-01', 999), 'streak', '{"count": 3}'::jsonb)),
    (b, jsonb_build_object('xpByDay', jsonb_build_object(to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 70)));
  set local role authenticated;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.add_friend('AAAAAAAA'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'needs a name first';
  ok := false; begin perform public.set_friend_name('Big merde'); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'blocked word refused in names';
  select x.friend_code into ca from public.set_friend_name('Awa') x;
  ok := false; begin perform public.add_friend(ca); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'cannot add yourself';

  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select x.friend_code into cb from public.set_friend_name('Moussa') x;
  nm := public.add_friend(lower(ca));
  assert nm = 'Awa', 'adds by code, any case';
  select count(*) into n from public.friends_board(); assert n = 2, 'board has me and my friend';
  select f.week_xp into n from public.friends_board() f where f.display_name = 'Awa'; assert n = 40, 'week XP ignores old days: ' || n;
  select count(*) into n from public.friends_board() f where f.is_me and f.display_name = 'Moussa'; assert n = 1, 'me marked';
  perform public.nudge_friend(a);
  ok := false; begin perform public.nudge_friend(a); exception when program_limit_exceeded then ok := true; end;
  assert ok, 'one nudge a day';

  -- A stranger sees nothing and cannot nudge.
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Stranger');
  select count(*) into n from public.friends_board(); assert n = 1, 'stranger sees only themselves';
  ok := false; begin perform public.nudge_friend(a); exception when insufficient_privilege then ok := true; end;
  assert ok, 'stranger cannot nudge';
  ok := false; begin perform count(*) from public.friend_profiles; exception when insufficient_privilege then ok := true; end;
  assert ok, 'profiles table not readable directly';

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select count(*) into n from public.my_nudges(); assert n = 1, 'nudge received';
  select count(*) into n from public.my_nudges(); assert n = 0, 'nudge shown once';
  perform public.remove_friend(b);
  select count(*) into n from public.friends_board(); assert n = 1, 'removed';

  raise exception 'FRIEND TESTS PASSED (rolled back)';
end $$;
