import type { APIRoute } from 'astro';

const ALLOWED = ['superadmin', 'branch_admin', 'coordinator'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Vincular un tutor al alumno. */
export const POST: APIRoute = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const studentId = params.id;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!studentId) return json({ error: 'Falta el id del alumno.' }, 400);

  const fd = await request.formData();
  const guardianId = fd.get('guardian_id')?.toString() ?? '';
  const relationship = fd.get('relationship')?.toString() || 'tutor';
  const isPrimary = fd.get('is_primary')?.toString() === 'true';

  if (!guardianId) return json({ error: 'Selecciona un tutor.' }, 400);

  // Si será principal, quitar el flag a los demás
  if (isPrimary) {
    await supabase
      .from('student_guardians')
      .update({ is_primary: false })
      .eq('student_id', studentId);
  }

  // RLS limita al staff a alumnos de su sucursal
  const { error } = await supabase.from('student_guardians').insert({
    student_id: studentId,
    guardian_id: guardianId,
    relationship,
    is_primary: isPrimary,
  });

  if (error) {
    console.error('link guardian:', error.message);
    const msg = error.code === '23505'
      ? 'Ese tutor ya está vinculado al alumno.'
      : 'No se pudo vincular al tutor.';
    return json({ error: msg }, 400);
  }

  return json({ ok: true }, 201);
};

/** Desvincular un tutor (?guardian_id=...). */
export const DELETE: APIRoute = async ({ url, params, locals }) => {
  const { session, supabase } = locals;
  const studentId = params.id;
  const guardianId = url.searchParams.get('guardian_id') ?? '';

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!studentId || !guardianId) {
    return json({ error: 'Faltan parámetros.' }, 400);
  }

  const { error } = await supabase
    .from('student_guardians')
    .delete()
    .eq('student_id', studentId)
    .eq('guardian_id', guardianId);

  if (error) {
    console.error('unlink guardian:', error.message);
    return json({ error: 'No se pudo desvincular al tutor.' }, 400);
  }

  return json({ ok: true });
};
