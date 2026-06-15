import { a as createSupabaseAdmin } from './supabase_B4M2ZyYM.mjs';
import { s as splitList } from './index_noBX4B5Q.mjs';

const ALLOWED = ["superadmin", "branch_admin"];
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
  const { data: instructor } = await supabase.from("instructors").select("id, profile_id").eq("id", id).single();
  if (!instructor) return json({ error: "Instructor no encontrado." }, 404);
  const fd = await request.formData();
  const text = (k) => fd.get(k)?.toString().trim();
  const update = {};
  if (fd.has("specialties")) update.specialties = splitList(text("specialties") ?? "");
  if (fd.has("certifications")) update.certifications = splitList(text("certifications") ?? "");
  if (fd.has("hourly_rate")) {
    const raw = text("hourly_rate") ?? "";
    if (raw) {
      const v = parseFloat(raw);
      if (!Number.isFinite(v) || v < 0) return json({ error: "Tarifa inválida." }, 400);
      update.hourly_rate = v;
    } else {
      update.hourly_rate = null;
    }
  }
  if (fd.has("hired_at")) update.hired_at = text("hired_at") || null;
  if (fd.has("is_active")) update.is_active = text("is_active") === "true";
  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from("instructors").update(update).eq("id", id);
    if (error) {
      console.error("update instructor:", error.message);
      return json({ error: "No se pudo actualizar la ficha." }, 400);
    }
  }
  if (fd.has("full_name") || fd.has("phone")) {
    const profileUpdate = {};
    if (fd.has("full_name")) {
      const v = text("full_name");
      if (!v) return json({ error: "El nombre no puede quedar vacío." }, 400);
      profileUpdate.full_name = v;
    }
    if (fd.has("phone")) profileUpdate.phone = text("phone") || null;
    const admin = createSupabaseAdmin();
    const db = session.profile.role === "superadmin" ? supabase : admin;
    if (!db) {
      return json(
        { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el .env para editar nombre/teléfono." },
        500
      );
    }
    const { error } = await db.from("profiles").update(profileUpdate).eq("id", instructor.profile_id);
    if (error) {
      console.error("update instructor profile:", error.message);
      return json({ error: "No se pudo actualizar el perfil." }, 400);
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
