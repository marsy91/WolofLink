-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Security hardening (November 2026 review). No behaviour changes for normal learners.
--  1. Problem reports: anonymous reports get their own daily cap, so a flood of
--     anonymous reports can no longer block reports from signed-in learners.
--  2. Synced progress: one learner's row is capped at 256 KB (today's largest is < 1 KB).
--  3. Signed-in and anonymous roles lose table permissions the app never uses
--     (TRUNCATE, REFERENCES, TRIGGER), which bypass row-level security.
--  4. Row-level security is switched on for every internal table, including the two that lacked it
--     (they are only touched by owner functions, which keep working).

-- 1. Problem reports -----------------------------------------------------------
create or replace function public.report_problem(entry text, problem text, note text default null, lang text default null, version text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is not null then
    -- Signed-in learners: 30 a day each, 1000 a day in total.
    if (select count(*) from public.content_reports r
        where r.user_id = uid and r.created_at > now() - interval '1 day') >= 30 then
      raise exception 'too many reports' using errcode = '54000';
    end if;
    if (select count(*) from public.content_reports r
        where r.user_id is not null and r.created_at > now() - interval '1 day') >= 1000 then
      raise exception 'too many reports' using errcode = '54000';
    end if;
  else
    -- No account: 200 a day in total, counted separately.
    if (select count(*) from public.content_reports r
        where r.user_id is null and r.created_at > now() - interval '1 day') >= 200 then
      raise exception 'too many reports' using errcode = '54000';
    end if;
  end if;
  -- Table checks already limit entry (60 chars), problem (4 values) and language (5 values).
  insert into public.content_reports (user_id, entry_id, problem, comment, ui_lang, app_version)
  values (uid, left(entry, 60), problem, nullif(left(trim(coalesce(note, '')), 500), ''), lang, left(version, 20));
end;
$$;
revoke execute on function public.report_problem(text, text, text, text, text) from public;
grant execute on function public.report_problem(text, text, text, text, text) to anon, authenticated;

-- 2. Progress size cap ---------------------------------------------------------
alter table public.progress drop constraint if exists progress_data_size;
alter table public.progress add constraint progress_data_size
  check (pg_column_size(data) <= 262144) not valid;
alter table public.progress validate constraint progress_data_size;

-- 3. Unused table permissions --------------------------------------------------
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke truncate, references, trigger on tables from anon, authenticated;

-- 4. Row-level security on the remaining internal tables -------------------------
-- (owners and audit_log already have it on the live database; this makes the
-- migrations match.)
alter table private.owners enable row level security;
alter table private.audit_log enable row level security;
alter table private.staff enable row level security;
alter table private.pending_actions enable row level security;
revoke all on all tables in schema private from public, anon, authenticated;
