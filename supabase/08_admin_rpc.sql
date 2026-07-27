-- ==========================================================
-- 08_admin_rpc.sql
-- Responsabilidade: Funções RPC / Stored Procedures para Ações de Administrador
-- ==========================================================

CREATE OR REPLACE FUNCTION public.admin_ban_user(target_id UUID, reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem banir utilizadores.';
  END IF;

  UPDATE public.profiles
  SET is_banned = true, ban_reason = reason, banned_at = now(), banned_by = auth.uid()
  WHERE id = target_id;

  UPDATE public.ads SET status = 'rejected', rejection_reason = 'Conta banida'
  WHERE user_id = target_id AND status IN ('active', 'pending_approval');

  INSERT INTO public.admin_audit_log (admin_id, action, target_table, target_id, details)
  VALUES (auth.uid(), 'ban_user', 'profiles', target_id::text, jsonb_build_object('reason', reason));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unban_user(target_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem desbanir utilizadores.';
  END IF;

  UPDATE public.profiles
  SET is_banned = false, ban_reason = null, banned_at = null, banned_by = null
  WHERE id = target_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_table, target_id, details)
  VALUES (auth.uid(), 'unban_user', 'profiles', target_id::text, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_verification(
  request_id UUID, approve BOOLEAN, reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem rever verificações.';
  END IF;

  SELECT user_id INTO v_user_id FROM public.verification_requests WHERE id = request_id;

  UPDATE public.verification_requests
  SET status = CASE WHEN approve THEN 'approved'::verif_status ELSE 'rejected'::verif_status END,
      rejection_reason = reason, reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = request_id;

  UPDATE public.profiles
  SET verification_status = CASE WHEN approve THEN 'verified'::verification_status ELSE 'rejected'::verification_status END
  WHERE id = v_user_id;

  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    v_user_id,
    CASE WHEN approve THEN 'Selo de Verificado Concedido!' ELSE 'Verificação Não Aprovada' END,
    CASE WHEN approve
      THEN 'A sua identidade foi verificada. Já exibe o selo de confiança.'
      ELSE 'A sua verificação foi recusada. Motivo: ' || COALESCE(reason, 'não especificado')
    END,
    'verification', '/dashboard'
  );

  INSERT INTO public.admin_audit_log (admin_id, action, target_table, target_id, details)
  VALUES (auth.uid(), 'review_verification', 'verification_requests', request_id::text,
          jsonb_build_object('approved', approve, 'reason', reason));
END;
$$;
