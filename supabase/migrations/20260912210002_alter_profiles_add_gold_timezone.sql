-- S3 / S8: Profile extensions for timezone-aware expiry and gold persistence
-- Existing profiles: id uuid pk, username text, level int, xp int, strength int, intellect int, discipline int, created_at
-- Add gold (mirrors GameState.gold) and timezone (for daily expiry in user's local midnight).

alter table public.profiles add column if not exists gold integer not null default 25;
alter table public.profiles add column if not exists timezone text;

-- Store browser timezone via Intl.DateTimeFormat().resolvedOptions().timeZone
-- Example: 'Asia/Calcutta', 'America/New_York'. Null = fallback to UTC.

-- Index timezone for expiry jobs if needed
create index if not exists profiles_timezone_idx on public.profiles (timezone);

-- RLS already exists for profiles; ensure gold/timezone are covered by existing policies
-- No new policies needed if existing policies are `for all` with using (auth.uid() = id).
-- If policies are restrictive, they automatically include new columns.
