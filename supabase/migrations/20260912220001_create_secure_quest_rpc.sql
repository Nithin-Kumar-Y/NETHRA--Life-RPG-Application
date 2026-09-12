-- Secure quest creation: server validates template/quantity/rewards, prevents 999999 forgery
-- Replaces direct INSERT with RPC for library/custom quests

-- Needed template data: we embed the library as a table for server validation
-- Instead of creating a separate templates table, we validate via hardcoded check in function
-- This keeps single source of truth with lib/quest-library.ts but enforced server-side

create table if not exists public.quest_templates (
  id text primary key,
  name text not null,
  genre text not null check (genre in ('INTELLECT','STRENGTH','DISCIPLINE')),
  unit text not null,
  min_value integer not null,
  max_value integer not null,
  xp_per_unit numeric not null,
  gold_per_unit numeric not null,
  cooldown_minutes integer not null
);

-- Seed templates from lib/quest-library.ts (id, name, genre, unit, min, max, xpPerUnit, goldPerUnit, cooldown)
insert into public.quest_templates (id, name, genre, unit, min_value, max_value, xp_per_unit, gold_per_unit, cooldown_minutes) values
  ('breathe','Breathe','DISCIPLINE','minutes',3,30,2,0.4,30),
  ('clean','Clean','DISCIPLINE','rooms',1,8,12,3,45),
  ('code','Code','INTELLECT','minutes',20,180,1,0.25,45),
  ('cook','Cook','DISCIPLINE','meals',1,4,20,5,40),
  ('cycle','Cycle','STRENGTH','kilometers',2,40,4,1,50),
  ('draw','Draw','INTELLECT','minutes',15,120,1,0.25,35),
  ('exercise','Exercise','STRENGTH','minutes',15,90,2,0.5,50),
  ('hydrate','Hydrate','DISCIPLINE','glasses',3,12,3,1,30),
  ('journal','Journal','DISCIPLINE','pages',1,10,12,3,30),
  ('language','Language','INTELLECT','minutes',10,90,2,0.4,40),
  ('learn','Learn','INTELLECT','minutes',15,120,2,0.4,40),
  ('listen','Listen','INTELLECT','minutes',10,90,1,0.2,30),
  ('meditate','Meditate','DISCIPLINE','minutes',5,60,3,0.6,35),
  ('mobility','Mobility','STRENGTH','minutes',10,45,2,0.5,40),
  ('music','Music','INTELLECT','minutes',15,90,2,0.4,40),
  ('plan','Plan','DISCIPLINE','tasks',1,12,6,1.5,30),
  ('practice','Practice','DISCIPLINE','minutes',15,120,2,0.4,40),
  ('pushups','Push-ups','STRENGTH','reps',10,100,1,0.25,40),
  ('read','Read','INTELLECT','pages',10,100,2,0.5,30),
  ('research','Research','INTELLECT','minutes',20,150,1,0.25,45),
  ('review','Review','INTELLECT','cards',10,80,1,0.25,30),
  ('run','Run','STRENGTH','kilometers',1,20,8,2,50),
  ('sleep','Sleep well','DISCIPLINE','hours',6,10,8,2,60),
  ('stretch','Stretch','STRENGTH','minutes',5,40,2,0.5,30),
  ('study','Study','INTELLECT','minutes',20,180,1,0.25,45),
  ('swim','Swim','STRENGTH','laps',4,40,3,0.75,50),
  ('tidy','Tidy','DISCIPLINE','minutes',10,60,2,0.5,35),
  ('train','Gym','STRENGTH','minutes',20,90,2,0.5,60),
  ('walk','Walk','STRENGTH','minutes',10,90,1,0.3,30),
  ('write','Write','INTELLECT','words',100,1500,0.05,0.012,40),
  ('yoga','Yoga','STRENGTH','minutes',10,75,2,0.5,45),
  ('cold','Cold shower','DISCIPLINE','minutes',1,10,8,2,40),
  ('focus','Deep work','INTELLECT','minutes',25,120,2,0.4,50),
  ('steps','Steps','STRENGTH','steps',2000,15000,0.006,0.0015,40),
  ('call','Call a friend','DISCIPLINE','minutes',10,60,2,0.4,45),
  ('garden','Garden','DISCIPLINE','minutes',10,90,2,0.5,40)
on conflict (id) do update set name=excluded.name, genre=excluded.genre, unit=excluded.unit, min_value=excluded.min_value, max_value=excluded.max_value, xp_per_unit=excluded.xp_per_unit, gold_per_unit=excluded.gold_per_unit, cooldown_minutes=excluded.cooldown_minutes;

-- Secure create quest RPC
create or replace function public.create_quest(
  p_template_id text,
  p_name text,
  p_description text,
  p_genre text,
  p_quantity integer,
  p_unit text,
  p_scheduled_date date,
  p_timezone text default null
)
returns public.quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_today date;
  v_tz text;
  v_template record;
  v_xp integer;
  v_gold integer;
  v_cooldown integer;
  v_unit text;
  v_name text;
  v_desc text;
  v_genre text;
  v_quantity integer;
  v_quest_id text;
  v_quest public.quests;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  -- timezone -> today
  select timezone into v_tz from public.profiles where id = v_user_id;
  if p_timezone is not null and p_timezone <> '' then v_tz := p_timezone; end if;
  if v_tz is null or v_tz = '' then v_tz := 'UTC'; end if;
  begin
    v_today := (now() at time zone v_tz)::date;
  exception when others then
    v_today := (now() at time zone 'UTC')::date;
  end;

  if p_scheduled_date is null then raise exception 'scheduled date required'; end if;
  if p_scheduled_date < v_today then raise exception 'Quests cannot be scheduled in the past'; end if;
  -- current month check (same as reducer: scheduled date must be in current month)
  if to_char(p_scheduled_date, 'YYYY-MM') != to_char(v_today, 'YYYY-MM') then
    raise exception 'Scheduling is limited to the current month';
  end if;

  if p_template_id is not null and p_template_id <> '' then
    -- Library quest: validate template
    select * into v_template from public.quest_templates where id = p_template_id;
    if not found then raise exception 'Template not found'; end if;
    -- quantity must be provided and within min/max
    if p_quantity is null then raise exception 'Quantity required for library quest'; end if;
    if p_quantity < v_template.min_value then raise exception 'Quantity below minimum'; end if;
    if p_quantity > v_template.max_value then raise exception 'Quantity above maximum'; end if;
    -- genre must match template genre (prevent client forging genre)
    if p_genre is not null and p_genre != v_template.genre then
      raise exception 'Genre does not match template';
    end if;
    v_genre := v_template.genre;
    v_unit := v_template.unit;
    v_quantity := p_quantity;
    v_name := v_template.name;
    v_desc := p_quantity::text || ' ' || v_template.unit;
    v_xp := greatest(1, round(p_quantity * v_template.xp_per_unit)::int);
    v_gold := greatest(1, round(p_quantity * v_template.gold_per_unit)::int);
    v_cooldown := v_template.cooldown_minutes;
    -- cooldown check
    if exists (select 1 from public.quest_cooldowns where user_id = v_user_id and cooldown_key = 'template:' || v_template.id and available_at > now()) then
      raise exception 'Quest cooldown is still running';
    end if;
  else
    -- Custom quest: fixed reward 50 XP / 5 Gold, 45m cooldown
    if p_name is null or length(trim(p_name)) < 2 then raise exception 'Custom quest name required'; end if;
    v_name := trim(p_name);
    v_desc := coalesce(trim(p_description), '');
    v_genre := coalesce(p_genre, 'DISCIPLINE');
    if v_genre not in ('INTELLECT','STRENGTH','DISCIPLINE') then raise exception 'Invalid genre'; end if;
    v_quantity := p_quantity; -- nullable
    v_unit := p_unit; -- nullable
    v_xp := 50;
    v_gold := 5;
    v_cooldown := 45;
    if exists (select 1 from public.quest_cooldowns where user_id = v_user_id and cooldown_key = 'custom:' || lower(v_name) and available_at > now()) then
      raise exception 'Custom quest cooldown still running';
    end if;
  end if;

  -- generate id like quest-xxxx
  v_quest_id := 'quest-' || substr(md5(random()::text),1,6) || '-' || substr(md5(now()::text),1,6);

  insert into public.quests (id, user_id, template_id, name, description, genre, scheduled_date, quantity, unit, xp_reward, gold_reward, status, created_at, cooldown_minutes)
  values (v_quest_id, v_user_id, nullif(p_template_id,''), v_name, v_desc, v_genre, p_scheduled_date, v_quantity, v_unit, v_xp, v_gold, 'active', now(), v_cooldown)
  returning * into v_quest;

  return v_quest;
end;
$$;

revoke all on function public.create_quest(text,text,text,text,integer,text,date,text) from public;
grant execute on function public.create_quest(text,text,text,text,integer,text,date,text) to authenticated;
