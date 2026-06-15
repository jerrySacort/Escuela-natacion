const ALLOWED = ["superadmin", "branch_admin", "coordinator"];
const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
function csvEscape(v) {
  const s = v === null || v === void 0 ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  return "\uFEFF" + lines.join("\r\n");
}
function csvResponse(filename, content) {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
const GET = async ({ url, locals }) => {
  const { session, supabase } = locals;
  if (!session || !ALLOWED.includes(session.profile.role)) {
    return new Response("No autorizado", { status: 401 });
  }
  const type = url.searchParams.get("type") ?? "";
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (type === "alumnos") {
    const { data } = await supabase.from("students").select("first_name, last_name, birth_date, enrolled_at, is_active, levels(name), branches(name)").order("last_name");
    const rows = (data ?? []).map((s) => [
      s.last_name,
      s.first_name,
      s.birth_date,
      one(s.levels)?.name ?? "",
      one(s.branches)?.name ?? "",
      s.enrolled_at,
      s.is_active ? "activo" : "inactivo"
    ]);
    return csvResponse(
      `alumnos_${today}.csv`,
      toCsv(["Apellidos", "Nombre", "Nacimiento", "Nivel", "Sucursal", "Inscrito", "Estatus"], rows)
    );
  }
  if (type === "cargos") {
    const { data } = await supabase.from("charges").select("concept, amount_due, due_date, status, created_at, students(first_name, last_name), branches(name)").order("due_date", { ascending: false }).limit(5e3);
    const rows = (data ?? []).map((c) => {
      const s = one(c.students);
      return [
        s ? `${s.last_name}, ${s.first_name}` : "",
        c.concept,
        c.amount_due,
        c.due_date,
        c.status,
        one(c.branches)?.name ?? ""
      ];
    });
    return csvResponse(
      `cargos_${today}.csv`,
      toCsv(["Alumno", "Concepto", "Monto", "Vence", "Estatus", "Sucursal"], rows)
    );
  }
  if (type === "pagos") {
    const { data } = await supabase.from("payments").select("amount, method, provider_ref, paid_at, charges(concept, students(first_name, last_name))").order("paid_at", { ascending: false }).limit(5e3);
    const rows = (data ?? []).map((p) => {
      const ch = one(p.charges);
      const s = one(ch?.students ?? null);
      return [
        p.paid_at?.slice(0, 10) ?? "",
        s ? `${s.last_name}, ${s.first_name}` : "",
        ch?.concept ?? "",
        p.amount,
        p.method,
        p.provider_ref ?? ""
      ];
    });
    return csvResponse(
      `pagos_${today}.csv`,
      toCsv(["Fecha", "Alumno", "Concepto", "Monto", "Método", "Referencia"], rows)
    );
  }
  if (type === "asistencia") {
    const { data } = await supabase.from("attendance").select("class_date, checked_at, method, students(first_name, last_name), groups(name)").order("class_date", { ascending: false }).limit(5e3);
    const rows = (data ?? []).map((a) => {
      const s = one(a.students);
      return [
        a.class_date,
        s ? `${s.last_name}, ${s.first_name}` : "",
        one(a.groups)?.name ?? "",
        a.method,
        a.checked_at?.slice(11, 19) ?? ""
      ];
    });
    return csvResponse(
      `asistencia_${today}.csv`,
      toCsv(["Fecha", "Alumno", "Grupo", "Método", "Hora"], rows)
    );
  }
  return new Response("Tipo de reporte no válido", { status: 400 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
