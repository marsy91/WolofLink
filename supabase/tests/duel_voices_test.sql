-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of voice swap in two-way duels. Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "DUEL VOICE TESTS PASSED (rolled back)".
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); k uuid := gen_random_uuid();
  ca text; d uuid; d2 uuid; ok boolean; n int; clip text := encode(convert_to(repeat('x', 400), 'UTF8'), 'base64'); r record;
  words text[] := array['g.salaam','g.nanga','g.jerejef','n.1','n.2','n.3','f.ceeb','f.ndox','p.yaay','p.baay'];
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (a, 't-va@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 't-vb@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 't-vc@example.invalid', 'authenticated', 'authenticated', now()),
    (k, 't-vk@example.invalid', 'authenticated', 'authenticated', now());
  insert into public.remote_switches (key, is_off) values ('duels', false) on conflict (key) do update set is_off = false;

  set local role authenticated;
  -- a: adult Wolof learner. b: adult Wolof speaker learning English. c: adult learner. k: under 18, learning English.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select x.friend_code into ca from public.set_friend_name('Awa') x;
  perform public.set_community(null, false, true);
  perform public.set_learning('wo');
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Moussa'); perform public.set_community(null, false, true); perform public.set_learning('en');
  perform public.add_friend(ca);
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Coumba'); perform public.set_community(null, false, true); perform public.set_learning('wo');
  perform public.add_friend(ca);
  perform set_config('request.jwt.claims', json_build_object('sub', k, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Kid'); perform public.set_learning('en');
  perform public.add_friend(ca);

  reset role;
  insert into public.duels (challenger, opponent, seed, entries, challenger_score, status) values (a, b, 7, words, 900, 'waiting') returning id into d;
  set local role authenticated;

  -- a records a word in English for b (a learns Wolof, so a speaks the partner's language).
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.send_duel_voice(d, 'g.salaam', 'wo', 'audio/webm', clip); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'a learner records in the partner''s language, not Wolof';
  ok := false; begin perform public.send_duel_voice(d, 'x.notinduel', 'en', 'audio/webm', clip); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'only a word from the duel';
  ok := false; begin perform public.send_duel_voice(d, 'g.salaam', 'en', 'audio/webm', 'not base64!!'); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'bad audio refused';
  perform public.send_duel_voice(d, 'g.salaam', 'en', 'audio/webm', clip);
  ok := false; begin perform count(*) from public.duel_voices; exception when insufficient_privilege then ok := true; end;
  assert ok, 'the table is closed';
  select count(*) into n from public.get_duel_voice(d); assert n = 0, 'you cannot fetch your own clip';

  -- b sees it waiting, hears it once, and a second fetch still works within 10 minutes.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.my_duel_voices(); assert n = 1, 'a clip is waiting';
  select * into r from public.get_duel_voice(d);
  assert r.entry_id = 'g.salaam' and r.lang = 'en' and r.audio = clip, 'b gets the clip';
  select count(*) into n from public.my_duel_voices(); assert n = 0, 'no longer waiting once heard';
  perform public.send_duel_voice(d, 'n.1', 'wo', 'audio/webm', clip);

  -- Someone outside the duel gets nothing.
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  select count(*) into n from public.get_duel_voice(d); assert n = 0, 'outsiders get nothing';

  -- Not two-way (two learners) and under-18s are refused.
  reset role;
  insert into public.duels (challenger, opponent, seed, entries, challenger_score, status) values (a, c, 8, words, 900, 'waiting') returning id into d2;
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.send_duel_voice(d2, 'g.salaam', 'wo', 'audio/webm', clip); exception when insufficient_privilege then ok := true; end;
  assert ok, 'only in two-way duels';
  reset role;
  insert into public.duels (challenger, opponent, seed, entries, challenger_score, status) values (a, k, 9, words, 900, 'waiting') returning id into d2;
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.send_duel_voice(d2, 'g.salaam', 'en', 'audio/webm', clip); exception when insufficient_privilege then ok := true; end;
  assert ok, 'never with someone under 18';

  -- a reports b's clip: deleted at once, report filed.
  perform public.report_duel_voice(d, 'rude');
  select count(*) into n from public.get_duel_voice(d); assert n = 0, 'reported clip deleted';
  reset role;
  select count(*) into n from public.user_reports u where u.reporter = a and u.reported = b and u.reason = 'inappropriate voice'; assert n = 1, 'report filed';

  -- Old clips are purged: heard more than 10 minutes ago, or older than 3 days.
  update public.duel_voices set heard_at = now() - interval '11 minutes' where duel_id = d and speaker = a;
  perform private.purge_duel_voices();
  select count(*) into n from public.duel_voices where duel_id = d; assert n = 0, 'heard clips purged';

  -- Deleting the duel deletes its clips.
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.send_duel_voice(d, 'g.salaam', 'en', 'audio/webm', clip);
  reset role;
  delete from public.duels where id = d;
  select count(*) into n from public.duel_voices where duel_id = d; assert n = 0, 'deleted with the duel';

  raise exception 'DUEL VOICE TESTS PASSED (rolled back)';
end $$;
