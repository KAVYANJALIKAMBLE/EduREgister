-- EduRegister full-scale Supabase schema
-- Run in Supabase SQL Editor (PostgreSQL)

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================================================
-- Utility functions
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.phone, null)
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = excluded.phone,
        updated_at = now();

  return new;
end;
$$;

-- =========================================================
-- Enums
-- =========================================================

do $$ begin
  create type public.gender as enum ('male', 'female', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.app_role as enum ('admin', 'head_master', 'clerk', 'teacher', 'accountant', 'librarian', 'transport_manager', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('present', 'absent', 'late', 'leave');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fee_invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.library_issue_status as enum ('issued', 'returned', 'lost', 'damaged');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.certificate_type as enum ('bonafide', 'school_leaving', 'transfer', 'character', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_channel as enum ('whatsapp', 'sms', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_status as enum ('queued', 'sent', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mdm_txn_type as enum ('inward', 'outward', 'adjustment');
exception when duplicate_object then null; end $$;

-- =========================================================
-- Core school and auth profile
-- =========================================================

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  school_code text,
  udise_code text,
  board_name text,
  management_name text,
  medium text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  phone text,
  email citext,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email citext,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_school_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, school_id, role)
);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_auth_user();

-- =========================================================
-- Academic master data
-- =========================================================

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  year_label text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, year_label)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_name text not null,
  class_order int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, class_name)
);

create table if not exists public.divisions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  division_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, division_name)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  subject_name text not null,
  subject_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, subject_name)
);

-- =========================================================
-- Student domain
-- =========================================================

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  gr_number text not null,
  admission_number text,
  roll_number text,
  first_name_en text not null,
  middle_name_en text,
  last_name_en text,
  first_name_mr text,
  middle_name_mr text,
  last_name_mr text,
  gender public.gender,
  dob date,
  blood_group text,
  caste text,
  category text,
  religion text,
  aadhaar_number text,
  mother_tongue text,
  nationality text default 'Indian',
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  photo_url text,
  admission_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, gr_number),
  unique (school_id, admission_number)
);

create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  relation text not null,
  full_name text not null,
  occupation text,
  phone text,
  email citext,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  division_id uuid references public.divisions(id) on delete set null,
  roll_number text,
  is_promoted boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, academic_year_id)
);

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  uploaded_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Staff / teachers
-- =========================================================

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  employee_code text,
  full_name text not null,
  phone text,
  email citext,
  qualification text,
  joining_date date,
  subject_specialization text,
  profile_photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, employee_code)
);

create table if not exists public.teacher_subject_allocations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, class_id, division_id, subject_id, academic_year_id)
);

-- =========================================================
-- Timetable
-- =========================================================

create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  slot_number int not null,
  start_time time not null,
  end_time time not null,
  is_break boolean not null default false,
  created_at timestamptz not null default now(),
  unique (school_id, slot_number)
);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  day_of_week int not null check (day_of_week between 1 and 7),
  slot_id uuid not null references public.timetable_slots(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  room_no text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academic_year_id, class_id, division_id, day_of_week, slot_id)
);

-- =========================================================
-- Attendance
-- =========================================================

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  attendance_date date not null,
  lecture_no int,
  notes text,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (academic_year_id, class_id, division_id, attendance_date, lecture_no)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.attendance_status not null,
  remark text,
  created_at timestamptz not null default now(),
  unique (session_id, student_id)
);

-- =========================================================
-- Exams, marks, grade cards
-- =========================================================

create table if not exists public.exam_terms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_name text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  unique (academic_year_id, term_name)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.exam_terms(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  exam_name text not null,
  exam_date date,
  created_at timestamptz not null default now(),
  unique (term_id, class_id, division_id, exam_name)
);

create table if not exists public.exam_subjects (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  max_marks numeric(6,2) not null default 100,
  pass_marks numeric(6,2) not null default 35,
  created_at timestamptz not null default now(),
  unique (exam_id, subject_id)
);

create table if not exists public.student_marks (
  id uuid primary key default gen_random_uuid(),
  exam_subject_id uuid not null references public.exam_subjects(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  obtained_marks numeric(6,2) not null,
  grade text,
  remark text,
  entered_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_subject_id, student_id)
);

-- =========================================================
-- Certificates
-- =========================================================

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  certificate_type public.certificate_type not null,
  certificate_no text,
  issue_date date not null default current_date,
  body_json jsonb not null default '{}'::jsonb,
  issued_by uuid references public.app_users(id) on delete set null,
  pdf_url text,
  created_at timestamptz not null default now(),
  unique (school_id, certificate_no)
);

-- =========================================================
-- Fees
-- =========================================================

create table if not exists public.fee_heads (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  head_name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (school_id, head_name)
);

create table if not exists public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  fee_head_id uuid not null references public.fee_heads(id) on delete cascade,
  amount numeric(10,2) not null,
  due_month int check (due_month between 1 and 12),
  due_date date,
  created_at timestamptz not null default now(),
  unique (academic_year_id, class_id, division_id, fee_head_id, due_month)
);

create table if not exists public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  invoice_no text not null,
  invoice_date date not null default current_date,
  due_date date,
  total_amount numeric(10,2) not null,
  paid_amount numeric(10,2) not null default 0,
  status public.fee_invoice_status not null default 'issued',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, invoice_no)
);

create table if not exists public.fee_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  fee_head_id uuid references public.fee_heads(id) on delete set null,
  description text not null,
  amount numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fee_invoices(id) on delete cascade,
  payment_date date not null default current_date,
  payment_mode text not null,
  txn_ref text,
  amount numeric(10,2) not null,
  received_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Library
-- =========================================================

create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  accession_no text,
  isbn text,
  title text not null,
  author_name text,
  publisher text,
  category text,
  language text,
  price numeric(10,2),
  purchase_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, accession_no)
);

create table if not exists public.library_book_copies (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.library_books(id) on delete cascade,
  copy_code text not null,
  shelf_no text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (book_id, copy_code)
);

create table if not exists public.library_issues (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  copy_id uuid not null references public.library_book_copies(id) on delete restrict,
  student_id uuid references public.students(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  issue_date date not null default current_date,
  due_date date not null,
  return_date date,
  status public.library_issue_status not null default 'issued',
  fine_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Transport
-- =========================================================

create table if not exists public.transport_vehicles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  vehicle_no text not null,
  vehicle_type text,
  capacity int,
  driver_name text,
  driver_phone text,
  attendant_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, vehicle_no)
);

create table if not exists public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  route_name text not null,
  vehicle_id uuid references public.transport_vehicles(id) on delete set null,
  monthly_fee numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, route_name)
);

create table if not exists public.transport_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.transport_routes(id) on delete cascade,
  stop_name text not null,
  stop_order int not null,
  pickup_time time,
  created_at timestamptz not null default now(),
  unique (route_id, stop_order)
);

create table if not exists public.student_transport_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  route_id uuid not null references public.transport_routes(id) on delete cascade,
  stop_id uuid references public.transport_stops(id) on delete set null,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Notice board, holidays, events
-- =========================================================

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  description text,
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  holiday_date date not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (school_id, holiday_date, title)
);

create table if not exists public.school_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  event_date date not null,
  start_time time,
  end_time time,
  description text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- MDM registers
-- =========================================================

create table if not exists public.mdm_stock_transactions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  txn_date date not null default current_date,
  item_name text not null,
  txn_type public.mdm_txn_type not null,
  quantity_kg numeric(10,3) not null,
  note text,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.mdm_daily_register (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  register_date date not null,
  class_id uuid references public.classes(id) on delete set null,
  present_students int not null default 0,
  meals_served int not null default 0,
  menu_text text,
  created_at timestamptz not null default now(),
  unique (school_id, register_date, class_id)
);

create table if not exists public.mdm_taste_register (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  register_date date not null,
  taster_name text not null,
  designation text,
  feedback text,
  created_at timestamptz not null default now(),
  unique (school_id, register_date, taster_name)
);

-- =========================================================
-- Messaging and audit
-- =========================================================

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  channel public.message_channel not null,
  template_name text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, channel, template_name)
);

create table if not exists public.message_queue (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  channel public.message_channel not null,
  recipient_name text,
  recipient_phone text,
  recipient_email citext,
  message_body text not null,
  status public.message_status not null default 'queued',
  error_message text,
  sent_at timestamptz,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  school_id uuid references public.schools(id) on delete set null,
  user_id uuid references public.app_users(id) on delete set null,
  action text not null,
  entity_name text,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Helpful indexes
-- =========================================================

create index if not exists idx_students_school on public.students (school_id);
create index if not exists idx_students_name on public.students (first_name_en, last_name_en);
create index if not exists idx_student_enrollments_year on public.student_enrollments (academic_year_id);
create index if not exists idx_attendance_sessions_date on public.attendance_sessions (attendance_date);
create index if not exists idx_attendance_records_student on public.attendance_records (student_id);
create index if not exists idx_marks_student on public.student_marks (student_id);
create index if not exists idx_fee_invoices_student on public.fee_invoices (student_id, status);
create index if not exists idx_library_issues_status on public.library_issues (status);
create index if not exists idx_message_queue_status on public.message_queue (status, created_at);
create index if not exists idx_audit_logs_school_created on public.audit_logs (school_id, created_at desc);

-- =========================================================
-- updated_at triggers
-- =========================================================

drop trigger if exists trg_schools_updated_at on public.schools;
create trigger trg_schools_updated_at before update on public.schools
for each row execute function public.set_updated_at();

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at before update on public.app_users
for each row execute function public.set_updated_at();

drop trigger if exists trg_academic_years_updated_at on public.academic_years;
create trigger trg_academic_years_updated_at before update on public.academic_years
for each row execute function public.set_updated_at();

drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at before update on public.classes
for each row execute function public.set_updated_at();

drop trigger if exists trg_divisions_updated_at on public.divisions;
create trigger trg_divisions_updated_at before update on public.divisions
for each row execute function public.set_updated_at();

drop trigger if exists trg_subjects_updated_at on public.subjects;
create trigger trg_subjects_updated_at before update on public.subjects
for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_student_guardians_updated_at on public.student_guardians;
create trigger trg_student_guardians_updated_at before update on public.student_guardians
for each row execute function public.set_updated_at();

drop trigger if exists trg_student_enrollments_updated_at on public.student_enrollments;
create trigger trg_student_enrollments_updated_at before update on public.student_enrollments
for each row execute function public.set_updated_at();

drop trigger if exists trg_teachers_updated_at on public.teachers;
create trigger trg_teachers_updated_at before update on public.teachers
for each row execute function public.set_updated_at();

drop trigger if exists trg_timetable_entries_updated_at on public.timetable_entries;
create trigger trg_timetable_entries_updated_at before update on public.timetable_entries
for each row execute function public.set_updated_at();

drop trigger if exists trg_student_marks_updated_at on public.student_marks;
create trigger trg_student_marks_updated_at before update on public.student_marks
for each row execute function public.set_updated_at();

drop trigger if exists trg_fee_invoices_updated_at on public.fee_invoices;
create trigger trg_fee_invoices_updated_at before update on public.fee_invoices
for each row execute function public.set_updated_at();

drop trigger if exists trg_library_books_updated_at on public.library_books;
create trigger trg_library_books_updated_at before update on public.library_books
for each row execute function public.set_updated_at();

drop trigger if exists trg_transport_vehicles_updated_at on public.transport_vehicles;
create trigger trg_transport_vehicles_updated_at before update on public.transport_vehicles
for each row execute function public.set_updated_at();

drop trigger if exists trg_transport_routes_updated_at on public.transport_routes;
create trigger trg_transport_routes_updated_at before update on public.transport_routes
for each row execute function public.set_updated_at();

drop trigger if exists trg_notices_updated_at on public.notices;
create trigger trg_notices_updated_at before update on public.notices
for each row execute function public.set_updated_at();

drop trigger if exists trg_message_templates_updated_at on public.message_templates;
create trigger trg_message_templates_updated_at before update on public.message_templates
for each row execute function public.set_updated_at();

-- =========================================================
-- RLS (starter policies)
-- NOTE: tighten policies per school/role before production launch.
-- =========================================================

alter table public.schools enable row level security;
alter table public.app_users enable row level security;
alter table public.user_school_roles enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.divisions enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.student_guardians enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.student_documents enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_subject_allocations enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.exam_terms enable row level security;
alter table public.exams enable row level security;
alter table public.exam_subjects enable row level security;
alter table public.student_marks enable row level security;
alter table public.certificates enable row level security;
alter table public.fee_heads enable row level security;
alter table public.fee_structures enable row level security;
alter table public.fee_invoices enable row level security;
alter table public.fee_invoice_items enable row level security;
alter table public.fee_payments enable row level security;
alter table public.library_books enable row level security;
alter table public.library_book_copies enable row level security;
alter table public.library_issues enable row level security;
alter table public.transport_vehicles enable row level security;
alter table public.transport_routes enable row level security;
alter table public.transport_stops enable row level security;
alter table public.student_transport_assignments enable row level security;
alter table public.notices enable row level security;
alter table public.holidays enable row level security;
alter table public.school_events enable row level security;
alter table public.mdm_stock_transactions enable row level security;
alter table public.mdm_daily_register enable row level security;
alter table public.mdm_taste_register enable row level security;
alter table public.message_templates enable row level security;
alter table public.message_queue enable row level security;
alter table public.audit_logs enable row level security;

do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in (
        'schools','app_users','user_school_roles','academic_years','classes','divisions','subjects',
        'students','student_guardians','student_enrollments','student_documents','teachers','teacher_subject_allocations',
        'timetable_slots','timetable_entries','attendance_sessions','attendance_records','exam_terms','exams','exam_subjects','student_marks',
        'certificates','fee_heads','fee_structures','fee_invoices','fee_invoice_items','fee_payments',
        'library_books','library_book_copies','library_issues','transport_vehicles','transport_routes','transport_stops',
        'student_transport_assignments','notices','holidays','school_events','mdm_stock_transactions','mdm_daily_register',
        'mdm_taste_register','message_templates','message_queue','audit_logs'
      )
  loop
    execute format('drop policy if exists "auth_all_%I" on public.%I;', t.tablename, t.tablename);
    execute format('create policy "auth_all_%I" on public.%I for all to authenticated using (true) with check (true);', t.tablename, t.tablename);
  end loop;
end $$;

-- =========================================================
-- Seed minimum roles and one demo school
-- =========================================================

insert into public.schools (school_name, school_code, state)
values ('Demo School', 'DEMO001', 'Maharashtra')
on conflict do nothing;

commit;
