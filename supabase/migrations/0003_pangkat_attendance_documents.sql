create table public.pangkat_formations (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  formation_date date not null,
  chairperson_id uuid references public.profiles(id),
  secretary_id uuid references public.profiles(id),
  member_id uuid references public.profiles(id),
  acceptance_status text not null default 'Pending',
  conflict_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  schedule_id uuid references public.mediation_schedules(id),
  complainant_attendance text,
  respondent_attendance text,
  lupon_attendance text,
  result text,
  remarks text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  type text not null,
  status text not null default 'Draft',
  version text not null default 'v1.0',
  prepared_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
