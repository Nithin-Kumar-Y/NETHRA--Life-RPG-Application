# NETHRA — Supabase Handoff

## Env
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # browser-safe publishable key (not anon, not service_role)
```
Never expose `SUPABASE_SERVICE_ROLE_KEY` in client. Server-only uses `SECURITY DEFINER` RPCs.

`.env.local` is gitignored (`# Environment variables` / `.env*.local`).

## Setup
1. `npm install` (adds `@supabase/ssr`, `@supabase/supabase-js`)
2. `npx supabase login` + `npx supabase link --project-ref <ref>`
3. `npx supabase db push` — applies pending (no `db reset`):
   - `20260912195600_create_quests_table.sql`
   - `20260912210000_create_gold_transactions.sql`
   - `20260912210001_create_quest_cooldowns.sql`
   - `20260912210002_alter_profiles_add_gold_timezone.sql`
   - `20260912210003_create_complete_quest_rpc.sql`
   - `20260912220000_harden_security.sql`
   - `20260912220001_create_secure_quest_rpc.sql` (quest_templates seed + `create_quest`)
   - `20260912220002_create_profile_shop_rpc.sql` (inventory_items, shop_items, `edit_profile`, `purchase_item`, `play_game`)

Verify: `npx supabase migration list`, `npx supabase db lint`, check `profiles`/`quests`/`gold_transactions`/`quest_cooldowns`/`inventory_items` + RPCs.

## Auth
- `lib/supabase/client.ts` (browser), `server.ts` (server), `middleware.ts` + root `middleware.ts` (session refresh)
- Pages: `/login`, `/signup` (email/password, `supabase.auth.signInWithPassword` / `signUp`)
- TopNav shows Login/Logout via `supabase.auth.getUser` + `onAuthStateChange`
- Anonymous fallback: `nethra.game.v1` localStorage authoritative when no session or Supabase unavailable

Flow: Signup → Auth user → `profiles` upsert timezone → Dashboard; Login → profile/quests/cooldowns/inventory hydration; Logout → `signOut()` → `/login`.

## RLS Model (authenticated only, `auth.uid()=user_id`/`id`)
- `quests`: SELECT own, INSERT own, DELETE own; **no UPDATE** (completion/expiry via RPC)
- `quest_cooldowns`: SELECT own only (RPC writes)
- `gold_transactions`: SELECT own only (RPC writes)
- `inventory_items`: SELECT own only (RPC writes)
- `profiles`: SELECT own, INSERT own, UPDATE safe fields only (trigger blocks `xp/level/gold/strength/intellect/discipline` direct changes)

Cross-user isolation tested via RLS `using/with check`.

## RPCs (SECURITY DEFINER, granted to `authenticated`)
- `complete_quest(p_quest_id, p_timezone)` — validates ownership/active/today/cooldown, derives rewards, updates quest, inserts gold_transaction (unique quest_id), upserts cooldown, updates profiles (xp/gold/level/genre XP)
- `expire_overdue_quests(p_timezone)` — `scheduled_date < today_in_tz` → expired
- `create_quest(p_template_id, p_name, ... p_scheduled_date, p_timezone)` — validates template/minmax/genre, calculates xp/gold server-side, inserts quest
- `edit_profile(p_name, p_village_name, ...)` — checks 15 XP cost, deducts, updates safe fields
- `purchase_item(p_shop_id)`, `play_game(...)` — checks balance/ownership, deducts gold, ledger, inventory

## LocalStorage Sync
Key `nethra.game.v1` remains. Authenticated+healthy → Supabase authoritative, LS cache. Unauthenticated/unavailable → LS. No auto-upload of pre-auth LS quests. `hasHydratedFromSupabaseRef` prevents stale overwrite.

## RPG Preservation
`lib/game-reducer.ts` pure, `lib/rpg.ts` formulas (`XP_PER_LEVEL 1000`, `attributeFromXp 1+floor(xp/80)`) unchanged, `lib/quest-library.ts` rewards preserved. UI (Sakura/glass, celebration, calendar) untouched.

## Run
```
npm run dev    # http://localhost:3000
npx tsc --noEmit
npm run build
```

## Deploy
Set `NEXT_PUBLIC_SUPABASE_URL` + `PUBLISHABLE_KEY` in Vercel env (no service_role). No secrets in repo.
