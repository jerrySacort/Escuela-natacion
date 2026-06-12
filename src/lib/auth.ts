import type { SupabaseClient } from '@supabase/supabase-js';

export type UserRole =
  | 'superadmin'
  | 'branch_admin'
  | 'coordinator'
  | 'instructor'
  | 'parent';

export interface Profile {
  id: string;
  branch_id: string | null;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

/** Devuelve el usuario autenticado + su perfil (rol y sucursal), o null. */
export async function getSessionProfile(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, branch_id, role, full_name, phone, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  return { user, profile: profile as Profile };
}

/** Ruta de inicio según rol. */
export function homeForRole(role: UserRole): string {
  switch (role) {
    case 'parent':
      return '/portal';
    case 'instructor':
      return '/instructor';
    default:
      return '/dashboard';
  }
}
