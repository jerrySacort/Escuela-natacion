-- ============================================================
-- 005_registro.sql — Registro público de padres
-- (aplicada en remoto el 2026-06-11 vía MCP)
-- ============================================================

-- Crea el profile automáticamente al registrarse un usuario.
-- SEGURIDAD: el rol SIEMPRE es 'parent'. El metadata viene del
-- cliente y no es confiable; staff/admin se asignan manualmente
-- o vía service role.
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, branch_id, role, full_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'branch_id', '')::uuid,
    'parent',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- El formulario de registro necesita listar sucursales sin sesión
create policy "branches_public_read" on branches
  for select to anon using (is_active);
