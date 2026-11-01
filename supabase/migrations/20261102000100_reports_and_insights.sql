-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- 1. Problem reports: learners flag a word or phrase ("spelling", "audio"…),
--    with or without an account. Only the owner can read them.
-- 2. Most-missed words: totals of right/wrong answers per word, computed from the
--    progress learners already sync. Owner only; no per-person data is returned.

create table if not exists public.content_reports (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users (id) on delete set null,
  entry_id    text not null check (entry_id ~ '^[a-zA-Z0-9._:-]{1,60}$'),
  problem     text not null check (problem in ('spelling', 'translation', 'audio', 'other')),
  comment     text check (char_length(comment) <= 500),
  ui_lang     text check (ui_lang in ('en', 'fr', 'es', 'de', 'it')),
  app_version text check (char_length(app_version) <= 20),
  status      text not null default 'open' check (status in ('open', 'fixed', 'dismissed'))
);
create index if not exists content_reports_status_idx on public.content_reports (status, created_at desc);
create index if not exists content_reports_user_idx on public.content_reports (user_id, created_at desc);

-- No policies: nobody reads or writes the table directly; only the functions below.
alter table public.content_reports enable row level security;
revoke all on public.content_reports from public, anon, authenticated;

create or replace function public.report_problem(entry text, problem text, note text default null, lang text default null, version text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  -- Simple flood limits: 30 per account per day, 1000 in total per day.
  if uid is not null and (select count(*) from public.content_reports r
                          where r.user_id = uid and r.created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many reports' using errcode = '54000';
  end if;
  if (select count(*) from public.content_reports r where r.created_at > now() - interval '1 day') >= 1000 then
    raise exception 'too many reports' using errcode = '54000';
  end if;
  insert into public.content_reports (user_id, entry_id, problem, comment, ui_lang, app_version)
  values (uid, entry, problem, nullif(left(trim(coalesce(note, '')), 500), ''), lang, left(version, 20));
end;
$$;

create or replace function public.owner_reports(report_status text default 'open', max_rows integer default 200)
  returns table (id bigint, created_at timestamptz, entry_id text, problem text, comment text,
                 ui_lang text, app_version text, status text, from_account boolean)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read reports', jsonb_build_object('status', report_status));
  return query
    select r.id, r.created_at, r.entry_id, r.problem, r.comment, r.ui_lang, r.app_version, r.status, r.user_id is not null
    from public.content_reports r
    where report_status = 'all' or r.status = report_status
    order by r.created_at desc
    limit least(greatest(max_rows, 1), 1000);
end;
$$;

create or replace function public.owner_set_report_status(report bigint, new_status text)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('report status', jsonb_build_object('report', report, 'status', new_status));
  update public.content_reports r set status = new_status where r.id = report;
  if not found then
    raise exception 'report not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.owner_missed_words(min_attempts integer default 5, max_rows integer default 50)
  returns table (entry_id text, learners integer, right_total integer, wrong_total integer, miss_rate numeric)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read missed words', jsonb_build_object('min_attempts', min_attempts));
  return query
    with cards as (
      select s.key as entry_id,
             greatest(coalesce((s.value ->> 'right')::integer, 0), 0) as r,
             greatest(coalesce((s.value ->> 'wrong')::integer, 0), 0) as w
      from public.progress p
      cross join lateral jsonb_each(case when jsonb_typeof(p.data -> 'srs') = 'object' then p.data -> 'srs' else '{}'::jsonb end) s
      where jsonb_typeof(s.value) = 'object'
        and coalesce(s.value ->> 'right', '0') ~ '^\d{1,6}$'
        and coalesce(s.value ->> 'wrong', '0') ~ '^\d{1,6}$'
    )
    select c.entry_id, count(*)::integer, sum(c.r)::integer, sum(c.w)::integer,
           round(sum(c.w)::numeric / nullif(sum(c.r) + sum(c.w), 0), 3)
    from cards c
    group by c.entry_id
    having sum(c.r) + sum(c.w) >= greatest(min_attempts, 1)
    order by 5 desc nulls last, 4 desc
    limit least(greatest(max_rows, 1), 500);
end;
$$;

revoke execute on function public.report_problem(text, text, text, text, text) from public;
grant execute on function public.report_problem(text, text, text, text, text) to anon, authenticated;
revoke execute on function public.owner_reports(text, integer) from public, anon;
revoke execute on function public.owner_set_report_status(bigint, text) from public, anon;
revoke execute on function public.owner_missed_words(integer, integer) from public, anon;
grant execute on function public.owner_reports(text, integer) to authenticated;
grant execute on function public.owner_set_report_status(bigint, text) to authenticated;
grant execute on function public.owner_missed_words(integer, integer) to authenticated;
