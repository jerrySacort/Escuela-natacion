import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute, F as Fragment } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { supabase } = Astro2.locals;
  const { id } = Astro2.params;
  const { data: student } = await supabase.from("students").select("id, first_name, last_name, birth_date, photo_url, levels(name)").eq("id", id).single();
  if (!student) return Astro2.redirect("/portal");
  const monthStart = /* @__PURE__ */ new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  const [enrollmentsQ, attendanceQ, attendanceMonthQ, evaluationsQ, chargesQ] = await Promise.all([
    supabase.from("enrollments").select("status, groups(name, is_active, group_schedules(weekday, start_time, end_time))").eq("student_id", id).in("status", ["active", "waitlisted"]),
    supabase.from("attendance").select("class_date, groups(name)").eq("student_id", id).order("class_date", { ascending: false }).limit(8),
    supabase.from("attendance").select("*", { count: "exact", head: true }).eq("student_id", id).gte("class_date", monthStartStr),
    supabase.from("evaluations").select(
      "id, evaluated_at, passed_level, notes, levels(name), evaluation_scores(result, skills(name))"
    ).eq("student_id", id).order("evaluated_at", { ascending: false }).limit(10),
    supabase.from("charges").select("id, concept, amount_due, due_date, status").eq("student_id", id).neq("status", "cancelled").order("due_date", { ascending: false }).limit(12)
  ]);
  const one = (v) => Array.isArray(v) ? v[0] ?? null : v;
  const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const level = one(student.levels);
  const age = Math.floor(
    (Date.now() - new Date(student.birth_date).getTime()) / (365.25 * 24 * 3600 * 1e3)
  );
  const groups = (enrollmentsQ.data ?? []).map((e) => {
    const g = one(e.groups);
    if (!g || !g.is_active) return null;
    const schedule = (g.group_schedules ?? []).sort((a, b) => a.weekday - b.weekday).map((s) => `${WEEKDAYS[s.weekday]} ${s.start_time.slice(0, 5)}`).join(" · ");
    return { name: g.name, waitlisted: e.status === "waitlisted", schedule };
  }).filter((g) => g !== null);
  const fmtDate = (d) => (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short"
  });
  const charges = chargesQ.data ?? [];
  const pendingCharges = charges.filter(
    (c) => c.status === "pending" || c.status === "overdue"
  );
  const paidCharges = charges.filter((c) => c.status === "paid").slice(0, 5);
  const evaluations = evaluationsQ.data ?? [];
  const mxn = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
  const attendanceMonth = attendanceMonthQ.count ?? 0;
  const stats = [
    { label: "Asistencias del mes", value: attendanceMonth, icon: "📅" },
    { label: "Clases activas", value: groups.length, icon: "🌊" },
    { label: "Cargos pendientes", value: pendingCharges.length, icon: "💳" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${student.first_name} — Portal` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="mx-auto max-w-5xl p-4 text-white sm:p-6 lg:p-8"> <a href="/portal" class="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
← Portal
</a> <!-- Hero --> <section class="relative mt-4 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-brand-500/45 via-brand-600/30 to-brand-700/45 p-5 sm:p-6"> <div class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div> <div class="relative flex items-center gap-4 sm:gap-5"> ${student.photo_url ? renderTemplate`<img${addAttribute(student.photo_url, "src")} alt="" class="h-20 w-20 rounded-2xl border-2 border-white/25 object-cover sm:h-24 sm:w-24">` : renderTemplate`<span class="bg-cream grid h-20 w-20 place-items-center rounded-2xl text-3xl sm:h-24 sm:w-24">
🏊
</span>`} <div class="min-w-0"> <h1 class="truncate text-2xl font-bold tracking-tight sm:text-3xl"> ${student.first_name} ${student.last_name} </h1> <div class="mt-2 flex flex-wrap gap-2"> <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-medium"> ${age} años
</span> <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-medium"> ${level?.name ?? "Sin nivel"} </span> </div> </div> </div> </section> <!-- Stats --> <section class="mt-4 grid grid-cols-3 gap-3 sm:gap-4"> ${stats.map((s) => renderTemplate`<div class="glass rounded-3xl p-4 sm:p-5"> <div class="flex items-start justify-between"> <span class="text-3xl font-bold sm:text-4xl">${s.value}</span> <span class="grid h-9 w-9 place-items-center rounded-2xl bg-white/5 text-lg"> ${s.icon} </span> </div> <p class="mt-1 text-xs text-white/45 sm:text-sm">${s.label}</p> </div>`)} </section> <!-- Grid --> <div class="mt-4 grid gap-4 lg:grid-cols-2"> <!-- Clases --> <section class="glass rounded-3xl p-5"> <h2 class="font-medium text-white/80">Clases</h2> <ul class="mt-3 space-y-2"> ${groups.map((g) => renderTemplate`<li class="rounded-2xl bg-white/5 p-3"> <p class="text-sm text-white/90"> ${g.name} ${g.waitlisted && renderTemplate`<span class="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">
lista de espera
</span>`} </p> <p class="mt-0.5 text-xs text-white/45">${g.schedule || "Sin horario"}</p> </li>`)} ${groups.length === 0 && renderTemplate`<li class="py-1 text-sm text-white/40">Sin clases activas.</li>`} </ul> </section> <!-- Asistencia --> <section class="glass rounded-3xl p-5"> <div class="flex items-center justify-between"> <h2 class="font-medium text-white/80">Asistencia</h2> <span class="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200"> ${attendanceMonth} este mes
</span> </div> <ul class="mt-3 space-y-1.5"> ${(attendanceQ.data ?? []).map((a) => renderTemplate`<li class="flex items-center justify-between text-sm"> <span class="text-white/70"> ${one(a.groups)?.name ?? "—"} </span> <span class="text-xs text-white/40">${fmtDate(a.class_date)}</span> </li>`)} ${(attendanceQ.data ?? []).length === 0 && renderTemplate`<li class="py-1 text-sm text-white/40">Sin asistencias registradas.</li>`} </ul> </section> <!-- Progreso --> <section class="glass rounded-3xl p-5"> <h2 class="font-medium text-white/80">Progreso</h2> <ul class="mt-3 space-y-3"> ${evaluations.map((ev) => {
    const l = one(ev.levels);
    const scores = ev.evaluation_scores ?? [];
    const logradas = scores.filter((s) => s.result === "achieved").length;
    return renderTemplate`<li> <details class="group"> <summary class="cursor-pointer list-none"> <div class="flex items-center justify-between gap-3 text-sm"> <span class="text-white/90"> ${l?.name ?? "—"} <span class="ml-1 inline-block text-white/30 transition group-open:rotate-90">
›
</span> </span> <span${addAttribute(`rounded-full px-3 py-1 text-xs ${ev.passed_level ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/60"}`, "class")}> ${ev.passed_level ? "Aprobado 🎉" : `${logradas}/${scores.length} logradas`} </span> </div> <p class="mt-0.5 text-xs text-white/35"> ${fmtDate(ev.evaluated_at)} ${ev.notes ? ` · ${ev.notes}` : ""} </p> </summary> <ul class="mt-2 space-y-1 rounded-2xl bg-white/5 p-3"> ${scores.map((sc) => {
      const sk = one(sc.skills);
      const dot = sc.result === "achieved" ? "🟢" : sc.result === "in_progress" ? "🟡" : "⚪";
      return renderTemplate`<li class="flex items-center justify-between gap-2 text-xs"> <span class="text-white/70">${sk?.name ?? "—"}</span> <span>${dot}</span> </li>`;
    })} </ul> </details> </li>`;
  })} ${evaluations.length === 0 && renderTemplate`<li class="py-1 text-sm text-white/40">Aún no hay evaluaciones.</li>`} </ul> </section> <!-- Estado de cuenta --> <section class="glass rounded-3xl p-5"> <h2 class="font-medium text-white/80">Estado de cuenta</h2> ${pendingCharges.length > 0 ? renderTemplate`<ul class="mt-3 space-y-2"> ${pendingCharges.map((c) => renderTemplate`<li${addAttribute(`flex items-center justify-between gap-3 rounded-2xl p-3 text-sm ${c.status === "overdue" ? "bg-red-400/10" : "bg-white/5"}`, "class")}> <div> <p class="text-white/90">${c.concept}</p> <p${addAttribute(`text-xs ${c.status === "overdue" ? "text-red-200" : "text-white/40"}`, "class")}> ${c.status === "overdue" ? "Vencido — " : "Vence "} ${fmtDate(c.due_date)} </p> </div> <span class="font-semibold">$${mxn.format(Number(c.amount_due))}</span> </li>`)} </ul>` : renderTemplate`<p class="mt-3 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-200">
✅ Al corriente — sin pagos pendientes.
</p>`} ${paidCharges.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-white/35">
Pagados recientes
</p> <ul class="mt-2 space-y-1.5"> ${paidCharges.map((c) => renderTemplate`<li class="flex items-center justify-between gap-3 text-sm"> <span class="text-white/60">${c.concept}</span> <span class="flex items-center gap-3"> <span class="text-white/40">$${mxn.format(Number(c.amount_due))}</span> <a${addAttribute(`/api/charges/${c.id}/receipt`, "href")} target="_blank" rel="noopener" class="text-xs text-white/50 underline-offset-4 hover:text-white hover:underline">
Recibo
</a> </span> </li>`)} </ul> ` })}`} <p class="mt-4 text-xs text-white/30">
Los pagos se realizan en recepción. Próximamente: pago en línea.
</p> </section> </div> </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/portal/alumno/[id].astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/portal/alumno/[id].astro";
const $$url = "/portal/alumno/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
