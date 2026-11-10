-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the duel rules: never the same entry twice, 1 trophy per
-- entry answered right (once), crowns per round, a second chance for missed entries
-- only after everything has been played. Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "DUEL TROPHY TESTS PASSED (rolled back)".
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  ca text; ok boolean; n int; r record; d1 uuid; d2 uuid; e1 text[]; e2 text[]; w text[];
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (a, 't-da@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 't-db@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 't-dc@example.invalid', 'authenticated', 'authenticated', now());
  -- A small course of 20 entries, so the test can play through all of it.
  delete from private.duel_entries x where x.id not in (select y.id from private.duel_entries y order by y.id limit 20);
  update public.remote_switches set is_off = false where key in ('duels', 'friends');
  set local role authenticated;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select x.friend_code into ca from public.set_friend_name('Awa') x;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Cheikh');
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Moussa');
  perform public.add_friend(ca);

  -- The server picks the entries; never a stranger; two open duels never share an entry.
  ok := false; begin perform * from public.start_duel(c); exception when insufficient_privilege then ok := true; end;
  assert ok, 'cannot duel a non-friend';
  select x.duel, x.entries into d1, e1 from public.start_duel(a) x;
  select x.duel, x.entries into d2, e2 from public.start_duel(a) x;
  assert cardinality(e1) = 10 and cardinality(e2) = 10, 'ten entries each';
  assert (select count(distinct v) from unnest(e1 || e2) v) = 20, 'open duels never share an entry';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select count(*) into n from public.my_duels(); assert n = 0, 'a duel being played is not shown yet';
  ok := false; begin perform public.finish_duel(d1, array[150,0,120,100,0,0,130,0,100,0]); exception when no_data_found then ok := true; end;
  assert ok, 'only the challenger finishes';

  -- Moussa sends both: 1 trophy per entry right.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.finish_duel(d1, array[150,0,120]); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'ten answers needed';
  ok := false; begin perform public.finish_duel(d1, array[999,0,0,0,0,0,0,0,0,0]); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'points capped at 150';
  n := public.finish_duel(d1, array[150,0,120,100,0,0,130,0,100,0]); assert n = 5, 'five right, five trophies: ' || n;
  ok := false; begin perform public.finish_duel(d1, array[150,0,120,100,0,0,130,0,100,0]); exception when no_data_found then ok := true; end;
  assert ok, 'cannot send twice';
  n := public.finish_duel(d2, array[100,100,100,100,100,100,100,100,100,100]); assert n = 10, 'ten right';
  select f.trophies into n from public.friends_board() f where f.is_me; assert n = 15, 'trophies on the board';

  -- Awa answers: rounds 300-270 (crown), 0-100, 300-230 (crown) → 2 crowns to 1, she wins.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select * into r from public.my_duels() x where x.id = d1;
  assert r.their_score is null and r.status = 'waiting', 'score hidden until played';
  select * into r from public.answer_duel(d1, array[100,100,100,0,0,0,150,150,0,0]);
  assert r.my_crowns = 2 and r.their_crowns = 1 and r.result = 'won' and r.trophies_won = 5, 'crowns decide: ' || row_to_json(r)::text;
  ok := false; begin perform public.answer_duel(d1, array[100,100,100,0,0,0,150,150,0,0]); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'cannot answer twice';
  select * into r from public.answer_duel(d2, array[0,0,0,0,0,0,0,0,0,0]);
  assert r.result = 'lost' and r.trophies_won = 0 and r.my_crowns = 0 and r.their_crowns = 3, 'three crowns to none';
  select f.week_crowns into n from public.friends_board() f where f.is_me; assert n = 2, 'crowns this week';
  select x.my_crowns into n from public.my_duels() x where x.id = d1; assert n = 2, 'crowns in the duel list';
  select x.trophies, x.total, x.unseen, x.second_chance into r from public.my_duel_words() x;
  assert r.trophies = 5 and r.total = 20 and r.unseen = 0 and r.second_chance = 15, 'progress: ' || row_to_json(r)::text;
  ok := false; begin perform public.my_duel_words(); perform count(*) from public.duel_words; exception when insufficient_privilege then ok := true; end;
  assert ok, 'duel_words not readable directly';

  -- Everything played: only missed entries come back, and only ones new to both.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  ok := false; begin perform * from public.start_duel(a); exception when raise_exception then ok := true; end;
  assert ok, 'no new words left together';

  reset role;
  select count(*) into n from private.duel_available(a); assert n = 15, 'second chance for the 15 Awa missed: ' || n;
  select array_agg(x.entry order by x.entry) into w from public.duel_words x where x.user_id = a and x.state = 'wrong';
  n := private.record_duel_words(a, array[w[1]], array[0]);
  assert (select x.state from public.duel_words x where x.user_id = a and x.entry = w[1]) = 'retired', 'missed twice: gone for good';
  n := private.record_duel_words(a, array[w[2]], array[120]); assert n = 1, 'right on the second chance earns the trophy';
  n := private.record_duel_words(a, array[w[2]], array[120]); assert n = 0, 'never twice for one entry';
  select count(*) into n from private.duel_available(a); assert n = 13, 'retired and won entries leave the pool';
  select x.trophies into n from public.friend_profiles x where x.user_id = a; assert n = 6, 'trophies match entries right';
  assert n <= (select count(*) from private.duel_entries), 'never more trophies than entries';

  -- The remote switch pauses new duels.
  insert into public.remote_switches (key, is_off) values ('duels', true) on conflict (key) do update set is_off = true;
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  ok := false; begin perform * from public.start_duel(a); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'paused';

  raise exception 'DUEL TROPHY TESTS PASSED (rolled back)';
end $$;
