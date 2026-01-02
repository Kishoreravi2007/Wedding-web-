-- Create call_schedules table for demo call requests
create table if not exists public.call_schedules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  preferred_date date not null,
  preferred_time text,
  timezone text,
  message text,
  status text not null default 'pending',
  notes text,
  source text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Helpful indexes
create index if not exists call_schedules_status_idx on public.call_schedules(status);
create index if not exists call_schedules_created_at_idx on public.call_schedules(created_at desc);

-- Enable Row Level Security then allow service role full access
alter table public.call_schedules enable row level security;

-- Allow anon to insert (website form) and select via service role only if desired.
-- Adjust policies to match your security requirements.
drop policy if exists "Allow inserts from anon" on public.call_schedules;
create policy "Allow inserts from anon"
on public.call_schedules
for insert
to anon
with check (true);

drop policy if exists "Allow service_role full access" on public.call_schedules;
create policy "Allow service_role full access"
on public.call_schedules
for all
to service_role
using (true)
with check (true);

