-- ==========================================================
-- 07_rls_admin_and_system.sql
-- Responsabilidade: RLS e Políticas para Denúncias, Verificações, Notificações e Auditoria
-- ==========================================================

-- Ativação RLS em tabelas de sistema/admin
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para Reports
DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
CREATE POLICY "reports_select_own_or_admin" ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE USING (public.is_admin());

-- Políticas para Verification Requests
DROP POLICY IF EXISTS "verif_insert_own" ON public.verification_requests;
CREATE POLICY "verif_insert_own" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "verif_select_own_or_admin" ON public.verification_requests;
CREATE POLICY "verif_select_own_or_admin" ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "verif_update_admin" ON public.verification_requests;
CREATE POLICY "verif_update_admin" ON public.verification_requests FOR UPDATE USING (public.is_admin());

-- Políticas para Notifications & Admin Audit Log
DROP POLICY IF EXISTS "notif_owner_select" ON public.notifications;
CREATE POLICY "notif_owner_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_owner_update" ON public.notifications;
CREATE POLICY "notif_owner_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_system_insert" ON public.notifications;
CREATE POLICY "notif_system_insert" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "audit_admin_only" ON public.admin_audit_log;
CREATE POLICY "audit_admin_only" ON public.admin_audit_log FOR ALL USING (public.is_admin());
