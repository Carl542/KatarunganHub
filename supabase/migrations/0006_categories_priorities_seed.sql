insert into public.complaint_categories (name) values
  ('Family Dispute'),
  ('Property Dispute'),
  ('Neighborhood Dispute'),
  ('Debt or Financial'),
  ('Physical Injury or Assault'),
  ('Other')
on conflict (name) do nothing;

insert into public.priority_levels (name, rank) values
  ('Low', 1),
  ('Medium', 2),
  ('High', 3),
  ('Urgent', 4)
on conflict (name) do nothing;
