function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== "superadmin") {
    return json({ error: "No autorizado" }, 401);
  }
  const fd = await request.formData();
  const name = fd.get("name")?.toString().trim() ?? "";
  const branchId = fd.get("branch_id")?.toString() ?? "";
  const lanes = parseInt(fd.get("lanes")?.toString() ?? "1", 10);
  if (!name || !branchId) {
    return json({ error: "Faltan campos obligatorios." }, 400);
  }
  if (!Number.isFinite(lanes) || lanes < 1) {
    return json({ error: "El número de carriles debe ser al menos 1." }, 400);
  }
  const { data, error } = await supabase.from("pools").insert({ name, branch_id: branchId, lanes }).select("id").single();
  if (error) {
    console.error("insert pool:", error.message);
    return json({ error: "No se pudo crear la alberca." }, 400);
  }
  return json({ id: data.id }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
