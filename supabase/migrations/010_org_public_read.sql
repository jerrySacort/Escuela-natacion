-- 010: el login y el registro (páginas públicas, sin sesión) necesitan
-- leer el nombre y logo de la escuela para el branding.
create policy "org_public_read" on org_settings for select to anon using (true);
