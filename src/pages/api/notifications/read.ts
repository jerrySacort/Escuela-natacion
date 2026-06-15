import type { APIRoute } from 'astro';

/** Marcar como leídas todas las notificaciones del usuario actual. */
export const POST: APIRoute = async ({ locals }) => {
  const { session, supabase } = locals;

  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', session.user.id)
    .is('read_at', null);

  if (error) {
    console.error('mark read:', error.message);
    return new Response(JSON.stringify({ error: 'No se pudo actualizar.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
