import { c as createSupabaseServer } from './supabase_B4M2ZyYM.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServer(request, cookies);
  await supabase.auth.signOut();
  return redirect("/login");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
