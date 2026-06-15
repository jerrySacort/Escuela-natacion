import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_BOjAT_3f.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';

const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
function InstructorsView({
  instructors,
  branches,
  showBranchSelect,
  canManage
}) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const editing = modal?.mode === "edit" ? modal.instructor : null;
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return instructors.filter(
      (i) => `${i.name} ${i.specialties.join(" ")}`.toLowerCase().includes(q)
    );
  }, [instructors, query]);
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (canManage && params.get("nuevo") === "1") {
      setModal({ mode: "create" });
      params.delete("nuevo");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (qs ? `?${qs}` : "")
      );
    }
  }, []);
  function close() {
    setModal(null);
    setError("");
  }
  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = editing ? `/api/instructors/${editing.id}` : "/api/instructors";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      body: new FormData(e.currentTarget)
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  async function toggleActive(i) {
    const action = i.is_active ? "desactivar" : "reactivar";
    if (!await confirmDialog(`¿Seguro que quieres ${action} a ${i.name}?`, { tone: i.is_active ? "danger" : "default" })) return;
    setTogglingId(i.id);
    const fd = new FormData();
    fd.set("is_active", String(!i.is_active));
    const res = await fetch(`/api/instructors/${i.id}`, {
      method: "PATCH",
      body: fd
    });
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
        onClick: () => setModal({ mode: "create" }),
        className: "bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5",
        children: "+ Añadir instructor"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-white/10 p-4", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          placeholder: "Buscar instructor…",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          className: "w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Instructor" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Sucursal" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Especialidades" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Grupos" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Tarifa/h" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Estatus" }),
          canManage && /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtered.map((i) => /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `border-t border-white/10 transition hover:bg-white/5 ${i.is_active ? "" : "opacity-50"}`,
              children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/90", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-cream/90 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-900", children: i.name.charAt(0) }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    i.name,
                    i.phone && /* @__PURE__ */ jsx("span", { className: "block text-xs text-white/40", children: i.phone })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: i.branch_name }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("span", { className: "flex flex-wrap gap-1", children: [
                  i.specialties.slice(0, 3).map((s) => /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60",
                      children: s
                    },
                    s
                  )),
                  i.specialties.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-white/30", children: "—" })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: i.groups_count }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: i.hourly_rate !== null ? `$${i.hourly_rate.toLocaleString("es-MX")}` : "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `rounded-full px-3 py-1 text-xs ${i.is_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/50"}`,
                    children: i.is_active ? "Activo" : "Inactivo"
                  }
                ) }),
                canManage && /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setModal({ mode: "edit", instructor: i }),
                      title: "Editar",
                      className: "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white",
                      children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }) })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => toggleActive(i),
                      disabled: togglingId === i.id,
                      title: i.is_active ? "Desactivar" : "Reactivar",
                      className: `flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-40 ${i.is_active ? "border-red-300/20 bg-red-400/10 text-red-300/80 hover:bg-red-400/25 hover:text-red-200" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-300/80 hover:bg-emerald-400/25 hover:text-emerald-200"}`,
                      children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsx("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }),
                        /* @__PURE__ */ jsx("line", { x1: "12", y1: "2", x2: "12", y2: "12" })
                      ] })
                    }
                  )
                ] }) })
              ]
            },
            i.id
          )),
          filtered.length === 0 && /* @__PURE__ */ jsx("tr", { className: "border-t border-white/10", children: /* @__PURE__ */ jsx(
            "td",
            {
              colSpan: canManage ? 7 : 6,
              className: "px-5 py-10 text-center text-white/40",
              children: "Sin instructores."
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
              className: "modal-panel my-auto w-full max-w-md space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: editing ? "Editar instructor" : "Nuevo instructor" }),
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
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Nombre completo",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "full_name",
                      required: true,
                      defaultValue: editing?.name,
                      className: inputClass
                    }
                  )
                ] }),
                !editing && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Correo (para iniciar sesión)",
                    /* @__PURE__ */ jsx("input", { type: "email", name: "email", required: true, className: inputClass })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Contraseña temporal",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        name: "password",
                        required: true,
                        minLength: 8,
                        placeholder: "Mínimo 8 caracteres — compártela con el instructor",
                        className: inputClass
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Teléfono",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "tel",
                        name: "phone",
                        defaultValue: editing?.phone ?? "",
                        className: inputClass
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Tarifa por hora $",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "hourly_rate",
                        min: "0",
                        step: "0.01",
                        defaultValue: editing?.hourly_rate ?? "",
                        className: inputClass
                      }
                    )
                  ] })
                ] }),
                showBranchSelect && !editing && /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Sucursal",
                  /* @__PURE__ */ jsxs("select", { name: "branch_id", required: true, className: inputClass, children: [
                    /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
                    branches.map((b) => /* @__PURE__ */ jsx("option", { value: b.id, className: "text-slate-900", children: b.name }, b.id))
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Especialidades (separadas por comas)",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "specialties",
                      defaultValue: editing?.specialties.join(", "),
                      placeholder: "bebés, competitivo, aquaerobics",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Certificaciones (separadas por comas)",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "certifications",
                      defaultValue: editing?.certifications.join(", "),
                      placeholder: "Cruz Roja, FMN nivel 2",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Fecha de contratación",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "date",
                      name: "hired_at",
                      defaultValue: editing?.hired_at ?? "",
                      className: `${inputClass} [color-scheme:dark]`
                    }
                  )
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
                      children: saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear instructor"
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
  const canManage = ["superadmin", "branch_admin"].includes(role);
  const [instructorsQ, branchesQ, groupsQ] = await Promise.all([
    supabase.from("instructors").select(
      "id, profile_id, branch_id, specialties, certifications, hourly_rate, hired_at, is_active, profiles(full_name, phone), branches(name)"
    ),
    isSuperadmin ? supabase.from("branches").select("id, name").eq("is_active", true).order("name") : Promise.resolve({ data: [] }),
    supabase.from("groups").select("instructor_id").eq("is_active", true)
  ]);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const groupCounts = /* @__PURE__ */ new Map();
  for (const g of groupsQ.data ?? []) {
    if (g.instructor_id) {
      groupCounts.set(g.instructor_id, (groupCounts.get(g.instructor_id) ?? 0) + 1);
    }
  }
  const instructors = (instructorsQ.data ?? []).map((i) => {
    const p = one(i.profiles);
    return {
      id: i.id,
      profile_id: i.profile_id,
      branch_id: i.branch_id,
      name: p?.full_name ?? "—",
      phone: p?.phone ?? null,
      specialties: i.specialties ?? [],
      certifications: i.certifications ?? [],
      hourly_rate: i.hourly_rate !== null ? Number(i.hourly_rate) : null,
      hired_at: i.hired_at,
      is_active: i.is_active,
      branch_name: one(i.branches)?.name ?? "—",
      groups_count: groupCounts.get(i.id) ?? 0
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Instructores" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "InstructorsView", InstructorsView, { "client:load": true, "instructors": instructors, "branches": branchesQ.data ?? [], "showBranchSelect": isSuperadmin, "canManage": canManage, "client:component-hydration": "load", "client:component-path": "@/components/InstructorsView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/instructores/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/instructores/index.astro";
const $$url = "/dashboard/instructores";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
