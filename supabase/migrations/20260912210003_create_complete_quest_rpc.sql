-- S3: Secure quest completion — authoritative, atomic, RLS-safe
-- Prevents client from awarding arbitrary XP/gold. All rewards derived from trusted DB row.
-- SECURITY DEFINER so it can insert gold_transactions (which has no client INSERT policy) and update profiles.

-- Helper to compute cooldown_key same as lib/quest-library.ts cooldownKey()
-- template:<id> or custom:<lower(trim(name))>
create or replace function public.quest_cooldown_key(p_template_id text, p_name text)
returns text language sql immutable as $$
  select case when p_template_id is not null and p_template_id <> '' then 'template:' || p_template_id else 'custom:' || lower(trim(p_name)) end
$$;

-- Complete quest: validates ownership, status, scheduled date (timezone-aware), cooldown, then atomically:
-- 1) mark quest completed
-- 2) insert gold transaction (prevents duplicates via unique quest_id)
-- 3) upsert cooldown
-- 4) update profile xp/gold/level/attributes
create or replace function public.complete_quest(p_quest_id text, p_timezone text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_quest record;
  v_today date;
  v_tz text;
  v_cooldown_key text;
  v_profile record;
  v_new_xp integer;
  v_new_level integer;
  v_new_intellect integer;
  v_new_strength integer;
  v_new_discipline integer;
  v_new_gold integer;
begin
  -- 1. authenticated user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 2. resolve timezone: param > profile.timezone > UTC
  select timezone into v_tz from public.profiles where id = v_user_id;
  if p_timezone is not null and p_timezone <> '' then
    v_tz := p_timezone;
    -- persist timezone if profile missing or different (best-effort, no error if fails)
    begin
      update public.profiles set timezone = v_tz where id = v_user_id;
    exception when others then null;
    end;
  end if;
  if v_tz is null or v_tz = '' then
    v_tz := 'UTC';
  end if;

  -- compute today in user's timezone
  begin
    v_today := (now() at time zone v_tz)::date;
  exception when others then
    v_today := (now() at time zone 'UTC')::date;
  end;

  -- 3. lock quest row
  select * into v_quest from public.quests where id = p_quest_id for update;
  if not found then
    raise exception 'Quest not found';
  end if;
  if v_quest.user_id != v_user_id then
    raise exception 'Quest does not belong to user';
  end if;
  if v_quest.status != 'active' then
    raise exception 'Quest is not active';
  end if;
  if v_quest.scheduled_date is null or v_quest.scheduled_date != v_today then
    raise exception 'Quest can only be completed on its scheduled day';
  end if;
  if v_quest.completed_at is not null then
    raise exception 'Quest already completed';
  end if;
  if v_quest.expired_at is not null then
    raise exception 'Quest is expired';
  end if;

  -- 4. cooldown check
  v_cooldown_key := public.quest_cooldown_key(v_quest.template_id, v_quest.name);
  if exists (select 1 from public.quest_cooldowns where user_id = v_user_id and cooldown_key = v_cooldown_key and available_at > now()) then
    raise exception 'Quest cooldown is still running';
  end if;

  -- 5. mark completed
  update public.quests set status = 'completed', completed_at = now() where id = p_quest_id;

  -- 6. gold transaction (unique quest_id prevents duplicate reward)
  begin
    insert into public.gold_transactions (id, user_id, amount, reason, quest_id)
    values ('gold-' || substr(md5(random()::text),1,6) || '-' || substr(md5(p_quest_id),1,8), v_user_id, v_quest.gold_reward, 'Quest: ' || v_quest.name, p_quest_id);
  exception when unique_violation then
    -- already awarded for this quest -> rollback quest update to keep idempotency
    raise exception 'Reward already claimed for this quest';
  end;

  -- 7. upsert cooldown
  insert into public.quest_cooldowns (user_id, cooldown_key, available_at)
  values (v_user_id, v_cooldown_key, now() + (v_quest.cooldown_minutes || ' minutes')::interval)
  on conflict (user_id, cooldown_key) do update set available_at = excluded.available_at, created_at = now();

  -- 8. profile progression — authoritative XP/gold/level
  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    -- create minimal profile if missing (should not happen, but safe)
    insert into public.profiles (id, username, level, xp, strength, intellect, discipline, gold)
    values (v_user_id, 'Traveler', 1, 0, 1, 1, 1, 25)
    returning * into v_profile;
  end if;

  v_new_xp := coalesce(v_profile.xp, 0) + v_quest.xp_reward;
  v_new_gold := coalesce(v_profile.gold, 25) + v_quest.gold_reward;
  -- derive level same as lib/rpg.ts levelFromTotalXp: floor(xp/1000)+1
  v_new_level := (v_new_xp / 1000)::int + 1;
  -- per-genre XP: profiles stores genre XP (same as GameState intellectXp etc)
  v_new_intellect := coalesce(v_profile.intellect, 0);
  v_new_strength := coalesce(v_profile.strength, 0);
  v_new_discipline := coalesce(v_profile.discipline, 0);
  if v_quest.genre = 'INTELLECT' then
    v_new_intellect := v_new_intellect + v_quest.xp_reward;
  elsif v_quest.genre = 'STRENGTH' then
    v_new_strength := v_new_strength + v_quest.xp_reward;
  elsif v_quest.genre = 'DISCIPLINE' then
    v_new_discipline := v_new_discipline + v_quest.xp_reward;
  end if;

  update public.profiles
  set xp = v_new_xp,
      gold = v_new_gold,
      level = v_new_level,
      intellect = v_new_intellect,
      strength = v_new_strength,
      discipline = v_new_discipline
  where id = v_user_id;

  return jsonb_build_object(
    'quest_id', p_quest_id,
    'xp_reward', v_quest.xp_reward,
    'gold_reward', v_quest.gold_reward,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'new_gold', v_new_gold,
    'cooldown_key', v_cooldown_key,
    'today', v_today
  );
end;
$$;

revoke all on function public.complete_quest(text, text) from public;
grant execute on function public.complete_quest(text, text) to authenticated;

-- Expire overdue quests (timezone-aware) — can be called on hydration or via cron.
-- Marks active quests with scheduled_date < today as expired.
create or replace function public.expire_overdue_quests(p_timezone text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_tz text;
  v_today date;
  v_count integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  select timezone into v_tz from public.profiles where id = v_user_id;
  if p_timezone is not null and p_timezone <> '' then
    v_tz := p_timezone;
  end if;
  if v_tz is null or v_tz = '' then
    v_tz := 'UTC';
  end if;
  begin
    v_today := (now() at time zone v_tz)::date;
  exception when others then
    v_today := (now() at time zone 'UTC')::date;
  end;

  update public.quests
  set status = 'expired', expired_at = now()
  where user_id = v_user_id and status = 'active' and scheduled_date < v_today;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.expire_overdue_quests(text) from public;
grant execute on function public.expire_overdue_quests(text) to authenticated;
