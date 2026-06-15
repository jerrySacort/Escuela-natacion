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
  const levelId = fd.get("level_id")?.toString() ?? "";
  const name = fd.get("name")?.toString().trim() ?? "";
  const sortOrder = parseInt(fd.get("sort_order")?.toString() ?? "0", 10);
  if (!levelId || !name) return json({ error: "Faltan campos." }, 400);
  const { error } = await supabase.from("skills").insert({
    level_id: levelId,
    name,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0
  });
  if (error) {
    console.error("insert skill:", error.message);
    return json({ error: "No se pudo crear la habilidad." }, 400);
  }
  return json({ ok: true }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
