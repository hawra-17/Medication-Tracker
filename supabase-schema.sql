-- ============================================================
-- MedRemind — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. PROFILES -------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  email      text not null default '',
  created_at timestamptz not null default now()
);

-- 2. MEDICATIONS ----------------------------------------------
create table if not exists public.medications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  dosage          text not null,
  unit            text not null,
  color           text not null,
  frequency       text not null,
  total_doses     integer not null,
  remaining_doses integer not null,
  reminder_times  text[] not null default '{}',
  start_date      timestamptz not null,
  end_date        timestamptz,
  instructions    text,
  notes           text,
  prescriber      text,
  created_at      timestamptz not null default now()
);
create index if not exists medications_user_id_idx on public.medications (user_id);

-- 3. DOSE LOGS ------------------------------------------------
create table if not exists public.dose_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  scheduled_for timestamptz not null,
  status        text not null,
  taken_at      timestamptz,
  note          text
);
create index if not exists dose_logs_user_id_idx on public.dose_logs (user_id);

-- 4. ROW LEVEL SECURITY ---------------------------------------
alter table public.profiles    enable row level security;
alter table public.medications enable row level security;
alter table public.dose_logs   enable row level security;

create policy "own profile"     on public.profiles
  for all using (auth.uid() = id)      with check (auth.uid() = id);

create policy "own medications" on public.medications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own dose logs"   on public.dose_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. AUTO-CREATE PROFILE ON SIGN-UP ---------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
