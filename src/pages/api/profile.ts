import type { APIRoute } from 'astro';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Actualiza el perfil del usuario actual (nombre, teléfono) y opcionalmente la contraseña. */
export const PATCH: APIRoute = async ({ request, locals }) => {
  const { session, supabase } = locals;

  if (!session) {
    return json({ error: 'No autorizado' }, 401);
  }

  const fd = await request.formData();
  const fullName = fd.get('full_name')?.toString().trim() ?? '';
  const phone = fd.get('phone')?.toString().trim() || null;
  const password = fd.get('password')?.toString() ?? '';

  if (!fullName) {
    return json({ error: 'El nombre es obligatorio.' }, 400);
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone })
    .eq('id', session.user.id);

  if (error) {
    console.error('update profile:', error.message);
    return json({ error: 'No se pudo actualizar el perfil.' }, 400);
  }

  if (password) {
    if (password.length < 8) {
      return json(
        { error: 'Perfil actualizado, pero la contraseña debe tener al menos 8 caracteres.' },
        400,
      );
    }
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      console.error('update password:', pwError.message);
      return json(
        { error: 'Perfil actualizado, pero no se pudo cambiar la contraseña.' },
        400,
      );
    }
  }

  return json({ ok: true });
};
