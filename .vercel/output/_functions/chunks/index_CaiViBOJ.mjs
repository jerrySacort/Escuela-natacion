import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_DnxdSQaP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Do2wH5FH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';
import { i as isRootAdmin } from './auth_DqoS55Rj.mjs';

const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
const labelClass = "block text-sm text-white/70";
const cardClass = "glass-soft rounded-3xl p-6";
const saveBtn = "bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50";
async function patch(url, fd) {
  return fetch(url, { method: "PATCH", body: fd });
}
const THEMES = [
  { id: "ocean", name: "Océano", bg: "#0d2436", accent: "#f7f3e8", brand: "#0e7bb8" },
  { id: "sunset", name: "Atardecer", bg: "#2a1530", accent: "#fde3c4", brand: "#e8915a" },
  { id: "forest", name: "Bosque", bg: "#0d2418", accent: "#cdeed9", brand: "#1fae7a" },
  { id: "cherry", name: "Cereza", bg: "#2a0c16", accent: "#f6d4dd", brand: "#d65a78" },
  { id: "midnight", name: "Medianoche", bg: "#0b1024", accent: "#d6dcff", brand: "#5a6cf0" },
  { id: "grape", name: "Uva", bg: "#1c1230", accent: "#e7d9ff", brand: "#9a6cf0" },
  { id: "steel", name: "Acero", bg: "#141c26", accent: "#dbe4ee", brand: "#6b8fc0" },
  { id: "coral", name: "Coral", bg: "#221310", accent: "#ffd9cc", brand: "#f0805a" },
  { id: "gold", name: "Oro", bg: "#221b0c", accent: "#f3e3b0", brand: "#d9a93a" },
  { id: "garnet", name: "Granate", bg: "#2d0f16", accent: "#fcd9dd", brand: "#e0455a" },
  { id: "neon", name: "Neón", bg: "#120817", accent: "#f0d9f7", brand: "#d633e8" }
];
function SettingsView({
  org,
  branches,
  pools,
  levels,
  user,
  canManageAdmins = false
}) {
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminMsg, setAdminMsg] = useState(null);
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolMsg, setSchoolMsg] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [branchModal, setBranchModal] = useState(null);
  const [poolModal, setPoolModal] = useState(null);
  const [levelModal, setLevelModal] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [theme, setTheme] = useState(org.theme ?? "ocean");
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);
  function onLogoChange(e) {
    const file = e.target.files?.[0];
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }
  async function createAdmin(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setAdminSaving(true);
    setAdminMsg(null);
    const res = await fetch("/api/users", {
      method: "POST",
      body: new FormData(form)
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setAdminMsg({ ok: true, text: "Superadmin creado correctamente." });
      form.reset();
    } else {
      setAdminMsg({ ok: false, text: body.error ?? "No se pudo crear el usuario." });
    }
    setAdminSaving(false);
  }
  async function submitProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await patch("/api/profile", new FormData(e.currentTarget));
    if (res.ok) {
      setProfileMsg({ ok: true, text: "Datos actualizados." });
      setProfileSaving(false);
      return;
    }
    const body = await res.json().catch(() => ({}));
    setProfileMsg({ ok: false, text: body.error ?? "No se pudo guardar." });
    setProfileSaving(false);
  }
  async function submitSchool(e) {
    e.preventDefault();
    setSchoolSaving(true);
    setSchoolMsg(null);
    const res = await patch("/api/settings", new FormData(e.currentTarget));
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setSchoolMsg({ ok: false, text: body.error ?? "No se pudo guardar." });
    setSchoolSaving(false);
  }
  async function submitBranch(e) {
    e.preventDefault();
    if (!branchModal) return;
    setModalSaving(true);
    setModalError("");
    const fd = new FormData(e.currentTarget);
    const url = branchModal.mode === "edit" ? `/api/branches/${branchModal.branch.id}` : "/api/branches";
    const res = branchModal.mode === "edit" ? await patch(url, fd) : await fetch(url, { method: "POST", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setModalError(body.error ?? "No se pudo guardar.");
    setModalSaving(false);
  }
  async function submitPool(e) {
    e.preventDefault();
    if (!poolModal) return;
    setModalSaving(true);
    setModalError("");
    const fd = new FormData(e.currentTarget);
    const url = poolModal.mode === "edit" ? `/api/pools/${poolModal.pool.id}` : "/api/pools";
    const res = poolModal.mode === "edit" ? await patch(url, fd) : await fetch(url, { method: "POST", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setModalError(body.error ?? "No se pudo guardar.");
    setModalSaving(false);
  }
  async function toggleBranch(b) {
    const action = b.is_active ? "desactivar" : "reactivar";
    if (!await confirmDialog(`¿Seguro que quieres ${action} la sucursal "${b.name}"?`, { tone: b.is_active ? "danger" : "default" })) return;
    const fd = new FormData();
    fd.set("is_active", String(!b.is_active));
    const res = await patch(`/api/branches/${b.id}`, fd);
    if (res.ok) window.location.reload();
    else void alertDialog("No se pudo actualizar la sucursal.");
  }
  async function deletePool(p) {
    if (!await confirmDialog(`¿Eliminar la alberca "${p.name}"?`, { tone: "danger", confirmText: "Eliminar" })) return;
    const res = await fetch(`/api/pools/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? "No se pudo eliminar la alberca.");
  }
  async function submitLevel(e) {
    e.preventDefault();
    if (!levelModal) return;
    setModalSaving(true);
    setModalError("");
    const fd = new FormData(e.currentTarget);
    const url = levelModal.mode === "edit" ? `/api/levels/${levelModal.level.id}` : "/api/levels";
    const res = levelModal.mode === "edit" ? await patch(url, fd) : await fetch(url, { method: "POST", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setModalError(body.error ?? "No se pudo guardar.");
    setModalSaving(false);
  }
  async function deleteLevel(l) {
    if (!await confirmDialog(`¿Eliminar el nivel "${l.name}"?`, { tone: "danger", confirmText: "Eliminar" })) return;
    const res = await fetch(`/api/levels/${l.id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? "No se pudo eliminar el nivel.");
  }
  function closeModal() {
    setBranchModal(null);
    setPoolModal(null);
    setLevelModal(null);
    setModalError("");
    setModalSaving(false);
  }
  async function pickTheme(id) {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = id;
    }
    setTheme(id);
    const fd = new FormData();
    fd.set("theme", id);
    const res = await patch("/api/theme", fd);
    if (!res.ok) void alertDialog("No se pudo guardar el tema.");
  }
  function Msg({ msg }) {
    if (!msg) return null;
    return /* @__PURE__ */ jsx(
      "p",
      {
        className: `rounded-xl p-3 text-sm ${msg.ok ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200"}`,
        children: msg.text
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl space-y-6", children: [
    /* @__PURE__ */ jsxs("section", { className: cardClass, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold tracking-tight", children: "Mi cuenta" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/50", children: "Tus datos de acceso y contacto." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitProfile, className: "mt-4 space-y-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Correo",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: user.email,
                disabled: true,
                className: `${inputClass} opacity-60`
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Rol",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: user.role,
                disabled: true,
                className: `${inputClass} capitalize opacity-60`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Nombre completo",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "full_name",
                required: true,
                defaultValue: user.full_name,
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Teléfono",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                name: "phone",
                defaultValue: user.phone ?? "",
                className: inputClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
          "Nueva contraseña (opcional)",
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              name: "password",
              minLength: 8,
              placeholder: "Déjalo en blanco para no cambiarla",
              className: inputClass
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Msg, { msg: profileMsg }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: profileSaving, className: saveBtn, children: profileSaving ? "Guardando…" : "Guardar cambios" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: cardClass, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold tracking-tight", children: "Datos de la escuela" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/50", children: "Nombre, contacto y logotipo que se mostrarán en el sistema." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitSchool, className: "mt-4 space-y-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            "label",
            {
              className: "group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/25 bg-white/5 transition hover:border-white/50",
              title: "Subir logotipo",
              children: [
                logoPreview || org.logo_url ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: logoPreview ?? org.logo_url ?? "",
                    alt: "Logo",
                    className: "h-full w-full object-cover"
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "text-2xl text-white/40 group-hover:text-white/70", children: "🏊" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    name: "logo",
                    accept: "image/*",
                    onChange: onLogoChange,
                    className: "hidden"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/50", children: [
            "Logotipo (opcional)",
            /* @__PURE__ */ jsx("span", { className: "block text-xs text-white/30", children: "JPG o PNG, máx. 5 MB" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
          "Nombre de la escuela",
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "school_name",
              required: true,
              defaultValue: org.school_name,
              className: inputClass
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Teléfono de contacto",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                name: "phone",
                defaultValue: org.phone ?? "",
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Correo de contacto",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                name: "email",
                defaultValue: org.email ?? "",
                className: inputClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Msg, { msg: schoolMsg }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: schoolSaving, className: saveBtn, children: schoolSaving ? "Guardando…" : "Guardar datos" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: cardClass, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold tracking-tight", children: "Tema de la aplicación" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/50", children: "Cambia los colores del sistema (fondo, botones, modales). Se aplica al instante." }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3", children: THEMES.map((t) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => pickTheme(t.id),
          className: `rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${theme === t.id ? "border-cream ring-2 ring-cream/40" : "border-white/10 hover:bg-white/5"}`,
          children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex h-14 items-center gap-2 rounded-xl px-3",
                style: { background: t.bg },
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "h-6 w-6 rounded-full border border-white/20",
                      style: { background: t.accent }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "h-6 w-6 rounded-full border border-white/20",
                      style: { background: t.brand }
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-white/90", children: t.name }),
              theme === t.id && /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-300", children: "✓ activo" })
            ] })
          ]
        },
        t.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: cardClass, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold tracking-tight", children: "Sucursales y albercas" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/50", children: "Direcciones, teléfonos y carriles de cada alberca." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setModalError("");
              setBranchModal({ mode: "create" });
            },
            className: "bg-cream rounded-full px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5",
            children: "+ Sucursal"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
        branches.map((b) => {
          const branchPools = pools.filter((p) => p.branch_id === b.id);
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `rounded-2xl border border-white/10 p-4 ${b.is_active ? "bg-white/5" : "bg-white/[0.02] opacity-60"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxs("p", { className: "font-semibold text-white/90", children: [
                      b.name,
                      !b.is_active && /* @__PURE__ */ jsx("span", { className: "ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50", children: "inactiva" })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-sm text-white/50", children: [
                      b.address || "Sin dirección",
                      b.phone ? ` · ${b.phone}` : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          setModalError("");
                          setBranchModal({ mode: "edit", branch: b });
                        },
                        className: "rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white",
                        children: "Editar"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleBranch(b),
                        className: "rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white",
                        children: b.is_active ? "Desactivar" : "Reactivar"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 border-t border-white/10 pt-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-white/40", children: "Albercas" }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          setModalError("");
                          setPoolModal({ mode: "create", branchId: b.id });
                        },
                        className: "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/15 hover:text-white",
                        children: "+ Alberca"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1.5", children: [
                    branchPools.map((p) => /* @__PURE__ */ jsxs(
                      "li",
                      {
                        className: "flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm",
                        children: [
                          /* @__PURE__ */ jsx("span", { className: "text-white/85", children: p.name }),
                          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
                            /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/50", children: [
                              p.lanes,
                              " carril",
                              p.lanes === 1 ? "" : "es"
                            ] }),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  setModalError("");
                                  setPoolModal({ mode: "edit", pool: p });
                                },
                                className: "text-xs text-white/50 transition hover:text-white",
                                children: "Editar"
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => deletePool(p),
                                className: "text-xs text-white/40 transition hover:text-red-200",
                                children: "Eliminar"
                              }
                            )
                          ] })
                        ]
                      },
                      p.id
                    )),
                    branchPools.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-1 text-xs text-white/35", children: "Sin albercas registradas." })
                  ] })
                ] })
              ]
            },
            b.id
          );
        }),
        branches.length === 0 && /* @__PURE__ */ jsx("p", { className: "py-2 text-sm text-white/40", children: "No hay sucursales todavía." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: cardClass, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold tracking-tight", children: "Niveles" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/50", children: "Los niveles que aparecen al crear grupos y en la rúbrica de evaluación." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setModalError("");
              setLevelModal({ mode: "create" });
            },
            className: "bg-cream rounded-full px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5",
            children: "+ Nivel"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
        levels.map((l) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-white/90", children: l.name }),
                /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-white/45", children: [
                  l.min_age != null || l.max_age != null ? `Edad: ${l.min_age ?? "—"}–${l.max_age ?? "—"} años` : "Sin rango de edad",
                  l.description ? ` · ${l.description}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setModalError("");
                      setLevelModal({ mode: "edit", level: l });
                    },
                    className: "rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white",
                    children: "Editar"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => deleteLevel(l),
                    className: "rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 transition hover:bg-red-400/20 hover:text-red-200",
                    children: "Eliminar"
                  }
                )
              ] })
            ]
          },
          l.id
        )),
        levels.length === 0 && /* @__PURE__ */ jsx("p", { className: "py-2 text-sm text-white/40", children: "No hay niveles todavía." })
      ] })
    ] }),
    canManageAdmins && /* @__PURE__ */ jsxs("section", { className: cardClass, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold tracking-tight", children: "Usuarios administradores" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-white/50", children: [
        "Crea cuentas con rol",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-medium text-white/70", children: "superadmin" }),
        ". Solo tu cuenta (raíz) puede hacerlo."
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: createAdmin, className: "mt-4 space-y-3.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Nombre completo",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "full_name",
                required: true,
                placeholder: "Nombre y apellido",
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
            "Correo",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                name: "email",
                required: true,
                placeholder: "correo@ejemplo.com",
                className: inputClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
          "Contraseña temporal",
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              name: "password",
              required: true,
              minLength: 8,
              placeholder: "Mínimo 8 caracteres",
              className: inputClass
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/35", children: "La cuenta queda activa al instante con rol superadmin. Comparte la contraseña de forma segura; el usuario podrá cambiarla después." }),
        /* @__PURE__ */ jsx(Msg, { msg: adminMsg }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: adminSaving, className: saveBtn, children: adminSaving ? "Creando…" : "Crear superadmin" }) })
      ] })
    ] }),
    branchModal && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && closeModal(),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: submitBranch,
              className: "modal-panel my-auto w-full max-w-md space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: branchModal.mode === "edit" ? "Editar sucursal" : "Nueva sucursal" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: closeModal,
                      className: "flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white",
                      "aria-label": "Cerrar",
                      children: "✕"
                    }
                  )
                ] }),
                modalError && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-3 text-sm text-red-200", children: modalError }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Nombre",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "name",
                      required: true,
                      defaultValue: branchModal.mode === "edit" ? branchModal.branch.name : "",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Dirección",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "address",
                      defaultValue: branchModal.mode === "edit" ? branchModal.branch.address ?? "" : "",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Teléfono",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "tel",
                      name: "phone",
                      defaultValue: branchModal.mode === "edit" ? branchModal.branch.phone ?? "" : "",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: closeModal,
                      className: "rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white",
                      children: "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsx("button", { type: "submit", disabled: modalSaving, className: saveBtn, children: modalSaving ? "Guardando…" : branchModal.mode === "edit" ? "Guardar" : "Crear" })
                ] })
              ]
            }
          )
        }
      ),
      document.body
    ),
    poolModal && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && closeModal(),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: submitPool,
              className: "modal-panel my-auto w-full max-w-sm space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: poolModal.mode === "edit" ? "Editar alberca" : "Nueva alberca" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: closeModal,
                      className: "flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white",
                      "aria-label": "Cerrar",
                      children: "✕"
                    }
                  )
                ] }),
                modalError && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-3 text-sm text-red-200", children: modalError }),
                poolModal.mode === "create" && /* @__PURE__ */ jsx("input", { type: "hidden", name: "branch_id", value: poolModal.branchId }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Nombre de la alberca",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "name",
                      required: true,
                      placeholder: "Alberca principal",
                      defaultValue: poolModal.mode === "edit" ? poolModal.pool.name : "",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Número de carriles",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      name: "lanes",
                      min: "1",
                      required: true,
                      defaultValue: poolModal.mode === "edit" ? poolModal.pool.lanes : 4,
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: closeModal,
                      className: "rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white",
                      children: "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsx("button", { type: "submit", disabled: modalSaving, className: saveBtn, children: modalSaving ? "Guardando…" : poolModal.mode === "edit" ? "Guardar" : "Crear" })
                ] })
              ]
            }
          )
        }
      ),
      document.body
    ),
    levelModal && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && closeModal(),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: submitLevel,
              className: "modal-panel my-auto w-full max-w-sm space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: levelModal.mode === "edit" ? "Editar nivel" : "Nuevo nivel" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: closeModal,
                      className: "flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white",
                      "aria-label": "Cerrar",
                      children: "✕"
                    }
                  )
                ] }),
                modalError && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-3 text-sm text-red-200", children: modalError }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Nombre del nivel",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "name",
                      required: true,
                      placeholder: "Principiantes",
                      defaultValue: levelModal.mode === "edit" ? levelModal.level.name : "",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                    "Edad mínima",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "min_age",
                        min: "0",
                        placeholder: "—",
                        defaultValue: levelModal.mode === "edit" ? levelModal.level.min_age ?? "" : "",
                        className: inputClass
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                    "Edad máxima",
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "max_age",
                        min: "0",
                        placeholder: "—",
                        defaultValue: levelModal.mode === "edit" ? levelModal.level.max_age ?? "" : "",
                        className: inputClass
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
                  "Descripción (opcional)",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "description",
                      placeholder: "Breve descripción del nivel",
                      defaultValue: levelModal.mode === "edit" ? levelModal.level.description ?? "" : "",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: closeModal,
                      className: "rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white",
                      children: "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsx("button", { type: "submit", disabled: modalSaving, className: saveBtn, children: modalSaving ? "Guardando…" : levelModal.mode === "edit" ? "Guardar" : "Crear" })
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
  if (session.profile.role !== "superadmin") return Astro2.redirect("/dashboard");
  const canManageAdmins = isRootAdmin(session.user.email);
  const [orgQ, branchesQ, poolsQ, levelsQ] = await Promise.all([
    supabase.from("org_settings").select("school_name, phone, email, logo_url, theme").eq("id", true).single(),
    supabase.from("branches").select("id, name, address, phone, is_active").order("name"),
    supabase.from("pools").select("id, name, lanes, branch_id").order("name"),
    supabase.from("levels").select("id, name, sort_order, min_age, max_age, description").order("sort_order")
  ]);
  const org = orgQ.data ?? {
    school_name: "Escuela de Natación",
    phone: null,
    email: null,
    logo_url: null,
    theme: "ocean"
  };
  const user = {
    full_name: session.profile.full_name,
    phone: session.profile.phone,
    email: session.user.email ?? "",
    role: session.profile.role
  };
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Configuración" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "SettingsView", SettingsView, { "client:load": true, "org": org, "branches": branchesQ.data ?? [], "pools": poolsQ.data ?? [], "levels": levelsQ.data ?? [], "user": user, "canManageAdmins": canManageAdmins, "client:component-hydration": "load", "client:component-path": "@/components/SettingsView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/configuracion/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/configuracion/index.astro";
const $$url = "/dashboard/configuracion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
