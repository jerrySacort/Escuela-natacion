import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_DnxdSQaP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Do2wH5FH.mjs';
import { A as AttendanceView } from './AttendanceView_-Bg-Qi_V.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { supabase, session } = Astro2.locals;
  const role = session.profile.role;
  const canManage = ["superadmin", "branch_admin", "coordinator"].includes(role);
  const today = (/* @__PURE__ */ new Date()).getDay();
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const { data: groupsData } = await supabase.from("groups").select(
    "id, name, levels(name), group_schedules!inner(weekday, start_time, end_time)"
  ).eq("is_active", true).eq("group_schedules.weekday", today).order("name");
  const groupIds = (groupsData ?? []).map((g) => g.id);
  const [enrollQ, attQ] = await Promise.all([
    groupIds.length > 0 ? supabase.from("enrollments").select("group_id, student_id, students(first_name, last_name, photo_url)").in("group_id", groupIds).eq("status", "active") : Promise.resolve({ data: [] }),
    groupIds.length > 0 ? supabase.from("attendance").select("group_id, student_id").in("group_id", groupIds).eq("class_date", todayStr) : Promise.resolve({ data: [] })
  ]);
  const attendanceSet = new Set(
    (attQ.data ?? []).map((a) => `${a.group_id}:${a.student_id}`)
  );
  const groups = (groupsData ?? []).map((g) => {
    const scheds = (g.group_schedules ?? []).slice().sort((a, b) => a.start_time.localeCompare(b.start_time));
    const times = scheds.map((s) => `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`).join(" / ");
    const roster = (enrollQ.data ?? []).filter((e) => e.group_id === g.id).map((e) => {
      const s = one(e.students);
      return {
        student_id: e.student_id,
        name: s ? `${s.last_name}, ${s.first_name}` : "—",
        photo_url: s?.photo_url ?? null,
        present: attendanceSet.has(`${g.id}:${e.student_id}`)
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return {
      id: g.id,
      name: g.name,
      level_name: one(g.levels)?.name ?? "—",
      times,
      roster
    };
  });
  const fecha = (/* @__PURE__ */ new Date()).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Asistencia" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="-mt-2 mb-5 flex flex-wrap items-center justify-between gap-3"> <p class="text-sm capitalize text-white/50">${fecha}</p> <a href="/dashboard/asistencia/kiosko" class="bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">
📷 Abrir kiosko QR
</a> </div> ${renderComponent($$result2, "AttendanceView", AttendanceView, { "client:load": true, "groups": groups, "canManage": canManage, "client:component-hydration": "load", "client:component-path": "@/components/AttendanceView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/asistencia/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/asistencia/index.astro";
const $$url = "/dashboard/asistencia";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
