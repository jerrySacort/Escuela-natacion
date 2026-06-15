# 🏊 Sistema Administrativo — Escuela de Natación

Sistema multi-sucursal para gestión de alumnos, grupos, instructores, cobranza, asistencia y evaluaciones, con portal de padres.

**Stack:** Astro 5 (SSR, adapter Node) · React Islands · Tailwind 4 · Supabase (PostgreSQL + Auth + Storage) · pdf-lib

---

## Puesta en marcha

```bash
npm install
copy .env.example .env   # llenar con las llaves de Supabase
npm run dev              # http://localhost:4321
```

Variables de entorno (`.env`):

| Variable | Dónde obtenerla | Uso |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Conexión |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Cliente (respeta RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Solo server: crear cuentas de instructores. **Nunca exponer ni subir a git** |

Comandos: `npm run dev` (desarrollo), `npm run build` + `npm run preview` (producción), `npm run check` (verificación de tipos).

## Base de datos

Las migraciones viven en `supabase/migrations/` (001–007) y **ya están aplicadas** en el proyecto remoto `EscuelaNatacion`. Para un proyecto nuevo: aplicarlas en orden con `supabase db push` o pegándolas en el SQL Editor. `supabase/seed/` tiene datos demo de sucursales.

Contenido: 19 tablas, RLS multi-tenant por `branch_id` en todas las tablas operativas, funciones helper `security definer` (`auth_role()`, `auth_branch_id()`, `is_my_child()`, `is_my_group()`), trigger `handle_new_user` (crea el profile al registrarse, siempre con rol `parent`), bucket `student-photos`, y seed de 6 niveles con 30 habilidades de rúbrica.

## Roles

| Rol | Acceso |
|---|---|
| `superadmin` | Todo, todas las sucursales. Único que administra rúbricas y mueve registros entre sucursales |
| `branch_admin` | Su sucursal completa, incluye crear instructores |
| `coordinator` | Alumnos, grupos, cobranza y asistencia de su sucursal |
| `instructor` | Panel propio (`/instructor`): sus grupos; puede registrar asistencia y evaluar |
| `parent` | Portal (`/portal`): sus hijos, avisos, progreso |

El registro público (`/registro`) siempre crea cuentas `parent`. El staff se promueve por SQL o lo crea un admin (instructores desde la UI).

## Módulos

- **Dashboard** (`/dashboard`) — métricas en vivo: alumnos activos, ingresos del mes, % cobranza (donut), grupos y lista de espera. Diseño glassmorphism.
- **Alumnos** — CRUD con foto (Storage), notas médicas, baja lógica. Expediente con tutores (vincular/desvincular), grupos, evaluaciones expandibles, QR imprimible y avisos.
- **Grupos** — niveles, alberca/carril, cupo, mensualidad, horarios por día. Detalle con inscripción y **lista de espera automática** (promueve al primero cuando se libera lugar).
- **Instructores** — crea la cuenta de acceso (service role) + ficha con especialidades, certificaciones y tarifa.
- **Pagos** — "Generar cargos del mes" (idempotente, marca vencidos), registro de pagos por método, cancelación, **recibo PDF** por pago.
- **Asistencia** — pase de lista manual por grupo (solo grupos con clase hoy) y **kiosko QR** con cámara (`/dashboard/asistencia/kiosko`, requiere HTTPS o localhost).
- **Rúbricas** — catálogo de habilidades por nivel (CRUD superadmin; protege histórico usado).
- **Evaluaciones** — desde el expediente: rúbrica tocable (no intentado → en progreso → logrado), aprobar nivel y promover al siguiente.
- **Reportes** — ingresos 6 meses, cobranza del mes, alumnos por nivel, asistencia semanal; exportación CSV (alumnos, cargos, pagos, asistencia).
- **Notificaciones** — avisos in-app a tutores al generar cargos, registrar pagos y evaluar; visibles en el portal con contador de no leídos.

## Arquitectura

- `src/middleware.ts` — protege rutas por rol y expone `Astro.locals.supabase` (cliente SSR con RLS) y `locals.session`.
- `src/pages/api/**` — todas las APIs validan rol en código **y** el RLS de Postgres respalda en la base (defensa en dos capas).
- `src/components/*.tsx` — React Islands (`client:load`); los modales usan portal a `<body>` porque el `backdrop-filter` del panel glass rompe `position: fixed`.
- `src/lib/` — clientes Supabase (server/browser/admin), helpers de auth y notificaciones.

## Pendientes / siguiente fase

1. **Pagos en línea** — Conekta o Stripe (webhook → marcar cargo pagado). Requiere cuenta y llaves.
2. **Emails** — Resend para recibos y recordatorios de mora. Requiere dominio verificado.
3. **Push** — FCM para la app móvil de padres.
4. **App móvil** — el portal ya es responsive; empaquetar como PWA o Expo.
5. Trigger de promoción de lista de espera a nivel BD (hoy se hace en la API).
6. Generación de QR offline (paquete `qrcode` en lugar del servicio externo).

---

*Última actualización: 11 de junio de 2026*
