import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, _ as addAttribute, F as Fragment, u as maybeRenderHead } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { a as alertDialog } from './dialog_CWCWZkCC.mjs';

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}
function NotificationsBell({ items }) {
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const ref = useRef(null);
  const unreadCount = items.filter((n) => n.unread).length;
  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  async function markAllRead() {
    setMarking(true);
    const res = await fetch("/api/notifications/read", { method: "POST" });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setMarking(false);
    void alertDialog("No se pudieron marcar como leídos.");
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((o) => !o),
        "aria-label": "Avisos",
        "aria-expanded": open,
        className: "relative grid h-9 w-9 place-items-center rounded-full bg-white/5 text-base transition hover:bg-white/10",
        children: [
          /* @__PURE__ */ jsx("span", { className: unreadCount > 0 ? "bell-ring" : "", children: "🔔" }),
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "bg-cream absolute -right-0.5 -top-0.5 grid h-4 min-w-4 animate-pulse place-items-center rounded-full px-1 text-[10px] font-bold text-slate-900", children: unreadCount })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "dropdown-in notif-panel fixed inset-x-3 top-[4.75rem] z-50 mx-auto w-auto max-w-sm rounded-3xl p-4 text-white shadow-2xl shadow-black/40 sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:top-full sm:mx-0 sm:mt-2 sm:w-80 sm:max-w-[calc(100vw-2rem)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-medium text-white/90", children: [
          "🔔 Avisos",
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "bg-cream ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-slate-900", children: unreadCount })
        ] }),
        unreadCount > 0 && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: markAllRead,
            disabled: marking,
            className: "text-xs text-white/50 transition hover:text-white disabled:opacity-50",
            children: marking ? "Marcando…" : "Marcar leídos"
          }
        )
      ] }),
      items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-5 mb-2 text-center text-sm text-white/40", children: "Sin avisos por ahora 🌊" }) : /* @__PURE__ */ jsx("ul", { className: "mt-3 max-h-[22rem] space-y-2 overflow-y-auto pr-1", children: items.map((n) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: `rounded-2xl p-3 ${n.unread ? "bg-white/10" : "bg-white/[0.03] opacity-70"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white/90", children: n.title }),
              /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-white/35", children: timeAgo(n.created_at) })
            ] }),
            n.body && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-white/60", children: n.body })
          ]
        },
        n.id
      )) })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { supabase, session } = Astro2.locals;
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const { data: orgRow } = await supabase.from("org_settings").select("school_name, logo_url").eq("id", true).single();
  const org = orgRow ?? { school_name: "Escuela de Natación", logo_url: null };
  const monthStart = /* @__PURE__ */ new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  const WEEKDAYS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const [childrenQ, notificationsQ] = await Promise.all([
    supabase.from("students").select("id, first_name, last_name, birth_date, photo_url, levels(name)").order("first_name"),
    supabase.from("notifications").select("id, title, body, created_at, read_at").order("created_at", { ascending: false }).limit(20)
  ]);
  const children = childrenQ.data ?? [];
  async function loadExpediente(childId) {
    const [enrollmentsQ, attendanceQ, attendanceMonthQ, evaluationsQ, chargesQ] = await Promise.all([
      supabase.from("enrollments").select("status, groups(name, is_active, group_schedules(weekday, start_time, end_time))").eq("student_id", childId).in("status", ["active", "waitlisted"]),
      supabase.from("attendance").select("class_date, groups(name)").eq("student_id", childId).order("class_date", { ascending: false }).limit(8),
      supabase.from("attendance").select("*", { count: "exact", head: true }).eq("student_id", childId).gte("class_date", monthStartStr),
      supabase.from("evaluations").select(
        "id, evaluated_at, passed_level, notes, levels(name), evaluation_scores(result, skills(name))"
      ).eq("student_id", childId).order("evaluated_at", { ascending: false }).limit(10),
      supabase.from("charges").select("id, concept, amount_due, due_date, status").eq("student_id", childId).neq("status", "cancelled").order("due_date", { ascending: false }).limit(12)
    ]);
    const groups = (enrollmentsQ.data ?? []).map((e) => {
      const g = one(e.groups);
      if (!g || !g.is_active) return null;
      const sched = (g.group_schedules ?? []).slice().sort((a, b) => a.weekday - b.weekday);
      const schedule = sched.map((s) => `${WEEKDAYS_SHORT[s.weekday]} ${s.start_time.slice(0, 5)}`).join(" · ");
      return {
        name: g.name,
        waitlisted: e.status === "waitlisted",
        schedule,
        scheduleRaw: sched
      };
    }).filter((g) => g !== null);
    const charges = chargesQ.data ?? [];
    const pendingCharges = charges.filter(
      (c) => c.status === "pending" || c.status === "overdue"
    );
    const paidCharges = charges.filter((c) => c.status === "paid").slice(0, 5);
    return {
      groups,
      attendance: attendanceQ.data ?? [],
      attendanceMonth: attendanceMonthQ.count ?? 0,
      evaluations: evaluationsQ.data ?? [],
      pendingCharges,
      paidCharges
    };
  }
  const expedientes = await Promise.all(children.map((c) => loadExpediente(c.id)));
  const kids = children.map((c, i) => ({ ...c, exp: expedientes[i] }));
  const avisos = (notificationsQ.data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    created_at: n.created_at,
    unread: n.read_at === null
  }));
  const activeClasses = expedientes.reduce((s, e) => s + e.groups.length, 0);
  const attendanceMonth = expedientes.reduce((s, e) => s + e.attendanceMonth, 0);
  const allPending = expedientes.flatMap((e) => e.pendingCharges);
  const pendingTotal = allPending.reduce((s, c) => s + Number(c.amount_due), 0);
  const hasOverdue = allPending.some((c) => c.status === "overdue");
  const now = /* @__PURE__ */ new Date();
  const nowDow = now.getDay();
  const nowTime = now.toTimeString().slice(0, 5);
  let nextClass = null;
  for (const k of kids) {
    for (const g of k.exp.groups) {
      if (g.waitlisted) continue;
      for (const s of g.scheduleRaw) {
        let inDays = (s.weekday - nowDow + 7) % 7;
        const time = s.start_time.slice(0, 5);
        if (inDays === 0 && time < nowTime) inDays = 7;
        const score = inDays * 1e4 + parseInt(time.replace(":", ""), 10);
        const currentScore = nextClass ? nextClass.inDays * 1e4 + 9999 : Infinity;
        if (!nextClass || score < currentScore) {
          const dayLabel = inDays === 0 ? "Hoy" : inDays === 1 ? "Mañana" : WEEKDAYS_FULL[s.weekday];
          nextClass = { label: `${dayLabel} · ${g.name}`, child: k.first_name, time, inDays };
        }
      }
    }
  }
  const fmtDate = (d) => (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  const ageOf = (d) => Math.floor((Date.now() - new Date(d).getTime()) / (365.25 * 24 * 3600 * 1e3));
  const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
  const firstName = session?.profile.full_name.split(" ")[0] ?? "";
  const initial = firstName.charAt(0).toUpperCase() || "🙂";
  const today = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const stats = [
    { label: "Nadadores", value: children.length, icon: "🏊" },
    { label: "Asistencias del mes", value: attendanceMonth, icon: "📅" },
    { label: "Clases activas", value: activeClasses, icon: "🌊" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Portal de padres" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="dash-bg fixed inset-0 -z-10"></div> <div class="mx-auto max-w-5xl p-4 text-white sm:p-6 lg:p-8"> <!-- Top bar --> <header class="glass relative z-50 flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6"> <div class="flex items-center gap-2.5"> ', " ", ' </div> <div class="flex items-center gap-3"> ', ' <span class="bg-cream/90 grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-slate-900"> ', ' </span> <form method="post" action="/api/auth/signout"> <button class="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">\nSalir\n</button> </form> </div> </header> <!-- Saludo --> <div class="mt-7 sm:mt-9"> <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Hola, ', ' 👋</h1> <p class="mt-1 text-sm capitalize text-white/45">', '</p> </div> <!-- Stats --> <section class="mt-6 grid grid-cols-3 gap-3 sm:gap-4"> ', ' </section> <div class="mt-4 grid gap-4 lg:grid-cols-3"> <!-- Expediente inline --> <div class="lg:col-span-2"> ', ' </div> <!-- Aside: próxima clase + pagos + avisos --> <div class="space-y-4"> <section class="glass rounded-3xl p-5"> <p class="text-xs uppercase tracking-wide text-white/40">Próxima clase</p> ', " </section> <section", '> <p class="text-xs uppercase tracking-wide text-white/40">Pagos pendientes</p> <p', ">\n$", ' </p> <p class="mt-1 text-xs text-white/45"> ', " </p> </section> </div> </div> </div> <script>\n    document.querySelectorAll('[data-tab]').forEach((btn) => {\n      btn.addEventListener('click', () => {\n        const id = btn.getAttribute('data-tab');\n        document\n          .querySelectorAll('[data-tab]')\n          .forEach((b) => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));\n        document\n          .querySelectorAll('[data-panel]')\n          .forEach((p) => p.classList.toggle('hidden', p.getAttribute('data-panel') !== id));\n      });\n    });\n  <\/script> "])), maybeRenderHead(), org.logo_url ? renderTemplate`<img${addAttribute(org.logo_url, "src")}${addAttribute(org.school_name, "alt")} class="h-14 w-auto max-w-[280px] object-contain">` : renderTemplate`<span class="bg-cream flex h-11 w-11 items-center justify-center rounded-full text-lg">
🏊
</span>`, !org.logo_url && renderTemplate`<span class="text-sm font-semibold tracking-tight sm:text-base"> ${org.school_name} </span>`, renderComponent($$result2, "NotificationsBell", NotificationsBell, { "client:load": true, "items": avisos, "client:component-hydration": "load", "client:component-path": "@/components/NotificationsBell", "client:component-export": "default" }), initial, firstName, today, stats.map((s) => renderTemplate`<div class="glass rounded-3xl p-4 sm:p-5"> <div class="flex items-start justify-between"> <span class="text-3xl font-bold sm:text-5xl">${s.value}</span> <span class="grid h-9 w-9 place-items-center rounded-2xl bg-white/5 text-lg"> ${s.icon} </span> </div> <p class="mt-1 text-xs text-white/45 sm:text-sm">${s.label}</p> </div>`), kids.length === 0 ? renderTemplate`<section class="glass rounded-3xl p-8 text-center"> <p class="text-3xl">🌊</p> <p class="mt-3 text-white/60">No hay nadadores vinculados a tu cuenta.</p> <p class="mt-1 text-sm text-white/40">
Pide en recepción que vinculen a tus hijos con tu correo.
</p> </section>` : renderTemplate`<section class="glass rounded-3xl p-4 sm:p-5"> <h2 class="px-1 text-sm font-medium uppercase tracking-wide text-white/50">
Expediente
</h2>  <div class="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist"> ${kids.map((k, i) => renderTemplate`<button type="button"${addAttribute(k.id, "data-tab")}${addAttribute(i === 0 ? "true" : "false", "aria-selected")} class="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 aria-selected:border-transparent aria-selected:bg-cream aria-selected:text-slate-900 aria-selected:font-semibold"> ${k.photo_url ? renderTemplate`<img${addAttribute(k.photo_url, "src")} alt="" class="h-6 w-6 rounded-full object-cover">` : renderTemplate`<span class="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs">
🏊
</span>`} ${k.first_name} </button>`)} </div>  ${kids.map((k, i) => {
    const ex = k.exp;
    const level = one(k.levels);
    return renderTemplate`<div${addAttribute(k.id, "data-panel")}${addAttribute(i === 0 ? "mt-4" : "mt-4 hidden", "class")}>  <div class="flex items-center gap-3 rounded-2xl bg-white/5 p-3"> ${k.photo_url ? renderTemplate`<img${addAttribute(k.photo_url, "src")} alt="" class="h-12 w-12 rounded-full border border-white/20 object-cover">` : renderTemplate`<span class="bg-cream grid h-12 w-12 place-items-center rounded-full text-xl">
🏊
</span>`} <div> <p class="font-semibold text-white/90"> ${k.first_name} ${k.last_name} </p> <p class="text-xs text-white/50"> ${ageOf(k.birth_date)} años · ${level?.name ?? "Sin nivel"} </p> </div> </div> <div class="mt-3 grid gap-3 sm:grid-cols-2">  <div class="glass-soft rounded-2xl p-4"> <h3 class="text-sm font-medium text-white/80">Clases</h3> <ul class="mt-2 space-y-2"> ${ex.groups.map((g) => renderTemplate`<li class="rounded-xl bg-white/5 p-2.5"> <p class="text-sm text-white/90"> ${g.name} ${g.waitlisted && renderTemplate`<span class="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">
lista de espera
</span>`} </p> <p class="mt-0.5 text-xs text-white/45"> ${g.schedule || "Sin horario"} </p> </li>`)} ${ex.groups.length === 0 && renderTemplate`<li class="py-1 text-sm text-white/40">Sin clases activas.</li>`} </ul> </div>  <div class="glass-soft rounded-2xl p-4"> <div class="flex items-center justify-between"> <h3 class="text-sm font-medium text-white/80">Asistencia</h3> <span class="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs text-emerald-200"> ${ex.attendanceMonth} este mes
</span> </div> <ul class="mt-2 space-y-1.5"> ${ex.attendance.map((a) => renderTemplate`<li class="flex items-center justify-between text-sm"> <span class="text-white/70"> ${one(a.groups)?.name ?? "—"} </span> <span class="text-xs text-white/40">${fmtDate(a.class_date)}</span> </li>`)} ${ex.attendance.length === 0 && renderTemplate`<li class="py-1 text-sm text-white/40">Sin asistencias.</li>`} </ul> </div>  <div class="glass-soft rounded-2xl p-4"> <h3 class="text-sm font-medium text-white/80">Progreso</h3> <ul class="mt-2 space-y-3"> ${ex.evaluations.map((ev) => {
      const l = one(ev.levels);
      const scores = ev.evaluation_scores ?? [];
      const logradas = scores.filter((s) => s.result === "achieved").length;
      return renderTemplate`<li> <details class="group"> <summary class="cursor-pointer list-none"> <div class="flex items-center justify-between gap-3 text-sm"> <span class="text-white/90"> ${l?.name ?? "—"} <span class="ml-1 inline-block text-white/30 transition group-open:rotate-90">
›
</span> </span> <span${addAttribute(`rounded-full px-2.5 py-0.5 text-xs ${ev.passed_level ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/60"}`, "class")}> ${ev.passed_level ? "Aprobado 🎉" : `${logradas}/${scores.length} logradas`} </span> </div> <p class="mt-0.5 text-xs text-white/35"> ${fmtDate(ev.evaluated_at)} ${ev.notes ? ` · ${ev.notes}` : ""} </p> </summary> <ul class="mt-2 space-y-1 rounded-xl bg-white/5 p-2.5"> ${scores.map((sc) => {
        const sk = one(sc.skills);
        const dot = sc.result === "achieved" ? "🟢" : sc.result === "in_progress" ? "🟡" : "⚪";
        return renderTemplate`<li class="flex items-center justify-between gap-2 text-xs"> <span class="text-white/70">${sk?.name ?? "—"}</span> <span>${dot}</span> </li>`;
      })} </ul> </details> </li>`;
    })} ${ex.evaluations.length === 0 && renderTemplate`<li class="py-1 text-sm text-white/40">Aún no hay evaluaciones.</li>`} </ul> </div>  <div class="glass-soft rounded-2xl p-4"> <h3 class="text-sm font-medium text-white/80">Estado de cuenta</h3> ${ex.pendingCharges.length > 0 ? renderTemplate`<ul class="mt-2 space-y-2"> ${ex.pendingCharges.map((c) => renderTemplate`<li${addAttribute(`flex items-center justify-between gap-3 rounded-xl p-2.5 text-sm ${c.status === "overdue" ? "bg-red-400/10" : "bg-white/5"}`, "class")}> <div> <p class="text-white/90">${c.concept}</p> <p${addAttribute(`text-xs ${c.status === "overdue" ? "text-red-200" : "text-white/40"}`, "class")}> ${c.status === "overdue" ? "Vencido — " : "Vence "} ${fmtDate(c.due_date)} </p> </div> <span class="font-semibold">
$${mxn.format(Number(c.amount_due))} </span> </li>`)} </ul>` : renderTemplate`<p class="mt-2 rounded-xl bg-emerald-400/10 p-2.5 text-sm text-emerald-200">
✅ Al corriente.
</p>`} ${ex.paidCharges.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-white/35">
Pagados recientes
</p> <ul class="mt-1.5 space-y-1.5"> ${ex.paidCharges.map((c) => renderTemplate`<li class="flex items-center justify-between gap-3 text-sm"> <span class="text-white/60">${c.concept}</span> <span class="flex items-center gap-3"> <span class="text-white/40">
$${mxn.format(Number(c.amount_due))} </span> <a${addAttribute(`/api/charges/${c.id}/receipt`, "href")} target="_blank" rel="noopener" class="text-xs text-white/50 underline-offset-4 hover:text-white hover:underline">
Recibo
</a> </span> </li>`)} </ul> ` })}`} </div> </div> </div>`;
  })} </section>`, nextClass ? renderTemplate`<div class="mt-3 flex items-center gap-4"> <span class="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brand-500/50 bg-brand-500/15 text-sm font-bold"> ${nextClass.time} </span> <div class="min-w-0"> <p class="text-sm font-semibold leading-snug">${nextClass.label}</p> ${nextClass.child && renderTemplate`<p class="mt-0.5 text-xs text-white/45">${nextClass.child}</p>`} </div> </div>` : renderTemplate`<p class="mt-3 text-sm text-white/40">Sin clases programadas</p>`, addAttribute(`glass rounded-3xl p-5 ${hasOverdue ? "border border-red-300/30" : ""}`, "class"), addAttribute(`mt-1 text-3xl font-bold ${hasOverdue ? "text-red-200" : ""}`, "class"), mxn.format(pendingTotal), allPending.length === 0 ? "Al corriente ✅" : `${allPending.length} cargo${allPending.length > 1 ? "s" : ""}${hasOverdue ? " · hay vencidos" : ""}`) })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/portal/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/portal/index.astro";
const $$url = "/portal";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
