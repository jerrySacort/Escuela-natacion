import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Notificar a los tutores de un alumno. Falla en silencio: una
 * notificación nunca debe romper la operación principal.
 */
export async function notifyStudentGuardians(
  supabase: SupabaseClient,
  studentId: string,
  title: string,
  body: string,
  branchId: string | null = null,
) {
  try {
    const { data } = await supabase
      .from('student_guardians')
      .select('guardian_id')
      .eq('student_id', studentId);
    const rows = (data ?? []).map((g) => ({
      profile_id: g.guardian_id,
      branch_id: branchId,
      title,
      body,
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from('notifications').insert(rows);
      if (error) console.error('notify:', error.message);
    }
  } catch (e) {
    console.error('notify:', e);
  }
}

interface BatchItem {
  student_id: string;
  title: string;
  body: string;
  branch_id: string | null;
}

/** Versión batch: una consulta de tutores para muchos alumnos. */
export async function notifyManyGuardians(
  supabase: SupabaseClient,
  items: BatchItem[],
) {
  if (items.length === 0) return;
  try {
    const studentIds = [...new Set(items.map((i) => i.student_id))];
    const { data } = await supabase
      .from('student_guardians')
      .select('student_id, guardian_id')
      .in('student_id', studentIds);

    const byStudent = new Map<string, string[]>();
    for (const g of data ?? []) {
      const list = byStudent.get(g.student_id) ?? [];
      list.push(g.guardian_id);
      byStudent.set(g.student_id, list);
    }

    const rows = items.flatMap((i) =>
      (byStudent.get(i.student_id) ?? []).map((guardianId) => ({
        profile_id: guardianId,
        branch_id: i.branch_id,
        title: i.title,
        body: i.body,
      })),
    );

    if (rows.length > 0) {
      const { error } = await supabase.from('notifications').insert(rows);
      if (error) console.error('notify batch:', error.message);
    }
  } catch (e) {
    console.error('notify batch:', e);
  }
}
