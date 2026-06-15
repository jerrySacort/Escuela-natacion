-- ============================================================
-- 007_storage_fotos.sql — Bucket público para fotos de alumnos
-- (aplicada en remoto el 2026-06-11 vía MCP)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

-- Solo staff puede subir/actualizar fotos
create policy "student_photos_staff_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-photos'
    and auth_role() in ('superadmin', 'branch_admin', 'coordinator')
  );

create policy "student_photos_staff_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'student-photos'
    and auth_role() in ('superadmin', 'branch_admin', 'coordinator')
  );

create policy "student_photos_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'student-photos');
