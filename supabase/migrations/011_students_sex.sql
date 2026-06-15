-- 011: sexo del alumno (para el tablero de alberca: niña/niño)
alter table students add column if not exists sex text check (sex in ('F', 'M'));
