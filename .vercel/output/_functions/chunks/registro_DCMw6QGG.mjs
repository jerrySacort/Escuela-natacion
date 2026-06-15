import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';
import { c as createSupabaseServer } from './supabase_B4M2ZyYM.mjs';

const $$Registro = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Registro;
  const supabase = createSupabaseServer(Astro2.request, Astro2.cookies);
  const { data: branches } = await supabase.from("branches").select("id, name").order("name");
  const { data: orgRow } = await supabase.from("org_settings").select("school_name, logo_url").eq("id", true).single();
  const org = orgRow ?? { school_name: "Escuela de Natación", logo_url: null };
  const error = Astro2.url.searchParams.get("error");
  const ok = Astro2.url.searchParams.get("ok");
  const errorMessages = {
    exists: "Ya existe una cuenta con ese correo.",
    weak: "La contraseña debe tener al menos 8 caracteres.",
    generic: "No se pudo completar el registro. Intenta de nuevo."
  };
  const inputClass = "mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-white/40";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Crear cuenta" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="flex min-h-screen items-center justify-center p-4 text-white"> ${ok ? renderTemplate`<div class="glass w-full max-w-sm space-y-4 rounded-[2rem] p-8 text-center shadow-2xl"> <p class="text-4xl">📬</p> <h1 class="text-2xl font-semibold tracking-tight">¡Casi listo!</h1> <p class="text-sm text-white/60">
Te enviamos un correo de confirmación. Abre el enlace para activar
            tu cuenta y después inicia sesión.
</p> <a href="/login" class="inline-block rounded-full bg-cream px-6 py-2.5 font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">
Ir a iniciar sesión
</a> </div>` : renderTemplate`<form method="post" action="/api/auth/signup" class="glass w-full max-w-sm space-y-4 rounded-[2rem] p-8 shadow-2xl"> <div class="flex flex-col items-center gap-1.5"> ${org.logo_url ? renderTemplate`<img${addAttribute(org.logo_url, "src")}${addAttribute(org.school_name, "alt")} class="h-14 w-auto max-w-[220px] object-contain">` : renderTemplate`<span class="text-3xl">🏊</span>`} <h1 class="text-2xl font-semibold tracking-tight">Crear cuenta</h1> </div> <p class="text-center text-sm text-white/50">
Registro para padres y tutores
</p> ${error && renderTemplate`<p class="rounded-xl bg-red-400/15 p-3 text-sm text-red-200"> ${errorMessages[error] ?? errorMessages.generic} </p>`} <label class="block text-sm text-white/70">
Nombre completo
<input type="text" name="full_name" required minlength="3"${addAttribute(inputClass, "class")}> </label> <label class="block text-sm text-white/70">
Teléfono
<input type="tel" name="phone"${addAttribute(inputClass, "class")}> </label> <label class="block text-sm text-white/70">
Sucursal
<select name="branch_id" required${addAttribute(inputClass, "class")}> <option value="" class="text-slate-900">
Selecciona una sucursal…
</option> ${(branches ?? []).map((b) => renderTemplate`<option${addAttribute(b.id, "value")} class="text-slate-900"> ${b.name} </option>`)} </select> </label> <label class="block text-sm text-white/70">
Correo
<input type="email" name="email" required${addAttribute(inputClass, "class")}> </label> <label class="block text-sm text-white/70">
Contraseña
<input type="password" name="password" required minlength="8"${addAttribute(inputClass, "class")}> </label> <button class="w-full rounded-full bg-cream py-2.5 font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">
Crear cuenta
</button> <p class="text-center text-sm text-white/50">
¿Ya tienes cuenta?${" "} <a href="/login" class="text-white underline-offset-4 hover:underline">
Inicia sesión
</a> </p> </form>`} </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/registro.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/registro.astro";
const $$url = "/registro";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Registro,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
