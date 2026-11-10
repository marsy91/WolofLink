-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of the community features (leagues, nearby, requests,
-- friends-only handles, blocking, reports). Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "COMMUNITY TESTS PASSED (rolled back)".
do $$
declare
  boss uuid := gen_random_uuid(); a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
  c uuid := gen_random_uuid(); kid uuid := gen_random_uuid();
  ok boolean; n int; req bigint; h jsonb; city text; bcode text;
begin
  insert into private.owners (email) values ('t-cboss@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 't-cboss@example.invalid', 'authenticated', 'authenticated', now()),
    (a, 't-ca@example.invalid', 'authenticated', 'authenticated', now()),
    (b, 't-cb@example.invalid', 'authenticated', 'authenticated', now()),
    (c, 't-cc@example.invalid', 'authenticated', 'authenticated', now()),
    (kid, 't-ckid@example.invalid', 'authenticated', 'authenticated', now());
  insert into public.progress (user_id, data) values
    (a, jsonb_build_object('xpByDay', jsonb_build_object(to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 50), 'xpTotal', 300)),
    (b, jsonb_build_object('xpByDay', jsonb_build_object(to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 80)));
  -- "Learners near you" starts off; the owner switches it on (community_safety_test checks the off state).
  update public.remote_switches set is_off = false where key = 'nearby';
  set local role authenticated;

  -- Everyone picks a name; everything community-related starts off.
  perform set_config('request.jwt.claims', json_build_object('sub', kid, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Kid');
  perform public.set_community('dakar', true, false);
  select x.show_city into ok from public.community_me() x; assert not ok, 'no league without 18+ confirmation';
  ok := false; begin perform public.set_nearby('dakar/plateau', true); exception when insufficient_privilege then ok := true; end;
  assert ok, 'under-18s cannot show themselves nearby';

  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Moussa');
  select x.friend_code into bcode from public.my_friend_card() x;
  select x.show_city into ok from public.community_me() x; assert not ok, 'city hidden by default';
  ok := false; begin perform public.set_community('atlantis', true, true); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'unknown city refused';
  perform public.set_community('dakar', true, true);
  ok := false; begin perform public.set_nearby('london/peckham', true); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'area must be in my city';
  ok := false; begin perform public.set_nearby('14.6928,-17.4467', true); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'coordinates cannot be stored';
  perform public.set_nearby('dakar/plateau', true);
  perform public.save_handle('instagram', '@moussa.wolof', true);
  perform public.save_handle('tiktok', 'moussa_tt', false);
  ok := false; begin perform public.save_handle('instagram', 'bad handle!', true); exception when invalid_parameter_value then ok := true; end;
  assert ok, 'handle format checked';

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Awa');
  select count(*) into n from public.city_league(); assert n = 0, 'no league until I show my city';
  perform public.set_community('dakar', true, true);
  select count(*) into n from public.city_league(); assert n = 2, 'league shows adults who opted in: ' || n;
  select count(*) into n from public.city_league() x where x.display_name = 'Kid'; assert n = 0, 'minors never in the league';
  select x.week_xp into n from public.city_league() x where x.display_name = 'Moussa'; assert n = 80, 'league ranks by week XP';
  perform public.set_nearby('dakar/plateau', true);
  select count(*) into n from public.nearby_learners(); assert n = 1, 'nearby shows Moussa only';

  -- Strangers cannot see profiles or handles.
  ok := false; begin perform * from public.friend_profile(b); exception when insufficient_privilege then ok := true; end;
  assert ok, 'profile is friends-only';
  ok := false; begin perform count(*) from public.social_handles; exception when insufficient_privilege then ok := true; end;
  assert ok, 'handles table not readable directly';

  -- Request → accept → friends-only profile with visible handles only.
  perform public.send_friend_request(b);
  select x.requested into ok from public.city_league() x where x.display_name = 'Moussa'; assert ok, 'request shown as sent';
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select x.id into req from public.my_friend_requests() x; assert req is not null, 'request received';
  perform public.respond_friend_request(req, true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select x.handles into h from public.friend_profile(b) x;
  assert jsonb_array_length(h) = 1 and h -> 0 ->> 'handle' = 'moussa.wolof', 'only visible handles, @ removed: ' || h::text;
  select x.home_city into city from public.friend_profile(b) x; assert city = 'dakar', 'city shown to friends who show it';

  -- Blocking removes the friendship and hides both ways everywhere.
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.block_user(a);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  select count(*) into n from public.city_league() x where x.display_name = 'Moussa'; assert n = 0, 'blocked hidden in league';
  select count(*) into n from public.nearby_learners(); assert n = 0, 'blocked hidden nearby';
  ok := false; begin perform * from public.friend_profile(b); exception when insufficient_privilege then ok := true; end;
  assert ok, 'blocked: no profile';
  ok := false; begin perform public.send_friend_request(b); exception when no_data_found then ok := true; end;
  assert ok, 'blocked: cannot request';
  assert public.add_friend(bcode) is null, 'blocked: cannot add by code';

  -- Reports reach the owner console only; rate-limited.
  perform public.report_user(b, 'harassment', 'test');
  ok := false; begin perform * from public.owner_user_reports(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'learners cannot read reports';
  for i in 1..4 loop perform public.report_user(b, 'spam'); end loop;
  ok := false; begin perform public.report_user(b, 'spam'); exception when program_limit_exceeded then ok := true; end;
  assert ok, 'five reports a day';
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  select count(*) into n from public.owner_user_reports(); assert n = 5, 'owner sees reports';

  -- The remote switch empties leagues and nearby at once.
  reset role;
  update public.remote_switches set is_off = true where key = 'community';
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', kid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform public.set_friend_name('Cheikh');
  perform public.set_community('dakar', true, true);
  select count(*) into n from public.city_league(); assert n = 0, 'paused league is empty';

  raise exception 'COMMUNITY TESTS PASSED (rolled back)';
end $$;
