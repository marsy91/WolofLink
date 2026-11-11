-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test of in-app feedback. Paste into Supabase → SQL Editor and run.
-- It aborts on purpose so NOTHING is saved. Expected: "FEEDBACK TESTS PASSED (rolled back)".
do $$
declare boss uuid := gen_random_uuid(); a uuid := gen_random_uuid(); ok boolean; n int; r record; fid bigint;
begin
  insert into private.owners (email) values ('t-fboss@example.invalid');
  insert into auth.users (id, email, aud, role, email_confirmed_at) values
    (boss, 't-fboss@example.invalid', 'authenticated', 'authenticated', now()),
    (a, 't-fa@example.invalid', 'authenticated', 'authenticated', now());
  insert into public.remote_switches (key, is_off) values ('feedback', false) on conflict (key) do update set is_off = false;

  -- Without an account: accepted, never with a reply address.
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform public.send_feedback('idea', 5, 'More units please!', true, '0.26.3', 'en', '/learn/');
  ok := false; begin perform count(*) from public.app_feedback; exception when insufficient_privilege then ok := true; end;
  assert ok, 'the table is not readable';
  ok := false; begin perform * from public.owner_feedback(); exception when insufficient_privilege then ok := true; end;
  assert ok, 'only the owner reads feedback';

  -- Signed in: a reply address only when allowed; checks and a daily limit.
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform public.send_feedback('wolof', null, 'Jërëjëf is spelled wrong in unit 1', true, '0.26.3', 'fr', '/lesson/greet-1/');
  ok := false; begin perform public.send_feedback('spam', null, 'hello there', false, null, null, null); exception when check_violation then ok := true; end;
  assert ok, 'unknown kind refused';
  ok := false; begin perform public.send_feedback('bug', 9, 'broken', false, null, null, null); exception when check_violation then ok := true; end;
  assert ok, 'rating 1 to 5';
  ok := false; begin perform public.send_feedback('bug', null, 'x', false, null, null, null); exception when check_violation then ok := true; end;
  assert ok, 'message too short';
  ok := false; begin perform public.send_feedback('bug', null, 'it broke', false, null, null, 'javascript:alert(1)'); exception when check_violation then ok := true; end;
  assert ok, 'screen must be an app path';
  for i in 1..4 loop perform public.send_feedback('bug', 2, 'It crashed ' || i, false, '0.26.3', 'fr', '/duel/'); end loop;
  ok := false; begin perform public.send_feedback('bug', 2, 'Again', false, '0.26.3', 'fr', '/duel/'); exception when program_limit_exceeded then ok := true; end;
  assert ok, 'five a day';

  -- The owner reads, marks and summarises.
  perform set_config('request.jwt.claims', json_build_object('sub', boss, 'role', 'authenticated')::text, true);
  select count(*) into n from public.owner_feedback(); assert n = 6, 'owner sees all six: ' || n;
  select * into r from public.owner_feedback() x where x.kind = 'wolof';
  assert r.reply_to = 't-fa@example.invalid' and r.screen = '/lesson/greet-1/', 'reply address when allowed';
  select count(*) into n from public.owner_feedback() x where x.reply_to is not null; assert n = 1, 'no address otherwise';
  fid := r.id;
  perform public.owner_set_feedback_status(fid, 'done');
  select count(*) into n from public.owner_feedback('open'); assert n = 5, 'done leaves the open list';
  select * into r from public.owner_feedback_summary(); assert r.total = 6 and r.rated = 5 and r.average = 2.6, 'summary: ' || row_to_json(r)::text;

  -- The switch pauses it.
  reset role;
  update public.remote_switches set is_off = true where key = 'feedback';
  set local role anon;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  ok := false; begin perform public.send_feedback('idea', 4, 'Paused?', false, null, null, null); exception when object_not_in_prerequisite_state then ok := true; end;
  assert ok, 'paused';
  raise exception 'FEEDBACK TESTS PASSED (rolled back)';
end $$;
