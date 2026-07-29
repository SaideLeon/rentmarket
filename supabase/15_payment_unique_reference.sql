-- ==========================================================
-- 15_payment_unique_reference.sql
-- Responsabilidade: Garantir unicidade de gateway_reference na tabela payments
-- ==========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_gateway_reference_key'
      AND conrelid = 'payments'::regclass
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_gateway_reference_key UNIQUE (gateway_reference);
  END IF;
END $$;
