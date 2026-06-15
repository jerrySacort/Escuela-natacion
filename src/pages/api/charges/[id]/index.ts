import type { APIRoute } from 'astro';

const ALLOWED = ['superadmin', 'branch_admin', 'coordinator'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Cancelar un cargo (solo pendientes o vencidos). */
export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const id = params.id;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!id) return json({ error: 'Falta el id.' }, 400);

  const fd = await request.formData();
  const action = fd.get('action')?.toString();

  if (action !== 'cancel') {
    return json({ error: 'Acción no soportada.' }, 400);
  }

  const { data, error } = await supabase
    .from('charges')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .in('status', ['pending', 'overdue'])
    .select('id')
    .single();

  if (error || !data) {
    console.error('cancel charge:', error?.message);
    return json(
      { error: 'No se pudo cancelar (¿ya está pagado o cancelado?).' },
      400,
    );
  }

  return json({ ok: true });
};
