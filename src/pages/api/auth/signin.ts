import type { APIRoute } from 'astro';
import { createSupabaseServer } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = form.get('email')?.toString() ?? '';
  const password = form.get('password')?.toString() ?? '';

  const supabase = createSupabaseServer(request, cookies);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return redirect('/login?error=1');
  return redirect('/');
};
