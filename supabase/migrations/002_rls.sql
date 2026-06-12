-- ============================================================
-- 002_rls.sql — Row Level Security multi-tenant
-- Aislamiento por sucursal + roles
-- ============================================================

-- ------------------------------------------------------------
-- Funciones helper (security definer: evitan recursión en RLS
-- y claims JWT desactualizados)
-- ------------------------------------------------------------
create or replace function auth_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function auth_branch_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select branch_id from profiles where id = auth.uid()
$$;

-- ¿El usuario actual es tutor de este alumno?
create or replace function is_my_child(p_student_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from student_guardians
    where student_id = p_student_id and guardian_id = auth.uid()
  )
$$;

-- ¿El grupo está asignado al instructor actual?
create or replace function is_my_group(p_group_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from groups g
    join instructors i on i.id = g.instructor_id
    where g.id = p_group_id and i.profile_id = auth.uid()
  )
$$;

-- ------------------------------------------------------------
-- Habilitar RLS en todas las tablas
-- ------------------------------------------------------------
alter table branches          enable row level security;
alter table profiles          enable row level security;
alter table instructors       enable row level security;
alter table levels            enable row level security;
alter table students          enable row level security;
alter table student_guardians enable row level security;
alter table pools             enable row level security;
alter table groups            enable row level security;
alter table group_schedules   enable row level security;
alter table enrollments       enable row level security;
alter table attendance        enable row level security;
alter table discounts         enable row level security;
alter table charges           enable row level security;
alter table payments          enable row level security;
alter table skills            enable row level security;
alter table evaluations       enable row level security;
alter table evaluation_scores enable row level security;
alter table notifications     enable row level security;
alter table inventory_items   enable row level security;

-- ------------------------------------------------------------
-- Catálogos globales: lectura para todo usuario autenticado
-- ------------------------------------------------------------
create policy "levels_read"  on levels  for select to authenticated using (true);
create policy "skills_read"  on skills  for select to authenticated using (true);
create policy "levels_admin" on levels  for all using (auth_role() = 'superadmin');
create policy "skills_admin" on skills  for all using (auth_role() = 'superadmin');

-- ------------------------------------------------------------
-- Branches: superadmin todo; staff ve su propia sucursal
-- ------------------------------------------------------------
create policy "branches_superadmin" on branches for all
  using (auth_role() = 'superadmin');
create policy "branches_own" on branches for select
  using (id = auth_branch_id());

-- ------------------------------------------------------------
-- Profiles: cada quien el suyo; staff ve perfiles de su sucursal
-- ------------------------------------------------------------
create policy "profiles_self" on profiles for select
  using (id = auth.uid());
create policy "profiles_self_update" on profiles for update
  using (id = auth.uid());
create policy "profiles_superadmin" on profiles for all
  using (auth_role() = 'superadmin');
create policy "profiles_branch_staff" on profiles for select
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );

-- ------------------------------------------------------------
-- Plantilla por tabla con branch_id:
--   superadmin → todo
--   branch_admin / coordinator → su sucursal
--   instructor / parent → políticas específicas
-- ------------------------------------------------------------

-- Students
create policy "students_superadmin" on students for all
  using (auth_role() = 'superadmin');
create policy "students_branch_staff" on students for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "students_parent" on students for select
  using (is_my_child(id));
create policy "students_instructor" on students for select
  using (
    auth_role() = 'instructor'
    and exists (
      select 1 from enrollments e
      where e.student_id = students.id
        and e.status = 'active'
        and is_my_group(e.group_id)
    )
  );

-- Student guardians
create policy "sg_superadmin" on student_guardians for all
  using (auth_role() = 'superadmin');
create policy "sg_branch_staff" on student_guardians for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and exists (select 1 from students s
                where s.id = student_id and s.branch_id = auth_branch_id())
  );
create policy "sg_parent" on student_guardians for select
  using (guardian_id = auth.uid());

-- Instructors
create policy "instructors_superadmin" on instructors for all
  using (auth_role() = 'superadmin');
create policy "instructors_branch" on instructors for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "instructors_self" on instructors for select
  using (profile_id = auth.uid());

-- Pools / groups / schedules
create policy "pools_superadmin" on pools for all
  using (auth_role() = 'superadmin');
create policy "pools_branch" on pools for select
  using (branch_id = auth_branch_id());
create policy "pools_branch_admin" on pools for all
  using (auth_role() = 'branch_admin' and branch_id = auth_branch_id());

create policy "groups_superadmin" on groups for all
  using (auth_role() = 'superadmin');
create policy "groups_branch_read" on groups for select
  using (branch_id = auth_branch_id());
create policy "groups_branch_manage" on groups for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "groups_parent" on groups for select
  using (
    exists (
      select 1 from enrollments e
      where e.group_id = groups.id and is_my_child(e.student_id)
    )
  );

create policy "schedules_read" on group_schedules for select
  to authenticated using (true);
create policy "schedules_manage" on group_schedules for all
  using (
    auth_role() = 'superadmin'
    or exists (
      select 1 from groups g
      where g.id = group_id
        and g.branch_id = auth_branch_id()
        and auth_role() in ('branch_admin', 'coordinator')
    )
  );

-- Enrollments
create policy "enrollments_superadmin" on enrollments for all
  using (auth_role() = 'superadmin');
create policy "enrollments_branch" on enrollments for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "enrollments_parent" on enrollments for select
  using (is_my_child(student_id));
create policy "enrollments_instructor" on enrollments for select
  using (auth_role() = 'instructor' and is_my_group(group_id));

-- Attendance
create policy "attendance_superadmin" on attendance for all
  using (auth_role() = 'superadmin');
create policy "attendance_branch" on attendance for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "attendance_instructor" on attendance for all
  using (auth_role() = 'instructor' and is_my_group(group_id));
create policy "attendance_parent" on attendance for select
  using (is_my_child(student_id));

-- Discounts
create policy "discounts_superadmin" on discounts for all
  using (auth_role() = 'superadmin');
create policy "discounts_branch" on discounts for select
  using (branch_id is null or branch_id = auth_branch_id());
create policy "discounts_branch_admin" on discounts for all
  using (auth_role() = 'branch_admin' and branch_id = auth_branch_id());

-- Charges
create policy "charges_superadmin" on charges for all
  using (auth_role() = 'superadmin');
create policy "charges_branch" on charges for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "charges_parent" on charges for select
  using (is_my_child(student_id));

-- Payments
create policy "payments_superadmin" on payments for all
  using (auth_role() = 'superadmin');
create policy "payments_branch" on payments for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "payments_parent" on payments for select
  using (
    exists (
      select 1 from charges c
      where c.id = charge_id and is_my_child(c.student_id)
    )
  );

-- Evaluations
create policy "evaluations_superadmin" on evaluations for all
  using (auth_role() = 'superadmin');
create policy "evaluations_branch" on evaluations for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
create policy "evaluations_instructor" on evaluations for all
  using (
    auth_role() = 'instructor'
    and exists (
      select 1 from instructors i
      where i.id = instructor_id and i.profile_id = auth.uid()
    )
  );
create policy "evaluations_parent" on evaluations for select
  using (is_my_child(student_id));

create policy "eval_scores_access" on evaluation_scores for all
  using (
    exists (select 1 from evaluations e where e.id = evaluation_id)
    -- la política de evaluations ya filtra; exists delega el control
  );

-- Notifications: solo el destinatario
create policy "notifications_own" on notifications for select
  using (profile_id = auth.uid());
create policy "notifications_own_update" on notifications for update
  using (profile_id = auth.uid());
create policy "notifications_admin" on notifications for insert
  with check (
    auth_role() in ('superadmin', 'branch_admin', 'coordinator')
  );

-- Inventory
create policy "inventory_superadmin" on inventory_items for all
  using (auth_role() = 'superadmin');
create policy "inventory_branch" on inventory_items for all
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
