-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of duels. Expected: "DUEL TESTS PASSED (rolled back)".
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  ca text; ok boolean; n int; d uuid; r record;
  ten text[] := array['g.salaam','g.maalekum','g.nanga','g.fi','g.tudd','g.awa','g.jerejef','g.waaw','g.deedeet','g.babeneen'];
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (a, 'test-a@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 'test-b@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 'test-c@example.invalid', 'authenticated', 'authenticated', now());
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select x.friend_code into ca from public.set_friend_name('Awa') x;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Moussa');
  perform public.add_friend(ca);

  -- Moussa challenges Awa.
  d := public.create_duel(a, 42, ten, 900);
  ok := false; begin perform public.create_duel(c, 42, ten, 900); exception when insufficient_privilege then ok := true; end;
  assert ok, 'cannot duel a non-friend';
  ok := false; begin perform public.create_duel(a, 42, ten[1:9], 900); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'needs 10 questions';

  -- Awa sees it without Moussa's score, plays and wins.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select * into r from public.my_duels() x where x.id = d;
  assert r.their_score is null and r.status = 'waiting' and not r.i_challenged, 'score hidden until played';
  select * into r from public.play_duel(d, 1000);
  assert r.result = 'won' and r.trophies_won = 0, 'older apps still play but earn no trophies (see duel_trophies_test)';
  ok := false; begin perform public.play_duel(d, 1000); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'cannot play twice';
  select f.trophies into n from public.friends_board() f where f.is_me; assert n = 0, 'no trophies from older apps';

  -- Moussa can't play his own challenge; a stranger can't see it.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select f.trophies into n from public.friends_board() f where f.is_me; assert n = 0, 'no trophies from older apps either way';
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  select count(*) into n from public.my_duels(); assert n = 0, 'strangers see no duels';

  raise exception 'DUEL TESTS PASSED (rolled back)';
end $$;
