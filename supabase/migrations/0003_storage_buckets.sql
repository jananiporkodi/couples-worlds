insert into storage.buckets (id, name, public)
values
  ('memory-media', 'memory-media', true),
  ('reference-photos', 'reference-photos', true)
on conflict (id) do nothing;

create policy "anon_read_memory_media" on storage.objects for select to anon using (bucket_id = 'memory-media');
create policy "anon_write_memory_media" on storage.objects for insert to anon with check (bucket_id = 'memory-media');
create policy "anon_update_memory_media" on storage.objects for update to anon using (bucket_id = 'memory-media');
create policy "anon_delete_memory_media" on storage.objects for delete to anon using (bucket_id = 'memory-media');

create policy "anon_read_reference_photos" on storage.objects for select to anon using (bucket_id = 'reference-photos');
create policy "anon_write_reference_photos" on storage.objects for insert to anon with check (bucket_id = 'reference-photos');
create policy "anon_update_reference_photos" on storage.objects for update to anon using (bucket_id = 'reference-photos');
create policy "anon_delete_reference_photos" on storage.objects for delete to anon using (bucket_id = 'reference-photos');
