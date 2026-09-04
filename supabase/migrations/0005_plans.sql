create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  plan_date date not null,
  location text,
  status text not null default 'planned' check (status in ('planned','done','cancelled')),
  memory_id uuid references public.memories(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_plans_date on public.plans(plan_date);

alter table public.plans enable row level security;

create policy "anon_all_plans" on public.plans for all to anon using (true) with check (true);
