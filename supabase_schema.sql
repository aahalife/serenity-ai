
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (extends default auth.users if using Supabase Auth, but we are using custom auth for now, 
-- so we'll create a public profiles table linked to our local user concept or just standalone for now)
-- Since we don't have Supabase Auth set up in the app yet (we use NextAuth or custom), 
-- we will create a simple 'profiles' table. 
-- Ideally, we should link this to auth.users if we switch to Supabase Auth later.

create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  name text,
  ocean_traits jsonb,
  identity text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Journal Entries
create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id), -- Optional if we don't enforce user link yet
  content text not null,
  mood text,
  tags text[],
  date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Wins
create table public.wins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  content text not null,
  category text,
  date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.wins enable row level security;

-- Policies (For now, allow public access since we don't have Supabase Auth tokens yet)
-- WARNING: This is for development only. In production, you must restrict this.
create policy "Allow public access to profiles" on public.profiles for all using (true);
create policy "Allow public access to journal" on public.journal_entries for all using (true);
create policy "Allow public access to wins" on public.wins for all using (true);
