import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_BOjAT_3f.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function scheduleSummary(schedules) {
  if (schedules.length === 0) return "Sin horario";
  const sorted = [...schedules].sort((a, b) => a.weekday - b.weekday);
  return sorted.map((s) => `${WEEKDAYS[s.weekday]} ${s.start_time.slice(0, 5)}`).join(" · ");
}
const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
function GroupsView({
  groups,
  branches,
  levels,
  instructors,
  pools,
  showBranchSelect,
  canManage,
  defaultBranchId
}) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [schedules, setSchedules] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const editing = modal?.mode === "edit" ? modal.group : null;
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return groups.filter(
      (g) => `${g.name} ${g.level_name} ${g.instructor_name ?? ""}`.toLowerCase().includes(q)
    );
  }, [groups, query]);
  const branchInstructors = useMemo(
    () => instructors.filter((i) => !branchId || i.branch_id === branchId),
    [instructors, branchId]
  );
  const branchPools = useMemo(
    () => pools.filter((p) => !branchId || p.branch_id === branchId),
    [pools, branchId]
  );
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);
  function openCreate() {
    setBranchId(defaultBranchId);
    setSchedules([{ weekday: 1, start_time: "16:00", end_time: "17:00" }]);
    setModal({ mode: "create" });
  }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (canManage && params.get("nuevo") === "1") {
      openCreate();
      params.delete("nuevo");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (qs ? `?${qs}` : "")
      );
    }
  }, []);
  function openEdit(g) {
    setBranchId(g.branch_id);
    setSchedules(
      g.schedules.map((s) => ({
        weekday: s.weekday,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5)
      }))
    );
    setModal({ mode: "edit", group: g });
  }
  function close() {
    setModal(null);
    setError("");
  }
  function setSched(i, patch) {
    setSchedules((prev) => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  }
  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("schedules", JSON.stringify(schedules));
    const url = editing ? `/api/groups/${editing.id}` : "/api/groups";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      body: fd
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  async function toggleActive(g) {
    const action = g.is_active ? "desactivar" : "reactivar";
    if (!await confirmDialog(`¿Seguro que quieres ${action} el grupo "${g.name}"?`, { tone: g.is_active ? "danger" : "default" })) return;
    setTogglingId(g.id);
    const fd = new FormData();
    fd.set("is_active", String(!g.is_active));
    const res = await fetch(`/api/groups/${g.id}`, { method: "PATCH", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setTogglingId(null);
    void alertDialog("No se pudo cambiar el estatus.");
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    canManage && /* @__PURE__ */ jsx("div", { className: "-mt-2 mb-5 flex justify-end", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: openCreate,
        className: "bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5",
        children: "+ Crear grupo"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-white/10 p-4", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          placeholder: "Buscar grupo…",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          className: "w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[60rem] text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Grupo" }),
          /* @__PURE__ */ jsx("th", { className: "min-w-[13rem] px-5 py-3 font-medium", children: "Horario" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Instructor" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Ocupación" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Mensualidad" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Estatus" }),
          canManage && /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtered.map((g) => /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `border-t border-white/10 transition hover:bg-white/5 ${g.is_active ? "" : "opacity-50"}`,
              children: [
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: `/dashboard/grupos/${g.id}`,
                      className: "text-white/90 hover:underline underline-offset-4",
                      children: g.name
                    }
                  ),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40", children: [
                    g.level_name,
                    g.branch_name ? ` · ${g.branch_name}` : "",
                    g.pool_name ? ` · ${g.pool_name}${g.lane ? ` C${g.lane}` : ""}` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: scheduleSummary(g.schedules) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: g.instructor_name ?? "—" }),
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: g.active_count >= g.capacity ? "text-amber-200" : "text-white/70",
                      children: [
                        g.active_count,
                        "/",
                        g.capacity
                      ]
                    }
                  ),
                  g.waitlist_count > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200", children: [
                    "+",
                    g.waitlist_count,
                    " espera"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3 text-white/70", children: [
                  "$",
                  g.monthly_fee.toLocaleString("es-MX")
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `rounded-full px-3 py-1 text-xs ${g.is_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/50"}`,
                    children: g.is_active ? "Activo" : "Inactivo"
                  }
                ) }),
                canManage && /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => openEdit(g),
                      title: "Editar",
                      className: "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white",
                      children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }) })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => toggleActive(g),
                      disabled: togglingId === g.id,
                      title: g.is_active ? "Desactivar" : "Reactivar",
                      className: `flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-40 ${g.is_active ? "border-red-300/20 bg-red-400/10 text-red-300/80 hover:bg-red-400/25 hover:text-red-200" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-300/80 hover:bg-emerald-400/25 hover:text-emerald-200"}`,
                      children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsx("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }),
                        /* @__PURE__ */ jsx("line", { x1: "12", y1: "2", x2: "12", y2: "12" })
                      ] })
                    }
                  )
                ] }) })
              ]
            },
            g.id
          )),
          filtered.length === 0 && /* @__PURE__ */ jsx("tr", { className: "border-t border-white/10", children: /* @__PURE__ */ jsx(
            "td",
            {
              colSpan: canManage ? 7 : 6,
              className: "px-5 py-10 text-center text-white/40",
              children: 'Sin grupos. Crea el primero con "+ Crear grupo".'
            }
          ) })
        ] })
      ] }) })
    ] }),
    modal && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && close(),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit,
              className: "modal-panel my-auto w-full max-w-lg space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: editing ? "Editar grupo" : "Nuevo grupo" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: close,
                      className: "flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white",
                      "aria-label": "Cerrar",
                      children: "✕"
                    }
                  )
                ] }),
                error && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-3 text-sm text-red-200", children: error }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Nombre del grupo",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        name: "name",
                        required: true,
                        defaultValue: editing?.name,
                        placeholder: "Delfines vespertino",
                        className: inputClass
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Nivel",
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        name: "level_id",
                        required: true,
                        defaultValue: editing?.level_id ?? "",
                        className: inputClass,
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
                          levels.map((l) => /* @__PURE__ */ jsx("option", { value: l.id, className: "text-slate-900", children: l.name }, l.id))
                        ]
                      }
                    )
                  ] })
                ] }),
                showBranchSelect && /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Sucursal",
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      name: "branch_id",
                      required: true,
                      value: branchId,
                      onChange: (e) => setBranchId(e.target.value),
                      className: inputClass,
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
                        branches.map((b) => /* @__PURE__ */ jsx("option", { value: b.id, className: "text-slate-900", children: b.name }, b.id))
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Instructor (opcional)",
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        name: "instructor_id",
                        defaultValue: editing?.instructor_id ?? "",
                        className: inputClass,
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin asignar" }),
                          branchInstructors.map((i) => /* @__PURE__ */ jsx("option", { value: i.id, className: "text-slate-900", children: i.name }, i.id))
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Alberca (opcional)",
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        name: "pool_id",
                        defaultValue: editing?.pool_id ?? "",
                        className: inputClass,
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin asignar" }),
                          branchPools.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, className: "text-slate-900", children: p.name }, p.id))
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Carril",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "lane",
                        min: "1",
                        defaultValue: editing?.lane ?? "",
                        className: inputClass
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Cupo",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "capacity",
                        min: "1",
                        required: true,
                        defaultValue: editing?.capacity ?? 8,
                        className: inputClass
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Mensualidad $",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "monthly_fee",
                        min: "0",
                        step: "0.01",
                        required: true,
                        defaultValue: editing?.monthly_fee ?? "",
                        className: inputClass
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-white/70", children: "Horarios" }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSchedules((prev) => [
                          ...prev,
                          { weekday: 1, start_time: "16:00", end_time: "17:00" }
                        ]),
                        className: "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/15 hover:text-white",
                        children: "+ Día"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-2", children: [
                    schedules.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "select",
                        {
                          value: s.weekday,
                          onChange: (e) => setSched(i, { weekday: Number(e.target.value) }),
                          className: "rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/40",
                          children: WEEKDAYS.map((d, w) => /* @__PURE__ */ jsx("option", { value: w, className: "text-slate-900", children: d }, w))
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "time",
                          value: s.start_time,
                          onChange: (e) => setSched(i, { start_time: e.target.value }),
                          className: "rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-white/40"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "–" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "time",
                          value: s.end_time,
                          onChange: (e) => setSched(i, { end_time: e.target.value }),
                          className: "rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-white/40"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setSchedules((prev) => prev.filter((_, j) => j !== i)),
                          className: "flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200",
                          "aria-label": "Quitar horario",
                          children: "✕"
                        }
                      )
                    ] }, i)),
                    schedules.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-white/35", children: "Sin horarios asignados." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: close,
                      className: "rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white",
                      children: "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: saving,
                      className: "bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50",
                      children: saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear grupo"
                    }
                  )
                ] })
              ]
            }
          )
        }
      ),
      document.body
    )
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { supabase, session } = Astro2.locals;
  const role = session.profile.role;
  const isSuperadmin = role === "superadmin";
  const canManage = ["superadmin", "branch_admin", "coordinator"].includes(role);
  const [groupsQ, levelsQ, branchesQ, instructorsQ, poolsQ, enrollQ] = await Promise.all([
    supabase.from("groups").select(
      "id, name, branch_id, level_id, instructor_id, pool_id, lane, capacity, monthly_fee, is_active, levels(name), branches(name), pools(name), instructors(id, profiles(full_name)), group_schedules(weekday, start_time, end_time)"
    ).order("name"),
    supabase.from("levels").select("id, name").order("sort_order"),
    isSuperadmin ? supabase.from("branches").select("id, name").eq("is_active", true).order("name") : Promise.resolve({ data: [] }),
    supabase.from("instructors").select("id, branch_id, profiles(full_name)").eq("is_active", true),
    supabase.from("pools").select("id, name, branch_id"),
    supabase.from("enrollments").select("group_id, status")
  ]);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const enrollments = enrollQ.data ?? [];
  const countBy = (groupId, status) => enrollments.filter((e) => e.group_id === groupId && e.status === status).length;
  const groups = (groupsQ.data ?? []).map((g) => {
    const instructor = one(g.instructors);
    const instructorProfile = one(instructor?.profiles ?? null);
    return {
      id: g.id,
      name: g.name,
      branch_id: g.branch_id,
      level_id: g.level_id,
      instructor_id: g.instructor_id,
      pool_id: g.pool_id,
      lane: g.lane,
      capacity: g.capacity,
      monthly_fee: Number(g.monthly_fee),
      is_active: g.is_active,
      level_name: one(g.levels)?.name ?? "—",
      branch_name: one(g.branches)?.name ?? "",
      pool_name: one(g.pools)?.name ?? null,
      instructor_name: instructorProfile?.full_name ?? null,
      schedules: g.group_schedules ?? [],
      active_count: countBy(g.id, "active"),
      waitlist_count: countBy(g.id, "waitlisted")
    };
  });
  const instructors = (instructorsQ.data ?? []).map((i) => ({
    id: i.id,
    branch_id: i.branch_id,
    name: one(i.profiles)?.full_name ?? "Instructor"
  }));
  const defaultBranchId = isSuperadmin ? "" : session.profile.branch_id ?? "";
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Grupos" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "GroupsView", GroupsView, { "client:load": true, "groups": groups, "branches": branchesQ.data ?? [], "levels": levelsQ.data ?? [], "instructors": instructors, "pools": poolsQ.data ?? [], "showBranchSelect": isSuperadmin, "canManage": canManage, "defaultBranchId": defaultBranchId, "client:component-hydration": "load", "client:component-path": "@/components/GroupsView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/grupos/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/grupos/index.astro";
const $$url = "/dashboard/grupos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
