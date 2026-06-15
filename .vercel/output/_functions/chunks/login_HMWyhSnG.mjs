import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_C2HBX7Lj.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';
import { c as createSupabaseServer } from './supabase_B4M2ZyYM.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const supabase = createSupabaseServer(Astro2.request, Astro2.cookies);
  const { data: orgRow } = await supabase.from("org_settings").select("school_name, logo_url").eq("id", true).single();
  const org = orgRow ?? { school_name: "Escuela de Natación", logo_url: null };
  const error = Astro2.url.searchParams.get("error");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Iniciar sesión" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="flex min-h-screen items-center justify-center p-4 text-white"> <form method="post" action="/api/auth/signin" class="glass w-full max-w-sm space-y-4 rounded-[2rem] p-8 shadow-2xl"> <div class="flex flex-col items-center gap-1.5"> ${org.logo_url ? renderTemplate`<img${addAttribute(org.logo_url, "src")}${addAttribute(org.school_name, "alt")} class="h-16 w-auto max-w-[240px] object-contain">` : renderTemplate`<h1 class="text-2xl font-semibold tracking-tight">🏊 ${org.school_name}</h1>`} </div> <p class="text-center text-sm text-white/50">Inicia sesión para continuar</p> ${error && renderTemplate`<p class="rounded-xl bg-red-400/15 p-3 text-sm text-red-200">
Credenciales incorrectas. Intenta de nuevo.
</p>`} <label class="block text-sm text-white/70">
Correo
<input type="email" name="email" required class="mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-white/40"> </label> <label class="block text-sm text-white/70">
Contraseña
<input type="password" name="password" required class="mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-white/40"> </label> <button class="w-full rounded-full bg-cream py-2.5 font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">
Entrar
</button> <p class="text-center text-sm text-white/50">
¿No tienes cuenta?
<a href="/registro" class="text-white underline-offset-4 hover:underline">Regístrate</a> </p> </form> </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/login.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
