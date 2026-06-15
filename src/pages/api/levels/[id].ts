import type { APIRoute } from 'astro';
import { parseAge } from './index';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Edita un nivel (solo superadmin). */
export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const { session, supabase } = locals;

  if (!session || session.profile.role !== 'superadmin') {
    return json({ error: 'No autorizado' }, 401);
  }

  const id = params.id;
  if (!id) return json({ error: 'Falta el id.' }, 400);

  const fd = await request.formData();
  const update: Record<string, unknown> = {};

  if (fd.has('name')) {
    const name = fd.get('name')?.toString().trim() ?? '';
    if (!name) return json({ error: 'El nombre es obligatorio.' }, 400);
    update.name = name;
  }
  if (fd.has('min_age')) update.min_age = parseAge(fd.get('min_age'));
  if (fd.has('max_age')) update.max_age = parseAge(fd.get('max_age'));
  if (fd.has('description'))
    update.description = fd.get('description')?.toString().trim() || null;
  if (fd.has('sort_order')) {
    const so = parseAge(fd.get('sort_order'));
    if (so !== null) update.sort_order = so;
  }

  if (Object.keys(update).length === 0) {
    return json({ error: 'Nada que actualizar.' }, 400);
  }

  const { error } = await supabase.from('levels').update(update).eq('id', id);
  if (error) {
    console.error('update level:', error.message);
    return json({ error: 'No se pudo actualizar el nivel.' }, 400);
  }

  return json({ ok: true });
};

/** Elimina un nivel (solo superadmin). Falla si está en uso. */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const { session, supabase } = locals;

  if (!session || session.profile.role !== 'superadmin') {
    return json({ error: 'No autorizado' }, 401);
  }

  const id = params.id;
  if (!id) return json({ error: 'Falta el id.' }, 400);

  const { error } = await supabase.from('levels').delete().eq('id', id);
  if (error) {
    // 23503 = violación de llave foránea (el nivel está referenciado).
    if (error.code === '23503') {
      return json(
        { error: 'No se puede eliminar: el nivel está en uso por grupos o alumnos.' },
        409,
      );
    }
    console.error('delete level:', error.message);
    return json({ error: 'No se pudo eliminar el nivel.' }, 400);
  }

  return json({ ok: true });
};
