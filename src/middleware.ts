import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServer } from '@/lib/supabase';
import { getSessionProfile, homeForRole, type UserRole } from '@/lib/auth';

/** Prefijo de ruta → roles permitidos. */
const PROTECTED: Record<string, UserRole[]> = {
  '/dashboard': ['superadmin', 'branch_admin', 'coordinator'],
  '/instructor': ['instructor', 'superadmin'],
  '/portal': ['parent', 'superadmin'],
  '/api/admin': ['superadmin', 'branch_admin'],
};

const PUBLIC = ['/login', '/api/auth'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (PUBLIC.some((p) => pathname.startsWith(p))) return next();

  const supabase = createSupabaseServer(context.request, context.cookies);
  const session = await getSessionProfile(supabase);

  // Disponible en cualquier página vía Astro.locals
  context.locals.supabase = supabase;
  context.locals.session = session;

  const rule = Object.entries(PROTECTED).find(([prefix]) =>
    pathname.startsWith(prefix),
  );

  if (rule) {
    if (!session) return context.redirect('/login');
    const [, allowedRoles] = rule;
    if (!allowedRoles.includes(session.profile.role)) {
      return context.redirect(homeForRole(session.profile.role));
    }
  }

  return next();
});
