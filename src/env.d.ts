/// <reference types="astro/client" />

// AOS (animate on scroll) no incluye tipos propios.
declare module 'aos';

declare namespace App {
  interface Locals {
    supabase: import('@supabase/supabase-js').SupabaseClient;
    session: {
      user: import('@supabase/supabase-js').User;
      profile: import('@/lib/auth').Profile;
    } | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}
