import { a as createSupabaseAdmin } from './supabase_B4M2ZyYM.mjs';

const ALLOWED = ["superadmin", "branch_admin", "coordinator"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, locals }) => {
  const { session, supabase } = locals;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return json({ error: "No autorizado" }, 401);
  }
  const admin = createSupabaseAdmin();
  if (!admin) {
    return json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el .env del servidor (Supabase → Settings → API)." },
      500
    );
  }
  const fd = await request.formData();
  const fullName = fd.get("full_name")?.toString().trim() ?? "";
  const email = fd.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = fd.get("password")?.toString() ?? "";
  const phone = fd.get("phone")?.toString().trim() || null;
  const studentId = fd.get("student_id")?.toString() ?? "";
  const relationship = fd.get("relationship")?.toString() || "tutor";
  const isPrimary = fd.get("is_primary")?.toString() === "true";
  if (!fullName || !email || !studentId) {
    return json({ error: "Faltan campos obligatorios." }, 400);
  }
  if (password.length < 8) {
    return json({ error: "La contraseña temporal debe tener al menos 8 caracteres." }, 400);
  }
  const { data: student } = await supabase.from("students").select("id, branch_id").eq("id", studentId).single();
  if (!student) return json({ error: "Alumno no encontrado." }, 404);
  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, branch_id: student.branch_id }
  });
  if (userError || !created.user) {
    console.error("create parent user:", userError?.message);
    const msg = userError?.message.includes("already") ? 'Ya existe una cuenta con ese correo (vincúlala desde "Existente").' : "No se pudo crear la cuenta.";
    return json({ error: msg }, 400);
  }
  if (isPrimary) {
    await supabase.from("student_guardians").update({ is_primary: false }).eq("student_id", studentId);
  }
  const { error: linkError } = await supabase.from("student_guardians").insert({
    student_id: studentId,
    guardian_id: created.user.id,
    relationship,
    is_primary: isPrimary
  });
  if (linkError) {
    console.error("link new parent:", linkError.message);
    return json({ error: "Cuenta creada, pero no se pudo vincular al alumno." }, 500);
  }
  return json({ ok: true }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
