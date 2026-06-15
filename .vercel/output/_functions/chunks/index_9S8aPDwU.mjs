const ALLOWED = ["superadmin", "branch_admin", "coordinator"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function parseSchedules(raw) {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    for (const s of arr) {
      if (typeof s.weekday !== "number" || s.weekday < 0 || s.weekday > 6 || !/^\d{2}:\d{2}$/.test(s.start_time) || !/^\d{2}:\d{2}$/.test(s.end_time) || s.start_time >= s.end_time) {
        return null;
      }
    }
    return arr;
  } catch {
    return null;
  }
}
const POST = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  const fd = await request.formData();
  const name = fd.get("name")?.toString().trim() ?? "";
  const levelId = fd.get("level_id")?.toString() ?? "";
  const instructorId = fd.get("instructor_id")?.toString() || null;
  const poolId = fd.get("pool_id")?.toString() || null;
  const lane = fd.get("lane")?.toString();
  const capacity = parseInt(fd.get("capacity")?.toString() ?? "8", 10);
  const monthlyFee = parseFloat(fd.get("monthly_fee")?.toString() ?? "");
  const branchId = session.profile.role === "superadmin" ? fd.get("branch_id")?.toString() ?? "" : session.profile.branch_id ?? "";
  if (!name || !levelId || !branchId) {
    return json({ error: "Faltan campos obligatorios." }, 400);
  }
  if (!Number.isFinite(capacity) || capacity < 1) {
    return json({ error: "Cupo inválido." }, 400);
  }
  if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
    return json({ error: "Mensualidad inválida." }, 400);
  }
  const schedules = parseSchedules(fd.get("schedules")?.toString() ?? "[]");
  if (schedules === null) {
    return json({ error: "Horarios inválidos (la hora de fin debe ser mayor a la de inicio)." }, 400);
  }
  const { data: group, error } = await supabase.from("groups").insert({
    name,
    branch_id: branchId,
    level_id: levelId,
    instructor_id: instructorId,
    pool_id: poolId,
    lane: lane ? parseInt(lane, 10) : null,
    capacity,
    monthly_fee: monthlyFee
  }).select("id").single();
  if (error) {
    console.error("insert group:", error.message);
    return json({ error: "No se pudo crear el grupo." }, 400);
  }
  if (schedules.length > 0) {
    const { error: schedError } = await supabase.from("group_schedules").insert(
      schedules.map((s) => ({ ...s, group_id: group.id }))
    );
    if (schedError) {
      console.error("insert schedules:", schedError.message);
      return json(
        { id: group.id, warnings: ["El grupo se creó, pero los horarios no se guardaron."] },
        201
      );
    }
  }
  return json({ id: group.id }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  parseSchedules
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _, parseSchedules as p };
