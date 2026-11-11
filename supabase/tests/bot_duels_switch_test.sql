-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the "Duel the computer" switch. Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "BOT DUEL SWITCH TESTS PASSED (rolled back)".
do $$
declare boss uuid := gen_random_uuid(); kid uuid := gen_random_uuid(); ok boolean;
begin
  insert into private.owners (email) values ('t-bboss@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 't-bboss@example.invalid', 'authenticated', 'authenticated', now()),
    (kid, 't-bkid@example.invalid', 'authenticated', 'authenticated', now());
  update public.remote_switches set is_off = true where key = 'bot_duels';
  set local role anon;
  select (public.app_notices() -> 'on') ? 'bot_duels' into ok; assert not ok, 'off by default';
  select (public.app_notices() -> 'off') ? 'bot_duels' into ok; assert not ok, 'never reads as paused';
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', kid, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_set_switch('bot_duels', false, null); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learners cannot switch it on';
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_set_switch('bot_duels', false, 'launch');
  select (public.app_notices() -> 'on') ? 'bot_duels' into ok; assert ok, 'owner switched it on';
  raise exception 'BOT DUEL SWITCH TESTS PASSED (rolled back)';
end $$;
