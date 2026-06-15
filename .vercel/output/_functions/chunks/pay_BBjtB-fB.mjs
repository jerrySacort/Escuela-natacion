import { a as notifyStudentGuardians } from './notify_GUnBibPs.mjs';

const ALLOWED = ["superadmin", "branch_admin", "coordinator"];
const METHODS = ["card", "spei", "oxxo", "cash", "transfer"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  const chargeId = params.id;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  if (!chargeId) return json({ error: "Falta el id del cargo." }, 400);
  const fd = await request.formData();
  const method = fd.get("method")?.toString() ?? "";
  const providerRef = fd.get("provider_ref")?.toString().trim() || null;
  const amountRaw = fd.get("amount")?.toString() ?? "";
  if (!METHODS.includes(method)) {
    return json({ error: "Método de pago inválido." }, 400);
  }
  const { data: charge } = await supabase.from("charges").select("id, branch_id, amount_due, status, student_id, concept").eq("id", chargeId).single();
  if (!charge) return json({ error: "Cargo no encontrado." }, 404);
  if (charge.status === "paid") {
    return json({ error: "Este cargo ya está pagado." }, 400);
  }
  if (charge.status === "cancelled") {
    return json({ error: "Este cargo está cancelado." }, 400);
  }
  const amount = amountRaw ? parseFloat(amountRaw) : Number(charge.amount_due);
  if (!Number.isFinite(amount) || amount <= 0) {
    return json({ error: "Monto inválido." }, 400);
  }
  const { error: payError } = await supabase.from("payments").insert({
    charge_id: charge.id,
    branch_id: charge.branch_id,
    amount,
    method,
    provider_ref: providerRef,
    recorded_by: session.user.id
  });
  if (payError) {
    console.error("insert payment:", payError.message);
    return json({ error: "No se pudo registrar el pago." }, 400);
  }
  const { error: updError } = await supabase.from("charges").update({ status: "paid" }).eq("id", charge.id);
  if (updError) {
    console.error("mark charge paid:", updError.message);
    return json({ error: "Pago registrado, pero no se pudo actualizar el cargo." }, 500);
  }
  await notifyStudentGuardians(
    supabase,
    charge.student_id,
    "Pago recibido ✅",
    `Recibimos tu pago de $${amount.toLocaleString("es-MX")} por "${charge.concept}". ¡Gracias!`,
    charge.branch_id
  );
  return json({ ok: true }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
