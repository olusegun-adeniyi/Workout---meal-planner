create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text not null,
  height_cm numeric,
  current_weight_kg numeric,
  target_weight_kg numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
add column if not exists height_cm numeric,
add column if not exists current_weight_kg numeric,
add column if not exists target_weight_kg numeric;

alter table public.user_profiles enable row level security;

drop policy if exists "Service role can manage user profiles" on public.user_profiles;

create policy "Service role can manage user profiles"
on public.user_profiles
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Service role can manage push subscriptions" on public.push_subscriptions;

create policy "Service role can manage push subscriptions"
on public.push_subscriptions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
