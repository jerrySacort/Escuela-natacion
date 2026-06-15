import type { APIRoute } from 'astro';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Crea una sucursal (solo superadmin). */
export const POST: APIRoute = async ({ request, locals }) => {
  const { session, supabase } = locals;

  if (!session || session.profile.role !== 'superadmin') {
    return json({ error: 'No autorizado' }, 401);
  }

  const fd = await request.formData();
  const name = fd.get('name')?.toString().trim() ?? '';
  const address = fd.get('address')?.toString().trim() || null;
  const phone = fd.get('phone')?.toString().trim() || null;

  if (!name) {
    return json({ error: 'El nombre de la sucursal es obligatorio.' }, 400);
  }

  const { data, error } = await supabase
    .from('branches')
    .insert({ name, address, phone })
    .select('id')
    .single();

  if (error) {
    console.error('insert branch:', error.message);
    return json({ error: 'No se pudo crear la sucursal.' }, 400);
  }

  return json({ id: data.id }, 201);
};
