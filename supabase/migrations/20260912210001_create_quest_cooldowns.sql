-- S2D / S3: Authoritative cooldowns — prevents immediate repeat completion
-- Mirrors GameState.cooldowns Record<cooldownKey, availableAtMs> but DB-backed.
-- cooldown_key = 'template:<id>' or 'custom:<lower(trim(name))>' per lib/quest-library.ts

create table if not exists public.quest_cooldowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cooldown_key text not null,
  available_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint quest_cooldowns_user_key_unique unique (user_id, cooldown_key)
);

create index if not exists quest_cooldowns_user_id_idx on public.quest_cooldowns (user_id);
create index if not exists quest_cooldowns_available_at_idx on public.quest_cooldowns (available_at);

alter table public.quest_cooldowns enable row level security;

drop policy if exists "Users can view own cooldowns" on public.quest_cooldowns;
create policy "Users can view own cooldowns"
  on public.quest_cooldowns for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cooldowns" on public.quest_cooldowns;
create policy "Users can insert own cooldowns"
  on public.quest_cooldowns for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cooldowns" on public.quest_cooldowns;
create policy "Users can update own cooldowns"
  on public.quest_cooldowns for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cooldowns" on public.quest_cooldowns;
create policy "Users can delete own cooldowns"
  on public.quest_cooldowns for delete
  to authenticated
  using (auth.uid() = user_id);
