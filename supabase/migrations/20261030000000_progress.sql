-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- One progress document per learner, readable and writable only by its owner.

create table public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint progress_data_is_object check (jsonb_typeof(data) = 'object'),
  -- A learner's whole progress is a few KB; cap it to stop abuse of storage.
  constraint progress_data_size check (pg_column_size(data) < 262144)
);

comment on table public.progress is 'WolofLink learner progress (see src/lib/merge.ts for the merge rules).';

-- Row-level security: every query is limited to the signed-in user's own row.
alter table public.progress enable row level security;

create policy "Learners read their own progress"
  on public.progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners create their own progress"
  on public.progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners update their own progress"
  on public.progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- No delete policy: rows are removed only with the account (on delete cascade).
revoke all on public.progress from anon;
grant select, insert, update on public.progress to authenticated;

create function public.progress_touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger progress_touch_updated_at
  before insert or update on public.progress
  for each row execute function public.progress_touch_updated_at();
