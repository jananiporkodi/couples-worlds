insert into public.settings (key, value) values
  ('relationship_start_date', '"2024-01-15"'),
  ('anniversary_date', '"2024-08-15"'),
  ('partner_a_name', '"Partner A"'),
  ('partner_b_name', '"Partner B"')
on conflict (key) do nothing;

insert into public.daily_questions (question) values
  ('What made you smile today?')
on conflict do nothing;

insert into public.love_jar (body, author) values
  ('You held my hand while crossing the road.', 'A'),
  ('I laughed so hard I cried at your terrible joke.', 'B')
on conflict do nothing;
