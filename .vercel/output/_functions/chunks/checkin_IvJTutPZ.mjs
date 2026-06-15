const ALLOWED = ["superadmin", "branch_admin", "coordinator", "instructor"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
const POST = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  const fd = await request.formData();
  const code = fd.get("code")?.toString().trim() ?? "";
  const studentIdInput = fd.get("student_id")?.toString() ?? "";
  const groupId = fd.get("group_id")?.toString() ?? "";
  const method = fd.get("method")?.toString() === "manual" ? "manual" : "qr";
  if (!code && !studentIdInput) {
    return json({ error: "Falta el código QR." }, 400);
  }
  let studentQuery = supabase.from("students").select("id, first_name, last_name, branch_id, is_active");
  studentQuery = code ? studentQuery.eq("qr_code", code) : studentQuery.eq("id", studentIdInput);
  const { data: student } = await studentQuery.single();
  if (!student) {
    return json({ error: "Código no reconocido." }, 404);
  }
  if (!student.is_active) {
    return json({ error: `${student.first_name} ${student.last_name} está inactivo.` }, 400);
  }
  const studentName = `${student.first_name} ${student.last_name}`;
  const { data: enrollments } = await supabase.from("enrollments").select("group_id, groups(id, name, is_active, group_schedules(weekday, start_time))").eq("student_id", student.id).eq("status", "active");
  const today = (/* @__PURE__ */ new Date()).getDay();
  const candidates = (enrollments ?? []).map((e) => {
    const g = one(e.groups);
    if (!g || !g.is_active) return null;
    const todaySched = (g.group_schedules ?? []).filter((s) => s.weekday === today);
    return {
      group_id: g.id,
      name: g.name,
      has_class_today: todaySched.length > 0,
      start_time: todaySched[0]?.start_time?.slice(0, 5) ?? null
    };
  }).filter((c) => c !== null);
  if (candidates.length === 0) {
    return json({ error: `${studentName} no tiene inscripciones activas.` }, 400);
  }
  let targetGroupId = groupId;
  if (!targetGroupId) {
    const withClassToday = candidates.filter((c) => c.has_class_today);
    if (withClassToday.length === 1) {
      targetGroupId = withClassToday[0].group_id;
    } else {
      return json({
        status: "choose",
        student_name: studentName,
        candidates
      });
    }
  } else if (!candidates.some((c) => c.group_id === targetGroupId)) {
    return json({ error: "El alumno no está inscrito en ese grupo." }, 400);
  }
  const { error } = await supabase.from("attendance").insert({
    student_id: student.id,
    group_id: targetGroupId,
    branch_id: student.branch_id,
    method,
    recorded_by: session.user.id
  });
  const groupName = candidates.find((c) => c.group_id === targetGroupId)?.name ?? "";
  if (error) {
    if (error.code === "23505") {
      return json({
        status: "already",
        student_name: studentName,
        group_name: groupName
      });
    }
    console.error("checkin:", error.message);
    return json({ error: "No se pudo registrar la asistencia." }, 400);
  }
  return json({ status: "ok", student_name: studentName, group_name: groupName }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
