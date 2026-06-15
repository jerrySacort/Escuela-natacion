import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_BOjAT_3f.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { supabase } = Astro2.locals;
  const now = /* @__PURE__ */ new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
  const weekAgo = new Date(Date.now() - 6 * 24 * 3600 * 1e3).toISOString().slice(0, 10);
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const [paymentsQ, chargesQ, studentsQ, attendanceQ] = await Promise.all([
    supabase.from("payments").select("amount, paid_at").gte("paid_at", sixMonthsAgo),
    supabase.from("charges").select("amount_due, status").gte("created_at", firstOfMonth),
    supabase.from("students").select("level_id, is_active, levels(name)").eq("is_active", true),
    supabase.from("attendance").select("class_date").gte("class_date", weekAgo)
  ]);
  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const monthKeys = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const incomeByMonth = new Map(monthKeys.map((k) => [k, 0]));
  for (const p of paymentsQ.data ?? []) {
    const k = p.paid_at?.slice(0, 7);
    if (k && incomeByMonth.has(k)) {
      incomeByMonth.set(k, (incomeByMonth.get(k) ?? 0) + Number(p.amount));
    }
  }
  const incomeBars = monthKeys.map((k) => ({
    label: MONTHS[parseInt(k.slice(5), 10) - 1],
    value: incomeByMonth.get(k) ?? 0
  }));
  const maxIncome = Math.max(1, ...incomeBars.map((b) => b.value));
  const charges = chargesQ.data ?? [];
  const sumBy = (st) => charges.filter((c) => c.status === st).reduce((s, c) => s + Number(c.amount_due), 0);
  const cobranza = [
    { label: "Pagado", value: sumBy("paid"), cls: "bg-emerald-400/70" },
    { label: "Pendiente", value: sumBy("pending"), cls: "bg-white/40" },
    { label: "Vencido", value: sumBy("overdue"), cls: "bg-red-400/70" }
  ];
  const totalCobranza = Math.max(1, cobranza.reduce((s, c) => s + c.value, 0));
  const levelCounts = /* @__PURE__ */ new Map();
  for (const s of studentsQ.data ?? []) {
    const name = one(s.levels)?.name ?? "Sin nivel";
    levelCounts.set(name, (levelCounts.get(name) ?? 0) + 1);
  }
  const levelBars = [...levelCounts.entries()].sort((a, b) => b[1] - a[1]);
  const maxLevel = Math.max(1, ...levelBars.map(([, v]) => v));
  const dayKeys = [];
  for (let i = 6; i >= 0; i--) {
    dayKeys.push(new Date(Date.now() - i * 24 * 3600 * 1e3).toISOString().slice(0, 10));
  }
  const attByDay = new Map(dayKeys.map((k) => [k, 0]));
  for (const a of attendanceQ.data ?? []) {
    if (attByDay.has(a.class_date)) {
      attByDay.set(a.class_date, (attByDay.get(a.class_date) ?? 0) + 1);
    }
  }
  const DAYS = ["D", "L", "M", "X", "J", "V", "S"];
  const attBars = dayKeys.map((k) => ({
    label: DAYS[(/* @__PURE__ */ new Date(k + "T00:00:00")).getDay()],
    value: attByDay.get(k) ?? 0
  }));
  const maxAtt = Math.max(1, ...attBars.map((b) => b.value));
  const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
  const exports = [
    { type: "alumnos", label: "Alumnos" },
    { type: "cargos", label: "Cargos" },
    { type: "pagos", label: "Pagos" },
    { type: "asistencia", label: "Asistencia" }
  ];
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Reportes" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="-mt-2 mb-6 flex flex-wrap items-center gap-2"> <span class="text-sm text-white/50">Exportar CSV:</span> ${exports.map((e) => renderTemplate`<a${addAttribute(`/api/reports/export?type=${e.type}`, "href")} class="glass-soft rounded-full px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/15 hover:text-white">
⬇ ${e.label} </a>`)} </div> <div class="grid grid-cols-1 gap-6 lg:grid-cols-2"> <!-- Ingresos por mes --> <div class="glass-soft rounded-3xl p-6"> <h2 class="font-medium text-white/80">Ingresos — últimos 6 meses</h2> <div class="mt-6 flex h-44 items-end gap-3"> ${incomeBars.map((b) => renderTemplate`<div class="flex flex-1 flex-col items-center gap-2"> <span class="text-xs text-white/60">$${mxn.format(b.value)}</span> <div class="w-full rounded-t-xl bg-gradient-to-t from-brand-500/60 to-brand-500"${addAttribute(`height: ${Math.max(4, b.value / maxIncome * 130)}px`, "style")}></div> <span class="text-xs capitalize text-white/40">${b.label}</span> </div>`)} </div> </div> <!-- Cobranza del mes --> <div class="glass-soft rounded-3xl p-6"> <h2 class="font-medium text-white/80">Cobranza del mes</h2> <div class="mt-6 flex h-3 overflow-hidden rounded-full bg-white/10"> ${cobranza.map((c) => renderTemplate`<div${addAttribute(c.cls, "class")}${addAttribute(`width: ${c.value / totalCobranza * 100}%`, "style")}></div>`)} </div> <ul class="mt-5 space-y-3"> ${cobranza.map((c) => renderTemplate`<li class="flex items-center justify-between text-sm"> <span class="flex items-center gap-2 text-white/70"> <span${addAttribute(`h-2.5 w-2.5 rounded-full ${c.cls}`, "class")}></span> ${c.label} </span> <span class="font-semibold text-white/90">$${mxn.format(c.value)}</span> </li>`)} </ul> </div> <!-- Alumnos por nivel --> <div class="glass-soft rounded-3xl p-6"> <h2 class="font-medium text-white/80">Alumnos activos por nivel</h2> <ul class="mt-5 space-y-3"> ${levelBars.map(([name, count]) => renderTemplate`<li> <div class="flex justify-between text-sm"> <span class="text-white/70">${name}</span> <span class="text-white/90">${count}</span> </div> <div class="mt-1 h-2 overflow-hidden rounded-full bg-white/10"> <div class="bg-cream h-full rounded-full"${addAttribute(`width: ${count / maxLevel * 100}%`, "style")}></div> </div> </li>`)} ${levelBars.length === 0 && renderTemplate`<li class="py-2 text-sm text-white/40">Sin alumnos activos.</li>`} </ul> </div> <!-- Asistencias de la semana --> <div class="glass-soft rounded-3xl p-6"> <h2 class="font-medium text-white/80">Asistencias — últimos 7 días</h2> <div class="mt-6 flex h-44 items-end gap-3"> ${attBars.map((b) => renderTemplate`<div class="flex flex-1 flex-col items-center gap-2"> <span class="text-xs text-white/60">${b.value}</span> <div class="w-full rounded-t-xl bg-gradient-to-t from-emerald-400/40 to-emerald-400/80"${addAttribute(`height: ${Math.max(4, b.value / maxAtt * 130)}px`, "style")}></div> <span class="text-xs text-white/40">${b.label}</span> </div>`)} </div> </div> </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/reportes/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/reportes/index.astro";
const $$url = "/dashboard/reportes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
