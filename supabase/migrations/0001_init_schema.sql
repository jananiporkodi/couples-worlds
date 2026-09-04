create extension if not exists "pgcrypto";

create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  is_custom_category boolean not null default false,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'not_done' check (status in ('not_done','done')),
  illustration_prompt text,
  illustration_url text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  bucket_item_id uuid references public.bucket_items(id) on delete set null,
  title text,
  story text,
  memory_date date not null default current_date,
  location text,
  mood text,
  tags text[] not null default '{}',
  photos text[] not null default '{}',
  videos text[] not null default '{}',
  reactions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references public.memories(id) on delete cascade,
  url text not null,
  media_type text not null default 'photo' check (media_type in ('photo','video')),
  tags text[] not null default '{}',
  person text check (person in ('us','him','her')),
  caption text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  author text,
  body text not null,
  mood text,
  created_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  photos text[] not null default '{}',
  mood text,
  created_at timestamptz not null default now()
);

create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  author text,
  mood text not null,
  note text,
  mood_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  question_date date not null default current_date,
  answer_a text,
  answer_b text,
  created_at timestamptz not null default now()
);

create table if not exists public.love_jar (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  author text,
  created_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  spotify_url text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.countdowns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_date date not null,
  emoji text,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other',
  notes text,
  wanted boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_memories_date on public.memories(memory_date desc);
create index if not exists idx_gallery_memory on public.gallery(memory_id);
create index if not exists idx_timeline_date on public.timeline_events(event_date);
create index if not exists idx_bucket_status on public.bucket_items(status);
