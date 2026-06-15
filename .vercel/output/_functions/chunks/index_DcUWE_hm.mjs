import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import './sequence_CVaQCOaa.mjs';
import 'clsx';
import { h as homeForRole } from './auth_DqoS55Rj.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const session = Astro2.locals.session;
  return Astro2.redirect(session ? homeForRole(session.profile.role) : "/login");
}, "D:/Proyectos/IA/Escuela natacion/src/pages/index.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
