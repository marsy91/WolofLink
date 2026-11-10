-- Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
-- Duels, new rules:
-- - Never the same word twice: the server picks each duel's 10 entries from those
--   NEITHER player has had in a duel before. An entry answered wrong comes back
--   once, but only after the learner has been through every entry ("second chance").
-- - Trophies: 1 per entry answered right, once per entry. The most anyone can have
--   is the number of entries in the course (private.duel_entries), so trophies never
--   go down and top out at "every word right".
-- - Crowns: the 10 questions are 3 rounds (1–3, 4–6, 7–10). Winning a round wins a
--   crown; more crowns wins the duel (equal crowns: higher score; then a draw).
-- - Older app versions keep working (create_duel / play_duel) but earn no trophies.

-- ── Entries the server knows (keep in sync with src/content/course.ts; a test checks) ──
create table if not exists private.duel_entries (id text primary key check (id ~ '^[a-zA-Z0-9._:-]{1,60}$'));
alter table private.duel_entries enable row level security;
revoke all on private.duel_entries from public, anon, authenticated;
insert into private.duel_entries (id) values
  ('a.amngaxaj'), ('a.asamaan'), ('a.bey'), ('a.biddiiw'), ('a.dafaytaw'), ('a.dex'), ('a.dexgi'), ('a.fas'),
  ('a.gaynde'), ('a.gispicc'), ('a.jant'), ('a.jantbi'), ('a.muus'), ('a.naarixar'), ('a.nag'), ('a.ngelaw'),
  ('a.ngelawli'), ('a.picc'), ('a.suuf'), ('a.xaj'), ('a.xar'), ('b.10000'), ('b.200'), ('b.300'),
  ('b.500'), ('b.its2000'), ('b.its500'), ('b.million'), ('b.seerlool'), ('b.wanni'), ('b.yomb'), ('c.amul'),
  ('c.amulsolo'), ('c.baal'), ('c.beggnaako'), ('c.beggumako'), ('c.begnaa'), ('c.bon'), ('c.dalal'), ('c.deggla'),
  ('c.deggnaa'), ('c.dimbali'), ('c.feebar'), ('c.jamm'), ('c.jammrekk'), ('c.kaay'), ('c.lii'), ('c.maangidem'),
  ('c.mennaa'), ('c.neexlool'), ('c.nookobokk'), ('c.suur'), ('c.teraanga'), ('c.tiis'), ('c.toogal'), ('c.waxal'),
  ('d.ammeew'), ('d.beggmaafe'), ('d.ceebjen'), ('d.dibi'), ('d.dugub'), ('d.lannga'), ('d.lax'), ('d.laxaksoow'),
  ('d.maafe'), ('d.meew'), ('d.soow'), ('e.anasabaay'), ('e.anasayaay'), ('e.damawoor'), ('e.dangawoor'), ('e.gan'),
  ('e.jerejefsuur'), ('e.joxmandox'), ('e.julli'), ('e.koor'), ('e.magni'), ('e.mungifi'), ('e.mungijulli'), ('e.ndeysaan'),
  ('e.ndogu'), ('e.neexnalool'), ('e.toogalfii'), ('e.woor'), ('f.an'), ('f.attaaya'), ('f.banaana'), ('f.begg'),
  ('f.ceeb'), ('f.ceebujen'), ('f.gerte'), ('f.ginaar'), ('f.jaay'), ('f.jen'), ('f.jend'), ('f.jendmburu'),
  ('f.kafe'), ('f.lantogg'), ('f.mango'), ('f.mar'), ('f.marse'), ('f.mburu'), ('f.ndekki'), ('f.ndox'),
  ('f.neex'), ('f.nen'), ('f.reer'), ('f.seer'), ('f.soble'), ('f.togg'), ('f.toggceeb'), ('f.wanni'),
  ('f.xiif'), ('f.xorom'), ('f.yapp'), ('f.yassa'), ('g.awa'), ('g.babeneen'), ('g.basuba'), ('g.dakar'),
  ('g.dara'), ('g.deedeet'), ('g.degg'), ('g.deggguma'), ('g.fanaane'), ('g.fandekk'), ('g.fi'), ('g.jerejef'),
  ('g.joge'), ('g.joob'), ('g.lubees'), ('g.maalekum'), ('g.manitam'), ('g.nanga'), ('g.ndank'), ('g.salaam'),
  ('g.sant'), ('g.senegaal'), ('g.tudd'), ('g.tuuti'), ('g.waaw'), ('g.waxaatal'), ('g.yendoo'), ('g.yownag'),
  ('h.amnggarab'), ('h.bakkan'), ('h.ben'), ('h.bet'), ('h.biir'), ('h.biirmetti'), ('h.bopp'), ('h.boppmetti'),
  ('h.doktoor'), ('h.garab'), ('h.gemmin'), ('h.loxo'), ('h.nopp'), ('h.tank'), ('h.wernaa'), ('h.wooal'),
  ('i.allo'), ('i.bindalma'), ('i.deggumala'), ('i.delluwoo'), ('i.doonlawoo'), ('i.joxalnimero'), ('i.manla'), ('i.wooma'),
  ('i.yonneema'), ('i.yonneengako'), ('k.anawanag'), ('k.bale'), ('k.foot'), ('k.lal'), ('k.neeg'), ('k.palanteer'),
  ('k.sangu'), ('k.sol'), ('k.taabal'), ('k.waan'), ('k.wanag'), ('k.yere'), ('k.yewwu'), ('l.ana'),
  ('l.bitig'), ('l.cammoon'), ('l.dekk'), ('l.demmarse'), ('l.demndakaaru'), ('l.fale'), ('l.fangay'), ('l.fii'),
  ('l.gaal'), ('l.garaas'), ('l.geej'), ('l.jege'), ('l.jubal'), ('l.kaar'), ('l.ker'), ('l.lekool'),
  ('l.loppitaan'), ('l.ndakaaru'), ('l.ndeyjoor'), ('l.oto'), ('l.roppalaan'), ('l.sore'), ('l.taksi'), ('l.tali'),
  ('l.taxawal'), ('l.welo'), ('m.amuldara'), ('m.bulmer'), ('m.bulragal'), ('m.jaaxle'), ('m.lulada'), ('m.mer'),
  ('m.mungibeg'), ('m.ragal'), ('m.rus'), ('m.yeemu'), ('n.1'), ('n.10'), ('n.100'), ('n.100f'),
  ('n.11'), ('n.12'), ('n.15'), ('n.2'), ('n.20'), ('n.2000'), ('n.3'), ('n.30'),
  ('n.4'), ('n.5'), ('n.50'), ('n.6'), ('n.7'), ('n.8'), ('n.9'), ('n.age'),
  ('n.age20'), ('n.amuma'), ('n.count'), ('n.derem'), ('n.joxma'), ('n.joxmanen'), ('n.junni'), ('n.price'),
  ('n.xaalis'), ('p.amnaa'), ('p.amnga'), ('p.ana'), ('p.baax'), ('p.baay'), ('p.dafabaax'), ('p.dafanjool'),
  ('p.doom'), ('p.gatt'), ('p.goor'), ('p.jabar'), ('p.jekker'), ('p.jigeen'), ('p.kii'), ('p.mag'),
  ('p.moodu'), ('p.ndaw'), ('p.njool'), ('p.nungifa'), ('p.rafet'), ('p.rakk'), ('p.samabaay'), ('p.samayaay'),
  ('p.xale'), ('p.xarit'), ('p.xaritbubaax'), ('p.yaay'), ('p.yaaybaax'), ('q.baaxna'), ('q.ban'), ('q.banngabegg'),
  ('q.banwaxtu'), ('q.fanladekk'), ('q.feebaroon'), ('q.kan'), ('q.kanmoonew'), ('q.kiikanla'), ('q.lannga'), ('q.lutax'),
  ('q.lutaxnga'), ('q.menngasuba'), ('q.menuma'), ('q.naatadoom'), ('q.naka'), ('q.nakalatudd'), ('q.ndaxdinga'), ('q.nudem'),
  ('q.waawdinaa'), ('r.bulo'), ('r.dafarafet'), ('r.dafaweex'), ('r.dafaxonq'), ('r.dall'), ('r.jenddall'), ('r.mbaxana'),
  ('r.mbubb'), ('r.mbubbmi'), ('r.naatadall'), ('r.nuul'), ('r.sol'), ('r.solmbubb'), ('r.summi'), ('r.summil'),
  ('r.tubey'), ('r.tubeyninuul'), ('r.weex'), ('r.xonq'), ('s.begfeey'), ('s.daw'), ('s.deglu'), ('s.dinaatukki'),
  ('s.fanngaytukki'), ('s.feey'), ('s.fo'), ('s.jelsaxaar'), ('s.lamb'), ('s.lambnga'), ('s.maangidaw'), ('s.mbalax'),
  ('s.saxaar'), ('s.tukki'), ('s.xaleyi'), ('s.yoonwi'), ('t.ajjuma'), ('t.allarba'), ('t.altine'), ('t.alxames'),
  ('t.at'), ('t.ayubes'), ('t.berkidemb'), ('t.bes'), ('t.demb'), ('t.dibeer'), ('t.gaawu'), ('t.gannaaw'),
  ('t.guddi'), ('t.kan'), ('t.kanam'), ('t.kannganew'), ('t.leegi'), ('t.nawet'), ('t.ngoon'), ('t.noor'),
  ('t.suba'), ('t.subalaaynew'), ('t.subasi'), ('t.talaata'), ('t.taw'), ('t.tey'), ('t.teyaltine'), ('t.waxtu'),
  ('t.weer'), ('u.basuba'), ('u.dinaadem'), ('u.dinaalawoo'), ('u.dinanugis'), ('u.dingaanew'), ('u.dumadem'), ('u.dumanew'),
  ('u.menumatey'), ('u.suyalla'), ('u.yaakaar'), ('v.begdem'), ('v.beggjang'), ('v.deglul'), ('v.dem'), ('v.dinaanew'),
  ('v.fanligeey'), ('v.gis'), ('v.gisnaako'), ('v.jang'), ('v.jangwolof'), ('v.lanngaydef'), ('v.lekk'), ('v.lekknaa'),
  ('v.lekkuma'), ('v.ligeey'), ('v.maangilekk'), ('v.maangiligeey'), ('v.mennaa'), ('v.mennga'), ('v.naan'), ('v.nelaw'),
  ('v.new'), ('v.newal'), ('v.newalfii'), ('v.sedd'), ('v.sonn'), ('v.tang'), ('v.wax'), ('v.xamnaa'),
  ('v.xamuma'), ('v.xoolal'), ('w.beykat'), ('w.bind'), ('w.dawalkat'), ('w.jaaykat'), ('w.jangalekatlaa'), ('w.janglekat'),
  ('w.kaayit'), ('w.laaj'), ('w.lanngayligeey'), ('w.maangibind'), ('w.napkat'), ('w.ndongo'), ('w.teere'), ('w.ubbil'),
  ('x.baalmaaq'), ('x.baalnaala'), ('x.beggfecc'), ('x.dewenati'), ('x.fecc'), ('x.korite'), ('x.mbalax'), ('x.ndank'),
  ('x.ngente'), ('x.nitnit'), ('x.sabar'), ('x.sey'), ('x.tabaski'), ('x.woy'), ('y.agsinaa'), ('y.amoonoto'),
  ('y.dembligeey'), ('y.demndakaaru'), ('y.demuma'), ('y.doonligeey'), ('y.fandemoon'), ('y.gisnaala'), ('y.gisumako'), ('y.newna'),
  ('z.dekkbindaw'), ('z.gatt'), ('z.genamag'), ('z.genaseer'), ('z.genatang'), ('z.genayomb'), ('z.gudd'), ('z.liimoogen'),
  ('z.ndakaarumag'), ('z.rafetlool')
on conflict do nothing;

-- ── What each learner has had in duels ──────────────────────────────────────
-- right = trophy earned; wrong = missed once (one second chance); retired = missed twice.
create table if not exists public.duel_words (
  user_id    uuid not null references auth.users (id) on delete cascade,
  entry      text not null,
  state      text not null check (state in ('right', 'wrong', 'retired')),
  updated_at timestamptz not null default now(),
  primary key (user_id, entry)
);
alter table public.duel_words enable row level security;
revoke all on public.duel_words from public, anon, authenticated;

alter table public.duels
  add column if not exists challenger_points integer[] check (challenger_points is null or cardinality(challenger_points) = 10),
  add column if not exists opponent_points integer[] check (opponent_points is null or cardinality(opponent_points) = 10),
  add column if not exists challenger_crowns integer check (challenger_crowns between 0 and 3),
  add column if not exists opponent_crowns integer check (opponent_crowns between 0 and 3);
alter table public.duels drop constraint if exists duels_status_check;
alter table public.duels add constraint duels_status_check check (status in ('playing', 'waiting', 'done', 'declined'));

-- Trophies now count entries answered right (old +30/+15/+5 trophies are replaced).
update public.friend_profiles p
set trophies = (select count(*)::integer from public.duel_words w where w.user_id = p.user_id and w.state = 'right');

-- ── Helpers ─────────────────────────────────────────────────────────────────
-- Entries this learner can get in a new duel: never had, and not in one of their open
-- duels; once nothing new is left, the entries they missed once (second chance).
create or replace function private.duel_available(u uuid) returns table (entry text)
  language sql stable security definer set search_path = '' as $$
  with open_entries as (
    select unnest(d.entries) as id from public.duels d
    where u in (d.challenger, d.opponent)
      and ((d.status = 'playing' and d.created_at > now() - interval '1 day')
           or (d.status = 'waiting' and d.created_at > now() - interval '3 days'))
  ),
  unseen as (
    select e.id from private.duel_entries e
    where not exists (select 1 from public.duel_words w where w.user_id = u and w.entry = e.id)
      and e.id not in (select o.id from open_entries o)
  )
  select s.id from unseen s
  union all
  select w.entry from public.duel_words w
  where w.user_id = u and w.state = 'wrong'
    and not exists (select 1 from unseen)
    and exists (select 1 from private.duel_entries e where e.id = w.entry)
    and w.entry not in (select o.id from open_entries o);
$$;

create or replace function private.duels_off() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.remote_switches s where s.key in ('duels', 'friends') and s.is_off);
$$;

create or replace function private.valid_points(points integer[]) returns boolean
  language sql immutable set search_path = '' as $$
  select points is not null and cardinality(points) = 10
     and not exists (select 1 from unnest(points) p where p is null or p not between 0 and 150);
$$;

-- Crowns for a's points against b's: rounds are questions 1–3, 4–6 and 7–10.
create or replace function private.duel_crowns(a integer[], b integer[]) returns integer
  language sql immutable set search_path = '' as $$
  select ((select sum(x) from unnest(a[1:3]) x) > (select sum(x) from unnest(b[1:3]) x))::integer
       + ((select sum(x) from unnest(a[4:6]) x) > (select sum(x) from unnest(b[4:6]) x))::integer
       + ((select sum(x) from unnest(a[7:10]) x) > (select sum(x) from unnest(b[7:10]) x))::integer;
$$;

-- Records one player's answers; returns the trophies earned (new entries answered right).
create or replace function private.record_duel_words(u uuid, duel_entries text[], points integer[]) returns integer
  language plpgsql security definer set search_path = '' as $$
declare
  gained integer := 0;
  e text;
  st text;
begin
  for i in 1..cardinality(duel_entries) loop
    e := duel_entries[i];
    continue when not exists (select 1 from private.duel_entries x where x.id = e);
    select w.state into st from public.duel_words w where w.user_id = u and w.entry = e;
    if points[i] > 0 then
      if st is distinct from 'right' then
        insert into public.duel_words (user_id, entry, state) values (u, e, 'right')
        on conflict (user_id, entry) do update set state = 'right', updated_at = now();
        gained := gained + 1;
      end if;
    elsif st is null then
      insert into public.duel_words (user_id, entry, state) values (u, e, 'wrong');
    elsif st = 'wrong' then
      update public.duel_words w set state = 'retired', updated_at = now() where w.user_id = u and w.entry = e;
    end if;
  end loop;
  update public.friend_profiles p set trophies = p.trophies + gained where p.user_id = u;
  return gained;
end;
$$;

revoke execute on function private.duel_available(uuid) from public, anon, authenticated;
revoke execute on function private.duels_off() from public, anon, authenticated;
revoke execute on function private.valid_points(integer[]) from public, anon, authenticated;
revoke execute on function private.duel_crowns(integer[], integer[]) from public, anon, authenticated;
revoke execute on function private.record_duel_words(uuid, text[], integer[]) from public, anon, authenticated;

-- ── Playing a duel ──────────────────────────────────────────────────────────
-- 1. The challenger starts: the server picks 10 entries new to both players.
create or replace function public.start_duel(friend uuid)
  returns table (duel uuid, seed integer, entries text[])
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  picked text[];
  new_seed integer := floor(random() * 2000000000)::integer;
  saved uuid;
begin
  if uid is null or not private.are_friends(uid, friend) then
    raise exception 'not friends' using errcode = '42501';
  end if;
  if private.duels_off() then
    raise exception 'paused' using errcode = '55000';
  end if;
  if (select count(*) from public.duels d where d.challenger = uid and d.created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many duels today' using errcode = '54000';
  end if;
  if (select count(*) from public.duels d where d.challenger = uid and d.opponent = friend
        and ((d.status = 'waiting' and d.created_at > now() - interval '3 days')
             or (d.status = 'playing' and d.created_at > now() - interval '1 day'))) >= 3 then
    raise exception 'too many open duels with this friend' using errcode = '54000';
  end if;
  picked := array(
    select a.entry from private.duel_available(uid) a
    where a.entry in (select b.entry from private.duel_available(friend) b)
    order by random() limit 10);
  if cardinality(picked) < 10 then
    raise exception 'no new words' using errcode = 'P0001';
  end if;
  insert into public.duels (challenger, opponent, seed, entries, challenger_score, status)
  values (uid, friend, new_seed, picked, 0, 'playing')
  returning id into saved;
  return query select saved, new_seed, picked;
end;
$$;

-- 2. The challenger sends their answers (points per question, 0 = wrong).
create or replace function public.finish_duel(duel uuid, points integer[])
  returns integer
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  d public.duels;
begin
  select * into d from public.duels x where x.id = duel for update;
  if d.id is null or d.challenger <> uid or d.status <> 'playing' or d.created_at < now() - interval '1 day' then
    raise exception 'duel not found' using errcode = 'P0002';
  end if;
  if not private.valid_points(points) then
    raise exception 'bad score' using errcode = '22023';
  end if;
  -- The friend gets 3 full days from now.
  update public.duels x
  set challenger_points = points, challenger_score = (select sum(p) from unnest(points) p),
      status = 'waiting', created_at = now()
  where x.id = duel;
  return private.record_duel_words(uid, d.entries, points);
end;
$$;

-- 3. The friend plays the same questions; crowns decide the winner.
create or replace function public.answer_duel(duel uuid, points integer[])
  returns table (my_score integer, their_score integer, my_crowns integer, their_crowns integer,
                 result text, trophies_won integer, my_points integer[], their_points integer[])
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  d public.duels;
  mine integer;
  mc integer;
  tc integer;
  res text;
  gained integer;
begin
  select * into d from public.duels x where x.id = duel for update;
  if d.id is null or d.opponent <> uid then
    raise exception 'duel not found' using errcode = 'P0002';
  end if;
  if d.status <> 'waiting' or d.created_at < now() - interval '3 days' then
    raise exception 'this duel is over' using errcode = '55000';
  end if;
  if not private.valid_points(points) then
    raise exception 'bad score' using errcode = '22023';
  end if;
  mine := (select sum(p) from unnest(points) p);
  if d.challenger_points is not null then
    mc := private.duel_crowns(points, d.challenger_points);
    tc := private.duel_crowns(d.challenger_points, points);
  end if;
  res := case
    when coalesce(mc, 0) > coalesce(tc, 0) then 'won'
    when coalesce(mc, 0) < coalesce(tc, 0) then 'lost'
    when mine > d.challenger_score then 'won'
    when mine < d.challenger_score then 'lost'
    else 'draw' end;
  update public.duels x
  set opponent_points = points, opponent_score = mine, opponent_crowns = mc, challenger_crowns = tc,
      status = 'done', finished_at = now()
  where x.id = duel;
  gained := private.record_duel_words(uid, d.entries, points);
  return query select mine, d.challenger_score, mc, tc, res, gained, points, d.challenger_points;
end;
$$;

-- Older app versions: still playable, but trophies come only from the new rules.
create or replace function public.play_duel(duel uuid, score integer)
  returns table (my_score integer, their_score integer, result text, trophies_won integer)
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  d public.duels;
begin
  select * into d from public.duels x where x.id = duel for update;
  if d.id is null or d.opponent <> uid then
    raise exception 'duel not found' using errcode = 'P0002';
  end if;
  if d.status <> 'waiting' or d.created_at < now() - interval '3 days' then
    raise exception 'this duel is over' using errcode = '55000';
  end if;
  if score not between 0 and 1500 then
    raise exception 'bad score' using errcode = '22023';
  end if;
  update public.duels x set opponent_score = score, status = 'done', finished_at = now() where x.id = duel;
  return query select score, d.challenger_score,
    case when score > d.challenger_score then 'won' when score = d.challenger_score then 'draw' else 'lost' end, 0;
end;
$$;

-- ── Lists ───────────────────────────────────────────────────────────────────
drop function if exists public.my_duels();
create function public.my_duels()
  returns table (id uuid, other_name text, i_challenged boolean, my_score integer, their_score integer,
                 status text, seed integer, entries text[], created_at timestamptz,
                 other_id uuid, my_crowns integer, their_crowns integer)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  return query
    select d.id,
           coalesce(fp.display_name, '?'),
           d.challenger = uid,
           case when d.challenger = uid then d.challenger_score else d.opponent_score end,
           case when d.challenger = uid then d.opponent_score
                when d.status = 'done' then d.challenger_score else null end,
           case when d.status = 'waiting' and d.created_at < now() - interval '3 days' then 'expired' else d.status end,
           d.seed, d.entries, d.created_at,
           case when d.challenger = uid then d.opponent else d.challenger end,
           case when d.challenger = uid then d.challenger_crowns else d.opponent_crowns end,
           case when d.challenger = uid then d.opponent_crowns else d.challenger_crowns end
    from public.duels d
    left join public.friend_profiles fp on fp.user_id = case when d.challenger = uid then d.opponent else d.challenger end
    where uid in (d.challenger, d.opponent) and d.status <> 'playing' and d.created_at > now() - interval '30 days'
    order by d.created_at desc
    limit 50;
end;
$$;

-- My trophies and how many entries are left to duel.
create or replace function public.my_duel_words()
  returns table (trophies integer, total integer, unseen integer, second_chance integer)
  language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  return query
    select (select count(*)::integer from public.duel_words w where w.user_id = uid and w.state = 'right'),
           (select count(*)::integer from private.duel_entries),
           (select count(*)::integer from private.duel_entries e
             where not exists (select 1 from public.duel_words w where w.user_id = uid and w.entry = e.id)),
           (select count(*)::integer from public.duel_words w where w.user_id = uid and w.state = 'wrong');
end;
$$;

-- The weekly board also shows crowns won this week (return type changes, so recreate it).
drop function if exists public.friends_board();
create function public.friends_board()
  returns table (user_id uuid, display_name text, week_xp integer, streak integer, last_active timestamptz,
                 is_me boolean, trophies integer, week_crowns integer)
  language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  return query
    with people as (
      select uid as id
      union
      select case when f.user_a = uid then f.user_b else f.user_a end from public.friendships f where uid in (f.user_a, f.user_b)
    )
    select fp.user_id, fp.display_name, private.week_xp(fp.user_id),
           coalesce((pr.data -> 'streak' ->> 'count')::integer, 0), pr.updated_at, fp.user_id = uid, fp.trophies,
           coalesce((select sum(case when d.challenger = fp.user_id then d.challenger_crowns else d.opponent_crowns end)::integer
                     from public.duels d
                     where fp.user_id in (d.challenger, d.opponent) and d.status = 'done'
                       and d.finished_at >= date_trunc('week', now() at time zone 'utc') at time zone 'utc'), 0)
    from people x
    join public.friend_profiles fp on fp.user_id = x.id
    left join public.progress pr on pr.user_id = x.id
    order by 3 desc, 2;
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.start_duel(uuid)', 'public.finish_duel(uuid, integer[])', 'public.answer_duel(uuid, integer[])',
    'public.play_duel(uuid, integer)', 'public.my_duels()', 'public.my_duel_words()', 'public.friends_board()'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
