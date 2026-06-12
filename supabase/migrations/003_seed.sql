-- ============================================================
-- 003_seed.sql — Catálogo de niveles y rúbricas de habilidades
-- ============================================================

-- Niveles (orden progresivo)
with new_levels as (
  insert into levels (name, sort_order, min_age, max_age, description) values
    ('Bebés (matronatación)', 1, 0,  3,  'Adaptación al agua con mamá/papá; flotación asistida y juego'),
    ('Principiantes',         2, 4,  99, 'Adaptación al medio, sumersión, flotación y desplazamiento básico'),
    ('Básicos',               3, 5,  99, 'Crol y dorso elemental, respiración lateral, saltos desde orilla'),
    ('Intermedios',           4, 6,  99, 'Técnica de crol y dorso, introducción a pecho, resistencia 25 m'),
    ('Avanzados',             5, 8,  99, 'Cuatro estilos, vueltas, clavados de salida, resistencia 100 m'),
    ('Competitivo',           6, 9,  99, 'Entrenamiento de alto volumen, técnica fina, pruebas cronometradas')
  returning id, name
)
insert into skills (level_id, name, sort_order)
select nl.id, s.name, s.sort_order
from new_levels nl
join (values
  -- Bebés
  ('Bebés (matronatación)', 'Entrada al agua sin llanto',          1),
  ('Bebés (matronatación)', 'Flotación asistida en espalda',       2),
  ('Bebés (matronatación)', 'Sumersión breve con apnea refleja',   3),
  ('Bebés (matronatación)', 'Pataleo asistido',                    4),
  -- Principiantes
  ('Principiantes', 'Sumersión voluntaria con burbujas',           1),
  ('Principiantes', 'Flotación ventral sin apoyo (5 seg)',         2),
  ('Principiantes', 'Flotación dorsal sin apoyo (5 seg)',          3),
  ('Principiantes', 'Patada de crol con tabla',                    4),
  ('Principiantes', 'Desplazamiento 5 m con apoyo',                5),
  -- Básicos
  ('Básicos', 'Crol elemental 10 m',                               1),
  ('Básicos', 'Dorso elemental 10 m',                              2),
  ('Básicos', 'Respiración lateral coordinada',                    3),
  ('Básicos', 'Salto de orilla con recuperación',                  4),
  ('Básicos', 'Flotación vertical (sostenerse 15 seg)',            5),
  -- Intermedios
  ('Intermedios', 'Crol técnico 25 m',                             1),
  ('Intermedios', 'Dorso técnico 25 m',                            2),
  ('Intermedios', 'Patada de pecho con tabla',                     3),
  ('Intermedios', 'Coordinación brazada de pecho',                 4),
  ('Intermedios', 'Resistencia 25 m continuos',                    5),
  -- Avanzados
  ('Avanzados', 'Crol 50 m con respiración bilateral',             1),
  ('Avanzados', 'Pecho técnico 25 m',                              2),
  ('Avanzados', 'Mariposa elemental 15 m',                         3),
  ('Avanzados', 'Vuelta de campana (crol)',                        4),
  ('Avanzados', 'Clavado de salida desde banco',                   5),
  ('Avanzados', 'Resistencia 100 m combinados',                    6),
  -- Competitivo
  ('Competitivo', 'Cuatro estilos legales (reglamento FINA)',      1),
  ('Competitivo', 'Salidas y vueltas reglamentarias',              2),
  ('Competitivo', 'Prueba cronometrada 100 m libre',               3),
  ('Competitivo', 'Prueba cronometrada 100 m combinado individual',4),
  ('Competitivo', 'Plan de entrenamiento semanal completo',        5)
) as s(level_name, name, sort_order)
  on s.level_name = nl.name;

-- ------------------------------------------------------------
-- Datos demo (opcional — comentar en producción)
-- ------------------------------------------------------------
-- insert into branches (name, address, phone) values
--   ('Sucursal Centro', 'Av. Principal 123', '555-000-0001'),
--   ('Sucursal Norte',  'Blvd. Norte 456',   '555-000-0002');
