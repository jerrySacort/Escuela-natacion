import { c as createSupabaseServer } from './supabase_B4M2ZyYM.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";
  const supabase = createSupabaseServer(request, cookies);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return redirect("/login?error=1");
  return redirect("/");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
