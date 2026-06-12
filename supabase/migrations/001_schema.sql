-- ============================================================
-- 001_schema.sql — Sistema administrativo escuela de natación
-- Stack: Supabase (PostgreSQL) · Multi-tenant por sucursal
-- ============================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum ('superadmin', 'branch_admin', 'coordinator', 'instructor', 'parent');
create type enrollment_status as enum ('active', 'waitlisted', 'paused', 'cancelled');
create type charge_status as enum ('pending', 'paid', 'overdue', 'cancelled');
create type payment_method as enum ('card', 'spei', 'oxxo', 'cash', 'transfer');
create type attendance_method as enum ('qr', 'manual', 'biometric');
create type evaluation_result as enum ('not_attempted', 'in_progress', 'achieved');

-- ------------------------------------------------------------
-- 1. Sucursales (raíz del multi-tenant)
-- ------------------------------------------------------------
create table branches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  phone       text,
  timezone    text not null default 'America/Mexico_City',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Perfiles (espejo de auth.users + rol + sucursal)
-- ------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  branch_id   uuid references branches(id),   -- null solo para superadmin
  role        user_role not null default 'parent',
  full_name   text not null,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  constraint branch_required check (role = 'superadmin' or branch_id is not null)
);

-- ------------------------------------------------------------
-- 3. Instructores (datos extra sobre el perfil)
-- ------------------------------------------------------------
create table instructors (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references profiles(id) on delete cascade,
  branch_id       uuid not null references branches(id),
  certifications  jsonb not null default '[]',
  specialties     text[] not null default '{}',
  hourly_rate     numeric(10,2),
  hired_at        date,
  is_active       boolean not null default true
);

-- ------------------------------------------------------------
-- 4. Niveles de natación (catálogo global)
-- ------------------------------------------------------------
create table levels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,            -- bebés, principiantes, intermedios...
  sort_order  int not null,
  min_age     int,
  max_age     int,
  description text
);

-- ------------------------------------------------------------
-- 5. Alumnos
-- ------------------------------------------------------------
create table students (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references branches(id),
  level_id       uuid references levels(id),
  first_name     text not null,
  last_name      text not null,
  birth_date     date not null,
  photo_url      text,
  medical_notes  text,
  qr_code        text unique default encode(gen_random_bytes(12), 'hex'),
  is_active      boolean not null default true,
  enrolled_at    date not null default current_date,
  created_at     timestamptz not null default now()
);
create index idx_students_branch on students(branch_id);

-- Tutores ↔ alumnos (un alumno puede tener varios tutores)
create table student_guardians (
  student_id    uuid not null references students(id) on delete cascade,
  guardian_id   uuid not null references profiles(id) on delete cascade,
  relationship  text not null default 'tutor',  -- madre, padre, abuelo...
  is_primary    boolean not null default false,
  primary key (student_id, guardian_id)
);
create index idx_guardians_guardian on student_guardians(guardian_id);

-- ------------------------------------------------------------
-- 6. Albercas y grupos
-- ------------------------------------------------------------
create table pools (
  id         uuid primary key default gen_random_uuid(),
  branch_id  uuid not null references branches(id),
  name       text not null,
  lanes      int not null default 1
);

create table groups (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references branches(id),
  level_id       uuid not null references levels(id),
  instructor_id  uuid references instructors(id),
  pool_id        uuid references pools(id),
  lane           int,
  name           text not null,
  capacity       int not null default 8,
  monthly_fee    numeric(10,2) not null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create index idx_groups_branch on groups(branch_id);

-- Horarios del grupo (varios días por semana)
create table group_schedules (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups(id) on delete cascade,
  weekday     int not null check (weekday between 0 and 6),  -- 0 = domingo
  start_time  time not null,
  end_time    time not null,
  check (end_time > start_time)
);

-- ------------------------------------------------------------
-- 7. Inscripciones (con lista de espera)
-- ------------------------------------------------------------
create table enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  group_id     uuid not null references groups(id),
  branch_id    uuid not null references branches(id),
  status       enrollment_status not null default 'active',
  waitlist_pos int,
  started_at   date not null default current_date,
  ended_at     date,
  created_at   timestamptz not null default now(),
  unique (student_id, group_id)
);
create index idx_enrollments_branch on enrollments(branch_id);
create index idx_enrollments_group on enrollments(group_id);

-- ------------------------------------------------------------
-- 8. Asistencia
-- ------------------------------------------------------------
create table attendance (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students(id) on delete cascade,
  group_id    uuid not null references groups(id),
  branch_id   uuid not null references branches(id),
  class_date  date not null default current_date,
  checked_at  timestamptz not null default now(),
  method      attendance_method not null default 'qr',
  recorded_by uuid references profiles(id),
  unique (student_id, group_id, class_date)
);
create index idx_attendance_branch_date on attendance(branch_id, class_date);

-- ------------------------------------------------------------
-- 9. Cobranza: cargos y pagos
-- ------------------------------------------------------------
create table discounts (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid references branches(id),   -- null = global
  name        text not null,                  -- hermanos, beca...
  percent     numeric(5,2) not null check (percent > 0 and percent <= 100),
  is_active   boolean not null default true
);

create table charges (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students(id),
  enrollment_id  uuid references enrollments(id),
  branch_id      uuid not null references branches(id),
  discount_id    uuid references discounts(id),
  concept        text not null,               -- "Mensualidad junio 2026"
  amount         numeric(10,2) not null,
  amount_due     numeric(10,2) not null,      -- con descuento aplicado
  due_date       date not null,
  status         charge_status not null default 'pending',
  created_at     timestamptz not null default now()
);
create index idx_charges_branch_status on charges(branch_id, status);
create index idx_charges_student on charges(student_id);

create table payments (
  id            uuid primary key default gen_random_uuid(),
  charge_id     uuid not null references charges(id),
  branch_id     uuid not null references branches(id),
  amount        numeric(10,2) not null,
  method        payment_method not null,
  provider_ref  text,                         -- id de Conekta/Stripe
  receipt_url   text,                         -- PDF en Storage
  paid_at       timestamptz not null default now(),
  recorded_by   uuid references profiles(id)
);
create index idx_payments_branch on payments(branch_id);

-- ------------------------------------------------------------
-- 10. Evaluaciones por rúbrica
-- ------------------------------------------------------------
create table skills (
  id        uuid primary key default gen_random_uuid(),
  level_id  uuid not null references levels(id) on delete cascade,
  name      text not null,                    -- patada, brazada, respiración...
  sort_order int not null default 0
);

create table evaluations (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  level_id      uuid not null references levels(id),
  branch_id     uuid not null references branches(id),
  instructor_id uuid references instructors(id),
  evaluated_at  date not null default current_date,
  passed_level  boolean not null default false,
  notes         text
);
create index idx_evaluations_student on evaluations(student_id);

create table evaluation_scores (
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  skill_id      uuid not null references skills(id),
  result        evaluation_result not null default 'not_attempted',
  comment       text,
  primary key (evaluation_id, skill_id)
);

-- ------------------------------------------------------------
-- 11. Notificaciones e inventario
-- ------------------------------------------------------------
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  branch_id   uuid references branches(id),
  title       text not null,
  body        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index idx_notifications_profile on notifications(profile_id) where read_at is null;

create table inventory_items (
  id         uuid primary key default gen_random_uuid(),
  branch_id  uuid not null references branches(id),
  name       text not null,
  quantity   int not null default 0,
  notes      text,
  updated_at timestamptz not null default now()
);
