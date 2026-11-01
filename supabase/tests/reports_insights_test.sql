-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of problem reports and most-missed words. Paste into
-- Supabase → SQL Editor and run. It aborts on purpose so NOTHING is saved.
-- Expected: "REPORT TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid();
  x uuid := gen_random_uuid();
  y uuid := gen_random_uuid();
  ok boolean; n int; rid bigint; rate numeric;
begin
  insert into private.owners (email) values ('test-owner@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 'test-owner@example.invalid', 'authenticated', 'authenticated', now()),
    (x, 'test-x@example.invalid', 'authenticated', 'authenticated', now()),
    (y, 'test-y@example.invalid', 'authenticated', 'authenticated', now());
  insert into public.progress (user_id, data) values
    (x, '{"srs": {"zz.test1": {"right": 1, "wrong": 9}, "zz.test2": {"right": 10, "wrong": 0}}}'),
    (y, '{"srs": {"zz.test1": {"right": 0, "wrong": 5}, "zz.bad": "nonsense"}}');

  -- A signed-out visitor and a learner can report; neither can read reports.
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform public.report_problem('zz.test1', 'audio', 'sounds cut off', 'fr', '0.13.0');
  ok := false; begin perform public.owner_reports(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'anon cannot read reports';

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  perform public.report_problem('zz.test1', 'spelling');
  ok := false; begin perform public.report_problem('zz.test1', 'rude'); exception when check_violation then ok := true; end;
  assert ok, 'unknown problem kind refused';
  ok := false; begin perform public.owner_reports(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learner cannot read reports';
  ok := false; begin perform public.owner_missed_words(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learner cannot read missed words';
  ok := false; begin perform count(*) from public.content_reports; exception when insufficient_privilege then ok := true; end;
  assert ok, 'table is not readable directly';

  -- The owner reads, resolves, and sees missed words.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  select count(*) into n from public.owner_reports('open') r where r.entry_id = 'zz.test1';
  assert n = 2, 'owner sees both reports';
  select r.id into rid from public.owner_reports('open') r where r.entry_id = 'zz.test1' and r.problem = 'audio';
  perform public.owner_set_report_status(rid, 'fixed');
  select count(*) into n from public.owner_reports('open') r where r.entry_id = 'zz.test1';
  assert n = 1, 'fixed report leaves the open list';
  select m.miss_rate into rate from public.owner_missed_words(5, 500) m where m.entry_id = 'zz.test1';
  assert rate = 0.933, 'miss rate is 14 of 15: ' || coalesce(rate::text, 'null');
  select count(*) into n from public.owner_missed_words(5, 500) m where m.entry_id = 'zz.bad';
  assert n = 0, 'malformed cards are skipped';

  raise exception 'REPORT TESTS PASSED (rolled back)';
end $$;
