-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of staff roles. Paste into Supabase → SQL Editor and run.
-- Uses temporary users, then aborts on purpose so NOTHING is saved.
-- Expected: "STAFF TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid(); adm uuid := gen_random_uuid(); sup uuid := gen_random_uuid();
  ana uuid := gen_random_uuid(); nobody uuid := gen_random_uuid(); ok boolean; n int;
begin
  insert into private.owners (email) values ('t-boss@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 't-boss@example.invalid', 'authenticated', 'authenticated', now()),
    (adm, 't-admin@example.invalid', 'authenticated', 'authenticated', now()),
    (sup, 't-support@example.invalid', 'authenticated', 'authenticated', now()),
    (ana, 't-analyst@example.invalid', 'authenticated', 'authenticated', now()),
    (nobody, 't-nobody@example.invalid', 'authenticated', 'authenticated', now());
  set local role authenticated;

  -- Owner invites staff.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  assert public.owner_role() = 'owner', 'owner role';
  perform public.owner_save_staff('T-Admin@example.invalid', 'Ada', 'admin');
  perform public.owner_save_staff('t-support@example.invalid', 'Sam', 'support');
  perform public.owner_save_staff('t-analyst@example.invalid', 'Ana', 'analyst');
  ok := false; begin perform public.owner_save_staff('t-boss@example.invalid', 'x', 'admin'); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'cannot add the owner as staff';
  ok := false; begin perform public.owner_save_staff('t-x@example.invalid', 'x', 'owner'); exception when check_violation then ok := true; end;
  assert ok, 'cannot invent an owner role';

  -- A stranger has no role and no access.
  perform set_config('request.jwt.claims', json_build_object('sub', nobody, 'role', 'authenticated')::text, true);
  assert public.owner_role() is null, 'stranger has no role';
  ok := false; begin perform public.owner_overview(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'stranger refused';
  ok := false; begin perform public.owner_staff(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'stranger cannot list staff';

  -- Admin: operational yes, destructive/team no.
  perform set_config('request.jwt.claims', json_build_object('sub', adm, 'role', 'authenticated')::text, true);
  assert public.owner_role() = 'admin', 'admin role';
  perform public.owner_overview();
  perform public.owner_people('');
  select count(*) into n from public.owner_audit(10); assert n >= 1, 'admin reads log (shows who)';
  ok := false; begin perform public.owner_delete_account(nobody); exception when insufficient_privilege then ok := true; end;
  assert ok, 'admin cannot delete accounts';
  ok := false; begin perform public.owner_save_staff('t-y@example.invalid', 'y', 'admin'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'admin cannot manage staff';
  ok := false; begin perform public.owner_set_grants(nobody, true, false, null, null); exception when insufficient_privilege then ok := true; end;
  assert ok, 'admin cannot give grants';

  -- Support: overview + people, but not suspend or the log.
  perform set_config('request.jwt.claims', json_build_object('sub', sup, 'role', 'authenticated')::text, true);
  perform public.owner_overview();
  perform public.owner_people('');
  ok := false; begin perform public.owner_set_suspended(nobody, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'support cannot suspend';
  ok := false; begin perform public.owner_audit(5); exception when insufficient_privilege then ok := true; end;
  assert ok, 'support cannot read the log';

  -- Analyst: numbers only, no personal lists.
  perform set_config('request.jwt.claims', json_build_object('sub', ana, 'role', 'authenticated')::text, true);
  perform public.owner_overview();
  ok := false; begin perform public.owner_people(''); exception when insufficient_privilege then ok := true; end;
  assert ok, 'analyst cannot see people';

  -- Deactivating or removing staff takes access away at once.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_save_staff('t-support@example.invalid', 'Sam', 'support', false);
  perform public.owner_remove_staff('t-analyst@example.invalid');
  perform set_config('request.jwt.claims', json_build_object('sub', sup, 'role', 'authenticated')::text, true);
  assert public.owner_role() is null, 'deactivated support has no role';
  perform set_config('request.jwt.claims', json_build_object('sub', ana, 'role', 'authenticated')::text, true);
  assert public.owner_role() is null, 'removed analyst has no role';

  raise exception 'STAFF TESTS PASSED (rolled back)';
end $$;
