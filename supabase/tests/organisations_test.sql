-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of organisations, team codes and their access rules.
-- Paste into Supabase → SQL Editor and run. It creates temporary test users,
-- checks every rule, then aborts on purpose so NOTHING is saved.
-- Expected result: an error that says "ALL TESTS PASSED (rolled back)".
-- Any other message names the rule that failed.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  c uuid := gen_random_uuid();
  org uuid; code text; n int; ok boolean;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'test-admin@example.invalid', 'authenticated', 'authenticated'),
    (b, 'test-member@example.invalid', 'authenticated', 'authenticated'),
    (c, 'test-outsider@example.invalid', 'authenticated', 'authenticated');
  insert into public.progress (user_id, data) values (b, '{"xpTotal": 120, "lessons": {"greetings-1": {}, "greetings-2": {}}, "streak": {"count": 4}}');
  -- The owner creates an organisation (owner console) with A as its admin.
  -- Learners can no longer create organisations themselves (20261116000000_org_team_plan.sql).
  insert into public.organisations (name, join_code, created_by, plan)
    values ('Test NGO', private.new_join_code(), a, 'paid') returning id, join_code into org, code;
  insert into public.memberships (org_id, user_id, role, display_name) values (org, a, 'admin', 'Admin A');
  assert code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$', 'code format';
  set local role authenticated;
  -- A member joins, typing the code in lower case with spaces.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.join_organisation(lower(substr(code,1,4)) || ' - ' || substr(code,5), 'Member B');
  select count(*) into n from public.memberships; assert n = 1, 'member sees only own membership: ' || n;
  select count(*) into n from public.organisations; assert n = 1, 'member sees their organisation';
  ok := false; begin perform public.organisation_report(org); exception when insufficient_privilege then ok := true; end;
  assert ok, 'member cannot read the report';
  ok := false; begin insert into public.memberships (org_id, user_id, role, display_name) values (org, b, 'admin', 'x'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'member cannot make themselves admin';
  ok := false; begin perform public.join_organisation('ZZZZZZZZ', 'Member B'); exception when no_data_found then ok := true; end;
  assert ok, 'unknown code is rejected';
  -- Someone outside the organisation sees nothing.
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  select count(*) into n from public.organisations; assert n = 0, 'outsider sees no organisation';
  select count(*) into n from public.memberships; assert n = 0, 'outsider sees no memberships';
  -- The admin's report shows the member's progress summary.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select count(*) into n from public.organisation_report(org); assert n = 2, 'report has 2 rows';
  select r.xp into n from public.organisation_report(org) r where r.display_name = 'Member B'; assert n = 120, 'xp in report';
  select r.lessons into n from public.organisation_report(org) r where r.display_name = 'Member B'; assert n = 2, 'lessons in report';
  select count(*) into n from public.memberships; assert n = 2, 'admin sees the members';
  -- The member leaves.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  delete from public.memberships where user_id = b;
  select count(*) into n from public.memberships; assert n = 0, 'member left';
  -- Visitors who aren't signed in can't use team codes.
  reset role; set local role anon;
  ok := false; begin perform public.join_organisation(code, 'x'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'anon cannot join';
  raise exception 'ALL TESTS PASSED (rolled back)';
end $$;
