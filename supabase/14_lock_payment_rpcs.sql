-- ==========================================================
-- 14_lock_payment_rpcs.sql
-- Responsabilidade: Bloquear execução direta de RPCs de concessão de plano/destaque por clientes
-- ==========================================================

REVOKE EXECUTE ON FUNCTION public.upgrade_plan_paid(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upgrade_plan_paid(UUID, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.upgrade_plan_paid(UUID, TEXT) FROM anon;

REVOKE EXECUTE ON FUNCTION public.boost_ad_paid(UUID, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.boost_ad_paid(UUID, INT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.boost_ad_paid(UUID, INT) FROM anon;
