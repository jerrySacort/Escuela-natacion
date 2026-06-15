import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';
import { A as AttendanceView } from './AttendanceView_-Bg-Qi_V.mjs';

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { supabase, session } = Astro2.locals;
  const { id } = Astro2.params;
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const todayDow = (/* @__PURE__ */ new Date()).getDay();
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const { data: instructor } = await supabase.from("instructors").select("id").eq("profile_id", session.user.id).single();
  const instructorId = instructor?.id ?? null;
  const { data: group } = instructorId ? await supabase.from("groups").select("id, name, capacity, levels(name), group_schedules(weekday, start_time, end_time)").eq("id", id).eq("instructor_id", instructorId).single() : { data: null };
  if (!group) return Astro2.redirect("/instructor");
  const [enrollQ, attQ] = await Promise.all([
    supabase.from("enrollments").select("student_id, students(first_name, last_name, photo_url)").eq("group_id", id).eq("status", "active"),
    supabase.from("attendance").select("student_id").eq("group_id", id).eq("class_date", todayStr)
  ]);
  const attendanceSet = new Set((attQ.data ?? []).map((a) => a.student_id));
  const roster = (enrollQ.data ?? []).map((e) => {
    const s = one(e.students);
    return {
      student_id: e.student_id,
      name: s ? `${s.last_name}, ${s.first_name}` : "—",
      photo_url: s?.photo_url ?? null,
      present: attendanceSet.has(e.student_id)
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const scheds = (group.group_schedules ?? []).slice().sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time));
  const weekly = scheds.map((s) => `${WEEKDAYS_SHORT[s.weekday]} ${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`).join(" · ");
  const todays = scheds.filter((s) => s.weekday === todayDow);
  const times = todays.map((s) => `${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`).join(" / ");
  const level = one(group.levels);
  const todayGroup = [
    {
      id: group.id,
      name: group.name,
      level_name: level?.name ?? "—",
      times,
      roster
    }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${group.name} — Instructor` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="mx-auto max-w-5xl p-4 text-white sm:p-6 lg:p-8"> <a href="/instructor" class="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
← Mis grupos
</a> <section class="relative mt-4 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-brand-500/45 via-brand-600/30 to-brand-700/45 p-5 sm:p-6"> <div class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div> <div class="relative flex flex-wrap items-center justify-between gap-3"> <div class="min-w-0"> <h1 class="truncate text-2xl font-bold tracking-tight sm:text-3xl">${group.name}</h1> <div class="mt-2 flex flex-wrap gap-2"> <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-medium"> ${level?.name ?? "Sin nivel"} </span> <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-medium"> ${roster.length}/${group.capacity} alumnos
</span> ${todays.length > 0 && renderTemplate`<span class="rounded-full bg-emerald-400/25 px-3 py-1 text-xs font-medium text-emerald-100">
Clase hoy · ${times} </span>`} </div> </div> </div> <p class="relative mt-3 text-xs text-white/70">${weekly || "Sin horario"}</p> </section> <section class="mt-6"> <h2 class="mb-3 px-1 text-sm font-medium uppercase tracking-wide text-white/50">
Pase de lista · hoy
</h2> ${renderComponent($$result2, "AttendanceView", AttendanceView, { "client:load": true, "groups": todayGroup, "canManage": true, "client:component-hydration": "load", "client:component-path": "@/components/AttendanceView", "client:component-export": "default" })} </section> </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/instructor/grupo/[id].astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/instructor/grupo/[id].astro";
const $$url = "/instructor/grupo/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
