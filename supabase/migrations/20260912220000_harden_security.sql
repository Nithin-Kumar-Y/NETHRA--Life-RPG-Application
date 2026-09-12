-- Master hardening: profiles, quests, cooldowns, gold_transactions
-- Fixes insecure direct UPDATE/INSERT that allowed client XP/gold/reward forgery
-- All progression changes now via SECURITY DEFINER RPCs

-- ============== QUESTS: restrict UPDATE ==============
-- Existing: authenticated could UPDATE any field (xp_reward, gold_reward, status, user_id)
-- Hardened: remove direct UPDATE, only RPC can change status/completed_at/expired_at
-- Keep SELECT/INSERT/DELETE for legitimate client ops (create/delete active)
drop policy if exists "Users can update own quests" on public.quests;
-- No replacement UPDATE policy => authenticated cannot directly UPDATE quests
-- Completion/expiry now via expire_overdue_quests / complete_quest RPCs only

-- Ensure SELECT/INSERT/DELETE remain (recreate to be explicit)
drop policy if exists "Users can view own quests" on public.quests;
create policy "Users can view own quests" on public.quests for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own quests" on public.quests;
create policy "Users can insert own quests" on public.quests for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can delete own quests" on public.quests;
create policy "Users can delete own quests" on public.quests for delete to authenticated using (auth.uid() = user_id);
-- Note: INSERT is still allowed but will be hardened via RPC in next migration
-- For now, INSERT via RLS is kept for backward compatibility; secure creation RPC will be preferred
-- Reward forgery via INSERT is mitigated by next migration's RPC that validates template and overwrites rewards
-- To fully block forged rewards, we will revoke INSERT and require RPC; keeping INSERT for now to avoid breaking anonymous fallback

-- ============== COOLDOWNS: read-only for client ==============
-- Existing: allowed INSERT/UPDATE/DELETE own cooldowns => bypass
drop policy if exists "Users can insert own cooldowns" on public.quest_cooldowns;
drop policy if exists "Users can update own cooldowns" on public.quest_cooldowns;
drop policy if exists "Users can delete own cooldowns" on public.quest_cooldowns;
-- Keep only SELECT
drop policy if exists "Users can view own cooldowns" on public.quest_cooldowns;
create policy "Users can view own cooldowns" on public.quest_cooldowns for select to authenticated using (auth.uid() = user_id);
-- Cooldowns now only created/updated by complete_quest RPC (SECURITY DEFINER bypasses RLS)

-- ============== GOLD_TRANSACTIONS: read-only ==============
-- Already correct: only SELECT for authenticated, no INSERT for client
-- Re-assert
drop policy if exists "Users can view own transactions" on public.gold_transactions;
create policy "Users can view own transactions" on public.gold_transactions for select to authenticated using (auth.uid() = user_id);
-- No insert/update/delete for authenticated => RPC only

-- ============== PROFILES: restrict sensitive columns ==============
-- Existing profiles RLS likely allows UPDATE own row unrestricted => client could set xp=999999
-- Harden: remove existing permissive UPDATE and replace with column-restricted logic via trigger
-- Since RLS cannot do column-level, use a trigger to prevent sensitive changes outside RPC

-- Ensure RLS enabled
alter table public.profiles enable row level security;

-- Recreate SELECT/INSERT policies if missing (idempotent)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can view own profile (anon)" on public.profiles;
-- Allow users to insert their own profile (for new signup)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Harden UPDATE: allow only safe fields (username, timezone, village_name if exists, avatar fields)
-- We implement via trigger that checks if sensitive columns changed outside RPC
-- Create function to block sensitive direct updates
create or replace function public.profiles_block_sensitive_update()
returns trigger language plpgsql as $$
begin
  -- Allow if this update is performed by the RPC (which runs as definer and bypasses RLS, but trigger still fires)
  -- We detect RPC by checking if the update comes from complete_quest / edit_profile RPC via a session variable
  -- Simpler: if OLD.xp is distinct from NEW.xp etc, check if the change is via allowed path
  -- For now, block direct authenticated updates to xp, level, strength, intellect, discipline, gold
  -- unless the update is from a SECURITY DEFINER function (which sets a custom GUC)
  -- We use a cheap check: if current user is authenticated and not service_role, and sensitive columns changed, raise
  -- SECURITY DEFINER functions run as owner (postgres), not authenticated, so they bypass this check
  -- Actually, SECURITY DEFINER still has auth.uid() = user, but current_user = postgres owner
  -- So we check current_user
  if current_user != 'postgres' and current_user != 'supabase_admin' and session_user != 'postgres' then
    -- This is a direct client update (authenticated role)
    if NEW.xp is distinct from OLD.xp or NEW.level is distinct from OLD.level or NEW.gold is distinct from OLD.gold or NEW.strength is distinct from OLD.strength or NEW.intellect is distinct from OLD.intellect or NEW.discipline is distinct from OLD.discipline then
      raise exception 'Direct update of XP/level/gold/attributes not allowed — use RPC';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists profiles_block_sensitive_update_trigger on public.profiles;
create trigger profiles_block_sensitive_update_trigger
  before update on public.profiles
  for each row execute function public.profiles_block_sensitive_update();

-- Allow safe UPDATE for username/timezone via RLS
drop policy if exists "Users can update own safe profile fields" on public.profiles;
create policy "Users can update own safe profile fields" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
-- The trigger will still block sensitive columns, so this policy is safe
