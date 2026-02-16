
-- Supabase Setup Script for DataFlow Management Software

-- 1. Create the user_data table
-- This table stores all application state in a JSONB payload per user
create table if not exists public.user_data (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  primary key (id),
  constraint user_data_user_id_key unique (user_id)
);

-- 2. Enable Row Level Security (RLS)
-- This ensures data privacy between users
alter table public.user_data enable row level security;

-- 3. Create RLS Policies

-- Policy: Users can only view their own data
create policy "Users can view their own data"
on public.user_data for select
using ( auth.uid() = user_id );

-- Policy: Users can only insert their own data
create policy "Users can insert their own data"
on public.user_data for insert
with check ( auth.uid() = user_id );

-- Policy: Users can only update their own data
create policy "Users can update their own data"
on public.user_data for update
using ( auth.uid() = user_id );

-- 4. Automatically manage updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.user_data;
create trigger set_updated_at
before update on public.user_data
for each row
execute function public.handle_updated_at();

-- Note: Make sure to create these tables in the 'public' schema of your Supabase project.
-- Use the SQL Editor in the Supabase dashboard to run this script.
