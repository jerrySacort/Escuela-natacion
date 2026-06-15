-- ============================================================
-- seed_sucursales.sql — Datos demo de sucursales y albercas
-- (ejecutado en remoto el 2026-06-11 vía MCP)
-- Datos ficticios: reemplazar con sucursales reales.
-- ============================================================
with b as (
  insert into branches (name, address, phone) values
    ('Sucursal Centro',   'Av. Juárez 123, Col. Centro',        '55-1000-0001'),
    ('Sucursal Norte',    'Blvd. Lindavista 456, Col. Norte',   '55-1000-0002'),
    ('Sucursal Sur',      'Calz. Tlalpan 789, Col. Del Valle',  '55-1000-0003')
  returning id
)
insert into pools (branch_id, name, lanes)
select b.id, p.name, p.lanes
from b
join (values
  ('Alberca semiolímpica', 6),
  ('Alberca de enseñanza', 3)
) as p(name, lanes) on true;
