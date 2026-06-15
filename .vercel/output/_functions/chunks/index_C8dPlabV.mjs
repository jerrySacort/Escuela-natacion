import { i as isRootAdmin } from './auth_DqoS55Rj.mjs';
import { a as createSupabaseAdmin } from './supabase_B4M2ZyYM.mjs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, locals }) => {
  const { session } = locals;
  if (!session || session.profile.role !== "superadmin" || !isRootAdmin(session.user.email)) {
    return json({ error: "No autorizado" }, 403);
  }
  const admin = createSupabaseAdmin();
  if (!admin) {
    return json(
      { error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor." },
      500
    );
  }
  const fd = await request.formData();
  const email = fd.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = fd.get("password")?.toString() ?? "";
  const fullName = fd.get("full_name")?.toString().trim() ?? "";
  if (!email || !email.includes("@")) {
    return json({ error: "Correo no válido." }, 400);
  }
  if (!fullName) {
    return json({ error: "El nombre es obligatorio." }, 400);
  }
  if (password.length < 8) {
    return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
  }
  const { data: branch } = await admin.from("branches").select("id").limit(1).maybeSingle();
  if (!branch) {
    return json(
      { error: "Crea al menos una sucursal antes de registrar usuarios." },
      400
    );
  }
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, branch_id: branch.id }
  });
  if (createErr || !created?.user) {
    const already = createErr?.message?.toLowerCase().includes("already");
    return json(
      { error: already ? "Ya existe un usuario con ese correo." : "No se pudo crear el usuario." },
      400
    );
  }
  const { error: roleErr } = await admin.from("profiles").update({ role: "superadmin", branch_id: null, full_name: fullName }).eq("id", created.user.id);
  if (roleErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    console.error("promote superadmin:", roleErr.message);
    return json({ error: "Se creó la cuenta pero no se pudo asignar el rol. Intenta de nuevo." }, 400);
  }
  return json({ id: created.user.id }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
