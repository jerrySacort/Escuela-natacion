import { d as defineMiddleware, s as sequence } from './chunks/sequence_CVaQCOaa.mjs';
import 'piccolore';
import 'clsx';
import { c as createSupabaseServer } from './chunks/supabase_B4M2ZyYM.mjs';
import { g as getSessionProfile, h as homeForRole } from './chunks/auth_DqoS55Rj.mjs';

const PROTECTED = {
  "/dashboard": ["superadmin", "branch_admin", "coordinator"],
  "/instructor": ["instructor", "superadmin"],
  "/portal": ["parent", "superadmin"],
  "/api/admin": ["superadmin", "branch_admin"]
};
const PUBLIC = ["/login", "/registro", "/api/auth"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    context.locals.supabase = createSupabaseServer(context.request, context.cookies);
    return next();
  }
  const supabase = createSupabaseServer(context.request, context.cookies);
  const session = await getSessionProfile(supabase);
  context.locals.supabase = supabase;
  context.locals.session = session;
  const rule = Object.entries(PROTECTED).find(
    ([prefix]) => pathname.startsWith(prefix)
  );
  if (rule) {
    if (!session) return context.redirect("/login");
    const [, allowedRoles] = rule;
    if (!allowedRoles.includes(session.profile.role)) {
      return context.redirect(homeForRole(session.profile.role));
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
