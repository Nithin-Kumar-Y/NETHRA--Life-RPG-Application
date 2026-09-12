-- NETHRA — S2A: Quest Database Foundation
-- One-time migration for `public.quests` persisting the current TypeScript Quest model.
-- Source of truth: lib/types.ts Quest, lib/game-reducer.ts creation logic, lib/quest-library.ts
-- Preserves existing `profiles` table + RLS; no service-role credentials in browser.
-- Do NOT wire UI yet; DB foundation only.

-- 1) Table: maps 1:1 to lib/types.ts Quest
--    - id: text (uid("quest-...") not uuid)
--    - template_id: text nullable (Quest.templateId)
--    - name/title: text (Quest.name)
--    - description: text (Quest.description)
--    - genre: text check (QuestGenre = INTELLECT | STRENGTH | DISCIPLINE)
--    - scheduled_date: date (Quest.scheduledDate = YYYY-MM-DD localDateKey)
--    - quantity: integer nullable (Quest.quantity)
--    - unit: text nullable (Quest.unit)
--    - xp_reward: integer (Quest.xpReward)
--    - gold_reward: integer (Quest.goldReward)
--    - status: text check (QuestStatus = active | completed | expired)
--    - created_at: timestamptz (Quest.createdAt ISO)
--    - completed_at: timestamptz nullable (Quest.completedAt)
--    - expired_at: timestamptz nullable (Quest.expiredAt)
--    - cooldown_minutes: integer (Quest.cooldownMinutes) — per-quest cooldown window, not the separate GameState.cooldowns map
--    - user_id: uuid FK → auth.users(id) (owner). Chosen over profiles(id) because profiles.id = auth.users.id and auth.users is canonical; cascade on user delete.

create table if not exists public.quests (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text,
  name text not null,
  description text not null default '',
  genre text not null check (genre in ('INTELLECT', 'STRENGTH', 'DISCIPLINE')),
  scheduled_date date not null,
  quantity integer check (quantity is null or quantity >= 0),
  unit text,
  xp_reward integer not null check (xp_reward >= 0),
  gold_reward integer not null check (gold_reward >= 0),
  status text not null check (status in ('active', 'completed', 'expired')) default 'active',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  expired_at timestamptz,
  cooldown_minutes integer not null check (cooldown_minutes >= 0)
);

-- 2) Indexes: required for fast per-user lookups + filters
--    - user's quests (most common: where user_id = auth.uid())
--    - status (active vs completed/expired separation in UI)
--    - scheduled_date (calendar + Active Today / Upcoming)
--    Plus composites for the actual query patterns without adding overhead on writes.
create index if not exists quests_user_id_idx on public.quests (user_id);
create index if not exists quests_status_idx on public.quests (status);
create index if not exists quests_scheduled_date_idx on public.quests (scheduled_date);
create index if not exists quests_user_scheduled_idx on public.quests (user_id, scheduled_date);
create index if not exists quests_user_status_idx on public.quests (user_id, status);

-- 3) Row Level Security: authenticated users can only access their own rows
--    No broad insecure policies; anon gets no access (no policy for anon).
--    Service role bypasses RLS automatically—no key is placed in browser.

alter table public.quests enable row level security;

-- SELECT: only own quests
drop policy if exists "Users can view own quests" on public.quests;
create policy "Users can view own quests"
  on public.quests for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT: only quests belonging to self
drop policy if exists "Users can insert own quests" on public.quests;
create policy "Users can insert own quests"
  on public.quests for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: only own quests (covers status → completed/expired, and any future edits)
drop policy if exists "Users can update own quests" on public.quests;
create policy "Users can update own quests"
  on public.quests for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: only own quests (ActiveQuests allows deletion of active quests)
drop policy if exists "Users can delete own quests" on public.quests;
create policy "Users can delete own quests"
  on public.quests for delete
  to authenticated
  using (auth.uid() = user_id);
