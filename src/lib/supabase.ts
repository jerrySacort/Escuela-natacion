import {
  createServerClient,
  createBrowserClient,
  parseCookieHeader,
  type CookieOptions,
} from '@supabase/ssr';
import type { AstroCookies } from 'astro';

type CookieToSet = { name: string; value: string; options: CookieOptions };

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente server-side por request. Respeta RLS según el usuario logueado.
 * Usar en páginas .astro, API routes y middleware.
 */
export function createSupabaseServer(request: Request, cookies: AstroCookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('cookie') ?? '').map(
          ({ name, value }) => ({ name, value: value ?? '' }),
        );
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies.set(name, value, options),
        );
      },
    },
  });
}

/** Cliente browser-side para React Islands (Realtime, mutaciones desde UI). */
export function createSupabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
