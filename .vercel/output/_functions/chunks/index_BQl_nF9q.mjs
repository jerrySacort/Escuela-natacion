import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';
import { P as PoolBoard } from './PoolBoard_Cu3fYTes.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { supabase, session } = Astro2.locals;
  const role = session.profile.role;
  if (!["superadmin", "branch_admin", "coordinator"].includes(role)) {
    return Astro2.redirect("/dashboard");
  }
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const [boardBranchesQ, boardPoolsQ, boardGroupsQ, orgQ] = await Promise.all([
    supabase.from("branches").select("id, name").eq("is_active", true).order("name"),
    supabase.from("pools").select("id, name, lanes, branch_id"),
    supabase.from("groups").select(
      "id, name, branch_id, pool_id, lane, levels(name), instructors(profiles(full_name)), group_schedules(weekday, start_time, end_time)"
    ).eq("is_active", true),
    supabase.from("org_settings").select("school_name, logo_url").eq("id", true).single()
  ]);
  const boardGroups = boardGroupsQ.data ?? [];
  const boardGroupIds = boardGroups.map((g) => g.id);
  const { data: boardEnroll } = boardGroupIds.length ? await supabase.from("enrollments").select("group_id, status, students(id, first_name, last_name, photo_url, sex)").in("group_id", boardGroupIds).eq("status", "active") : { data: [] };
  const poolSessions = boardGroups.map((g) => {
    const inst = one(g.instructors);
    const instructor = one(inst?.profiles ?? null)?.full_name ?? null;
    const students = (boardEnroll ?? []).filter((e) => e.group_id === g.id).map((e) => {
      const s = one(e.students);
      return s ? { id: s.id, name: `${s.first_name} ${s.last_name}`, photo: s.photo_url, sex: s.sex } : null;
    }).filter(
      (x) => x !== null
    );
    return {
      id: g.id,
      name: g.name,
      branch_id: g.branch_id,
      pool_id: g.pool_id,
      lane: g.lane,
      level: one(g.levels)?.name ?? null,
      instructor,
      schedules: (g.group_schedules ?? []).map((s) => ({
        weekday: s.weekday,
        start: s.start_time.slice(0, 5),
        end: s.end_time.slice(0, 5)
      })),
      students
    };
  });
  const org = orgQ.data ?? { school_name: "Escuela de Natación", logo_url: null };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Alberca en vivo" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="mx-auto min-h-screen max-w-6xl p-4 text-white sm:p-8"> <header class="mb-6 flex items-center justify-between"> <a href="/dashboard" class="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
← Panel
</a> ${org.logo_url ? renderTemplate`<img${addAttribute(org.logo_url, "src")}${addAttribute(org.school_name, "alt")} class="h-14 w-auto max-w-[240px] object-contain">` : renderTemplate`<span class="text-lg font-semibold tracking-tight">🏊 ${org.school_name}</span>`} </header> ${renderComponent($$result2, "PoolBoard", PoolBoard, { "client:load": true, "kiosk": true, "branches": boardBranchesQ.data ?? [], "pools": boardPoolsQ.data ?? [], "sessions": poolSessions, "client:component-hydration": "load", "client:component-path": "@/components/PoolBoard", "client:component-export": "default" })} </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/alberca/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/alberca/index.astro";
const $$url = "/dashboard/alberca";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
