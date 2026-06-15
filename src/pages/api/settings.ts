import type { APIRoute } from 'astro';

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Actualiza los datos globales de la escuela (solo superadmin). */
export const PATCH: APIRoute = async ({ request, locals }) => {
  const { session, supabase } = locals;

  if (!session || session.profile.role !== 'superadmin') {
    return json({ error: 'No autorizado' }, 401);
  }

  const fd = await request.formData();
  const schoolName = fd.get('school_name')?.toString().trim() ?? '';
  const phone = fd.get('phone')?.toString().trim() || null;
  const email = fd.get('email')?.toString().trim() || null;
  const logo = fd.get('logo');

  if (!schoolName) {
    return json({ error: 'El nombre de la escuela es obligatorio.' }, 400);
  }

  const update: Record<string, unknown> = {
    school_name: schoolName,
    phone,
    email,
    updated_at: new Date().toISOString(),
  };

  const warnings: string[] = [];

  const hasLogo = logo instanceof File && logo.size > 0;
  if (hasLogo) {
    if (!logo.type.startsWith('image/')) {
      return json({ error: 'El logo debe ser una imagen.' }, 400);
    }
    if (logo.size > MAX_LOGO_BYTES) {
      return json({ error: 'El logo no debe superar 5 MB.' }, 400);
    }
    const ext = (logo.name.split('.').pop() || 'png').toLowerCase();
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upError } = await supabase.storage
      .from('org-assets')
      .upload(path, logo, { contentType: logo.type, upsert: true });
    if (upError) {
      console.error('upload logo:', upError.message);
      warnings.push('Los datos se guardaron, pero el logo no se pudo subir.');
    } else {
      const { data: pub } = supabase.storage.from('org-assets').getPublicUrl(path);
      update.logo_url = pub.publicUrl;
    }
  }

  const { error } = await supabase.from('org_settings').update(update).eq('id', true);
  if (error) {
    console.error('update org_settings:', error.message);
    return json({ error: 'No se pudo guardar la configuración.' }, 400);
  }

  return json({ ok: true, warnings });
};
