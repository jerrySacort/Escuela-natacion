import type { APIRoute } from 'astro';

const ALLOWED = ['superadmin', 'branch_admin', 'coordinator'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Inscribir alumno; si el cupo está lleno entra a lista de espera. */
export const POST: APIRoute = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const groupId = params.id;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!groupId) return json({ error: 'Falta el id del grupo.' }, 400);

  const fd = await request.formData();
  const studentId = fd.get('student_id')?.toString() ?? '';
  if (!studentId) return json({ error: 'Selecciona un alumno.' }, 400);

  const { data: group } = await supabase
    .from('groups')
    .select('id, branch_id, capacity, is_active')
    .eq('id', groupId)
    .single();

  if (!group) return json({ error: 'Grupo no encontrado.' }, 404);
  if (!group.is_active) return json({ error: 'El grupo está inactivo.' }, 400);

  const [{ count: activeCount }, { count: waitCount }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'active'),
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'waitlisted'),
  ]);

  const isFull = (activeCount ?? 0) >= group.capacity;

  const { error } = await supabase.from('enrollments').insert({
    student_id: studentId,
    group_id: groupId,
    branch_id: group.branch_id,
    status: isFull ? 'waitlisted' : 'active',
    waitlist_pos: isFull ? (waitCount ?? 0) + 1 : null,
  });

  if (error) {
    console.error('enroll:', error.message);
    const msg =
      error.code === '23505'
        ? 'Ese alumno ya está inscrito en este grupo.'
        : 'No se pudo inscribir al alumno.';
    return json({ error: msg }, 400);
  }

  return json({ ok: true, waitlisted: isFull }, 201);
};

/** Dar de baja una inscripción (?enrollment_id=...). Si había lista de
 *  espera, promueve automáticamente al primero. */
export const DELETE: APIRoute = async ({ url, params, locals }) => {
  const { session, supabase } = locals;
  const groupId = params.id;
  const enrollmentId = url.searchParams.get('enrollment_id') ?? '';

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!groupId || !enrollmentId) return json({ error: 'Faltan parámetros.' }, 400);

  const { data: enr, error } = await supabase
    .from('enrollments')
    .update({ status: 'cancelled', ended_at: new Date().toISOString().slice(0, 10) })
    .eq('id', enrollmentId)
    .eq('group_id', groupId)
    .select('status')
    .single();

  if (error || !enr) {
    console.error('cancel enrollment:', error?.message);
    return json({ error: 'No se pudo dar de baja.' }, 400);
  }

  // Promover al primero de la lista de espera si se liberó un lugar
  let promoted = false;
  const { data: next } = await supabase
    .from('enrollments')
    .select('id')
    .eq('group_id', groupId)
    .eq('status', 'waitlisted')
    .order('waitlist_pos', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (next) {
    const { error: promoteError } = await supabase
      .from('enrollments')
      .update({ status: 'active', waitlist_pos: null })
      .eq('id', next.id);
    promoted = !promoteError;
  }

  return json({ ok: true, promoted });
};
