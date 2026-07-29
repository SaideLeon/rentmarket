-- ==========================================================
-- 18_payment_webhook_events.sql
-- Responsabilidade: Tabela de idempotência para webhooks de pagamento (Monere architecture)
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  request_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  provider_payment_id text NOT NULL,
  payload jsonb NOT NULL
);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Fechada para RLS pública (apenas service_role do servidor interage)
DROP POLICY IF EXISTS "webhook_events_no_public" ON public.payment_webhook_events;
CREATE POLICY "webhook_events_no_public" ON public.payment_webhook_events FOR ALL USING (false);
