function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const PATCH = async ({ request, params, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== "superadmin") {
    return json({ error: "No autorizado" }, 401);
  }
  const id = params.id;
  if (!id) return json({ error: "Falta el id." }, 400);
  const fd = await request.formData();
  const update = {};
  if (fd.has("name")) {
    const name = fd.get("name")?.toString().trim() ?? "";
    if (!name) return json({ error: "El nombre es obligatorio." }, 400);
    update.name = name;
  }
  if (fd.has("lanes")) {
    const lanes = parseInt(fd.get("lanes")?.toString() ?? "", 10);
    if (!Number.isFinite(lanes) || lanes < 1) {
      return json({ error: "El número de carriles debe ser al menos 1." }, 400);
    }
    update.lanes = lanes;
  }
  if (Object.keys(update).length === 0) {
    return json({ error: "Nada que actualizar." }, 400);
  }
  const { error } = await supabase.from("pools").update(update).eq("id", id);
  if (error) {
    console.error("update pool:", error.message);
    return json({ error: "No se pudo actualizar la alberca." }, 400);
  }
  return json({ ok: true });
};
const DELETE = async ({ params, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== "superadmin") {
    return json({ error: "No autorizado" }, 401);
  }
  const id = params.id;
  if (!id) return json({ error: "Falta el id." }, 400);
  const { error } = await supabase.from("pools").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return json(
        { error: "No se puede eliminar: hay grupos que usan esta alberca." },
        400
      );
    }
    console.error("delete pool:", error.message);
    return json({ error: "No se pudo eliminar la alberca." }, 400);
  }
  return json({ ok: true });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
