import type { APIRoute } from 'astro';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Renombrar habilidad. */
export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== 'superadmin') {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!params.id) return json({ error: 'Falta el id.' }, 400);

  const fd = await request.formData();
  const name = fd.get('name')?.toString().trim() ?? '';
  if (!name) return json({ error: 'El nombre no puede quedar vacío.' }, 400);

  const { error } = await supabase
    .from('skills')
    .update({ name })
    .eq('id', params.id);

  if (error) {
    console.error('update skill:', error.message);
    return json({ error: 'No se pudo actualizar.' }, 400);
  }
  return json({ ok: true });
};

/** Eliminar habilidad (las evaluaciones pasadas conservan su histórico
 *  solo si no hay FK; aquí la FK restringe el borrado si ya fue usada). */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== 'superadmin') {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!params.id) return json({ error: 'Falta el id.' }, 400);

  const { error } = await supabase.from('skills').delete().eq('id', params.id);

  if (error) {
    console.error('delete skill:', error.message);
    const msg =
      error.code === '23503'
        ? 'No se puede eliminar: ya fue usada en evaluaciones.'
        : 'No se pudo eliminar.';
    return json({ error: msg }, 400);
  }
  return json({ ok: true });
};
