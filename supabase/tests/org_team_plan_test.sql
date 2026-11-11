-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the organisation Team plan (20261116000000_org_team_plan.sql).
-- Paste into Supabase → SQL Editor and run. It creates temporary test users,
-- checks every rule, then aborts on purpose so NOTHING is saved.
-- Expected result: an error that says "ALL TESTS PASSED (rolled back)".
-- Any other message names the rule that failed.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  org uuid; code text; n int; ok boolean; s record;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'test-admin@example.invalid', 'authenticated', 'authenticated'),
    (b, 'test-member@example.invalid', 'authenticated', 'authenticated');
  insert into public.organisations (name, join_code, created_by, plan, seats, notes)
    values ('Test NGO', private.new_join_code(), a, 'paid', 10, 'owner-only note') returning id, join_code into org, code;
  insert into public.memberships (org_id, user_id, role, display_name) values
    (org, a, 'admin', 'Admin A'), (org, b, 'member', 'Member B');

  set local role authenticated;
  -- Learners can't create organisations any more.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.create_organisation('Free for all', 'B'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learners cannot call create_organisation';
  -- Members see the organisation's name, not the owner's notes or the plan.
  select count(*) into n from public.organisations where name = 'Test NGO'; assert n = 1, 'member sees the name';
  ok := false; begin perform (select o.notes from public.organisations o limit 1); exception when insufficient_privilege then ok := true; end;
  assert ok, 'member cannot read notes';
  ok := false; begin perform (select o.join_code from public.organisations o limit 1); exception when insufficient_privilege then ok := true; end;
  assert ok, 'member cannot read the team code column directly';
  -- A plain member is not an admin of anything.
  select count(*) into n from public.org_admin_summary(); assert n = 0, 'member has no admin summary';

  -- The admin sees the team code, seats and member count, with the plan active.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select * into s from public.org_admin_summary();
  assert s.org_id = org and s.join_code = code, 'admin summary has the team code';
  assert s.members = 2 and s.seats = 10 and s.plan = 'paid', 'admin summary has members, seats and plan';
  assert s.team_active, 'paid plan is active';
  select count(*) into n from public.organisation_report(org); assert n = 2, 'report works on an active plan';

  -- Free plan: no dashboard.
  reset role; update public.organisations set plan = 'free' where id = org; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  assert not (select x.team_active from public.org_admin_summary() x), 'free plan is not active';
  ok := false; begin perform public.organisation_report(org); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'free plan cannot read the report';

  -- Paid but past its paid-until date: no dashboard.
  reset role; update public.organisations set plan = 'paid', paid_until = current_date - 1 where id = org; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.organisation_report(org); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'expired plan cannot read the report';

  -- Suspended: no dashboard.
  reset role; update public.organisations set paid_until = current_date + 30, status = 'suspended' where id = org; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.organisation_report(org); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'suspended organisation cannot read the report';

  -- Pilot (the free trial) works.
  reset role; update public.organisations set status = 'active', plan = 'pilot' where id = org; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select count(*) into n from public.organisation_report(org); assert n = 2, 'pilot plan can read the report';

  -- A member still can't read the report, whatever the plan.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.organisation_report(org); exception when insufficient_privilege then ok := true; end;
  assert ok, 'member cannot read the report';

  -- Visitors who aren't signed in get nothing.
  reset role; set local role anon;
  ok := false; begin perform public.org_admin_summary(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'anon cannot read the admin summary';
  raise exception 'ALL TESTS PASSED (rolled back)';
end $$;
