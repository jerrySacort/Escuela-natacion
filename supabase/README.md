# Base de datos — Escuela de natación

## Archivos

- `migrations/001_schema.sql` — 19 tablas, enums e índices
- `migrations/002_rls.sql` — Funciones helper + políticas RLS multi-tenant

## Cómo aplicar

```bash
supabase db push          # con Supabase CLI
# o pegar cada archivo en SQL Editor del dashboard, en orden
```

## Diseño clave

**Multi-tenant:** todas las tablas operativas llevan `branch_id`. El aislamiento se aplica con RLS.

**Roles:** en lugar de leer `branch_id`/`role` del JWT (se desactualiza si cambias el rol de alguien), las políticas usan funciones `security definer` (`auth_role()`, `auth_branch_id()`) que consultan `profiles` en vivo. Más simple y siempre correcto; si el rendimiento lo exige después, se migra a custom claims con un Auth Hook.

**Accesos por rol:**

| Rol | Alcance |
|---|---|
| `superadmin` | Todo, todas las sucursales |
| `branch_admin` / `coordinator` | CRUD completo de su sucursal |
| `instructor` | Sus grupos: alumnos, asistencia, evaluaciones |
| `parent` | Solo lectura de datos de sus hijos (vía `student_guardians`) |

**Lista de espera:** `enrollments.status = 'waitlisted'` + `waitlist_pos`. La promoción automática al liberarse un cupo conviene hacerla en una Edge Function o trigger (pendiente).

**QR check-in:** `students.qr_code` se genera automáticamente al crear el alumno.

## Pendientes sugeridos

1. Trigger que crea `profiles` al registrarse un usuario en `auth.users`
2. Edge Function de generación mensual de `charges`
3. Trigger de promoción de lista de espera
4. Seed de `levels` y `skills` (rúbricas por nivel)
