-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of community safety: the "nearby" switch starts off, children
-- cannot be contacted by strangers or share handles, reported people are hidden,
-- the owner can remove someone, and friend codes cannot be guessed at speed.
-- Paste into Supabase → SQL Editor and run. It aborts on purpose so NOTHING is saved.
-- Expected: "COMMUNITY SAFETY TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid(); a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
  kid uuid := gen_random_uuid(); r1 uuid := gen_random_uuid(); r2 uuid := gen_random_uuid(); r3 uuid := gen_random_uuid();
  ok boolean; n int; h jsonb; kid_code text; a_code text; nm text;
begin
  insert into private.owners (email) values ('t-sboss@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 't-sboss@example.invalid', 'authenticated', 'authenticated', now()),
    (a, 't-sa@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 't-sb@example.invalid', 'authenticated', 'authenticated', now()),
    (kid, 't-skid@example.invalid', 'authenticated', 'authenticated', now()),
    (r1, 't-sr1@example.invalid', 'authenticated', 'authenticated', now()),
    (r2, 't-sr2@example.invalid', 'authenticated', 'authenticated', now()),
    (r3, 't-sr3@example.invalid', 'authenticated', 'authenticated', now());
  -- Start from the shipped state, whatever an earlier run left.
  update public.remote_switches set is_off = true where key = 'nearby';
  update public.remote_switches set is_off = false where key in ('community', 'friends');
  set local role authenticated;

  -- Names for everyone; the reporters are adults in Dakar.
  perform set_config('request.jwt.claims', json_build_object('sub', r1, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Ref One'); perform public.set_community('dakar', true, true);
  perform set_config('request.jwt.claims', json_build_object('sub', r2, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Ref Two'); perform public.set_community('dakar', true, true);
  perform set_config('request.jwt.claims', json_build_object('sub', r3, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Ref Three'); perform public.set_community('dakar', true, true);
  perform set_config('request.jwt.claims', json_build_object('sub', kid, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Kid'); perform public.set_community('dakar', true, false);
  select p.friend_code into kid_code from public.my_friend_card() p;

  -- 1. "Learners near you" and handles are off until the owner switches them on.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Awa');
  perform public.set_community('dakar', true, true);
  select p.friend_code into a_code from public.my_friend_card() p;
  select (public.app_notices() -> 'on') ? 'nearby' into ok; assert not ok, 'nearby is not on by default';
  select (public.app_notices() -> 'off') ? 'nearby' into ok; assert not ok, 'nearby never reads as a paused switch';
  ok := false; begin perform public.set_nearby('dakar/plateau', true); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'nearby refused while off';
  ok := false; begin perform public.save_handle('instagram', 'awa.w', true); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'handles refused while off';
  ok := false; begin perform public.owner_set_switch('nearby', false, null); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learners cannot switch it on';

  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_set_switch('nearby', false, 'launch');
  select (public.app_notices() -> 'on') ? 'nearby' into ok; assert ok, 'owner switched nearby on';

  -- 2. Nobody can send a request to a child, even knowing their id.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.send_friend_request(kid); exception when no_data_found then ok := true; end;
  assert ok, 'no requests to children';
  perform public.save_handle('snapchat', 'awa.snap', true);

  -- An adult who is not in a league or nearby cannot be requested either.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Bintou');
  perform public.set_community(null, false, true);
  ok := false; begin perform public.send_friend_request(a); exception when insufficient_privilege then ok := true; end;
  assert ok, 'hidden adults cannot send requests';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.send_friend_request(b); exception when no_data_found then ok := true; end;
  assert ok, 'cannot request someone who is not in a league';

  -- Children cannot send requests, see leagues or add handles.
  perform set_config('request.jwt.claims', json_build_object('sub', kid, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.send_friend_request(a); exception when insufficient_privilege then ok := true; end;
  assert ok, 'children cannot send requests';
  select count(*) into n from public.city_league(); assert n = 0, 'children see no league';
  ok := false; begin perform public.save_handle('instagram', 'kid.w', true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'children cannot add handles';

  -- 3. A child who is friends with an adult (in person, by code) never sees their handles.
  perform public.add_friend(a_code);
  select x.handles into h from public.friend_profile(a) x; assert h = '[]'::jsonb, 'children never see handles: ' || h::text;
  perform set_config('request.jwt.claims', json_build_object('sub', r1, 'role', 'authenticated')::text, true);
  perform public.send_friend_request(a);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.send_friend_request(r1);  -- crossing requests accept at once
  perform set_config('request.jwt.claims', json_build_object('sub', r1, 'role', 'authenticated')::text, true);
  select x.handles into h from public.friend_profile(a) x; assert jsonb_array_length(h) = 1, 'adult friends see visible handles';
  -- Saying "not 18+" hides one's handles at once.
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.set_community('dakar', true, false);
  perform set_config('request.jwt.claims', json_build_object('sub', r1, 'role', 'authenticated')::text, true);
  select x.handles into h from public.friend_profile(a) x; assert h = '[]'::jsonb, 'handles hidden after leaving 18+';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.set_community('dakar', true, true);

  -- 4. Reported as under 18 → out of the league until reviewed.
  perform set_config('request.jwt.claims', json_build_object('sub', r2, 'role', 'authenticated')::text, true);
  select count(*) into n from public.city_league() x where x.display_name = 'Awa'; assert n = 1, 'Awa in the league';
  perform public.report_user(a, 'underage');
  select count(*) into n from public.city_league() x where x.display_name = 'Awa'; assert n = 0, 'underage report hides at once';
  ok := false; begin perform public.send_friend_request(a); exception when no_data_found then ok := true; end;
  assert ok, 'cannot request someone reported as under 18';
  ok := false; begin perform public.report_user(r2, 'spam'); exception when no_data_found then ok := true; end;
  assert ok, 'cannot report yourself';
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_set_user_report_status((select x.id from public.owner_user_reports() x where x.reason = 'underage'), 'dismissed');
  perform set_config('request.jwt.claims', json_build_object('sub', r2, 'role', 'authenticated')::text, true);
  select count(*) into n from public.city_league() x where x.display_name = 'Awa'; assert n = 1, 'back after review';

  -- Three different people reporting → hidden; two are not enough.
  perform public.report_user(a, 'harassment');
  perform set_config('request.jwt.claims', json_build_object('sub', r3, 'role', 'authenticated')::text, true);
  perform public.report_user(a, 'harassment');
  select count(*) into n from public.city_league() x where x.display_name = 'Awa'; assert n = 1, 'two reporters do not hide';
  perform set_config('request.jwt.claims', json_build_object('sub', r1, 'role', 'authenticated')::text, true);
  perform public.report_user(a, 'harassment');
  select count(*) into n from public.city_league() x where x.display_name = 'Awa'; assert n = 0, 'three reporters hide';

  -- 5. The owner removes someone from the community.
  perform set_config('request.jwt.claims', json_build_object('sub', r2, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.owner_set_community_restriction(a, true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learners cannot remove people';
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  perform public.owner_set_community_restriction(a, true);
  select x.reported_restricted into ok from public.owner_user_reports() x where x.reported = a limit 1; assert ok, 'console shows removed';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  ok := false; begin perform public.add_friend(kid_code); exception when insufficient_privilege then ok := true; end;
  assert ok, 'removed people cannot add friends';
  ok := false; begin perform public.save_handle('x', 'awa_x', true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'removed people cannot add handles';
  select count(*) into n from public.city_league(); assert n = 0, 'removed people see no league';

  -- 6. Twenty wrong friend codes a day, then refused.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  for i in 1..20 loop
    nm := public.add_friend('ZZZZZZZ' || chr(50 + (i % 8)));
    assert nm is null or nm <> '', 'wrong codes return null';
  end loop;
  ok := false; begin perform public.add_friend(kid_code); exception when program_limit_exceeded then ok := true; end;
  assert ok, 'guessing is limited';

  raise exception 'COMMUNITY SAFETY TESTS PASSED (rolled back)';
end $$;
