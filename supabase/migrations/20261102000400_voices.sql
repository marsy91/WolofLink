-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Community voices: invited native speakers record lines; recordings are checked
-- automatically (scripts/voice-check, GitHub Actions) and then approved by the owner
-- or a trusted reviewer before any learner hears them.
--
-- Filtering, in order:
--   1. Only invited recorders can upload (private.is_recorder), after accepting the terms.
--   2. The automatic check transcribes each clip and compares it with the line; clips
--      that don't match, are silent, too short/long, or contain a blocked word are
--      flagged ('flagged') instead of going to review ('review').
--   3. Nothing is public until a person approves it ('approved'). Nobody approves their own.
--   4. The owner or a reviewer can pull an approved voice at any time.

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.recorders (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  can_approve  boolean not null default false,
  active       boolean not null default true,
  consented_at timestamptz,
  rewarded_at  timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.recordings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete cascade,
  entry_id     text not null check (entry_id ~ '^[a-zA-Z0-9._:-]{1,60}$'),
  path         text not null unique,
  duration_ms  integer not null check (duration_ms between 300 and 15000),
  mime         text not null check (mime ~ '^audio/(webm|ogg|mp4|mpeg|aac|x-m4a)'),
  status       text not null default 'new'
                 check (status in ('new', 'flagged', 'review', 'approved', 'rejected', 'replaced')),
  auto_score   numeric,
  transcript   text,
  flag         text,
  reviewed_by  uuid references auth.users (id) on delete set null,
  reviewed_at  timestamptz,
  note         text check (char_length(note) <= 300),
  created_at   timestamptz not null default now()
);
create index if not exists recordings_status_idx on public.recordings (status, created_at);
create index if not exists recordings_entry_idx on public.recordings (entry_id, status);
create index if not exists recordings_user_idx on public.recordings (user_id, created_at desc);

-- Words that must never appear in a voice (any language; matched without accents).
create table if not exists public.blocked_words (
  word     text primary key check (char_length(word) between 2 and 40),
  added_at timestamptz not null default now()
);

alter table public.recorders enable row level security;
alter table public.recordings enable row level security;
alter table public.blocked_words enable row level security;
revoke all on public.recorders, public.recordings, public.blocked_words from public, anon, authenticated;

-- ── Helpers ─────────────────────────────────────────────────────────────────
create or replace function private.is_recorder() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.recorders r where r.user_id = (select auth.uid()) and r.active);
$$;

create or replace function private.is_voice_approver() returns boolean
  language sql stable security definer set search_path = '' as $$
  select private.is_owner()
      or exists (select 1 from public.recorders r where r.user_id = (select auth.uid()) and r.active and r.can_approve);
$$;

create or replace function private.voice_log(action text, detail jsonb) returns void
  language sql security definer set search_path = '' as $$
  insert into private.audit_log (actor, action, detail) values ((select auth.uid()), action, detail);
$$;

revoke execute on function private.is_recorder() from public, anon;
revoke execute on function private.is_voice_approver() from public, anon;
revoke execute on function private.voice_log(text, jsonb) from public, anon, authenticated;
grant execute on function private.is_recorder() to authenticated;
grant execute on function private.is_voice_approver() to authenticated;

-- ── Storage: private bucket; approved clips readable by anyone ───────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 2097152,
        array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "recorders upload to their folder" on storage.objects;
create policy "recorders upload to their folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recordings'
              and (storage.foldername(name))[1] = (select auth.uid())::text
              and private.is_recorder());

-- Policies run as the caller, who can't read public.recordings; this definer helper decides.
create or replace function public.can_read_recording(object_name text) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.recordings r where r.path = object_name and r.status = 'approved')
      or ((select auth.uid()) is not null and split_part(object_name, '/', 1) = (select auth.uid())::text)
      or ((select auth.uid()) is not null and private.is_voice_approver());
$$;
revoke execute on function public.can_read_recording(text) from public;
grant execute on function public.can_read_recording(text) to anon, authenticated;

drop policy if exists "recordings readable when allowed" on storage.objects;
create policy "recordings readable when allowed" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'recordings' and public.can_read_recording(name));

-- ── Recorder side ───────────────────────────────────────────────────────────
create or replace function public.my_recorder()
  returns table (is_recorder boolean, can_approve boolean, consented boolean, display_name text,
                 approved integer, waiting integer)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  r public.recorders;
begin
  select * into r from public.recorders x where x.user_id = uid and x.active;
  if r.user_id is null then
    return query select false, private.is_voice_approver(), false, null::text, 0, 0;
    return;
  end if;
  return query
    select true, r.can_approve or private.is_owner(), r.consented_at is not null, r.display_name,
           (select count(*)::integer from public.recordings g where g.user_id = uid and g.status in ('approved', 'replaced')),
           (select count(*)::integer from public.recordings g where g.user_id = uid and g.status in ('new', 'flagged', 'review'));
end;
$$;

create or replace function public.recorder_consent() returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_recorder() then
    raise exception 'not an invited recorder' using errcode = '42501';
  end if;
  update public.recorders r set consented_at = coalesce(r.consented_at, now()) where r.user_id = (select auth.uid());
end;
$$;

-- Entries this recorder has already done (any status) and entries that already have an approved voice.
create or replace function public.recorder_progress()
  returns table (entry_id text, mine boolean, approved boolean)
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_recorder() then
    raise exception 'not an invited recorder' using errcode = '42501';
  end if;
  return query
    select g.entry_id, bool_or(g.user_id = (select auth.uid()) and g.status <> 'rejected'), bool_or(g.status = 'approved')
    from public.recordings g group by g.entry_id;
end;
$$;

create or replace function public.submit_recording(entry text, file_path text, duration integer, file_mime text)
  returns uuid
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  saved uuid;
begin
  if not exists (select 1 from public.recorders r where r.user_id = uid and r.active and r.consented_at is not null) then
    raise exception 'not an invited recorder, or terms not accepted' using errcode = '42501';
  end if;
  if split_part(file_path, '/', 1) <> uid::text then
    raise exception 'file must be in your own folder' using errcode = '42501';
  end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = 'recordings' and o.name = file_path) then
    raise exception 'upload the file first' using errcode = 'P0002';
  end if;
  if (select count(*) from public.recordings g where g.user_id = uid and g.created_at > now() - interval '1 day') >= 300 then
    raise exception 'daily limit reached' using errcode = '54000';
  end if;
  insert into public.recordings (user_id, entry_id, path, duration_ms, mime)
  values (uid, entry, file_path, duration, file_mime)
  returning id into saved;
  return saved;
end;
$$;

-- ── Review side (owner and trusted reviewers) ───────────────────────────────
create or replace function public.review_queue(queue text default 'review', max_rows integer default 50)
  returns table (id uuid, entry_id text, path text, duration_ms integer, status text, auto_score numeric,
                 transcript text, flag text, recorder text, own boolean, created_at timestamptz)
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_voice_approver() then
    raise exception 'reviewers only' using errcode = '42501';
  end if;
  return query
    select g.id, g.entry_id, g.path, g.duration_ms, g.status, g.auto_score, g.transcript, g.flag,
           coalesce(r.display_name, '?'), g.user_id = (select auth.uid()), g.created_at
    from public.recordings g left join public.recorders r on r.user_id = g.user_id
    where (queue = 'review' and g.status = 'review')
       or (queue = 'new' and g.status = 'new')
       or (queue = 'flagged' and g.status = 'flagged')
       or (queue = 'approved' and g.status = 'approved')
    order by g.created_at
    limit least(greatest(max_rows, 1), 200);
end;
$$;

create or replace function public.review_recording(recording uuid, decision text, review_note text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  g public.recordings;
  done integer;
begin
  if not private.is_voice_approver() then
    raise exception 'reviewers only' using errcode = '42501';
  end if;
  if decision not in ('approved', 'rejected') then
    raise exception 'decision must be approved or rejected' using errcode = '22023';
  end if;
  select * into g from public.recordings x where x.id = recording for update;
  if g.id is null then
    raise exception 'recording not found' using errcode = 'P0002';
  end if;
  if g.user_id = uid then
    raise exception 'you cannot review your own recording' using errcode = '42501';
  end if;
  if decision = 'approved' then
    update public.recordings x set status = 'replaced'
      where x.entry_id = g.entry_id and x.status = 'approved' and x.id <> g.id;
  end if;
  update public.recordings x
    set status = decision, reviewed_by = uid, reviewed_at = now(), note = nullif(trim(review_note), '')
    where x.id = recording;
  perform private.voice_log('voice.' || decision, jsonb_build_object('recording', recording, 'entry', g.entry_id));

  -- Reward: 20 approved lines earn a year of Premium (once).
  if decision = 'approved' and g.user_id is not null then
    select count(*) into done from public.recordings x where x.user_id = g.user_id and x.status in ('approved', 'replaced');
    if done >= 20 and not exists (select 1 from public.recorders r where r.user_id = g.user_id and r.rewarded_at is not null) then
      insert into public.account_grants (user_id, premium, premium_until, note, updated_at)
      values (g.user_id, true, now() + interval '1 year', 'Voice contributor reward', now())
      on conflict (user_id) do update
        set premium = true,
            premium_until = case when public.account_grants.premium and public.account_grants.premium_until is null then null
                                 else greatest(coalesce(public.account_grants.premium_until, now()), now() + interval '1 year') end,
            updated_at = now();
      update public.recorders r set rewarded_at = now() where r.user_id = g.user_id;
    end if;
  end if;
end;
$$;

-- Take an approved voice off the app at once (e.g. after a learner's report).
create or replace function public.pull_voice(entry text, reason text default null)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_voice_approver() then
    raise exception 'reviewers only' using errcode = '42501';
  end if;
  update public.recordings x set status = 'rejected', reviewed_by = (select auth.uid()), reviewed_at = now(),
         note = coalesce(nullif(trim(reason), ''), 'pulled')
    where x.entry_id = entry and x.status = 'approved';
  perform private.voice_log('voice.pull', jsonb_build_object('entry', entry));
end;
$$;

-- ── Public: approved voices and credits ─────────────────────────────────────
create or replace function public.community_voices()
  returns table (entry_id text, path text, recorder text, approved_at timestamptz)
  language sql stable security definer set search_path = '' as $$
  select g.entry_id, g.path, coalesce(r.display_name, ''), g.reviewed_at
  from public.recordings g left join public.recorders r on r.user_id = g.user_id
  where g.status = 'approved';
$$;

-- ── Owner: recorders and the blocked-word list ──────────────────────────────
create or replace function public.owner_recorders()
  returns table (user_id uuid, email text, display_name text, can_approve boolean, active boolean,
                 consented boolean, approved integer, waiting integer, rejected integer)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read recorders');
  return query
    select r.user_id, u.email::text, r.display_name, r.can_approve, r.active, r.consented_at is not null,
           (select count(*)::integer from public.recordings g where g.user_id = r.user_id and g.status in ('approved', 'replaced')),
           (select count(*)::integer from public.recordings g where g.user_id = r.user_id and g.status in ('new', 'flagged', 'review')),
           (select count(*)::integer from public.recordings g where g.user_id = r.user_id and g.status = 'rejected')
    from public.recorders r join auth.users u on u.id = r.user_id
    order by r.created_at;
end;
$$;

create or replace function public.owner_save_recorder(member_email text, name text, approver boolean, is_active boolean default true)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare
  member uuid;
begin
  perform private.require_owner('recorder.save', jsonb_build_object('email', member_email, 'approver', approver, 'active', is_active));
  select u.id into member from auth.users u where lower(u.email) = lower(trim(member_email));
  if member is null then
    raise exception 'no account with that email (they must create one in the app first)' using errcode = 'P0002';
  end if;
  insert into public.recorders (user_id, display_name, can_approve, active)
  values (member, trim(name), approver, is_active)
  on conflict (user_id) do update set display_name = excluded.display_name, can_approve = excluded.can_approve,
                                      active = excluded.active;
end;
$$;

create or replace function public.owner_blocked_words()
  returns table (word text)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read blocked words');
  return query select b.word from public.blocked_words b order by b.word;
end;
$$;

create or replace function public.owner_set_blocked_word(blocked text, add boolean)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('blocked word', jsonb_build_object('add', add));
  if add then
    insert into public.blocked_words (word) values (lower(trim(blocked))) on conflict do nothing;
  else
    delete from public.blocked_words b where b.word = lower(trim(blocked));
  end if;
end;
$$;

-- ── Permissions ─────────────────────────────────────────────────────────────
revoke execute on function public.my_recorder() from public, anon;
revoke execute on function public.recorder_consent() from public, anon;
revoke execute on function public.recorder_progress() from public, anon;
revoke execute on function public.submit_recording(text, text, integer, text) from public, anon;
revoke execute on function public.review_queue(text, integer) from public, anon;
revoke execute on function public.review_recording(uuid, text, text) from public, anon;
revoke execute on function public.pull_voice(text, text) from public, anon;
revoke execute on function public.owner_recorders() from public, anon;
revoke execute on function public.owner_save_recorder(text, text, boolean, boolean) from public, anon;
revoke execute on function public.owner_blocked_words() from public, anon;
revoke execute on function public.owner_set_blocked_word(text, boolean) from public, anon;
revoke execute on function public.community_voices() from public;

grant execute on function public.my_recorder() to authenticated;
grant execute on function public.recorder_consent() to authenticated;
grant execute on function public.recorder_progress() to authenticated;
grant execute on function public.submit_recording(text, text, integer, text) to authenticated;
grant execute on function public.review_queue(text, integer) to authenticated;
grant execute on function public.review_recording(uuid, text, text) to authenticated;
grant execute on function public.pull_voice(text, text) to authenticated;
grant execute on function public.owner_recorders() to authenticated;
grant execute on function public.owner_save_recorder(text, text, boolean, boolean) to authenticated;
grant execute on function public.owner_blocked_words() to authenticated;
grant execute on function public.owner_set_blocked_word(text, boolean) to authenticated;
grant execute on function public.community_voices() to anon, authenticated;

-- Starter block list (French and English). Your Wolof reviewer should add Wolof words
-- in the owner console (Voices → Blocked words); they are matched without accents.
insert into public.blocked_words (word) values
  ('merde'), ('putain'), ('connard'), ('connasse'), ('salope'), ('encule'), ('enculer'), ('batard'),
  ('fuck'), ('fucking'), ('shit'), ('bitch'), ('bastard'), ('asshole'), ('cunt'), ('dick')
on conflict do nothing;
