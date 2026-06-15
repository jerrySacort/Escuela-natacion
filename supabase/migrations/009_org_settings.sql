-- 009: Configuración global de la escuela + bucket de assets (logo)

-- Tabla singleton con los datos de la escuela
create table if not exists org_settings (
  id          boolean primary key default true,
  school_name text not null default 'Escuela de Natación',
  phone       text,
  email       text,
  logo_url    text,
  updated_at  timestamptz not null default now(),
  constraint org_settings_singleton check (id)
);

insert into org_settings (id) values (true) on conflict (id) do nothing;

alter table org_settings enable row level security;

-- Cualquier usuario autenticado puede leer (nombre/logo se muestran en el panel)
create policy "org_read" on org_settings for select to authenticated using (true);
-- Solo el superadmin puede actualizar
create policy "org_update" on org_settings for update
  using (auth_role() = 'superadmin')
  with check (auth_role() = 'superadmin');

-- Bucket público para el logo de la escuela
insert into storage.buckets (id, name, public)
values ('org-assets', 'org-assets', true)
on conflict (id) do nothing;

create policy "org_assets_superadmin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'org-assets' and auth_role() = 'superadmin');

create policy "org_assets_superadmin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'org-assets' and auth_role() = 'superadmin');

create policy "org_assets_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'org-assets');
