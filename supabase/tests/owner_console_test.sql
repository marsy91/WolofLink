-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the owner console. Paste into Supabase → SQL Editor
-- and run. It uses temporary users and a temporary test owner, then aborts on
-- purpose so NOTHING is saved. Expected: "OWNER TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid();
  x uuid := gen_random_uuid();
  y uuid := gen_random_uuid();
  org uuid; code text; code2 text; n int; ok boolean; j jsonb;
begin
  insert into private.owners (email) values ('test-owner@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 'test-owner@example.invalid', 'authenticated', 'authenticated', now()),
    (x, 'test-x@example.invalid', 'authenticated', 'authenticated', now()),
    (y, 'test-y@example.invalid', 'authenticated', 'authenticated', now());
  set local role authenticated;

  -- A normal user is refused everywhere.
  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  assert not public.owner_check(), 'normal user is not owner';
  ok := false; begin perform public.owner_overview(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'normal user cannot see the overview';
  ok := false; begin perform public.owner_people(''); exception when insufficient_privilege then ok := true; end;
  assert ok, 'normal user cannot list people';
  ok := false; begin perform public.owner_set_suspended(y, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'normal user cannot suspend accounts';

  -- The owner.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  assert public.owner_check(), 'owner is recognised';
  j := public.owner_overview();
  assert (j ->> 'learners')::int >= 3, 'overview counts learners';
  select c.id, c.join_code into org, code from public.owner_create_organisation('Embassy Test', 'paid', 1) c;
  select count(*) into n from public.owner_organisations() o where o.id = org; assert n = 1, 'org listed';

  -- Seat limit: one seat.
  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  perform public.join_organisation(code, 'X');
  perform set_config('request.jwt.claims', json_build_object('sub', y, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.join_organisation(code, 'Y'); exception when program_limit_exceeded then ok := true; end;
  assert ok, 'full organisation refuses new members';

  -- Owner suspends the organisation, then nobody new can join.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_update_organisation(org, 'Embassy Test', 'suspended', 'paid', 10, current_date + 30, 'note');
  perform set_config('request.jwt.claims', json_build_object('sub', y, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.join_organisation(code, 'Y'); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'suspended organisation refuses new members';

  -- Owner manages members.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_update_organisation(org, 'Embassy Test', 'active', 'paid', 10, null, null);
  perform public.owner_add_member(org, 'TEST-Y@example.invalid', 'Y', 'admin');
  select count(*) into n from public.owner_members(org); assert n = 2, 'two members';
  perform public.owner_set_role(org, y, 'member');
  select count(*) into n from public.owner_members(org) m where m.role = 'admin'; assert n = 0, 'role changed';
  perform public.owner_remove_member(org, y);
  select count(*) into n from public.owner_members(org); assert n = 1, 'member removed';
  code2 := public.owner_new_code(org); assert code2 <> code, 'new code issued';

  -- Accounts.
  select count(*) into n from public.owner_people('test-x'); assert n = 1, 'search people';
  perform public.owner_set_suspended(x, true);
  select count(*) into n from public.owner_people('test-x') p where p.suspended; assert n = 1, 'suspended';
  perform public.owner_set_suspended(x, false);
  ok := false; begin perform public.owner_set_suspended(boss, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'owner cannot suspend themselves';
  perform public.owner_delete_account(y);
  select count(*) into n from public.owner_people('test-y'); assert n = 0, 'account deleted';
  perform public.owner_delete_organisation(org);
  select count(*) into n from public.owner_organisations() o where o.id = org; assert n = 0, 'organisation deleted';
  select count(*) into n from public.owner_audit(50); assert n >= 8, 'actions are in the audit log';

  raise exception 'OWNER TESTS PASSED (rolled back)';
end $$;
