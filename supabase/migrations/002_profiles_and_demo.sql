-- Profiles: link auth.users to a role (user | admin)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile (non-role fields only in app)"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Service role can insert/update for seed (no policy for insert; use service_role in seed)
-- Allow insert so trigger can run as definer
create policy "Allow insert for new users"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Profile is created on first login in the app (see lib/supabase ensureProfile).
-- Demo/admin user is created via: npm run seed
