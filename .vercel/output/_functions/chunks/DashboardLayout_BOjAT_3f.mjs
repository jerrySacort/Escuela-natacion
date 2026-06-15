import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute, bk as renderSlot } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';

const $$DashboardLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$DashboardLayout;
  const { title } = Astro2.props;
  const session = Astro2.locals.session;
  const path = Astro2.url.pathname;
  const { data: orgRow } = await Astro2.locals.supabase.from("org_settings").select("school_name, logo_url").eq("id", true).single();
  const org = orgRow ?? { school_name: "Escuela de Natación", logo_url: null };
  const nav = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/dashboard/alumnos", label: "Alumnos" },
    { href: "/dashboard/grupos", label: "Grupos" },
    { href: "/dashboard/instructores", label: "Instructores" },
    { href: "/dashboard/pagos", label: "Pagos" },
    { href: "/dashboard/asistencia", label: "Asistencia" },
    { href: "/dashboard/rubricas", label: "Rúbricas" },
    { href: "/dashboard/reportes", label: "Reportes" },
    ...session.profile.role === "superadmin" ? [{ href: "/dashboard/configuracion", label: "Configuración" }] : []
  ];
  const isActive = (href) => href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);
  const initial = session.profile.full_name.charAt(0).toUpperCase();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="min-h-screen p-3 text-white sm:p-6 lg:p-8"> <div class="glass panel-enter mx-auto max-w-7xl rounded-[2rem] p-4 shadow-2xl sm:rounded-[2.5rem] sm:p-7"> <!-- Header: logo · nav píldoras · usuario --> <header class="flex flex-wrap items-center gap-4"> <a href="/dashboard" class="flex items-center gap-2 px-1" aria-label="Inicio"> ${org.logo_url ? renderTemplate`<img${addAttribute(org.logo_url, "src")}${addAttribute(org.school_name, "alt")} class="h-14 w-auto max-w-[280px] object-contain">` : renderTemplate`<span class="text-2xl">🏊</span>`} ${!org.logo_url && renderTemplate`<span class="hidden text-sm font-semibold tracking-tight lg:block"> ${org.school_name} </span>`} </a> <nav class="glass-soft no-scrollbar order-3 flex w-full gap-1 overflow-x-auto rounded-full p-1.5 sm:order-none sm:w-auto sm:flex-1 sm:justify-center"> ${nav.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${isActive(item.href) ? "bg-cream font-medium text-slate-900 shadow" : "text-white/70 hover:bg-white/10 hover:text-white"}`, "class")}> ${item.label} </a>`)} </nav> <div class="glass-soft ml-auto flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 sm:ml-0"> <span class="flex h-9 w-9 items-center justify-center rounded-full bg-cream font-bold text-slate-900"> ${initial} </span> <span class="hidden text-sm leading-tight md:block"> ${session.profile.full_name} <span class="block text-xs text-white/50">${session.profile.role}</span> </span> <form method="post" action="/api/auth/signout" class="flex"> <button class="text-white/60 transition hover:text-white" title="Cerrar sesión" aria-label="Cerrar sesión"> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> </button> </form> </div> </header> <main class="dash-enter mt-6 sm:mt-8"> ${title && renderTemplate`<h1 class="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">${title}</h1>`} ${renderSlot($$result2, $$slots["default"])} </main> </div> </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/layouts/DashboardLayout.astro", void 0);

export { $$DashboardLayout as $ };
