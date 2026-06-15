import type { APIRoute } from 'astro';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Edita una sucursal o cambia su estado activo (solo superadmin). */
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
  if (fd.has('address')) update.address = fd.get('address')?.toString().trim() || null;
  if (fd.has('phone')) update.phone = fd.get('phone')?.toString().trim() || null;
  if (fd.has('is_active')) update.is_active = fd.get('is_active')?.toString() === 'true';

  if (Object.keys(update).length === 0) {
    return json({ error: 'Nada que actualizar.' }, 400);
  }

  const { error } = await supabase.from('branches').update(update).eq('id', id);
  if (error) {
    console.error('update branch:', error.message);
    return json({ error: 'No se pudo actualizar la sucursal.' }, 400);
  }

  return json({ ok: true });
};
