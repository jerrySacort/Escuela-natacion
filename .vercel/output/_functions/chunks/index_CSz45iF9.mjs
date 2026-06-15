import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_BOjAT_3f.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { a as alertDialog, c as confirmDialog } from './dialog_CWCWZkCC.mjs';

function RubricsView({ levels, skills, canEdit }) {
  const [addingTo, setAddingTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  async function onAdd(e, level) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("level_id", level.id);
    const count = skills.filter((s) => s.level_id === level.id).length;
    fd.set("sort_order", String(count + 1));
    const res = await fetch("/api/skills", { method: "POST", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? "No se pudo crear.");
    setSaving(false);
  }
  async function onRename(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/skills/${editing.id}`, {
      method: "PATCH",
      body: new FormData(e.currentTarget)
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? "No se pudo renombrar.");
    setSaving(false);
  }
  async function onDelete(skill) {
    if (!await confirmDialog(`¿Eliminar "${skill.name}" de la rúbrica?`, { tone: "danger", confirmText: "Eliminar" })) return;
    const res = await fetch(`/api/skills/${skill.id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? "No se pudo eliminar.");
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3", children: levels.map((level) => {
    const levelSkills = skills.filter((s) => s.level_id === level.id).sort((a, b) => a.sort_order - b.sort_order);
    return /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-medium text-white/90", children: level.name }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/40", children: [
          levelSkills.length,
          " habilidades"
        ] })
      ] }),
      level.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-white/40", children: level.description }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2", children: [
        levelSkills.map((s) => /* @__PURE__ */ jsx(
          "li",
          {
            className: "group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5",
            children: editing?.id === s.id ? /* @__PURE__ */ jsxs("form", { onSubmit: onRename, className: "flex flex-1 gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  name: "name",
                  defaultValue: s.name,
                  autoFocus: true,
                  required: true,
                  className: "flex-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white outline-none"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: saving,
                  className: "bg-cream rounded-full px-3 py-1 text-xs font-semibold text-slate-900",
                  children: "✓"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setEditing(null),
                  className: "text-xs text-white/40 hover:text-white",
                  children: "✕"
                }
              )
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm text-white/80", children: s.name }),
              canEdit && /* @__PURE__ */ jsxs("span", { className: "flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setEditing(s),
                    title: "Renombrar",
                    className: "flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white",
                    children: "✎"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onDelete(s),
                    title: "Eliminar",
                    className: "flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-red-400/20 hover:text-red-200",
                    children: "✕"
                  }
                )
              ] })
            ] })
          },
          s.id
        )),
        levelSkills.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-1 text-sm text-white/35", children: "Sin habilidades." })
      ] }),
      canEdit && (addingTo === level.id ? /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (e) => onAdd(e, level),
          className: "mt-3 flex gap-2",
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "name",
                placeholder: "Nueva habilidad…",
                autoFocus: true,
                required: true,
                className: "flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                className: "bg-cream rounded-full px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50",
                children: "Añadir"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setAddingTo(null),
                className: "text-xs text-white/40 hover:text-white",
                children: "✕"
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setAddingTo(level.id),
          className: "mt-3 w-full rounded-full border border-dashed border-white/15 py-2 text-xs text-white/40 transition hover:border-white/30 hover:text-white/70",
          children: "+ Añadir habilidad"
        }
      ))
    ] }, level.id);
  }) });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { supabase, session } = Astro2.locals;
  const canEdit = session.profile.role === "superadmin";
  const [levelsQ, skillsQ] = await Promise.all([
    supabase.from("levels").select("id, name, description").order("sort_order"),
    supabase.from("skills").select("id, level_id, name, sort_order")
  ]);
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Rúbricas por nivel" }, { "default": async ($$result2) => renderTemplate`${!canEdit && renderTemplate`${maybeRenderHead()}<p class="-mt-2 mb-5 text-sm text-white/40">
Solo lectura — el superadmin administra el catálogo.
</p>`}${renderComponent($$result2, "RubricsView", RubricsView, { "client:load": true, "levels": levelsQ.data ?? [], "skills": skillsQ.data ?? [], "canEdit": canEdit, "client:component-hydration": "load", "client:component-path": "@/components/RubricsView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/rubricas/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/rubricas/index.astro";
const $$url = "/dashboard/rubricas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
