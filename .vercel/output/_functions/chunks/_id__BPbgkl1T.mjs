import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_B5gixhUf.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';

const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/40";
function EnrollmentsCard({
  groupId,
  enrolled,
  available,
  capacity,
  canManage
}) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const active = enrolled.filter((e) => e.status === "active");
  const waitlist = enrolled.filter((e) => e.status === "waitlisted").sort((a, b) => (a.waitlist_pos ?? 0) - (b.waitlist_pos ?? 0));
  const isFull = active.length >= capacity;
  async function onAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/groups/${groupId}/enrollments`, {
      method: "POST",
      body: new FormData(e.currentTarget)
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo inscribir.");
    setSaving(false);
  }
  async function onRemove(en) {
    if (!await confirmDialog(`¿Dar de baja a ${en.name} de este grupo?`, { tone: "danger", confirmText: "Dar de baja" })) return;
    const res = await fetch(
      `/api/groups/${groupId}/enrollments?enrollment_id=${en.enrollment_id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      window.location.reload();
      return;
    }
    void alertDialog("No se pudo dar de baja.");
  }
  function Row({ en, badge }) {
    return /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
      en.photo_url ? /* @__PURE__ */ jsx(
        "img",
        {
          src: en.photo_url,
          alt: "",
          className: "h-9 w-9 shrink-0 rounded-full border border-white/15 object-cover"
        }
      ) : /* @__PURE__ */ jsx("span", { className: "bg-cream/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-900", children: en.name.charAt(0) }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `/dashboard/alumnos/${en.student_id}`,
          className: "min-w-0 flex-1 truncate text-sm text-white/90 hover:underline underline-offset-4",
          children: en.name
        }
      ),
      badge && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs text-amber-200", children: badge }),
      canManage && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onRemove(en),
          title: "Dar de baja",
          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200",
          children: "✕"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-medium text-white/80", children: [
        "Alumnos",
        " ",
        /* @__PURE__ */ jsxs("span", { className: isFull ? "text-amber-200" : "text-white/40", children: [
          active.length,
          "/",
          capacity
        ] })
      ] }),
      canManage && !adding && available.length > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setAdding(true),
          className: "rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white",
          children: "+ Inscribir"
        }
      )
    ] }),
    adding && /* @__PURE__ */ jsxs("form", { onSubmit: onAdd, className: "mt-4 space-y-3 border-b border-white/10 pb-4", children: [
      error && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-2.5 text-xs text-red-200", children: error }),
      isFull && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-amber-400/10 p-2.5 text-xs text-amber-200", children: "Cupo lleno: el alumno entrará a la lista de espera." }),
      /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
        "Alumno",
        /* @__PURE__ */ jsxs("select", { name: "student_id", required: true, className: inputClass, children: [
          /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
          available.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, className: "text-slate-900", children: s.name }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setAdding(false);
              setError("");
            },
            className: "rounded-full px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: saving,
            className: "bg-cream rounded-full px-5 py-2 text-xs font-semibold text-slate-900 shadow transition hover:-translate-y-0.5 disabled:opacity-50",
            children: saving ? "Inscribiendo…" : "Inscribir"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-3", children: [
      active.map((en) => /* @__PURE__ */ jsx(Row, { en }, en.enrollment_id)),
      active.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-2 text-sm text-white/40", children: "Sin alumnos inscritos." })
    ] }),
    waitlist.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { className: "mt-5 text-xs font-semibold uppercase tracking-wide text-amber-200/70", children: "Lista de espera" }),
      /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-3", children: waitlist.map((en, i) => /* @__PURE__ */ jsx(Row, { en, badge: `#${i + 1}` }, en.enrollment_id)) })
    ] })
  ] });
}

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { supabase, session } = Astro2.locals;
  const { id } = Astro2.params;
  const role = session.profile.role;
  const canManage = ["superadmin", "branch_admin", "coordinator"].includes(role);
  const { data: group } = await supabase.from("groups").select(
    "id, name, branch_id, lane, capacity, monthly_fee, is_active, levels(name), branches(name), pools(name), instructors(profiles(full_name)), group_schedules(weekday, start_time, end_time)"
  ).eq("id", id).single();
  if (!group) return Astro2.redirect("/dashboard/grupos");
  const [enrolledQ, studentsQ] = await Promise.all([
    supabase.from("enrollments").select("id, status, waitlist_pos, student_id, students(first_name, last_name, photo_url)").eq("group_id", id).in("status", ["active", "waitlisted"]),
    supabase.from("students").select("id, first_name, last_name").eq("branch_id", group.branch_id).eq("is_active", true).order("last_name")
  ]);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const level = one(group.levels);
  const branch = one(group.branches);
  const pool = one(group.pools);
  const instructorRel = one(group.instructors);
  const instructor = one(instructorRel?.profiles ?? null);
  const schedules = [...group.group_schedules ?? []].sort(
    (a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time)
  );
  const enrolled = (enrolledQ.data ?? []).map((e) => {
    const s = one(e.students);
    return {
      enrollment_id: e.id,
      student_id: e.student_id,
      name: s ? `${s.last_name}, ${s.first_name}` : "—",
      photo_url: s?.photo_url ?? null,
      status: e.status,
      waitlist_pos: e.waitlist_pos
    };
  });
  const enrolledIds = new Set(enrolled.map((e) => e.student_id));
  const available = (studentsQ.data ?? []).filter((s) => !enrolledIds.has(s.id)).map((s) => ({ id: s.id, name: `${s.last_name}, ${s.first_name}` }));
  const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<a href="/dashboard/grupos" class="mb-5 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
← Grupos
</a>  <section class="glass-soft mb-6 rounded-3xl p-6"> <div class="flex flex-wrap items-center justify-between gap-4"> <div> <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl"> ${group.name} <span${addAttribute(`ml-3 align-middle rounded-full px-3 py-1 text-xs ${group.is_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/50"}`, "class")}> ${group.is_active ? "Activo" : "Inactivo"} </span> </h1> <p class="mt-1 text-sm text-white/50"> ${level?.name ?? "—"} · ${branch?.name ?? "—"} ${pool ? ` · ${pool.name}${group.lane ? ` (carril ${group.lane})` : ""}` : ""} </p> <p class="mt-1 text-sm text-white/50">
Instructor: ${instructor?.full_name ?? "Sin asignar"} </p> </div> <div class="text-right"> <p class="text-sm text-white/50">Mensualidad</p> <p class="text-3xl font-bold"> ${mxn.format(Number(group.monthly_fee))}<span class="align-super text-base text-white/60">$</span> </p> </div> </div> </section> <div class="grid grid-cols-1 gap-6 lg:grid-cols-2"> <!-- Horarios --> <div class="glass-soft rounded-3xl p-6"> <h2 class="font-medium text-white/80">Horarios</h2> <ul class="mt-4 space-y-3"> ${schedules.map((s) => renderTemplate`<li class="flex items-center justify-between text-sm"> <span class="text-white/90">${WEEKDAYS[s.weekday]}</span> <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"> ${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)} </span> </li>`)} ${schedules.length === 0 && renderTemplate`<li class="py-2 text-sm text-white/40">Sin horarios asignados.</li>`} </ul> </div> <!-- Alumnos inscritos --> ${renderComponent($$result2, "EnrollmentsCard", EnrollmentsCard, { "client:load": true, "groupId": group.id, "enrolled": enrolled, "available": available, "capacity": group.capacity, "canManage": canManage, "client:component-hydration": "load", "client:component-path": "@/components/EnrollmentsCard", "client:component-export": "default" })} </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/grupos/[id].astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/grupos/[id].astro";
const $$url = "/dashboard/grupos/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
