import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_BOjAT_3f.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { c as confirmDialog, a as alertDialog } from './dialog_CWCWZkCC.mjs';

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "overdue", label: "Vencidos" },
  { key: "paid", label: "Pagados" },
  { key: "cancelled", label: "Cancelados" }
];
const METHOD_OPTIONS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" },
  { value: "spei", label: "SPEI" },
  { value: "oxxo", label: "OXXO" }
];
const STATUS_STYLES = {
  pending: "bg-white/10 text-white/60",
  overdue: "bg-red-400/20 text-red-200",
  paid: "bg-emerald-400/20 text-emerald-200",
  cancelled: "bg-white/5 text-white/30"
};
const STATUS_LABELS = {
  pending: "Pendiente",
  overdue: "Vencido",
  paid: "Pagado",
  cancelled: "Cancelado"
};
const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
function PaymentsView({ charges, canManage }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [paying, setPaying] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const summary = useMemo(() => {
    const sum = (st) => charges.filter((c) => c.status === st).reduce((s, c) => s + c.amount_due, 0);
    return {
      paid: sum("paid"),
      pending: sum("pending"),
      overdue: sum("overdue")
    };
  }, [charges]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return charges.filter(
      (c) => (filter === "all" ? c.status !== "cancelled" : c.status === filter) && `${c.student_name} ${c.concept}`.toLowerCase().includes(q)
    );
  }, [charges, filter, query]);
  useEffect(() => {
    if (!paying) return;
    const onKey = (e) => e.key === "Escape" && setPaying(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paying]);
  async function onGenerate() {
    if (!await confirmDialog("¿Generar los cargos de mensualidad del mes en curso para todas las inscripciones activas?", { confirmText: "Generar" }))
      return;
    setGenerating(true);
    const res = await fetch("/api/charges/generate", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      await alertDialog(
        `Cargos nuevos: ${body.created} · ya existían: ${body.skipped} · marcados vencidos: ${body.overdue_marked}`
      );
      window.location.reload();
      return;
    }
    setGenerating(false);
    void alertDialog(body.error ?? "No se pudieron generar los cargos.");
  }
  async function onPay(e) {
    e.preventDefault();
    if (!paying) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/charges/${paying.id}/pay`, {
      method: "POST",
      body: new FormData(e.currentTarget)
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "No se pudo registrar el pago.");
    setSaving(false);
  }
  async function onCancel(c) {
    if (!await confirmDialog(`¿Cancelar el cargo "${c.concept}" de ${c.student_name}?`, { tone: "danger", confirmText: "Cancelar cargo", cancelText: "Volver" })) return;
    const fd = new FormData();
    fd.set("action", "cancel");
    const res = await fetch(`/api/charges/${c.id}`, { method: "PATCH", body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    void alertDialog("No se pudo cancelar el cargo.");
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("section", { className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-white/40", children: "Pagado" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-3xl font-bold text-emerald-200", children: [
          "$",
          mxn.format(summary.paid)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-white/40", children: "Pendiente" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-3xl font-bold", children: [
          "$",
          mxn.format(summary.pending)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-white/40", children: "Vencido" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-3xl font-bold text-red-200", children: [
          "$",
          mxn.format(summary.overdue)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-wrap items-center gap-2", children: [
      FILTERS.map((f) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setFilter(f.key),
          className: `rounded-full px-4 py-1.5 text-sm transition ${filter === f.key ? "bg-cream font-medium text-slate-900 shadow" : "glass-soft text-white/60 hover:text-white"}`,
          children: f.label
        },
        f.key
      )),
      canManage && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onGenerate,
          disabled: generating,
          className: "bg-cream ml-auto rounded-full px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50",
          children: generating ? "Generando…" : "Generar cargos del mes"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-white/10 p-4", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          placeholder: "Buscar por alumno o concepto…",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          className: "w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Alumno" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Concepto" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Monto" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Vence" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Estatus" }),
          canManage && /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtered.map((c) => /* @__PURE__ */ jsxs(
            "tr",
            {
              className: "border-t border-white/10 transition hover:bg-white/5",
              children: [
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: `/dashboard/alumnos/${c.student_id}`,
                      className: "text-white/90 hover:underline underline-offset-4",
                      children: c.student_name
                    }
                  ),
                  c.group_name && /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40", children: c.group_name })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: c.concept }),
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3 text-white/90", children: [
                  "$",
                  mxn.format(c.amount_due)
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-white/70", children: (/* @__PURE__ */ new Date(c.due_date + "T00:00:00")).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short"
                }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `rounded-full px-3 py-1 text-xs ${STATUS_STYLES[c.status]}`,
                    children: STATUS_LABELS[c.status]
                  }
                ) }),
                canManage && /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                  c.status === "paid" && /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: `/api/charges/${c.id}/receipt`,
                      target: "_blank",
                      rel: "noopener",
                      className: "rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white",
                      children: "🧾 Recibo"
                    }
                  ),
                  (c.status === "pending" || c.status === "overdue") && /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setPaying(c),
                        className: "rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/25",
                        children: "Registrar pago"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => onCancel(c),
                        title: "Cancelar cargo",
                        className: "flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200",
                        children: "✕"
                      }
                    )
                  ] })
                ] })
              ]
            },
            c.id
          )),
          filtered.length === 0 && /* @__PURE__ */ jsx("tr", { className: "border-t border-white/10", children: /* @__PURE__ */ jsx(
            "td",
            {
              colSpan: canManage ? 6 : 5,
              className: "px-5 py-10 text-center text-white/40",
              children: 'Sin cargos. Usa "Generar cargos del mes" para crearlos desde las inscripciones activas.'
            }
          ) })
        ] })
      ] }) })
    ] }),
    paying && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm",
          onClick: (e) => e.target === e.currentTarget && setPaying(null),
          children: /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: onPay,
              className: "modal-panel my-auto w-full max-w-sm space-y-4 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold tracking-tight", children: "Registrar pago" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setPaying(null),
                      className: "flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white",
                      "aria-label": "Cerrar",
                      children: "✕"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-white/5 p-4 text-sm", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-white/90", children: paying.student_name }),
                  /* @__PURE__ */ jsx("p", { className: "text-white/50", children: paying.concept })
                ] }),
                error && /* @__PURE__ */ jsx("p", { className: "rounded-xl bg-red-400/15 p-3 text-sm text-red-200", children: error }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Monto $",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      name: "amount",
                      min: "0.01",
                      step: "0.01",
                      required: true,
                      defaultValue: paying.amount_due,
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Método de pago",
                  /* @__PURE__ */ jsx("select", { name: "method", required: true, className: inputClass, children: METHOD_OPTIONS.map((m) => /* @__PURE__ */ jsx("option", { value: m.value, className: "text-slate-900", children: m.label }, m.value)) })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "block text-sm text-white/70", children: [
                  "Referencia (opcional)",
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      name: "provider_ref",
                      placeholder: "Folio, núm. de transferencia…",
                      className: inputClass
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setPaying(null),
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
                      children: saving ? "Registrando…" : "Confirmar pago"
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
  const canManage = ["superadmin", "branch_admin", "coordinator"].includes(role);
  const { data: charges } = await supabase.from("charges").select(
    "id, student_id, concept, amount_due, due_date, status, students(first_name, last_name), enrollments(groups(name))"
  ).order("due_date", { ascending: false }).limit(300);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const rows = (charges ?? []).map((c) => {
    const s = one(c.students);
    const enr = one(c.enrollments);
    const g = one(enr?.groups ?? null);
    return {
      id: c.id,
      student_id: c.student_id,
      student_name: s ? `${s.last_name}, ${s.first_name}` : "—",
      group_name: g?.name ?? null,
      concept: c.concept,
      amount_due: Number(c.amount_due),
      due_date: c.due_date,
      status: c.status
    };
  });
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Pagos y cobranza" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "PaymentsView", PaymentsView, { "client:load": true, "charges": rows, "canManage": canManage, "client:component-hydration": "load", "client:component-path": "@/components/PaymentsView", "client:component-export": "default" })} ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/pagos/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/pagos/index.astro";
const $$url = "/dashboard/pagos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
