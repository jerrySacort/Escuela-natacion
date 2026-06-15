import type { APIRoute } from 'astro';
import { isRootAdmin } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Crea un usuario superadmin.
 *
 * SEGURIDAD: solo la cuenta raíz (ROOT_ADMIN_EMAIL) puede usar esto, aunque
 * cualquier superadmin tenga acceso a Configuración. La verificación se hace
 * con el email de la SESIÓN del servidor (no con datos del cliente).
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { session } = locals;

  // Doble candado: debe haber sesión, ser superadmin y ser la cuenta raíz.
  if (
    !session ||
    session.profile.role !== 'superadmin' ||
    !isRootAdmin(session.user.email)
  ) {
    return json({ error: 'No autorizado' }, 403);
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return json(
      { error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
      500,
    );
  }

  const fd = await request.formData();
  const email = fd.get('email')?.toString().trim().toLowerCase() ?? '';
  const password = fd.get('password')?.toString() ?? '';
  const fullName = fd.get('full_name')?.toString().trim() ?? '';

  if (!email || !email.includes('@')) {
    return json({ error: 'Correo no válido.' }, 400);
  }
  if (!fullName) {
    return json({ error: 'El nombre es obligatorio.' }, 400);
  }
  if (password.length < 8) {
    return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400);
  }

  // El trigger handle_new_user inserta el perfil como 'parent', y la tabla
  // exige branch_id para los no-superadmin (constraint + FK). Pasamos una
  // sucursal válida para que ese insert no falle; luego elevamos a superadmin
  // y dejamos branch_id en null.
  const { data: branch } = await admin
    .from('branches')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (!branch) {
    return json(
      { error: 'Crea al menos una sucursal antes de registrar usuarios.' },
      400,
    );
  }

  // 1) Crear la cuenta de autenticación (el trigger crea el profile como 'parent').
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, branch_id: branch.id },
  });

  if (createErr || !created?.user) {
    const already = createErr?.message?.toLowerCase().includes('already');
    return json(
      { error: already ? 'Ya existe un usuario con ese correo.' : 'No se pudo crear el usuario.' },
      400,
    );
  }

  // 2) Elevar el rol a superadmin (branch_id null: válido para superadmin).
  const { error: roleErr } = await admin
    .from('profiles')
    .update({ role: 'superadmin', branch_id: null, full_name: fullName })
    .eq('id', created.user.id);

  if (roleErr) {
    // Revertir la cuenta a medias para no dejar un 'parent' huérfano.
    await admin.auth.admin.deleteUser(created.user.id);
    console.error('promote superadmin:', roleErr.message);
    return json({ error: 'Se creó la cuenta pero no se pudo asignar el rol. Intenta de nuevo.' }, 400);
  }

  return json({ id: created.user.id }, 201);
};
