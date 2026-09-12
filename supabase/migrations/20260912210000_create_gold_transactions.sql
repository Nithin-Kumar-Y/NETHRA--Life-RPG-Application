-- S3: Gold transactions — secure ledger for XP/Gold rewards
-- Prevents browser from awarding itself arbitrary gold. Rewards originate from trusted RPC.

create table if not exists public.gold_transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null, -- positive = reward, negative = spend
  reason text not null, -- e.g. 'Quest: Read' or 'Shop: ...'
  quest_id text references public.quests(id) on delete set null,
  created_at timestamptz not null default now(),
  -- prevent duplicate reward for same quest (idempotent completion)
  constraint gold_transactions_quest_unique unique (quest_id)
);

-- Indexes for per-user ledger
create index if not exists gold_transactions_user_id_idx on public.gold_transactions (user_id);
create index if not exists gold_transactions_quest_id_idx on public.gold_transactions (quest_id);
create index if not exists gold_transactions_created_at_idx on public.gold_transactions (created_at desc);

-- RLS: users can only read own transactions. Direct inserts are restricted;
-- reward inserts are performed by SECURITY DEFINER RPC (complete_quest) which bypasses RLS.
-- To prevent arbitrary positive gold from client, we do NOT create an INSERT policy for authenticated
-- (only service_role / RPC can insert). Spends (shop/games) will also be moved to RPC in future;
-- for now, allow no direct inserts from client.

alter table public.gold_transactions enable row level security;

drop policy if exists "Users can view own transactions" on public.gold_transactions;
create policy "Users can view own transactions"
  on public.gold_transactions for select
  to authenticated
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated => blocked by default.
-- RPC with SECURITY DEFINER (owner = postgres/service_role) will bypass and insert securely.
-- If future client spends need to be allowed, add a restrictive policy:
--   with check (auth.uid() = user_id and amount <= 0)

-- Prevent gold_transactions from being inserted with arbitrary quest_id of another user:
-- enforced via FK + RLS + RPC checks.
