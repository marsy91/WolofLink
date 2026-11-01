-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of account grants. Paste into Supabase → SQL Editor and
-- run. It aborts on purpose so NOTHING is saved.
-- Expected: "GRANT TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid();
  x uuid := gen_random_uuid();
  y uuid := gen_random_uuid();
  ok boolean; g record; org uuid; code text;
begin
  insert into private.owners (email) values ('test-owner@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 'test-owner@example.invalid', 'authenticated', 'authenticated', now()),
    (x, 'test-x@example.invalid', 'authenticated', 'authenticated', now()),
    (y, 'test-y@example.invalid', 'authenticated', 'authenticated', now());
  set local role authenticated;

  -- A learner starts with nothing and cannot grant themselves anything.
  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  select * into g from public.my_grants();
  assert not g.unlock_all and not g.premium, 'learner starts with nothing';
  ok := false; begin perform public.owner_set_grants(x, true, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learner cannot grant';
  ok := false; begin insert into public.account_grants (user_id, unlock_all) values (x, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learner cannot write the table';

  -- The owner has everything and can grant.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  select * into g from public.my_grants();
  assert g.unlock_all and g.premium and g.source = 'owner', 'owner has everything';
  perform public.owner_set_grants(x, true, true, now() + interval '30 days', 'tester');
  perform public.owner_set_grants(y, false, true, now() - interval '1 day');

  perform set_config('request.jwt.claims', json_build_object('sub', x, 'role', 'authenticated')::text, true);
  select * into g from public.my_grants();
  assert g.unlock_all and g.premium and g.source = 'granted', 'granted learner has both';

  perform set_config('request.jwt.claims', json_build_object('sub', y, 'role', 'authenticated')::text, true);
  select * into g from public.my_grants();
  assert not g.premium, 'expired premium is off';

  -- Members of an active paid organisation get Premium.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  select c.id, c.join_code into org, code from public.owner_create_organisation('Grant Test Org', 'paid', 10) c;
  perform set_config('request.jwt.claims', json_build_object('sub', y, 'role', 'authenticated')::text, true);
  perform public.join_organisation(code, 'Y');
  select * into g from public.my_grants();
  assert g.premium and g.source = 'organisation', 'paid organisation gives premium';

  -- Removing grants.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_set_grants(x, false, false);
  assert not exists (select 1 from public.owner_grants() o where o.user_id = x), 'grants removed';

  raise exception 'GRANT TESTS PASSED (rolled back)';
end $$;
