create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','punong','secretary','lupon','complainant','respondent')),
  position text,
  created_at timestamptz not null default now()
);

create table public.complaint_categories (
  id serial primary key,
  name text not null unique
);

create table public.priority_levels (
  id serial primary key,
  name text not null unique,
  rank int not null
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  case_number text unique,
  reference_number text unique not null,
  type text not null check (type in ('Lupon','Non-Lupon','Pending classification')),
  category_id int references public.complaint_categories(id),
  priority_id int references public.priority_levels(id),
  title text not null,
  complainant_id uuid references public.profiles(id),
  respondent_id uuid references public.profiles(id),
  status text not null default 'New',
  workflow_stage text,
  narrative text,
  relief text,
  filed_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table public.case_assignments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  assignee_id uuid references public.profiles(id),
  assigned_role text not null,
  assigned_at timestamptz not null default now()
);

create table public.case_status_logs (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  previous_stage text,
  outcome text,
  next_stage text,
  authorized_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create table public.mediation_schedules (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  type text not null,
  scheduled_at timestamptz not null,
  venue text,
  facilitator_id uuid references public.profiles(id),
  status text not null default 'Scheduled'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  recipient_id uuid references public.profiles(id),
  channel text not null,
  message text not null,
  status text not null default 'Queued',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  module text not null,
  complaint_id uuid references public.complaints(id),
  created_at timestamptz not null default now()
);

create table public.files_attachments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  storage_path text not null,
  document_type text,
  created_at timestamptz not null default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null
);
