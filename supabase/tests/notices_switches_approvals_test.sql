-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of announcements, remote switches and approval requests.
-- Paste into Supabase → SQL Editor and run. Aborts on purpose: NOTHING is saved.
-- Expected: "NOTICE TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid(); adm uuid := gen_random_uuid(); sup uuid := gen_random_uuid();
  victim uuid := gen_random_uuid(); ok boolean; j jsonb; req bigint; req2 bigint; n int;
begin
  insert into private.owners (email) values ('t2-boss@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 't2-boss@example.invalid', 'authenticated', 'authenticated', now()),
    (adm, 't2-admin@example.invalid', 'authenticated', 'authenticated', now()),
    (sup, 't2-support@example.invalid', 'authenticated', 'authenticated', now()),
    (victim, 't2-victim@example.invalid', 'authenticated', 'authenticated', now());
  insert into private.staff (email, name, role) values
    ('t2-admin@example.invalid', 'Ada', 'admin'), ('t2-support@example.invalid', 'Sam', 'support');
  set local role authenticated;

  -- Admin posts an announcement and pauses duels.
  perform set_config('request.jwt.claims', json_build_object('sub', adm, 'role', 'authenticated')::text, true);
  perform public.owner_save_announcement(null, '{"en":"Test notice","fr":"Avis"}', null, current_date, current_date + 3);
  perform public.owner_set_switch('duels', true, 'testing');
  ok := false; begin perform public.owner_set_switch('everything', true); exception when check_violation then ok := true; end;
  assert ok, 'unknown switch refused';

  -- Anyone (no account) sees them.
  set local role anon;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  j := public.app_notices();
  assert j -> 'off' ? 'duels', 'duels reported off';
  assert exists (select 1 from jsonb_array_elements(j -> 'announcements') e where e -> 'title' ->> 'en' = 'Test notice'), 'announcement visible';
  ok := false; begin perform public.owner_switches(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'anon cannot use the console';
  set local role authenticated;

  -- Support can't delete or post, but can ask.
  perform set_config('request.jwt.claims', json_build_object('sub', sup, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_set_switch('friends', true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'support cannot flip switches';
  req := public.owner_request_action('delete account', victim, 'Asked by email to be deleted');
  ok := false; begin perform public.owner_decide_action(req, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'support cannot approve';

  -- Admin can't approve either.
  perform set_config('request.jwt.claims', json_build_object('sub', adm, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_decide_action(req, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'admin cannot approve';
  select count(*) into n from public.owner_pending_actions() p where p.status = 'pending'; assert n >= 1, 'admin sees requests';

  -- Owner approves: the account is gone. Owner can't approve their own request.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_decide_action(req, true);
  reset role;
  assert not exists (select 1 from auth.users where id = victim), 'approved request ran';
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_decide_action(req, true); exception when no_data_found then ok := true; end;
  assert ok, 'cannot decide twice';
  req2 := public.owner_request_action('suspend account', adm, 'self test');
  ok := false; begin perform public.owner_decide_action(req2, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'requester cannot approve their own request';

  raise exception 'NOTICE TESTS PASSED (rolled back)';
end $$;
