function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function parseAge(v) {
  const s = v?.toString().trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
const POST = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== "superadmin") {
    return json({ error: "No autorizado" }, 401);
  }
  const fd = await request.formData();
  const name = fd.get("name")?.toString().trim() ?? "";
  if (!name) return json({ error: "El nombre es obligatorio." }, 400);
  const minAge = parseAge(fd.get("min_age"));
  const maxAge = parseAge(fd.get("max_age"));
  const description = fd.get("description")?.toString().trim() || null;
  const { data: last } = await supabase.from("levels").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sortOrder = (last?.sort_order ?? 0) + 1;
  const { data, error } = await supabase.from("levels").insert({ name, min_age: minAge, max_age: maxAge, description, sort_order: sortOrder }).select("id").single();
  if (error) {
    console.error("insert level:", error.message);
    return json({ error: "No se pudo crear el nivel." }, 400);
  }
  return json({ id: data.id }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  parseAge
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _, parseAge as p };
