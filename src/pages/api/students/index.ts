import type { APIRoute } from 'astro';

const ALLOWED = ['superadmin', 'branch_admin', 'coordinator'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, supabase } = locals;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: 'No autorizado' }, 401);
  }

  const fd = await request.formData();
  const firstName = fd.get('first_name')?.toString().trim() ?? '';
  const lastName = fd.get('last_name')?.toString().trim() ?? '';
  const birthDate = fd.get('birth_date')?.toString() ?? '';
  const levelId = fd.get('level_id')?.toString() || null;
  const medicalNotes = fd.get('medical_notes')?.toString().trim() || null;
  const guardianId = fd.get('guardian_id')?.toString() || null;
  const relationship = fd.get('relationship')?.toString() || 'tutor';
  const sexRaw = fd.get('sex')?.toString();
  const sex = sexRaw === 'F' || sexRaw === 'M' ? sexRaw : null;
  const photo = fd.get('photo');

  // El staff de sucursal solo da de alta en SU sucursal;
  // el superadmin elige en el formulario.
  const branchId =
    session.profile.role === 'superadmin'
      ? (fd.get('branch_id')?.toString() ?? '')
      : (session.profile.branch_id ?? '');

  if (!firstName || !lastName || !birthDate || !branchId) {
    return json({ error: 'Faltan campos obligatorios.' }, 400);
  }
  if (new Date(birthDate) > new Date()) {
    return json({ error: 'La fecha de nacimiento no puede ser futura.' }, 400);
  }

  // Validar foto antes de crear nada
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto) {
    if (!photo.type.startsWith('image/')) {
      return json({ error: 'La foto debe ser una imagen.' }, 400);
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return json({ error: 'La foto no debe superar 5 MB.' }, 400);
    }
  }

  const { data: student, error } = await supabase
    .from('students')
    .insert({
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      branch_id: branchId,
      level_id: levelId,
      medical_notes: medicalNotes,
      sex,
    })
    .select('id')
    .single();

  if (error) {
    console.error('insert student:', error.message);
    return json({ error: 'No se pudo guardar el alumno.' }, 400);
  }

  const warnings: string[] = [];

  // Subir foto a Storage y guardar URL pública
  if (hasPhoto) {
    const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${student.id}/${Date.now()}.${ext}`;
    const { error: upError } = await supabase.storage
      .from('student-photos')
      .upload(path, photo, { contentType: photo.type });

    if (upError) {
      console.error('upload photo:', upError.message);
      warnings.push('El alumno se creó, pero la foto no se pudo subir.');
    } else {
      const { data: pub } = supabase.storage
        .from('student-photos')
        .getPublicUrl(path);
      await supabase
        .from('students')
        .update({ photo_url: pub.publicUrl })
        .eq('id', student.id);
    }
  }

  // Vincular tutor
  if (guardianId) {
    const { error: sgError } = await supabase.from('student_guardians').insert({
      student_id: student.id,
      guardian_id: guardianId,
      relationship,
      is_primary: true,
    });
    if (sgError) {
      console.error('link guardian:', sgError.message);
      warnings.push('El alumno se creó, pero no se pudo vincular al tutor.');
    }
  }

  return json({ id: student.id, warnings }, 201);
};
