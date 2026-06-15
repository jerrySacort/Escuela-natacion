import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_DnxdSQaP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Do2wH5FH.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { P as PoolBoard } from './PoolBoard_Cu3fYTes.mjs';

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const RELATIONSHIPS = ["madre", "padre", "tutor", "abuelo/a", "otro"];
const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
const pillClass = "glass-soft flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10";
function QuickActions({
  canManage,
  canInstructors,
  showBranchSelect,
  defaultBranchId,
  branches,
  levels,
  guardians,
  instructors,
  pools
}) {
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [guardianId, setGuardianId] = useState("");
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [schedules, setSchedules] = useState([]);
  const branchInstructors = useMemo(
    () => instructors.filter((i) => !branchId || i.branch_id === branchId),
    [instructors, branchId]
  );
  const branchPools = useMemo(
    () => pools.filter((p) => !branchId || p.branch_id === branchId),
    [pools, branchId]
  );
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);
  function close() {
    setActive(null);
    setError("");
    setSaving(false);
    setPhotoPreview(null);
    setGuardianId("");
  }
  function openGrupo() {
    setBranchId(defaultBranchId);
    setSchedules([{ weekday: 1, start_time: "16:00", end_time: "17:00" }]);
    setError("");
    setActive("grupo");
  }
  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }
  function setSched(i, patch) {
    setSchedules((prev) => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  }
  async function submitStudent(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/students", {
      method: "POST",
      body: new FormData(e.currentTarget)
    });
    if (res.ok) return window.location.reload();
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  async function submitGroup(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("schedules", JSON.stringify(schedules));
    const res = await fetch("/api/groups", { method: "POST", body: fd });
    if (res.ok) return window.location.reload();
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  async function submitInstructor(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/instructors", {
      method: "POST",
      body: new FormData(e.currentTarget)
    });
    if (res.ok) return window.location.reload();
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo guardar.");
    setSaving(false);
  }
  function IconBox({ children }) {
    return /* @__PURE__ */ jsx("span", { className: "bg-cream grid h-8 w-8 place-items-center rounded-xl text-base text-slate-900", children });
  }
  function modalShell(title, body, onSubmit, submitLabel, maxW) {
    return createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && close(),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit,
              className: `modal-panel my-auto w-full ${maxW} space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: title }),
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
                body,
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
                      children: saving ? "Guardando…" : submitLabel
                    }
                  )
                ] })
              ]
            }
          )
        }
      ),
      document.body
    );
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-3 text-sm font-medium uppercase tracking-wide text-white/50", children: "Acciones rápidas" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:flex sm:flex-wrap", children: [
      canManage && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
        setError("");
        setActive("alumno");
      }, className: pillClass, children: [
        /* @__PURE__ */ jsx(IconBox, { children: "🏊" }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "+" }),
          "Nuevo alumno"
        ] })
      ] }),
      canManage && /* @__PURE__ */ jsxs("button", { type: "button", onClick: openGrupo, className: pillClass, children: [
        /* @__PURE__ */ jsx(IconBox, { children: "🗓️" }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "+" }),
          "Nuevo grupo"
        ] })
      ] }),
      canInstructors && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
        setError("");
        setActive("instructor");
      }, className: pillClass, children: [
        /* @__PURE__ */ jsx(IconBox, { children: "🧑‍🏫" }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "+" }),
          "Nuevo instructor"
        ] })
      ] }),
      canManage && /* @__PURE__ */ jsxs("a", { href: "/dashboard/pagos", className: pillClass, children: [
        /* @__PURE__ */ jsx(IconBox, { children: "💳" }),
        /* @__PURE__ */ jsx("span", { children: "Registrar pago" })
      ] }),
      canManage && /* @__PURE__ */ jsxs("a", { href: "/dashboard/asistencia", className: pillClass, children: [
        /* @__PURE__ */ jsx(IconBox, { children: "✅" }),
        /* @__PURE__ */ jsx("span", { children: "Pase de lista" })
      ] })
    ] }),
    active === "alumno" && typeof document !== "undefined" && modalShell(
      "Nuevo alumno",
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            "label",
            {
              className: "group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/25 bg-white/5 transition hover:border-white/50",
              title: "Subir fotografía",
              children: [
                photoPreview ? /* @__PURE__ */ jsx("img", { src: photoPreview, alt: "Vista previa", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-xl text-white/40 group-hover:text-white/70", children: "📷" }),
                /* @__PURE__ */ jsx("input", { type: "file", name: "photo", accept: "image/*", onChange: onPhotoChange, className: "hidden" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/50", children: [
            "Fotografía (opcional)",
            /* @__PURE__ */ jsx("span", { className: "block text-xs text-white/30", children: "JPG o PNG, máx. 5 MB" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Nombre(s)",
            /* @__PURE__ */ jsx("input", { type: "text", name: "first_name", required: true, className: inputClass })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Apellidos",
            /* @__PURE__ */ jsx("input", { type: "text", name: "last_name", required: true, className: inputClass })
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
              max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              className: `${inputClass} [color-scheme:dark]`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Sexo",
          /* @__PURE__ */ jsxs("select", { name: "sex", className: inputClass, children: [
            /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin especificar" }),
            /* @__PURE__ */ jsx("option", { value: "F", className: "text-slate-900", children: "Niña" }),
            /* @__PURE__ */ jsx("option", { value: "M", className: "text-slate-900", children: "Niño" })
          ] })
        ] }),
        showBranchSelect && /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Sucursal",
          /* @__PURE__ */ jsxs("select", { name: "branch_id", required: true, className: inputClass, children: [
            /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona una sucursal…" }),
            branches.map((b) => /* @__PURE__ */ jsx("option", { value: b.id, className: "text-slate-900", children: b.name }, b.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Nivel (opcional)",
          /* @__PURE__ */ jsxs("select", { name: "level_id", className: inputClass, children: [
            /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin nivel asignado" }),
            levels.map((l) => /* @__PURE__ */ jsx("option", { value: l.id, className: "text-slate-900", children: l.name }, l.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
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
            /* @__PURE__ */ jsx("select", { name: "relationship", disabled: !guardianId, className: `${inputClass} disabled:opacity-40`, children: RELATIONSHIPS.map((r) => /* @__PURE__ */ jsx("option", { value: r, className: "text-slate-900", children: r }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Notas médicas (opcional)",
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "medical_notes",
              rows: 2,
              placeholder: "Alergias, condiciones, medicamentos…",
              className: "mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
            }
          )
        ] })
      ] }),
      submitStudent,
      "Guardar alumno",
      "max-w-md"
    ),
    active === "grupo" && typeof document !== "undefined" && modalShell(
      "Nuevo grupo",
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Nombre del grupo",
            /* @__PURE__ */ jsx("input", { type: "text", name: "name", required: true, placeholder: "Delfines vespertino", className: inputClass })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Nivel",
            /* @__PURE__ */ jsxs("select", { name: "level_id", required: true, defaultValue: "", className: inputClass, children: [
              /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
              levels.map((l) => /* @__PURE__ */ jsx("option", { value: l.id, className: "text-slate-900", children: l.name }, l.id))
            ] })
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
            /* @__PURE__ */ jsxs("select", { name: "instructor_id", defaultValue: "", className: inputClass, children: [
              /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin asignar" }),
              branchInstructors.map((i) => /* @__PURE__ */ jsx("option", { value: i.id, className: "text-slate-900", children: i.name }, i.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Alberca (opcional)",
            /* @__PURE__ */ jsxs("select", { name: "pool_id", defaultValue: "", className: inputClass, children: [
              /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Sin asignar" }),
              branchPools.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, className: "text-slate-900", children: p.name }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Carril",
            /* @__PURE__ */ jsx("input", { type: "number", name: "lane", min: "1", className: inputClass })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Cupo",
            /* @__PURE__ */ jsx("input", { type: "number", name: "capacity", min: "1", required: true, defaultValue: 8, className: inputClass })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Mensualidad $",
            /* @__PURE__ */ jsx("input", { type: "number", name: "monthly_fee", min: "0", step: "0.01", required: true, className: inputClass })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-white/70", children: "Horarios" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setSchedules((prev) => [...prev, { weekday: 1, start_time: "16:00", end_time: "17:00" }]),
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
        ] })
      ] }),
      submitGroup,
      "Crear grupo",
      "max-w-lg"
    ),
    active === "instructor" && typeof document !== "undefined" && modalShell(
      "Nuevo instructor",
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Nombre completo",
          /* @__PURE__ */ jsx("input", { type: "text", name: "full_name", required: true, className: inputClass })
        ] }),
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
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Teléfono",
            /* @__PURE__ */ jsx("input", { type: "tel", name: "phone", className: inputClass })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
            "Tarifa por hora $",
            /* @__PURE__ */ jsx("input", { type: "number", name: "hourly_rate", min: "0", step: "0.01", className: inputClass })
          ] })
        ] }),
        showBranchSelect && /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Sucursal",
          /* @__PURE__ */ jsxs("select", { name: "branch_id", required: true, className: inputClass, children: [
            /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Selecciona…" }),
            branches.map((b) => /* @__PURE__ */ jsx("option", { value: b.id, className: "text-slate-900", children: b.name }, b.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Especialidades (separadas por comas)",
          /* @__PURE__ */ jsx("input", { type: "text", name: "specialties", placeholder: "bebés, competitivo, aquaerobics", className: inputClass })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Certificaciones (separadas por comas)",
          /* @__PURE__ */ jsx("input", { type: "text", name: "certifications", placeholder: "Cruz Roja, FMN nivel 2", className: inputClass })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
          "Fecha de contratación",
          /* @__PURE__ */ jsx("input", { type: "date", name: "hired_at", className: `${inputClass} [color-scheme:dark]` })
        ] })
      ] }),
      submitInstructor,
      "Crear instructor",
      "max-w-md"
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
  const canInstructors = ["superadmin", "branch_admin"].includes(role);
  const defaultBranchId = isSuperadmin ? "" : session.profile.branch_id ?? "";
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const [levelsQ, branchesFullQ, guardiansQ, instructorsListQ, poolsQ] = await Promise.all([
    supabase.from("levels").select("id, name").order("sort_order"),
    isSuperadmin ? supabase.from("branches").select("id, name").eq("is_active", true).order("name") : Promise.resolve({ data: [] }),
    supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name"),
    supabase.from("instructors").select("id, branch_id, profiles(full_name)").eq("is_active", true),
    supabase.from("pools").select("id, name, branch_id")
  ]);
  const qaBranches = branchesFullQ.data ?? [];
  const qaLevels = levelsQ.data ?? [];
  const qaGuardians = (guardiansQ.data ?? []).map((g) => ({ id: g.id, name: g.full_name }));
  const qaInstructors = (instructorsListQ.data ?? []).map((i) => ({
    id: i.id,
    branch_id: i.branch_id,
    name: one(i.profiles)?.full_name ?? "Instructor"
  }));
  const qaPools = poolsQ.data ?? [];
  const [boardBranchesQ, boardPoolsQ, boardGroupsQ] = await Promise.all([
    supabase.from("branches").select("id, name").eq("is_active", true).order("name"),
    supabase.from("pools").select("id, name, lanes, branch_id"),
    supabase.from("groups").select(
      "id, name, branch_id, pool_id, lane, levels(name), instructors(profiles(full_name)), group_schedules(weekday, start_time, end_time)"
    ).eq("is_active", true)
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
  const now = /* @__PURE__ */ new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const [studentsQ, groupsQ, waitlistQ, chargesQ, paymentsQ, branchesQ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("groups").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "waitlisted"),
    supabase.from("charges").select("amount_due, status").gte("created_at", firstOfMonth),
    supabase.from("payments").select("amount").gte("paid_at", firstOfMonth),
    supabase.from("branches").select("name").eq("is_active", true).order("name")
  ]);
  const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
  const ingresos = (paymentsQ.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const cargos = chargesQ.data ?? [];
  const cargosPagados = cargos.filter((c) => c.status === "paid").length;
  const pctCobranza = cargos.length ? Math.round(cargosPagados / cargos.length * 100) : 0;
  const cargosPendientes = cargos.filter(
    (c) => c.status === "pending" || c.status === "overdue"
  ).length;
  const stats = [
    { label: "Alumnos activos", value: mxn.format(studentsQ.count ?? 0), suffix: "" },
    { label: "Ingresos del mes", value: mxn.format(ingresos), suffix: "$" },
    { label: "Cargos pendientes", value: mxn.format(cargosPendientes), suffix: "" }
  ];
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Panel general" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="flex flex-wrap items-center gap-8 lg:gap-12"> <div class="relative h-28 w-28 shrink-0"${addAttribute(`Cobranza del mes: ${pctCobranza}%`, "title")}> <div class="donut absolute inset-0"${addAttribute(`background: conic-gradient(var(--color-cream) ${pctCobranza}%, rgba(255,255,255,.14) 0)`, "style")}></div> <div class="absolute inset-0 flex flex-col items-center justify-center"> <span class="text-2xl font-bold">${pctCobranza}<span class="text-sm align-super">%</span></span> <span class="text-[10px] uppercase tracking-wide text-white/50">cobranza</span> </div> </div> ${stats.map((s) => renderTemplate`<div> <p class="text-sm text-white/50">${s.label}</p> <p class="mt-1 text-4xl font-bold tracking-tight sm:text-5xl"> ${s.value} ${s.suffix && renderTemplate`<span class="align-super text-xl text-white/60">${s.suffix}</span>`} </p> </div>`)} </section>  ${canManage && renderTemplate`<div class="mt-8"> ${renderComponent($$result2, "QuickActions", QuickActions, { "client:load": true, "canManage": canManage, "canInstructors": canInstructors, "showBranchSelect": isSuperadmin, "defaultBranchId": defaultBranchId, "branches": qaBranches, "levels": qaLevels, "guardians": qaGuardians, "instructors": qaInstructors, "pools": qaPools, "client:component-hydration": "load", "client:component-path": "@/components/QuickActions", "client:component-export": "default" })} </div>`}${canManage && renderTemplate`<div class="mt-8"> ${renderComponent($$result2, "PoolBoard", PoolBoard, { "client:load": true, "branches": boardBranchesQ.data ?? [], "pools": boardPoolsQ.data ?? [], "sessions": poolSessions, "fullscreenHref": "/dashboard/alberca", "client:component-hydration": "load", "client:component-path": "@/components/PoolBoard", "client:component-export": "default" })} </div>`} <section class="mt-8 flex flex-wrap items-center gap-2"> <span class="glass-soft rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-slate-900">
Todas
</span> ${(branchesQ.data ?? []).map((b) => renderTemplate`<span class="glass-soft rounded-full px-4 py-1.5 text-sm text-white/70"> ${b.name} </span>`)} </section>  <section class="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3"> <div class="glass-soft rounded-3xl p-6 lg:col-span-2"> <h2 class="font-medium text-white/80">Actividad reciente</h2> <p class="mt-3 text-sm text-white/50">
Aquí aparecerán las últimas inscripciones, pagos y asistencias.
        Conecta los módulos de pagos y asistencia para ver movimiento.
</p> <div class="mt-6 grid grid-cols-2 gap-4"> <div class="glass-soft rounded-2xl p-4"> <p class="text-xs uppercase tracking-wide text-white/40">Grupos activos</p> <p class="mt-1 text-3xl font-bold">${groupsQ.count ?? 0}</p> </div> <div class="glass-soft rounded-2xl p-4"> <p class="text-xs uppercase tracking-wide text-white/40">Lista de espera</p> <p class="mt-1 text-3xl font-bold">${waitlistQ.count ?? 0}</p> </div> </div> </div> <div class="flex flex-col gap-5"> <a href="/dashboard/alumnos" class="rounded-3xl bg-cream p-6 text-slate-900 shadow-lg transition hover:-translate-y-0.5"> <p class="font-semibold">Alumnos</p> <p class="mt-1 text-sm text-slate-500">Expedientes, niveles y tutores</p> <p class="mt-4 text-4xl font-bold">${studentsQ.count ?? 0}</p> </a> <a href="/dashboard/pagos" class="glass-soft rounded-3xl p-6 transition hover:-translate-y-0.5"> <p class="font-semibold text-white/90">Cobranza del mes</p> <p class="mt-1 text-sm text-white/50"> ${cargosPagados} de ${cargos.length} cargos pagados
</p> <p class="mt-4 text-4xl font-bold"> ${mxn.format(ingresos)}<span class="align-super text-lg text-white/60">$</span> </p> </a> </div> </section> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
