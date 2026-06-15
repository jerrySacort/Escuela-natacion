import { p as parseSchedules } from './index_9S8aPDwU.mjs';

const ALLOWED = ["superadmin", "branch_admin", "coordinator"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const PATCH = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const id = params.id;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  if (!id) return json({ error: "Falta el id." }, 400);
  const fd = await request.formData();
  const update = {};
  const text = (k) => fd.get(k)?.toString().trim();
  if (fd.has("name")) {
    const v = text("name");
    if (!v) return json({ error: "El nombre no puede quedar vacío." }, 400);
    update.name = v;
  }
  if (fd.has("level_id")) {
    const v = text("level_id");
    if (!v) return json({ error: "El nivel es obligatorio." }, 400);
    update.level_id = v;
  }
  if (fd.has("instructor_id")) update.instructor_id = text("instructor_id") || null;
  if (fd.has("pool_id")) update.pool_id = text("pool_id") || null;
  if (fd.has("lane")) {
    const v = text("lane");
    update.lane = v ? parseInt(v, 10) : null;
  }
  if (fd.has("capacity")) {
    const v = parseInt(text("capacity") ?? "", 10);
    if (!Number.isFinite(v) || v < 1) return json({ error: "Cupo inválido." }, 400);
    update.capacity = v;
  }
  if (fd.has("monthly_fee")) {
    const v = parseFloat(text("monthly_fee") ?? "");
    if (!Number.isFinite(v) || v < 0) return json({ error: "Mensualidad inválida." }, 400);
    update.monthly_fee = v;
  }
  if (fd.has("is_active")) update.is_active = text("is_active") === "true";
  if (fd.has("branch_id") && session.profile.role === "superadmin") {
    const v = text("branch_id");
    if (v) update.branch_id = v;
  }
  if (Object.keys(update).length > 0) {
    const { data, error } = await supabase.from("groups").update(update).eq("id", id).select("id").single();
    if (error || !data) {
      console.error("update group:", error?.message);
      return json({ error: "No se pudo actualizar el grupo." }, 400);
    }
  }
  if (fd.has("schedules")) {
    const schedules = parseSchedules(fd.get("schedules")?.toString() ?? "[]");
    if (schedules === null) {
      return json({ error: "Horarios inválidos (la hora de fin debe ser mayor a la de inicio)." }, 400);
    }
    const { error: delError } = await supabase.from("group_schedules").delete().eq("group_id", id);
    if (delError) {
      console.error("delete schedules:", delError.message);
      return json({ error: "No se pudieron actualizar los horarios." }, 400);
    }
    if (schedules.length > 0) {
      const { error: insError } = await supabase.from("group_schedules").insert(schedules.map((s) => ({ ...s, group_id: id })));
      if (insError) {
        console.error("insert schedules:", insError.message);
        return json({ error: "No se pudieron guardar los horarios nuevos." }, 400);
      }
    }
  }
  return json({ id });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
