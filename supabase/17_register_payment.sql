-- ==========================================================
-- 17_register_payment.sql
-- Responsabilidade: RPC para registar novo pedido de pagamento
-- ==========================================================

CREATE OR REPLACE FUNCTION public.register_payment(
  p_user_id UUID,
  p_type TEXT,
  p_ad_id UUID DEFAULT NULL,
  p_method TEXT DEFAULT 'mpesa',
  p_amount_mzn NUMERIC DEFAULT 0,
  p_gateway_reference TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id TEXT := 'pay_' || md5(random()::text || clock_timestamp()::text);
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Não autorizado' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.payments (id, user_id, ad_id, type, method, amount_mzn, status, gateway_reference)
  VALUES (v_payment_id, p_user_id, p_ad_id, p_type, p_method, p_amount_mzn, 'pending', p_gateway_reference);

  RETURN jsonb_build_object('payment_id', v_payment_id);
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Referência de pagamento já registada' USING ERRCODE = '23505';
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_payment(UUID, TEXT, UUID, TEXT, NUMERIC, TEXT) TO authenticated;
