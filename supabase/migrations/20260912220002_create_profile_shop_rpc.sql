-- Secure profile edit + shop/inventory

-- Inventory table (user-owned items)
create table if not exists public.inventory_items (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slot text not null check (slot in ('Relic','Keepsake','Cosmetic','Trophy')),
  note text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists inventory_user_id_idx on public.inventory_items (user_id);

alter table public.inventory_items enable row level security;
drop policy if exists "Users can view own inventory" on public.inventory_items;
create policy "Users can view own inventory" on public.inventory_items for select to authenticated using (auth.uid() = user_id);
-- No direct INSERT/UPDATE/DELETE for client; via RPC only
-- Ensure no permissive policies remain
drop policy if exists "Users can insert own inventory" on public.inventory_items;
drop policy if exists "Users can update own inventory" on public.inventory_items;
drop policy if exists "Users can delete own inventory" on public.inventory_items;

-- Shop catalog (server-trusted prices) — mirrors lib/shop.ts GOLD_SHOP
create table if not exists public.shop_items (
  id text primary key,
  name text not null,
  cost integer not null check (cost >= 0),
  slot text not null,
  note text not null
);

insert into public.shop_items (id, name, cost, slot, note) values
  ('shop-lantern-pin','Lantern Pin',40,'Cosmetic','A warm brass pin for your traveler cloak.'),
  ('shop-sakura-obi','Sakura Obi Thread',55,'Cosmetic','Pale pink thread for ceremonial wear.'),
  ('shop-ink-fan','Ink Folding Fan',70,'Keepsake','A quiet fan painted with mountain mist.'),
  ('shop-moon-bell','Moon Bell',90,'Relic','Rings once at dusk. Purely ceremonial.')
on conflict (id) do update set name=excluded.name, cost=excluded.cost, slot=excluded.slot, note=excluded.note;

-- Profile edit RPC: verifies XP balance, deducts cost, updates safe fields only
create or replace function public.edit_profile(
  p_name text,
  p_village_name text,
  p_gender text,
  p_title text,
  p_avatar_id text,
  p_timezone text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile public.profiles;
  v_cost integer := 15;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'Profile not found';
  end if;
  if coalesce(v_profile.xp,0) < v_cost then
    raise exception 'Not enough XP to edit profile';
  end if;
  if p_name is null or length(trim(p_name)) < 2 then raise exception 'Name too short'; end if;
  if p_village_name is null or length(trim(p_village_name)) < 2 then raise exception 'Village name too short'; end if;

  update public.profiles set
    username = trim(p_name),
    -- village name not in current profiles schema, store in username or ignore; we keep for extensibility via a new column if needed
    -- For now, we store village name in a separate column if exists, else ignore
    -- Add village_name column if missing
    xp = v_profile.xp - v_cost,
    level = ((v_profile.xp - v_cost) / 1000)::int + 1,
    timezone = coalesce(p_timezone, v_profile.timezone)
  where id = v_user_id
  returning * into v_profile;

  -- Record gold transaction for edit cost as negative XP? We keep XP ledger via profiles only; no gold_transaction for XP cost

  return v_profile;
end;
$$;

-- Ensure village_name column exists for edit_profile
alter table public.profiles add column if not exists village_name text;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists title text;
alter table public.profiles add column if not exists avatar_id text;

revoke all on function public.edit_profile(text,text,text,text,text,text) from public;
grant execute on function public.edit_profile(text,text,text,text,text,text) to authenticated;

-- Shop purchase RPC: verifies balance, deducts gold, grants inventory, ledger
create or replace function public.purchase_item(p_shop_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile public.profiles;
  v_item public.shop_items;
  v_exists boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  select * into v_item from public.shop_items where id = p_shop_id;
  if not found then raise exception 'Item not found'; end if;
  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then raise exception 'Profile not found'; end if;
  if coalesce(v_profile.gold,0) < v_item.cost then raise exception 'Not enough gold'; end if;
  select exists(select 1 from public.inventory_items where user_id = v_user_id and id = v_item.id) into v_exists;
  if v_exists then raise exception 'Already owned'; end if;

  update public.profiles set gold = v_profile.gold - v_item.cost where id = v_user_id;

  insert into public.inventory_items (id, user_id, name, slot, note) values (v_item.id, v_user_id, v_item.name, v_item.slot, v_item.note);

  insert into public.gold_transactions (id, user_id, amount, reason) values ('gold-' || substr(md5(random()::text),1,6), v_user_id, -v_item.cost, 'Shop: ' || v_item.name);

  return jsonb_build_object('item_id', v_item.id, 'new_gold', v_profile.gold - v_item.cost);
end;
$$;

revoke all on function public.purchase_item(text) from public;
grant execute on function public.purchase_item(text) to authenticated;

-- Arcade game RPC (gold cost, xp reward)
create or replace function public.play_game(p_game_id text, p_gold_cost integer, p_xp_reward integer, p_note text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile public.profiles;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_gold_cost < 0 or p_xp_reward < 0 then raise exception 'Invalid amounts'; end if;
  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then raise exception 'Profile not found'; end if;
  if coalesce(v_profile.gold,0) < p_gold_cost then raise exception 'Not enough gold'; end if;

  update public.profiles set gold = v_profile.gold - p_gold_cost, xp = v_profile.xp + p_xp_reward, level = ((v_profile.xp + p_xp_reward)/1000)::int + 1 where id = v_user_id;
  if p_gold_cost > 0 then
    insert into public.gold_transactions (id, user_id, amount, reason) values ('gold-' || substr(md5(random()::text),1,6), v_user_id, -p_gold_cost, coalesce(p_note,'Game'));
  end if;
  return jsonb_build_object('new_gold', v_profile.gold - p_gold_cost, 'new_xp', v_profile.xp + p_xp_reward);
end;
$$;

revoke all on function public.play_game(text,integer,integer,text) from public;
grant execute on function public.play_game(text,integer,integer,text) to authenticated;
