-- ============================================================
-- 004_harden_functions.sql — Endurecer funciones helper
-- (aplicada en remoto el 2026-06-11 vía MCP)
-- ============================================================
-- Las funciones helper solo deben ser ejecutables por usuarios
-- autenticados (las políticas RLS las invocan en su contexto).
revoke execute on function auth_role() from anon, public;
revoke execute on function auth_branch_id() from anon, public;
revoke execute on function is_my_child(uuid) from anon, public;
revoke execute on function is_my_group(uuid) from anon, public;
