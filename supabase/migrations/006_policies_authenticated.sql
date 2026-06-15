-- ============================================================
-- 006_policies_authenticated.sql
-- (aplicada en remoto el 2026-06-11 vía MCP)
-- ============================================================
-- Las policies que usan funciones helper (auth_role, etc.) no
-- deben evaluarse para anon: tras revocarle EXECUTE (004),
-- cualquier consulta anónima fallaba con "permission denied
-- for function". Se limitan todas las policies de rol public
-- → authenticated, excepto branches_public_read (la única
-- pensada para anon, usada por el form de registro).
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and roles = '{public}'::name[]
      and policyname <> 'branches_public_read'
  loop
    execute format(
      'alter policy %I on %I.%I to authenticated',
      p.policyname, p.schemaname, p.tablename
    );
  end loop;
end $$;
