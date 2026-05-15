-- ============================================================
-- MedRemind — Missed-dose email notifications
-- Run this in Supabase Dashboard → SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- 1. Store each user's timezone so the server can compute their
--    local dose times correctly (defaults to UTC until the app sets it).
alter table public.profiles
  add column if not exists timezone text not null default 'UTC';

-- 2. Track which missed doses we have already emailed about,
--    so the cron job never emails the same dose twice.
create table if not exists public.missed_dose_emails (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  scheduled_for timestamptz not null,
  sent_at       timestamptz not null default now()
);

create index if not exists missed_dose_emails_lookup_idx
  on public.missed_dose_emails (medication_id, scheduled_for);

alter table public.missed_dose_emails enable row level security;

-- Only the Edge Function (service role) writes here; users may read their own.
create policy "own missed dose emails" on public.missed_dose_emails
  for select using (auth.uid() = user_id);

-- 3. Schedule the Edge Function every 30 minutes via pg_cron + pg_net.
--    Enable the extensions first (Dashboard → Database → Extensions:
--    enable "pg_cron" and "pg_net"), then edit the two placeholders below
--    and run this block.
--
--    <PROJECT_REF>  = your project ref (the subdomain in your Supabase URL)
--    <CRON_SECRET>  = any long random string; set the SAME value as a
--                     function secret named CRON_SECRET (see deploy steps).

-- select cron.unschedule('missed-dose-emails');  -- run if re-creating

select cron.schedule(
  'missed-dose-emails',
  '*/30 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/send-missed-dose-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
