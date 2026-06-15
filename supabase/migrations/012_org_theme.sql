-- 012: tema de la aplicación elegido por el admin
alter table org_settings add column if not exists theme text not null default 'ocean';
