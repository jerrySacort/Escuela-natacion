import { a as createSupabaseAdmin } from './supabase_B4M2ZyYM.mjs';

const ALLOWED = ["superadmin", "branch_admin"];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function splitList(raw) {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
const POST = async ({ request, locals }) => {
  const { session } = locals;
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
  const specialties = splitList(fd.get("specialties")?.toString() ?? "");
  const certifications = splitList(fd.get("certifications")?.toString() ?? "");
  const hourlyRateRaw = fd.get("hourly_rate")?.toString() ?? "";
  const hourlyRate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;
  const hiredAt = fd.get("hired_at")?.toString() || null;
  const branchId = session.profile.role === "superadmin" ? fd.get("branch_id")?.toString() ?? "" : session.profile.branch_id ?? "";
  if (!fullName || !email || !branchId) {
    return json({ error: "Faltan campos obligatorios." }, 400);
  }
  if (password.length < 8) {
    return json({ error: "La contraseña temporal debe tener al menos 8 caracteres." }, 400);
  }
  if (hourlyRate !== null && (!Number.isFinite(hourlyRate) || hourlyRate < 0)) {
    return json({ error: "Tarifa inválida." }, 400);
  }
  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, branch_id: branchId }
  });
  if (userError || !created.user) {
    console.error("create instructor user:", userError?.message);
    const msg = userError?.message.includes("already") ? "Ya existe una cuenta con ese correo." : "No se pudo crear la cuenta del instructor.";
    return json({ error: msg }, 400);
  }
  const { error: roleError } = await admin.from("profiles").update({ role: "instructor", branch_id: branchId }).eq("id", created.user.id);
  if (roleError) {
    console.error("promote instructor:", roleError.message);
    return json({ error: "Cuenta creada, pero no se pudo asignar el rol." }, 500);
  }
  const { error: insError } = await admin.from("instructors").insert({
    profile_id: created.user.id,
    branch_id: branchId,
    specialties,
    certifications,
    hourly_rate: hourlyRate,
    hired_at: hiredAt
  });
  if (insError) {
    console.error("insert instructor:", insError.message);
    return json({ error: "Cuenta creada, pero no se pudo crear la ficha." }, 500);
  }
  return json({ ok: true }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  splitList
}, Symbol.toStringTag, { value: 'Module' }));

export { _page as _, splitList as s };
