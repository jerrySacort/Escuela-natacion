import type { APIRoute } from 'astro';
import { createSupabaseServer } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = form.get('email')?.toString().trim() ?? '';
  const password = form.get('password')?.toString() ?? '';
  const fullName = form.get('full_name')?.toString().trim() ?? '';
  const phone = form.get('phone')?.toString().trim() ?? '';
  const branchId = form.get('branch_id')?.toString() ?? '';

  if (!email || !fullName || !branchId) return redirect('/registro?error=generic');
  if (password.length < 8) return redirect('/registro?error=weak');

  const supabase = createSupabaseServer(request, cookies);

  // El trigger handle_new_user crea el profile con rol 'parent';
  // el rol NUNCA se toma del metadata por seguridad.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, branch_id: branchId },
    },
  });

  if (error) {
    const code = error.message.includes('already registered')
      ? 'exists'
      : 'generic';
    return redirect(`/registro?error=${code}`);
  }

  return redirect('/registro?ok=1');
};
