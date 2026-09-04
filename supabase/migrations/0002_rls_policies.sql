alter table public.bucket_items enable row level security;
alter table public.memories enable row level security;
alter table public.gallery enable row level security;
alter table public.notes enable row level security;
alter table public.timeline_events enable row level security;
alter table public.moods enable row level security;
alter table public.daily_questions enable row level security;
alter table public.love_jar enable row level security;
alter table public.playlists enable row level security;
alter table public.countdowns enable row level security;
alter table public.wishlist enable row level security;
alter table public.settings enable row level security;

-- These policies grant the `anon` role full access. That's safe in this app
-- only because the anon key is never sent to the browser: every read/write
-- happens server-side (Server Components / Server Actions) behind the
-- passcode-gated middleware. Do not expose SUPABASE_ANON_KEY as a
-- NEXT_PUBLIC_ variable, or these policies would allow anyone with the key
-- to read/write your data directly.
create policy "anon_all_bucket_items" on public.bucket_items for all to anon using (true) with check (true);
create policy "anon_all_memories" on public.memories for all to anon using (true) with check (true);
create policy "anon_all_gallery" on public.gallery for all to anon using (true) with check (true);
create policy "anon_all_notes" on public.notes for all to anon using (true) with check (true);
create policy "anon_all_timeline_events" on public.timeline_events for all to anon using (true) with check (true);
create policy "anon_all_moods" on public.moods for all to anon using (true) with check (true);
create policy "anon_all_daily_questions" on public.daily_questions for all to anon using (true) with check (true);
create policy "anon_all_love_jar" on public.love_jar for all to anon using (true) with check (true);
create policy "anon_all_playlists" on public.playlists for all to anon using (true) with check (true);
create policy "anon_all_countdowns" on public.countdowns for all to anon using (true) with check (true);
create policy "anon_all_wishlist" on public.wishlist for all to anon using (true) with check (true);
create policy "anon_all_settings" on public.settings for all to anon using (true) with check (true);
