-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test for the family and family_night remote switches.
-- Paste into Supabase → SQL Editor and run.
-- Expected: "FAMILY SWITCHES TESTS PASSED (rolled back)".
do $$
declare
  notices jsonb;
  ok boolean;
begin
  -- Both keys exist and start off.
  assert exists (select 1 from public.remote_switches where key = 'family'       and is_off = true),
    'family switch should exist and be off by default';
  assert exists (select 1 from public.remote_switches where key = 'family_night' and is_off = true),
    'family_night switch should exist and be off by default';

  -- app_notices does not list them in 'on' while they are off.
  notices := public.app_notices();
  assert not (notices -> 'on') @> '"family"'::jsonb,       'family not in on list while off';
  assert not (notices -> 'on') @> '"family_night"'::jsonb, 'family_night not in on list while off';

  -- Switching family on shows it in app_notices.
  update public.remote_switches set is_off = false where key = 'family';
  notices := public.app_notices();
  assert (notices -> 'on') @> '"family"'::jsonb, 'family should appear in on list when switched on';
  assert not (notices -> 'on') @> '"family_night"'::jsonb, 'family_night still off';

  -- Switching family_night on shows it too.
  update public.remote_switches set is_off = false where key = 'family_night';
  notices := public.app_notices();
  assert (notices -> 'on') @> '"family_night"'::jsonb, 'family_night in on list';

  -- The constraint rejects an unknown key.
  ok := false;
  begin
    insert into public.remote_switches (key, is_off) values ('not_a_key', true);
  exception when check_violation then
    ok := true;
  end;
  assert ok, 'unknown key rejected by constraint';

  -- The existing opt-in keys are still accepted.
  assert exists (select 1 from public.remote_switches where key = 'nearby'),    'nearby still present';
  assert exists (select 1 from public.remote_switches where key = 'bot_duels'), 'bot_duels still present';

  raise exception 'FAMILY SWITCHES TESTS PASSED (rolled back)';
end $$;
