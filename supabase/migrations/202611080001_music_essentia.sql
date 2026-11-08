-- Music Essentia: private project and generation-job records.
create table if not exists public.music_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled composition',
  prompt text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.music_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.music_projects(id) on delete set null,
  provider text not null default 'unconfigured',
  provider_job_id text,
  status text not null default 'queued' check (status in ('queued','processing','succeeded','failed')),
  request jsonb not null,
  result jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists music_projects_user_created_idx on public.music_projects(user_id, created_at desc);
create index if not exists music_jobs_user_created_idx on public.music_jobs(user_id, created_at desc);
alter table public.music_projects enable row level security;
alter table public.music_jobs enable row level security;
drop policy if exists "Users manage their own music projects" on public.music_projects;
create policy "Users manage their own music projects" on public.music_projects
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users read their own music jobs" on public.music_jobs;
create policy "Users read their own music jobs" on public.music_jobs
  for select to authenticated using (auth.uid() = user_id);
