async function notifyStudentGuardians(supabase, studentId, title, body, branchId = null) {
  try {
    const { data } = await supabase.from("student_guardians").select("guardian_id").eq("student_id", studentId);
    const rows = (data ?? []).map((g) => ({
      profile_id: g.guardian_id,
      branch_id: branchId,
      title,
      body
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) console.error("notify:", error.message);
    }
  } catch (e) {
    console.error("notify:", e);
  }
}
async function notifyManyGuardians(supabase, items) {
  if (items.length === 0) return;
  try {
    const studentIds = [...new Set(items.map((i) => i.student_id))];
    const { data } = await supabase.from("student_guardians").select("student_id, guardian_id").in("student_id", studentIds);
    const byStudent = /* @__PURE__ */ new Map();
    for (const g of data ?? []) {
      const list = byStudent.get(g.student_id) ?? [];
      list.push(g.guardian_id);
      byStudent.set(g.student_id, list);
    }
    const rows = items.flatMap(
      (i) => (byStudent.get(i.student_id) ?? []).map((guardianId) => ({
        profile_id: guardianId,
        branch_id: i.branch_id,
        title: i.title,
        body: i.body
      }))
    );
    if (rows.length > 0) {
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) console.error("notify batch:", error.message);
    }
  } catch (e) {
    console.error("notify batch:", e);
  }
}

export { notifyStudentGuardians as a, notifyManyGuardians as n };
