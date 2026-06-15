import type { APIRoute } from 'astro';

const ALLOWED = ['superadmin', 'branch_admin', 'coordinator'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const id = params.id;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!id) return json({ error: 'Falta el id.' }, 400);

  const fd = await request.formData();
  const update: Record<string, unknown> = {};

  const text = (k: string) => fd.get(k)?.toString().trim();

  if (fd.has('first_name')) {
    const v = text('first_name');
    if (!v) return json({ error: 'El nombre no puede quedar vacío.' }, 400);
    update.first_name = v;
  }
  if (fd.has('last_name')) {
    const v = text('last_name');
    if (!v) return json({ error: 'Los apellidos no pueden quedar vacíos.' }, 400);
    update.last_name = v;
  }
  if (fd.has('birth_date')) {
    const v = text('birth_date') ?? '';
    if (!v || new Date(v) > new Date()) {
      return json({ error: 'Fecha de nacimiento inválida.' }, 400);
    }
    update.birth_date = v;
  }
  if (fd.has('sex')) {
    const v = text('sex');
    update.sex = v === 'F' || v === 'M' ? v : null;
  }
  if (fd.has('level_id')) update.level_id = text('level_id') || null;
  if (fd.has('medical_notes')) update.medical_notes = text('medical_notes') || null;
  if (fd.has('is_active')) update.is_active = text('is_active') === 'true';

  // Solo superadmin puede mover alumnos de sucursal
  if (fd.has('branch_id') && session.profile.role === 'superadmin') {
    const v = text('branch_id');
    if (v) update.branch_id = v;
  }

  // Foto nueva (opcional)
  const photo = fd.get('photo');
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith('image/')) {
      return json({ error: 'La foto debe ser una imagen.' }, 400);
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return json({ error: 'La foto no debe superar 5 MB.' }, 400);
    }
    const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${id}/${Date.now()}.${ext}`;
    const { error: upError } = await supabase.storage
      .from('student-photos')
      .upload(path, photo, { contentType: photo.type });
    if (upError) {
      console.error('upload photo:', upError.message);
      return json({ error: 'No se pudo subir la foto.' }, 400);
    }
    const { data: pub } = supabase.storage
      .from('student-photos')
      .getPublicUrl(path);
    update.photo_url = pub.publicUrl;
  }

  if (Object.keys(update).length === 0) {
    return json({ error: 'Nada que actualizar.' }, 400);
  }

  // RLS limita al staff a su propia sucursal
  const { data, error } = await supabase
    .from('students')
    .update(update)
    .eq('id', id)
    .select('id')
    .single();

  if (error || !data) {
    console.error('update student:', error?.message);
    return json({ error: 'No se pudo actualizar el alumno.' }, 400);
  }

  return json({ id: data.id });
};
