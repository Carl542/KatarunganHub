alter table public.profiles add column status text not null default 'Active';

create table public.lupon_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade unique,
  position text,
  term text,
  contact text,
  availability text,
  skill text,
  conflict_notes text,
  created_at timestamptz not null default now()
);
