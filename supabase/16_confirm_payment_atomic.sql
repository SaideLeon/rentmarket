-- ==========================================================
-- 16_confirm_payment_atomic.sql
-- Responsabilidade: RPC atómica para confirmação de pagamentos
-- ==========================================================

CREATE OR REPLACE FUNCTION public.confirm_payment(
  p_payment_id TEXT,
  p_confirmed_by UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'webhook'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
BEGIN
  -- Se for acção de admin, validar se quem chama é admin
  IF p_source = 'admin' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado' USING ERRCODE = 'P0001';
  END IF;

  -- Lock da linha de pagamento para evitar race conditions
  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pagamento não encontrado' USING ERRCODE = 'P0003';
  END IF;

  IF v_payment.status <> 'pending' THEN
    IF v_payment.status = 'confirmed' THEN
      RETURN jsonb_build_object('ok', true, 'status', 'confirmed', 'type', v_payment.type, 'already_processed', true);
    ELSE
      RAISE EXCEPTION 'Pagamento já processado: %', v_payment.status USING ERRCODE = 'P0004';
    END IF;
  END IF;

  UPDATE public.payments
  SET status = 'confirmed', confirmed_at = now()
  WHERE id = p_payment_id;

  -- Aplicar concessão do benefício no banco
  IF v_payment.type = 'upgrade_plan' THEN
    UPDATE public.profiles SET plan = 'pro'::plan_type WHERE id = v_payment.user_id;
  ELSIF v_payment.type = 'boost_ad' AND v_payment.ad_id IS NOT NULL THEN
    UPDATE public.ads
    SET is_featured = true, featured_until = now() + interval '30 days'
    WHERE id = v_payment.ad_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', 'confirmed', 'type', v_payment.type);
END;
$$;

-- Permissões
REVOKE EXECUTE ON FUNCTION public.confirm_payment(TEXT, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.confirm_payment(TEXT, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.confirm_payment(TEXT, UUID, TEXT) TO authenticated;
