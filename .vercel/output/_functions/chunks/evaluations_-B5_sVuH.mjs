import { a as notifyStudentGuardians } from './notify_GUnBibPs.mjs';

const ALLOWED = ["superadmin", "branch_admin", "coordinator", "instructor"];
const STAFF = ["superadmin", "branch_admin", "coordinator"];
const RESULTS = ["not_attempted", "in_progress", "achieved"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const studentId = params.id;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  if (!studentId) return json({ error: "Falta el id del alumno." }, 400);
  const fd = await request.formData();
  const levelId = fd.get("level_id")?.toString() ?? "";
  const notes = fd.get("notes")?.toString().trim() || null;
  const passedLevel = fd.get("passed_level")?.toString() === "true";
  const promote = fd.get("promote")?.toString() === "true";
  let scores;
  try {
    scores = JSON.parse(fd.get("scores")?.toString() ?? "[]");
    if (!Array.isArray(scores) || scores.some((s) => !s.skill_id || !RESULTS.includes(s.result))) {
      throw new Error("bad scores");
    }
  } catch {
    return json({ error: "Calificaciones inválidas." }, 400);
  }
  if (!levelId) return json({ error: "Falta el nivel evaluado." }, 400);
  const { data: student } = await supabase.from("students").select("id, branch_id, level_id, first_name").eq("id", studentId).single();
  if (!student) return json({ error: "Alumno no encontrado." }, 404);
  const { data: instructorRow } = await supabase.from("instructors").select("id").eq("profile_id", session.user.id).maybeSingle();
  const { data: evaluation, error } = await supabase.from("evaluations").insert({
    student_id: student.id,
    level_id: levelId,
    branch_id: student.branch_id,
    instructor_id: instructorRow?.id ?? null,
    passed_level: passedLevel,
    notes
  }).select("id").single();
  if (error || !evaluation) {
    console.error("insert evaluation:", error?.message);
    return json({ error: "No se pudo guardar la evaluación." }, 400);
  }
  if (scores.length > 0) {
    const { error: scoreError } = await supabase.from("evaluation_scores").insert(
      scores.map((s) => ({
        evaluation_id: evaluation.id,
        skill_id: s.skill_id,
        result: s.result,
        comment: s.comment?.trim() || null
      }))
    );
    if (scoreError) {
      console.error("insert scores:", scoreError.message);
      return json({ error: "Evaluación creada, pero fallaron las calificaciones." }, 500);
    }
  }
  const warnings = [];
  if (passedLevel && promote) {
    if (!STAFF.includes(session.profile.role)) {
      warnings.push("Solo el staff puede promover de nivel; pide a coordinación que lo aplique.");
    } else {
      const { data: levels } = await supabase.from("levels").select("id, sort_order").order("sort_order");
      const current = (levels ?? []).find((l) => l.id === levelId);
      const next = current ? (levels ?? []).find((l) => l.sort_order > current.sort_order) : null;
      if (next) {
        const { error: promoteError } = await supabase.from("students").update({ level_id: next.id }).eq("id", student.id);
        if (promoteError) {
          warnings.push("No se pudo actualizar el nivel del alumno.");
        }
      } else {
        warnings.push("Ya está en el último nivel; no hay promoción.");
      }
    }
  }
  await notifyStudentGuardians(
    supabase,
    student.id,
    passedLevel ? "¡Nivel aprobado! 🎉" : "Nueva evaluación 📋",
    passedLevel ? `${student.first_name} aprobó su evaluación de nivel. ¡Felicidades!` : `${student.first_name} tiene una nueva evaluación de avance. Revísala en su perfil.`,
    student.branch_id
  );
  return json({ id: evaluation.id, warnings }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
