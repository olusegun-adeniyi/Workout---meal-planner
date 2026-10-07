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

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.user_profiles(id) on delete set null,
  week_starting_date date not null unique,
  source text not null check (source in ('ai', 'fallback')),
  plan jsonb not null,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.weekly_plans enable row level security;

drop policy if exists "Service role can manage weekly plans" on public.weekly_plans;

create policy "Service role can manage weekly plans"
on public.weekly_plans
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Logging (Today screen). One row per planned slot per day; custom logs have a
-- null slot, and NULLs are distinct under UNIQUE, so any number are allowed.
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null,
  slot text check (slot in ('breakfast', 'brunch', 'lunch', 'dinner')),
  status text not null check (status in ('eaten', 'skipped')),
  source text not null check (source in ('planned', 'custom_text')),
  name text not null,
  calories integer not null check (calories >= 0),
  protein_g integer not null check (protein_g >= 0),
  notes text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (log_date, slot)
);

create index if not exists meal_logs_log_date_idx on public.meal_logs (log_date);

alter table public.meal_logs enable row level security;

drop policy if exists "Service role can manage meal logs" on public.meal_logs;

create policy "Service role can manage meal logs"
on public.meal_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null unique,
  split_label text not null,
  completed_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

drop policy if exists "Service role can manage workout logs" on public.workout_logs;

create policy "Service role can manage workout logs"
on public.workout_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Photo logging: AI-estimated meals from a food photo (photos themselves aren't stored).
alter table public.meal_logs drop constraint if exists meal_logs_source_check;
alter table public.meal_logs
add constraint meal_logs_source_check check (source in ('planned', 'custom_text', 'custom_photo'));
