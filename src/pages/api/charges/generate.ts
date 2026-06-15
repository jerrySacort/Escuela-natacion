import type { APIRoute } from 'astro';
import { notifyManyGuardians } from '@/lib/notify';

const ALLOWED = ['superadmin', 'branch_admin', 'coordinator'];
const DUE_DAY = 10; // día de vencimiento de las mensualidades

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Genera los cargos de mensualidad del mes en curso para todas las
 * inscripciones activas visibles (RLS limita al staff a su sucursal).
 * Idempotente: omite inscripciones que ya tienen el cargo del mes.
 * También marca como vencidos los cargos pendientes pasados de fecha.
 */
export const POST: APIRoute = async ({ locals }) => {
  const { session, supabase } = locals;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const concept = `Mensualidad ${MONTHS[month]} ${year}`;
  const dueDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(DUE_DAY).padStart(2, '0')}`;
  const today = now.toISOString().slice(0, 10);

  // Inscripciones activas con la cuota de su grupo
  const { data: enrollments, error: enrError } = await supabase
    .from('enrollments')
    .select('id, student_id, branch_id, groups(monthly_fee, is_active)')
    .eq('status', 'active');

  if (enrError) {
    console.error('list enrollments:', enrError.message);
    return json({ error: 'No se pudieron leer las inscripciones.' }, 400);
  }

  // Cargos ya generados este mes (por inscripción)
  const { data: existing } = await supabase
    .from('charges')
    .select('enrollment_id')
    .eq('concept', concept)
    .neq('status', 'cancelled');

  const have = new Set((existing ?? []).map((c) => c.enrollment_id));

  const one = <T,>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;

  const rows = (enrollments ?? [])
    .filter((e) => !have.has(e.id))
    .map((e) => {
      const g = one(e.groups) as { monthly_fee: number; is_active: boolean } | null;
      if (!g || !g.is_active) return null;
      const fee = Number(g.monthly_fee);
      return {
        student_id: e.student_id,
        enrollment_id: e.id,
        branch_id: e.branch_id,
        concept,
        amount: fee,
        amount_due: fee,
        due_date: dueDate,
        status: 'pending' as const,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  let created = 0;
  if (rows.length > 0) {
    const { error: insError } = await supabase.from('charges').insert(rows);
    if (insError) {
      console.error('insert charges:', insError.message);
      return json({ error: 'No se pudieron generar los cargos.' }, 400);
    }
    created = rows.length;

    // Avisar a los tutores
    const dueFmt = new Date(dueDate + 'T00:00:00').toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
    });
    await notifyManyGuardians(
      supabase,
      rows.map((r) => ({
        student_id: r.student_id,
        branch_id: r.branch_id,
        title: 'Nuevo cargo 📄',
        body: `${concept}: $${r.amount_due.toLocaleString('es-MX')} — vence el ${dueFmt}.`,
      })),
    );
  }

  // Marcar vencidos
  const { data: overdueRows } = await supabase
    .from('charges')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', today)
    .select('id');

  return json({
    created,
    skipped: have.size,
    overdue_marked: overdueRows?.length ?? 0,
    concept,
  });
};
