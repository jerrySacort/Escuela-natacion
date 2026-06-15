const ALLOWED = ["superadmin", "branch_admin", "coordinator", "instructor"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  const fd = await request.formData();
  const studentId = fd.get("student_id")?.toString() ?? "";
  const groupId = fd.get("group_id")?.toString() ?? "";
  const present = fd.get("present")?.toString() === "true";
  if (!studentId || !groupId) {
    return json({ error: "Faltan parámetros." }, 400);
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (present) {
    const { data: student } = await supabase.from("students").select("branch_id").eq("id", studentId).single();
    if (!student) return json({ error: "Alumno no encontrado." }, 404);
    const { error } = await supabase.from("attendance").insert({
      student_id: studentId,
      group_id: groupId,
      branch_id: student.branch_id,
      class_date: today,
      method: "manual",
      recorded_by: session.user.id
    });
    if (error && error.code !== "23505") {
      console.error("toggle attendance on:", error.message);
      return json({ error: "No se pudo marcar la asistencia." }, 400);
    }
  } else {
    const { error } = await supabase.from("attendance").delete().eq("student_id", studentId).eq("group_id", groupId).eq("class_date", today);
    if (error) {
      console.error("toggle attendance off:", error.message);
      return json({ error: "No se pudo desmarcar la asistencia." }, 400);
    }
  }
  return json({ ok: true });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
