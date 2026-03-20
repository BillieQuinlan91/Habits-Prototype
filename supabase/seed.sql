insert into public.organizations (name)
values
  ('Foundrs'),
  ('Indie Hackers')
on conflict (name) do nothing;

insert into public.habit_templates (name, type, suggested_target_value, suggested_target_unit, sort_order)
values
  ('Workout', 'binary', null, null, 1),
  ('Deep Work', 'measurable', 180, 'minutes', 2),
  ('Meditate', 'binary', null, null, 3),
  ('Journal', 'binary', null, null, 4),
  ('Read', 'measurable', 30, 'minutes', 5),
  ('10k Steps', 'measurable', 10000, 'steps', 6),
  ('Sleep 8 hours', 'measurable', 8, 'hours', 7),
  ('Drink Water', 'measurable', 3, 'liters', 8)
on conflict (name) do nothing;
