import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_B5gixhUf.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';

const RELATIONSHIPS = ["madre", "padre", "tutor", "abuelo/a", "otro"];
const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
function age(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1e3));
}
function StudentsView({
  students,
  branches,
  levels,
  guardians,
  showBranchSelect,
  canManage
}) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [guardianId, setGuardianId] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const editing = modal?.mode === "edit" ? modal.student : null;
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter(
      (s) => `${s.first_name} ${s.last_name}`.toLowerCase().includes(q)
    );
  }, [students, query]);
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);
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
  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }
  function close() {
    setModal(null);
    setPhotoPreview(null);
    setGuardianId("");
    setError("");
  }
  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = editing ? `/api/students/${editing.id}` : "/api/students";
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
  async function toggleActive(s) {
    const action = s.is_active ? "desactivar" : "reactivar";
    if (!await confirmDialog(`¿Seguro que quieres ${action} a ${s.first_name} ${s.last_name}?`, { tone: s.is_active ? "danger" : "default" }))
      return;
    setTogglingId(s.id);
    const fd = new FormData();
    fd.set("is_active", String(!s.is_active));
    const res = await fetch(`/api/students/${s.id}`, { method: "PATCH", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setTogglingId(null);
    void alertDialog("No se pudo cambiar el estatus.");
  }
  const currentPhoto = photoPreview ?? editing?.photo_url ?? null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    canManage && /* @__PURE__ */ jsx("div", { className: "-mt-2 mb-5 flex justify-end", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setModal({ mode: "create" }),
        className: "bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5",
        children: "+ Añadir alumno"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-white/10 p-4", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          placeholder: "Buscar alumno…",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          className: "w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[40rem] text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Nombre" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Edad" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Nivel" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Estatus" }),
          canManage && /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtered.map((s) => /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `border-t border-white/10 transition hover:bg-white/5 ${s.is_active ? "" : "opacity-50"}`,
              children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/90", children: /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: `/dashboard/alumnos/${s.id}`,
                    className: "flex items-center gap-3 hover:underline underline-offset-4",
                    children: [
                      s.photo_url ? /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: s.photo_url,
                          alt: "",
                          className: "h-9 w-9 rounded-full border border-white/15 object-cover"
                        }
                      ) : /* @__PURE__ */ jsx("span", { className: "bg-cream/90 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-900", children: s.first_name.charAt(0) }),
                      s.last_name,
                      ", ",
                      s.first_name
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3 text-white/70", children: [
                  age(s.birth_date),
                  " años"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: s.levels?.name ?? "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `rounded-full px-3 py-1 text-xs ${s.is_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/50"}`,
                    children: s.is_active ? "Activo" : "Inactivo"
                  }
                ) }),
                canManage && /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setModal({ mode: "edit", student: s }),
                      title: "Editar",
                      className: "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white",
                      children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }) })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => toggleActive(s),
                      disabled: togglingId === s.id,
                      title: s.is_active ? "Desactivar" : "Reactivar",
                      className: `flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-40 ${s.is_active ? "border-red-300/20 bg-red-400/10 text-red-300/80 hover:bg-red-400/25 hover:text-red-200" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-300/80 hover:bg-emerald-400/25 hover:text-emerald-200"}`,
                      children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsx("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }),
                        /* @__PURE__ */ jsx("line", { x1: "12", y1: "2", x2: "12", y2: "12" })
                      ] })
                    }
                  )
                ] }) })
              ]
            },
            s.id
          )),
          filtered.length === 0 && /* @__PURE__ */ jsx("tr", { className: "border-t border-white/10", children: /* @__PURE__ */ jsx(
            "td",
            {
              colSpan: canManage ? 5 : 4,
              className: "px-5 py-10 text-center text-white/40",
              children: "Sin resultados"
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
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: editing ? "Editar alumno" : "Nuevo alumno" }),
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
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      className: "group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/25 bg-white/5 transition hover:border-white/50",
                      title: "Subir fotografía",
                      children: [
                        currentPhoto ? /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: currentPhoto,
                            alt: "Vista previa",
                            className: "h-full w-full object-cover"
                          }
                        ) : /* @__PURE__ */ jsx("span", { className: "text-xl text-white/40 group-hover:text-white/70", children: "📷" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "file",
                            name: "photo",
                            accept: "image/*",
                            onChange: onPhotoChange,
                            className: "hidden"
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/50", children: [
                    editing ? "Cambiar fotografía" : "Fotografía (opcional)",
                    /* @__PURE__ */ jsx("span", { className: "block text-xs text-white/30", children: "JPG o PNG, máx. 5 MB" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Nombre(s)",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        name: "first_name",
                        required: true,
                        defaultValue: editing?.first_name,
                        className: inputClass
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Apellidos",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        name: "last_name",
                        required: true,
                        defaultValue: editing?.last_name,
                        className: inputClass
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Fecha de nacimiento",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "date",
                      name: "birth_date",
                      required: true,
                      defaultValue: editing?.birth_date,
                      max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                      className: `${inputClass} [color-scheme:dark]`
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Sexo",
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      name: "sex",
                      defaultValue: editing?.sex ?? "",
                      className: inputClass,
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin especificar" }),
                        /* @__PURE__ */ jsx("option", { value: "F", className: "text-slate-900", children: "Niña" }),
                        /* @__PURE__ */ jsx("option", { value: "M", className: "text-slate-900", children: "Niño" })
                      ]
                    }
                  )
                ] }),
                showBranchSelect && /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Sucursal",
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      name: "branch_id",
                      required: true,
                      defaultValue: editing?.branch_id ?? "",
                      className: inputClass,
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona una sucursal…" }),
                        branches.map((b) => /* @__PURE__ */ jsx("option", { value: b.id, className: "text-slate-900", children: b.name }, b.id))
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Nivel (opcional)",
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      name: "level_id",
                      defaultValue: editing?.level_id ?? "",
                      className: inputClass,
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin nivel asignado" }),
                        levels.map((l) => /* @__PURE__ */ jsx("option", { value: l.id, className: "text-slate-900", children: l.name }, l.id))
                      ]
                    }
                  )
                ] }),
                !editing && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Padre / tutor (opcional)",
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        name: "guardian_id",
                        value: guardianId,
                        onChange: (e) => setGuardianId(e.target.value),
                        className: inputClass,
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin vincular" }),
                          guardians.map((g) => /* @__PURE__ */ jsx("option", { value: g.id, className: "text-slate-900", children: g.name }, g.id))
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                    "Parentesco",
                    /* @__PURE__ */ jsx(
                      "select",
                      {
                        name: "relationship",
                        disabled: !guardianId,
                        className: `${inputClass} disabled:opacity-40`,
                        children: RELATIONSHIPS.map((r) => /* @__PURE__ */ jsx("option", { value: r, className: "text-slate-900", children: r }, r))
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Notas médicas (opcional)",
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      name: "medical_notes",
                      rows: 2,
                      defaultValue: editing?.medical_notes ?? "",
                      placeholder: "Alergias, condiciones, medicamentos…",
                      className: "mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
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
                      children: saving ? "Guardando…" : editing ? "Guardar cambios" : "Guardar alumno"
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
  const [studentsQ, levelsQ, branchesQ, guardiansQ] = await Promise.all([
    supabase.from("students").select(
      "id, first_name, last_name, birth_date, is_active, photo_url, level_id, branch_id, medical_notes, sex, levels(name)"
    ).order("last_name"),
    supabase.from("levels").select("id, name").order("sort_order"),
    isSuperadmin ? supabase.from("branches").select("id, name").eq("is_active", true).order("name") : Promise.resolve({ data: [] }),
    supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name")
  ]);
  const rows = (studentsQ.data ?? []).map((s) => ({
    ...s,
    levels: Array.isArray(s.levels) ? s.levels[0] ?? null : s.levels
  }));
  const guardians = (guardiansQ.data ?? []).map((g) => ({
    id: g.id,
    name: g.full_name
  }));
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Alumnos" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "StudentsView", StudentsView, { "client:load": true, "students": rows, "branches": branchesQ.data ?? [], "levels": levelsQ.data ?? [], "guardians": guardians, "showBranchSelect": isSuperadmin, "canManage": canManage, "client:component-hydration": "load", "client:component-path": "@/components/StudentsView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/alumnos/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/alumnos/index.astro";
const $$url = "/dashboard/alumnos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
