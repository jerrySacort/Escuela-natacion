const THEMES = [
  "ocean",
  "sunset",
  "forest",
  "cherry",
  "midnight",
  "grape",
  "steel",
  "coral",
  "gold",
  "garnet",
  "neon"
];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const PATCH = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || session.profile.role !== "superadmin") {
    return json({ error: "No autorizado" }, 401);
  }
  const fd = await request.formData();
  const theme = fd.get("theme")?.toString() ?? "";
  if (!THEMES.includes(theme)) {
    return json({ error: "Tema no válido." }, 400);
  }
  const { error } = await supabase.from("org_settings").update({ theme }).eq("id", true);
  if (error) {
    console.error("update theme:", error.message);
    return json({ error: "No se pudo guardar el tema." }, 400);
  }
  return json({ ok: true });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
