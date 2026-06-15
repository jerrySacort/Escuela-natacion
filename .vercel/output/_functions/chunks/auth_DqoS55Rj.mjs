const ROOT_ADMIN_EMAIL = "jerry.dc37@gmail.com";
function isRootAdmin(email) {
  return !!email && email.trim().toLowerCase() === ROOT_ADMIN_EMAIL;
}
async function getSessionProfile(supabase) {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, branch_id, role, full_name, phone, avatar_url").eq("id", user.id).single();
  if (!profile) return null;
  return { user, profile };
}
function homeForRole(role) {
  switch (role) {
    case "parent":
      return "/portal";
    case "instructor":
      return "/instructor";
    default:
      return "/dashboard";
  }
}

export { getSessionProfile as g, homeForRole as h, isRootAdmin as i };
