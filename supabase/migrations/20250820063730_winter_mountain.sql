/*
  # HealTrack Database Schema

  This schema defines the core tables for the HealTrack health tracking application.

  ## Tables Created
  1. **profiles** - User profile information (demographics, physical stats)
  2. **health_metrics** - Generic health data tracking (steps, weight, heart rate, etc.)
  3. **goals** - User-defined health goals and targets
  4. **medications** - User medications and prescriptions
  5. **medication_logs** - Tracking when medications are taken
  6. **appointments** - Healthcare appointments and scheduling
  7. **notifications** - In-app notification system

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies enforce user ownership for all operations

  ## Notes
  - Uses UUID primary keys for all tables
  - All tables reference auth.users for user association
  - Generic metrics system allows flexible health data tracking
  - JSONB used for flexible scheduling in medications
*/

-- Enable pgcrypto for uuids if not already
create extension if not exists "uuid-ossp";

-- USERS PROFILE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  gender text,
  dob date,
  height_cm numeric,
  weight_kg numeric,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy "profiles are readable by owner"
on public.profiles for select using (auth.uid() = id);
create policy "profiles are updatable by owner"
on public.profiles for update using (auth.uid() = id);
create policy "profiles are insertable by owner"
on public.profiles for insert with check (auth.uid() = id);

-- GENERIC METRICS
create table if not exists public.health_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('steps','water','weight','heart_rate','sleep','calories')),
  value numeric not null,
  unit text,
  notes text,
  recorded_at timestamp with time zone not null default now(),
  created_at timestamp with time zone default now()
);

alter table public.health_metrics enable row level security;
create policy "metrics readable by owner"
on public.health_metrics for select using (auth.uid() = user_id);
create policy "metrics insertable by owner"
on public.health_metrics for insert with check (auth.uid() = user_id);
create policy "metrics updatable by owner"
on public.health_metrics for update using (auth.uid() = user_id);
create policy "metrics deletable by owner"
on public.health_metrics for delete using (auth.uid() = user_id);

-- GOALS
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('steps','water','weight','heart_rate','sleep','calories')),
  target numeric not null,
  unit text,
  period text not null default 'daily', -- daily, weekly, monthly
  starts_on date default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.goals enable row level security;
create policy "goals by owner"
on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MEDICATIONS + LOGS
create table if not exists public.medications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text,
  instructions text,
  schedule jsonb, -- e.g., {"type":"daily","times":["08:00","20:00"]}
  created_at timestamp with time zone default now()
);
alter table public.medications enable row level security;
create policy "meds by owner"
on public.medications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.medication_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  taken_at timestamp with time zone not null default now(),
  notes text
);
alter table public.medication_logs enable row level security;
create policy "med logs by owner"
on public.medication_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- APPOINTMENTS
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  location text,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now()
);
alter table public.appointments enable row level security;
create policy "appointments by owner"
on public.appointments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NOTIFICATIONS (in-app)
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text, -- e.g., "reminder","system"
  read boolean default false,
  created_at timestamp with time zone default now()
);
alter table public.notifications enable row level security;
create policy "notifications by owner"
on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ensure RLS ON
alter table public.profiles force row level security;
alter table public.health_metrics force row level security;
alter table public.goals force row level security;
alter table public.medications force row level security;
alter table public.medication_logs force row level security;
alter table public.appointments force row level security;
alter table public.notifications force row level security;