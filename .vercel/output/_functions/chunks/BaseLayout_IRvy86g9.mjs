import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { J as createRenderInstruction, _ as addAttribute, bj as renderHead, bk as renderSlot, I as renderTemplate } from './sequence_CVaQCOaa.mjs';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "Escuela de Natación" } = Astro2.props;
  let theme = "ocean";
  try {
    const { data } = await Astro2.locals.supabase.from("org_settings").select("theme").eq("id", true).single();
    if (data?.theme) theme = data.theme;
  } catch {
    theme = "ocean";
  }
  return renderTemplate`<html lang="es"${addAttribute(theme, "data-theme")}> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/x-icon" href="/favicon.ico"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-slate-50 text-slate-900"> ${renderSlot($$result, $$slots["default"])} ${renderScript($$result, "D:/Proyectos/IA/Escuela natacion/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "D:/Proyectos/IA/Escuela natacion/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
