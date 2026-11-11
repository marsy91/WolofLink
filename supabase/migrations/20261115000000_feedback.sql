-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- In-app feedback: learners (with or without an account) send an idea, a bug, a
-- Wolof correction or anything else, with an optional star rating. The owner reads
-- it in the console (Reports → Feedback). The app version, language and screen are
-- added so problems can be found; an email is shown only for a signed-in learner
-- who ticked "you can reply to me". The owner can pause it (switch "feedback").

create table if not exists public.app_feedback (
  id          bigserial primary key,
  user_id     uuid references auth.users (id) on delete set null,
  kind        text not null check (kind in ('idea', 'bug', 'wolof', 'other')),
  rating      integer check (rating between 1 and 5),
  message     text not null check (char_length(btrim(message)) between 3 and 1000),
  contact_ok  boolean not null default false,
  app_version text check (app_version is null or app_version ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'),
  lang        text check (lang is null or lang in ('en', 'fr', 'es', 'de', 'it')),
  screen      text check (screen is null or screen ~ '^/[a-z0-9/_-]{0,80}$'),
  status      text not null default 'open' check (status in ('open', 'read', 'done')),
  created_at  timestamptz not null default now()
);
create index if not exists app_feedback_status_idx on public.app_feedback (status, created_at desc);
create index if not exists app_feedback_user_idx on public.app_feedback (user_id, created_at desc);
alter table public.app_feedback enable row level security;
revoke all on public.app_feedback from public, anon, authenticated;

-- The owner can pause feedback remotely.
alter table public.remote_switches drop constraint if exists remote_switches_key_check;
alter table public.remote_switches add constraint remote_switches_key_check
  check (key in ('friends', 'duels', 'voices', 'supporter', 'reports', 'community', 'nearby', 'bot_duels', 'feedback'));
insert into public.remote_switches (key) values ('feedback') on conflict do nothing;

-- Learners send feedback (account optional). Limits: 5 a day per account; without
-- an account, 300 an hour in total so nobody can flood the inbox.
create or replace function public.send_feedback(fb_kind text, fb_rating integer, fb_message text, fb_contact boolean,
                                                fb_version text, fb_lang text, fb_screen text)
  returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if exists (select 1 from public.remote_switches s where s.key = 'feedback' and s.is_off) then
    raise exception 'paused' using errcode = '55000';
  end if;
  if uid is not null then
    if (select count(*) from public.app_feedback f where f.user_id = uid and f.created_at > now() - interval '1 day') >= 5 then
      raise exception 'too many' using errcode = '54000';
    end if;
  elsif (select count(*) from public.app_feedback f where f.user_id is null and f.created_at > now() - interval '1 hour') >= 300 then
    raise exception 'too many' using errcode = '54000';
  end if;
  insert into public.app_feedback (user_id, kind, rating, message, contact_ok, app_version, lang, screen)
  values (uid, fb_kind, fb_rating, btrim(fb_message), coalesce(fb_contact, false) and uid is not null,
          nullif(fb_version, ''), nullif(fb_lang, ''), nullif(fb_screen, ''));
end;
$$;

-- Console: the inbox (email only when the learner allowed a reply).
create or replace function public.owner_feedback(fb_status text default 'open', max_rows integer default 200)
  returns table (id bigint, created_at timestamptz, kind text, rating integer, message text, status text,
                 app_version text, lang text, screen text, reply_to text)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read feedback');
  return query
    select f.id, f.created_at, f.kind, f.rating, f.message, f.status, f.app_version, f.lang, f.screen,
           case when f.contact_ok then u.email::text end
    from public.app_feedback f
    left join auth.users u on u.id = f.user_id
    where fb_status = 'all' or f.status = fb_status
    order by f.created_at desc
    limit least(greatest(max_rows, 1), 500);
end;
$$;

create or replace function public.owner_set_feedback_status(item bigint, new_status text)
  returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('feedback status', jsonb_build_object('feedback', item, 'status', new_status));
  update public.app_feedback f set status = new_status where f.id = item;
end;
$$;

-- Average rating and counts over the last 30 days, for the inbox header.
create or replace function public.owner_feedback_summary()
  returns table (total integer, open_count integer, rated integer, average numeric)
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_owner('read feedback');
  return query
    select count(*)::integer, count(*) filter (where f.status = 'open')::integer,
           count(f.rating)::integer, round(avg(f.rating)::numeric, 1)
    from public.app_feedback f where f.created_at > now() - interval '30 days';
end;
$$;

revoke execute on function public.send_feedback(text, integer, text, boolean, text, text, text) from public;
grant execute on function public.send_feedback(text, integer, text, boolean, text, text, text) to anon, authenticated;
do $$
declare f text;
begin
  foreach f in array array['public.owner_feedback(text, integer)', 'public.owner_set_feedback_status(bigint, text)', 'public.owner_feedback_summary()'] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
