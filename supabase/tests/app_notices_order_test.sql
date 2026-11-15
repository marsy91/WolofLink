-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Self-cancelling test for 20261121000000_app_notices_order.sql.
-- Paste into Supabase → SQL Editor and run.
-- Expected: "APP NOTICES ORDER TESTS PASSED (rolled back)".
do $$
declare
  n jsonb;
begin
  -- Announcements come newest first.
  insert into public.announcements (title, starts_on, ends_on)
    values ('{"en":"zz older"}', current_date - 2, current_date + 1),
           ('{"en":"zz newer"}', current_date - 1, current_date + 1);
  n := public.app_notices();
  assert (select array_agg(e -> 'title' ->> 'en' order by o)
          from jsonb_array_elements(n -> 'announcements') with ordinality t(e, o)
          where e -> 'title' ->> 'en' like 'zz %') = array['zz newer', 'zz older'],
    'announcements should be newest first';

  -- Pausable keys appear in "off" when off, sorted; opt-in keys never appear there.
  update public.remote_switches set is_off = true where key in ('world', 'feedback', 'family', 'family_night');
  n := public.app_notices();
  assert (n -> 'off') @> '["feedback", "world"]'::jsonb, 'paused keys listed as off';
  assert not (n -> 'off') @> '["family"]'::jsonb and not (n -> 'off') @> '["family_night"]'::jsonb,
    'opt-in keys are never in the off list';
  assert (select array_agg(v order by o) = array_agg(v order by v)
          from jsonb_array_elements_text(n -> 'off') with ordinality e(v, o)), 'off list is sorted';

  -- Opt-in keys appear in "on" only when switched on, sorted.
  update public.remote_switches set is_off = false where key in ('family', 'family_night');
  n := public.app_notices();
  assert (n -> 'on') @> '["family", "family_night"]'::jsonb, 'switched-on opt-in keys listed as on';
  assert (select array_agg(v order by o) = array_agg(v order by v)
          from jsonb_array_elements_text(n -> 'on') with ordinality e(v, o)), 'on list is sorted';

  raise exception 'APP NOTICES ORDER TESTS PASSED (rolled back)';
end $$;
