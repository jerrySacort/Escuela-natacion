import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_DnxdSQaP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Do2wH5FH.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';
import { createPortal } from 'react-dom';

const RELATIONSHIPS = ["madre", "padre", "tutor", "abuelo/a", "otro"];
const inputClass$1 = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
function GuardiansCard({ studentId, linked, parents, canManage }) {
  const [mode, setMode] = useState("closed");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const available = parents.filter(
    (p) => !linked.some((l) => l.guardian_id === p.id)
  );
  function close() {
    setMode("closed");
    setError("");
  }
  async function submit(url, form) {
    setSaving(true);
    setError("");
    const res = await fetch(url, { method: "POST", body: new FormData(form) });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  function onLink(e) {
    e.preventDefault();
    void submit(`/api/students/${studentId}/guardians`, e.currentTarget);
  }
  function onCreate(e) {
    e.preventDefault();
    void submit("/api/parents", e.currentTarget);
  }
  async function onRemove(g) {
    if (!await confirmDialog(`¿Desvincular a ${g.name}?`, { tone: "danger", confirmText: "Desvincular" })) return;
    const res = await fetch(
      `/api/students/${studentId}/guardians?guardian_id=${g.guardian_id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      window.location.reload();
      return;
    }
    void alertDialog("No se pudo desvincular.");
  }
  const relationshipSelect = /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
    "Parentesco",
    /* @__PURE__ */ jsx("select", { name: "relationship", className: inputClass$1, children: RELATIONSHIPS.map((r) => /* @__PURE__ */ jsx("option", { value: r, className: "text-slate-900", children: r }, r)) })
  ] });
  const primaryCheck = /* @__PURE__ */ jsxs("label", { className: "flex items-end gap-2 pb-2.5 text-sm text-white/70", children: [
    /* @__PURE__ */ jsx("input", { type: "checkbox", name: "is_primary", value: "true", className: "accent-[#f7f3e8]" }),
    "Principal"
  ] });
  const footer = /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: close,
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
        children: saving ? "Guardando…" : mode === "new" ? "Crear y vincular" : "Vincular"
      }
    )
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-medium text-white/80", children: "Padres y tutores" }),
      canManage && mode === "closed" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMode("existing"),
          className: "rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white",
          children: "+ Vincular"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-3", children: [
      linked.map((g) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "bg-cream/90 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-slate-900", children: g.name.charAt(0) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "truncate text-sm text-white/90", children: [
            g.name,
            g.is_primary && /* @__PURE__ */ jsx("span", { className: "bg-cream ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-900", children: "principal" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40", children: [
            g.relationship,
            g.phone ? ` · ${g.phone}` : ""
          ] })
        ] }),
        canManage && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onRemove(g),
            title: "Desvincular",
            className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200",
            children: "✕"
          }
        )
      ] }, g.guardian_id)),
      linked.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-2 text-sm text-white/40", children: "Sin tutores vinculados." })
    ] }),
    mode !== "closed" && /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t border-white/10 pt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setMode("existing");
              setError("");
            },
            className: `rounded-full px-4 py-1.5 text-xs transition ${mode === "existing" ? "bg-cream font-semibold text-slate-900" : "glass-soft text-white/60 hover:text-white"}`,
            children: "Cuenta existente"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setMode("new");
              setError("");
            },
            className: `rounded-full px-4 py-1.5 text-xs transition ${mode === "new" ? "bg-cream font-semibold text-slate-900" : "glass-soft text-white/60 hover:text-white"}`,
            children: "Nueva cuenta"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "mb-3 rounded-xl bg-red-400/15 p-2.5 text-xs text-red-200", children: error }),
      mode === "existing" && /* @__PURE__ */ jsxs("form", { onSubmit: onLink, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Tutor",
          /* @__PURE__ */ jsxs("select", { name: "guardian_id", required: true, className: inputClass$1, children: [
            /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
            available.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, className: "text-slate-900", children: p.name }, p.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          relationshipSelect,
          primaryCheck
        ] }),
        footer
      ] }),
      mode === "new" && /* @__PURE__ */ jsxs("form", { onSubmit: onCreate, className: "space-y-3", children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "student_id", value: studentId }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Nombre completo",
          /* @__PURE__ */ jsx("input", { type: "text", name: "full_name", required: true, className: inputClass$1 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Correo",
            /* @__PURE__ */ jsx("input", { type: "email", name: "email", required: true, className: inputClass$1 })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Teléfono",
            /* @__PURE__ */ jsx("input", { type: "tel", name: "phone", className: inputClass$1 })
          ] })
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
              placeholder: "Mínimo 8 caracteres — compártela con el padre",
              className: inputClass$1
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          relationshipSelect,
          primaryCheck
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/35", children: "La cuenta queda activa de inmediato, sin correo de confirmación." }),
        footer
      ] })
    ] })
  ] });
}

const RESULTS = [
  { value: "not_attempted", label: "No intentado", cls: "bg-white/10 text-white/50" },
  { value: "in_progress", label: "En progreso", cls: "bg-amber-400/20 text-amber-200" },
  { value: "achieved", label: "Logrado", cls: "bg-emerald-400/25 text-emerald-200" }
];
const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-white/40";
function EvaluationModal({
  studentId,
  studentLevelId,
  levels,
  skills,
  canPromote
}) {
  const [open, setOpen] = useState(false);
  const [levelId, setLevelId] = useState(studentLevelId ?? levels[0]?.id ?? "");
  const [results, setResults] = useState({});
  const [passed, setPassed] = useState(false);
  const [promote, setPromote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const levelSkills = useMemo(
    () => skills.filter((s) => s.level_id === levelId),
    [skills, levelId]
  );
  const allAchieved = levelSkills.length > 0 && levelSkills.every((s) => results[s.id] === "achieved");
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  function openModal() {
    setLevelId(studentLevelId ?? levels[0]?.id ?? "");
    setResults({});
    setPassed(false);
    setPromote(false);
    setError("");
    setOpen(true);
  }
  function cycle(skillId) {
    setResults((prev) => {
      const order = ["not_attempted", "in_progress", "achieved"];
      const current = prev[skillId] ?? "not_attempted";
      const next = order[(order.indexOf(current) + 1) % order.length];
      return { ...prev, [skillId]: next };
    });
  }
  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("level_id", levelId);
    fd.set("passed_level", String(passed));
    fd.set("promote", String(promote));
    fd.set(
      "scores",
      JSON.stringify(
        levelSkills.map((s) => ({
          skill_id: s.id,
          result: results[s.id] ?? "not_attempted"
        }))
      )
    );
    const res = await fetch(`/api/students/${studentId}/evaluations`, {
      method: "POST",
      body: fd
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      if (body.warnings?.length) await alertDialog(body.warnings.join("\n"));
      window.location.reload();
      return;
    }
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: openModal,
        className: "rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white",
        children: "+ Evaluar"
      }
    ),
    open && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && setOpen(false),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit,
              className: "modal-panel my-auto w-full max-w-md space-y-4 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: "Nueva evaluación" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setOpen(false),
                      className: "flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white",
                      "aria-label": "Cerrar",
                      children: "✕"
                    }
                  )
                ] }),
                error && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-3 text-sm text-red-200", children: error }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Nivel evaluado",
                  /* @__PURE__ */ jsx(
                    "select",
                    {
                      value: levelId,
                      onChange: (e) => setLevelId(e.target.value),
                      className: inputClass,
                      children: levels.map((l) => /* @__PURE__ */ jsx("option", { value: l.id, className: "text-slate-900", children: l.name }, l.id))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70", children: [
                    "Habilidades",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: "(toca para cambiar)" })
                  ] }),
                  /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-2", children: [
                    levelSkills.map((s) => {
                      const r = RESULTS.find((x) => x.value === (results[s.id] ?? "not_attempted")) ?? RESULTS[0];
                      return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => cycle(s.id),
                          className: "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10",
                          children: [
                            /* @__PURE__ */ jsx("span", { className: "text-sm text-white/90", children: s.name }),
                            /* @__PURE__ */ jsx("span", { className: `shrink-0 rounded-full px-3 py-1 text-xs ${r.cls}`, children: r.label })
                          ]
                        }
                      ) }, s.id);
                    }),
                    levelSkills.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-2 text-sm text-white/40", children: "Este nivel no tiene habilidades definidas (agrégalas en Rúbricas)." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Notas (opcional)",
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      name: "notes",
                      rows: 2,
                      className: "mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-2xl bg-white/5 p-4", children: [
                  /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: passed,
                        onChange: (e) => setPassed(e.target.checked),
                        className: "accent-[#f7f3e8]"
                      }
                    ),
                    "Aprueba el nivel",
                    allAchieved && !passed && /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-200", children: "(todas logradas ✓)" })
                  ] }),
                  passed && canPromote && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: promote,
                        onChange: (e) => setPromote(e.target.checked),
                        className: "accent-[#f7f3e8]"
                      }
                    ),
                    "Promover al siguiente nivel"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setOpen(false),
                      className: "rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white",
                      children: "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: saving || levelSkills.length === 0,
                      className: "bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50",
                      children: saving ? "Guardando…" : "Guardar evaluación"
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

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { supabase, session } = Astro2.locals;
  const { id } = Astro2.params;
  const role = session.profile.role;
  const canManage = ["superadmin", "branch_admin", "coordinator"].includes(role);
  const { data: student } = await supabase.from("students").select(
    "id, first_name, last_name, birth_date, photo_url, medical_notes, is_active, enrolled_at, qr_code, level_id, levels(name), branches(name)"
  ).eq("id", id).single();
  if (!student) return Astro2.redirect("/dashboard/alumnos");
  const [guardiansQ, parentsQ, enrollmentsQ, evaluationsQ] = await Promise.all([
    supabase.from("student_guardians").select("guardian_id, relationship, is_primary, profiles(full_name, phone)").eq("student_id", id),
    supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name"),
    supabase.from("enrollments").select("id, status, started_at, groups(name)").eq("student_id", id).order("started_at", { ascending: false }),
    supabase.from("evaluations").select(
      "id, evaluated_at, passed_level, notes, levels(name), evaluation_scores(result, comment, skills(name))"
    ).eq("student_id", id).order("evaluated_at", { ascending: false })
  ]);
  const [allLevelsQ, allSkillsQ] = await Promise.all([
    supabase.from("levels").select("id, name").order("sort_order"),
    supabase.from("skills").select("id, level_id, name").order("sort_order")
  ]);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const level = one(student.levels);
  const branch = one(student.branches);
  const linked = (guardiansQ.data ?? []).map((g) => {
    const p = one(g.profiles);
    return {
      guardian_id: g.guardian_id,
      relationship: g.relationship,
      is_primary: g.is_primary,
      name: p?.full_name ?? "—",
      phone: p?.phone ?? null
    };
  });
  const parents = (parentsQ.data ?? []).map((p) => ({ id: p.id, name: p.full_name }));
  const age = Math.floor(
    (Date.now() - new Date(student.birth_date).getTime()) / (365.25 * 24 * 3600 * 1e3)
  );
  const fmtDate = (d) => (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const statusLabel = {
    active: "Activa",
    waitlisted: "Lista de espera",
    paused: "Pausada",
    cancelled: "Cancelada"
  };
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<a href="/dashboard/alumnos" class="mb-5 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
← Alumnos
</a>  <section class="glass-soft mb-6 flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">  <div class="flex items-center gap-4 sm:contents"> ${student.photo_url ? renderTemplate`<img${addAttribute(student.photo_url, "src")} alt="" class="h-20 w-20 shrink-0 rounded-full border-2 border-white/20 object-cover sm:h-24 sm:w-24">` : renderTemplate`<span class="bg-cream flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-slate-900 sm:h-24 sm:w-24"> ${student.first_name.charAt(0)} </span>`}  <h1 class="text-2xl font-semibold tracking-tight sm:hidden"> ${student.first_name} ${student.last_name} <span${addAttribute(`ml-2 inline-block align-middle rounded-full px-3 py-1 text-xs ${student.is_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/50"}`, "class")}> ${student.is_active ? "Activo" : "Inactivo"} </span> </h1> </div> <div class="min-w-0 sm:flex-1">  <h1 class="hidden text-2xl font-semibold tracking-tight sm:block sm:text-3xl"> ${student.first_name} ${student.last_name} <span${addAttribute(`ml-3 align-middle rounded-full px-3 py-1 text-xs ${student.is_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/50"}`, "class")}> ${student.is_active ? "Activo" : "Inactivo"} </span> </h1> <p class="mt-1 text-sm text-white/50"> ${age} años · ${level?.name ?? "Sin nivel"} · ${branch?.name ?? "—"} </p> <p class="mt-1 text-xs text-white/35">
Inscrito el ${fmtDate(student.enrolled_at)} · Código ${student.qr_code} </p> </div> <div class="text-center"> <img${addAttribute(`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${student.qr_code}`, "src")} alt="Código QR del alumno" width="120" height="120" class="mx-auto rounded-2xl bg-white p-2 sm:mx-0"> <p class="mt-1.5 text-xs text-white/35">QR para check-in</p> </div> ${student.medical_notes && renderTemplate`<div class="w-full rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-100 sm:w-auto sm:max-w-xs"> <p class="text-xs font-semibold uppercase tracking-wide text-amber-200/70">
Notas médicas
</p> <p class="mt-1">${student.medical_notes}</p> </div>`} </section> <div class="grid grid-cols-1 gap-6 lg:grid-cols-3"> <!-- Tutores --> ${renderComponent($$result2, "GuardiansCard", GuardiansCard, { "client:load": true, "studentId": student.id, "linked": linked, "parents": parents, "canManage": canManage, "client:component-hydration": "load", "client:component-path": "@/components/GuardiansCard", "client:component-export": "default" })} <!-- Inscripciones --> <div class="glass-soft rounded-3xl p-6"> <h2 class="font-medium text-white/80">Grupos</h2> <ul class="mt-4 space-y-3"> ${(enrollmentsQ.data ?? []).map((e) => {
    const g = one(e.groups);
    return renderTemplate`<li class="flex items-center justify-between gap-3 text-sm"> <span class="text-white/90">${g?.name ?? "—"}</span> <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60"> ${statusLabel[e.status] ?? e.status} </span> </li>`;
  })} ${(enrollmentsQ.data ?? []).length === 0 && renderTemplate`<li class="py-2 text-sm text-white/40">Sin inscripciones.</li>`} </ul> </div> <!-- Evaluaciones --> <div class="glass-soft rounded-3xl p-6"> <div class="flex items-center justify-between"> <h2 class="font-medium text-white/80">Evaluaciones</h2> ${canManage && renderTemplate`${renderComponent($$result2, "EvaluationModal", EvaluationModal, { "client:load": true, "studentId": student.id, "studentLevelId": student.level_id, "levels": allLevelsQ.data ?? [], "skills": allSkillsQ.data ?? [], "canPromote": canManage, "client:component-hydration": "load", "client:component-path": "@/components/EvaluationModal", "client:component-export": "default" })}`} </div> <ul class="mt-4 space-y-3"> ${(evaluationsQ.data ?? []).map((ev) => {
    const l = one(ev.levels);
    const scores = ev.evaluation_scores ?? [];
    return renderTemplate`<li class="text-sm"> <details class="group"> <summary class="cursor-pointer list-none"> <div class="flex items-center justify-between gap-3"> <span class="text-white/90"> ${l?.name ?? "—"} <span class="ml-1 text-white/30 transition group-open:rotate-90 inline-block">
›
</span> </span> <span${addAttribute(`rounded-full px-3 py-1 text-xs ${ev.passed_level ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/60"}`, "class")}> ${ev.passed_level ? "Aprobado" : "En progreso"} </span> </div> <p class="mt-0.5 text-xs text-white/35"> ${fmtDate(ev.evaluated_at)} ${ev.notes ? ` · ${ev.notes}` : ""} </p> </summary> <ul class="mt-2 space-y-1 rounded-2xl bg-white/5 p-3"> ${scores.map((sc) => {
      const sk = one(sc.skills);
      const dot = sc.result === "achieved" ? "🟢" : sc.result === "in_progress" ? "🟡" : "⚪";
      return renderTemplate`<li class="flex items-center justify-between gap-2 text-xs"> <span class="text-white/70">${sk?.name ?? "—"}</span> <span>${dot}</span> </li>`;
    })} ${scores.length === 0 && renderTemplate`<li class="text-xs text-white/35">Sin calificaciones.</li>`} </ul> </details> </li>`;
  })} ${(evaluationsQ.data ?? []).length === 0 && renderTemplate`<li class="py-2 text-sm text-white/40">Sin evaluaciones.</li>`} </ul> </div> </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/alumnos/[id].astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/alumnos/[id].astro";
const $$url = "/dashboard/alumnos/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
