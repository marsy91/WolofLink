-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of two-way duels. Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "TWO-WAY DUEL TESTS PASSED (rolled back)".
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  ca text; ok boolean; v text;
begin
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (a, 't-2a@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 't-2b@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 't-2c@example.invalid', 'authenticated', 'authenticated', now());

  -- Without an account: nothing.
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  ok := false; begin perform public.set_learning('en'); exception when insufficient_privilege then ok := true; end;
  assert ok, 'needs an account';
  ok := false; begin perform public.friend_learning(a); exception when insufficient_privilege then ok := true; end;
  assert ok, 'needs an account to look';

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select x.friend_code into ca from public.set_friend_name('Awa') x;
  perform public.set_learning('en');
  ok := false; begin perform public.set_learning('de'); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'only wo, en or fr';
  ok := false; begin perform count(*) from public.friend_profiles; exception when insufficient_privilege then ok := true; end;
  assert ok, 'the table stays closed';

  -- b is a friend; c is not.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Moussa');
  assert public.friend_learning(a) is null, 'not friends yet';
  perform public.add_friend(ca);
  assert public.friend_learning(a) = 'en', 'a friend sees the course';
  assert public.friend_learning(b) is null, 'nothing for yourself';

  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Stranger');
  assert public.friend_learning(a) is null, 'a stranger sees nothing';

  -- Switching back to the Wolof course.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.set_learning('wo');
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  assert public.friend_learning(a) = 'wo', 'updated';

  raise exception 'TWO-WAY DUEL TESTS PASSED (rolled back)';
end $$;
