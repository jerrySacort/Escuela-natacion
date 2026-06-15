import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ianvqhskscscspnermqj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbnZxaHNrc2NzY3NwbmVybXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTk3MTcsImV4cCI6MjA5Njc5NTcxN30.o-Siry22oApFLykXmNoSILqrUcDHLQ2lPLGxcexy4Kk";
function createSupabaseServer(request, cookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" })
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(
          ({ name, value, options }) => cookies.set(name, value, options)
        );
      }
    }
  });
}
function createSupabaseAdmin() {
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbnZxaHNrc2NzY3NwbmVybXFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxOTcxNywiZXhwIjoyMDk2Nzk1NzE3fQ.6fUIvZoBkX83tPwlqPTDBCwLXGGbBTyKVgogT00GAx8";
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export { createSupabaseAdmin as a, createSupabaseServer as c };
