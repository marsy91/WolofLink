-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the November 2026 security hardening. Paste into
-- Supabase → SQL Editor and run. It aborts on purpose so NOTHING is saved.
-- Expected: "SECURITY TESTS PASSED (rolled back)".
do $$
declare
  x uuid := gen_random_uuid();
  ok boolean;
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (x, 'test-sec@example.invalid', 'authenticated', 'authenticated', now());

  -- Unused table permissions are gone (they bypass row-level security).
  assert not has_table_privilege('authenticated', 'public.progress', 'TRUNCATE'), 'no truncate on progress';
  assert not has_table_privilege('authenticated', 'public.memberships', 'TRUNCATE'), 'no truncate on memberships';
  assert not has_table_privilege('authenticated', 'public.organisations', 'TRUNCATE'), 'no truncate on organisations';
  assert not has_table_privilege('anon', 'public.calendar_dates', 'TRUNCATE'), 'no truncate for anon';
  -- What the app uses still works.
  assert has_table_privilege('authenticated', 'public.progress', 'SELECT'), 'progress still readable';
  assert has_table_privilege('authenticated', 'public.progress', 'UPDATE'), 'progress still writable';

  -- Row-level security on every internal table.
  assert (select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'private' and c.relkind = 'r'), 'RLS on all private tables';

  -- Anonymous reports have their own cap and cannot block signed-in learners.
  insert into public.content_reports (entry_id, problem, created_at)
    select 'zz.flood', 'other', now() from generate_series(1, 200);
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  ok := false; begin perform public.report_problem('zz.test', 'audio'); exception when program_limit_exceeded then ok := true; end;
  assert ok, 'anonymous flood is capped';
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  perform public.report_problem('zz.test', 'spelling');
  ok := false; begin perform public.report_problem('zz.test', 'not-a-problem'); exception when check_violation then ok := true; end;
  assert ok, 'unknown problem types are refused';

  -- A learner can sync normal progress but not a huge blob.
  insert into public.progress (user_id, data) values (x, '{"xpTotal": 10}');
  ok := false;
  begin
    update public.progress set data = jsonb_build_object('junk', (select string_agg(md5(i::text), '') from generate_series(1, 20000) i))
      where user_id = x;
  exception when check_violation then ok := true; end;
  assert ok, 'progress size is capped';

  raise exception 'SECURITY TESTS PASSED (rolled back)';
end $$;
