-- 008: RLS de grupos para instructores
-- Antes: groups_branch_read permitía a CUALQUIER usuario con la misma sucursal
-- (incluidos instructores) leer todos los grupos de la sucursal.
-- Ahora: el instructor ve solo sus grupos asignados; la lectura por sucursal
-- queda acotada al staff administrativo (branch_admin / coordinator).

-- El instructor ve únicamente los grupos que tiene asignados
create policy "groups_instructor" on groups for select
  using (
    auth_role() = 'instructor'
    and exists (
      select 1 from instructors i
      where i.id = groups.instructor_id
        and i.profile_id = auth.uid()
    )
  );

-- Acotar la lectura por sucursal a administradores de sucursal y coordinadores
drop policy "groups_branch_read" on groups;
create policy "groups_branch_read" on groups for select
  using (
    auth_role() in ('branch_admin', 'coordinator')
    and branch_id = auth_branch_id()
  );
