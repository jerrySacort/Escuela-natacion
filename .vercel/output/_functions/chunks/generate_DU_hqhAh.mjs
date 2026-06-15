import { n as notifyManyGuardians } from './notify_GUnBibPs.mjs';

const ALLOWED = ["superadmin", "branch_admin", "coordinator"];
const DUE_DAY = 10;
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ locals }) => {
  const { session, supabase } = locals;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const concept = `Mensualidad ${MONTHS[month]} ${year}`;
  const dueDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(DUE_DAY).padStart(2, "0")}`;
  const today = now.toISOString().slice(0, 10);
  const { data: enrollments, error: enrError } = await supabase.from("enrollments").select("id, student_id, branch_id, groups(monthly_fee, is_active)").eq("status", "active");
  if (enrError) {
    console.error("list enrollments:", enrError.message);
    return json({ error: "No se pudieron leer las inscripciones." }, 400);
  }
  const { data: existing } = await supabase.from("charges").select("enrollment_id").eq("concept", concept).neq("status", "cancelled");
  const have = new Set((existing ?? []).map((c) => c.enrollment_id));
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const rows = (enrollments ?? []).filter((e) => !have.has(e.id)).map((e) => {
    const g = one(e.groups);
    if (!g || !g.is_active) return null;
    const fee = Number(g.monthly_fee);
    return {
      student_id: e.student_id,
      enrollment_id: e.id,
      branch_id: e.branch_id,
      concept,
      amount: fee,
      amount_due: fee,
      due_date: dueDate,
      status: "pending"
    };
  }).filter((r) => r !== null);
  let created = 0;
  if (rows.length > 0) {
    const { error: insError } = await supabase.from("charges").insert(rows);
    if (insError) {
      console.error("insert charges:", insError.message);
      return json({ error: "No se pudieron generar los cargos." }, 400);
    }
    created = rows.length;
    const dueFmt = (/* @__PURE__ */ new Date(dueDate + "T00:00:00")).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long"
    });
    await notifyManyGuardians(
      supabase,
      rows.map((r) => ({
        student_id: r.student_id,
        branch_id: r.branch_id,
        title: "Nuevo cargo 📄",
        body: `${concept}: $${r.amount_due.toLocaleString("es-MX")} — vence el ${dueFmt}.`
      }))
    );
  }
  const { data: overdueRows } = await supabase.from("charges").update({ status: "overdue" }).eq("status", "pending").lt("due_date", today).select("id");
  return json({
    created,
    skipped: have.size,
    overdue_marked: overdueRows?.length ?? 0,
    concept
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
