-- Job Tracker SaaS - Initial Schema
-- Run this in your Supabase SQL Editor to create tables and RLS

-- Pipeline stages (enum-like ordering: 1=Applied, 2=Screen, 3=Interview, 4=Offer, 5=Rejected)
-- We use text for flexibility; order is: applied, screening, interview, offer, rejected

-- Companies (one per user)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs (applications)
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  status text not null default 'applied' check (status in ('applied', 'screening', 'interview', 'offer', 'rejected')),
  source text,
  salary_min numeric,
  salary_max numeric,
  location text,
  job_url text,
  description text,
  notes text,
  applied_at date,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Contacts (optional, linked to company)
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  email text,
  role text,
  linkedin_url text,
  created_at timestamptz default now()
);

-- Activities / timeline (optional for future: log interviews, follow-ups)
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  type text not null,
  title text,
  notes text,
  happened_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.contacts enable row level security;
alter table public.activities enable row level security;

create policy "Users can CRUD own companies"
  on public.companies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own jobs"
  on public.jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own contacts"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for common queries
create index if not exists jobs_user_id_idx on public.jobs(user_id);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_company_id_idx on public.jobs(company_id);
create index if not exists jobs_applied_at_idx on public.jobs(applied_at);
create index if not exists companies_user_id_idx on public.companies(user_id);

-- Trigger to update updated_at on jobs
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();
