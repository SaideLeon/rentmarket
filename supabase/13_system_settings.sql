-- ==========================================================
-- 13_system_settings.sql
-- Responsabilidade: Tabela de definições globais do sistema QueliMercado
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  free_plan_max_ads INT DEFAULT 3,
  auto_approve_ads BOOLEAN DEFAULT true,
  ad_validity_days INT DEFAULT 30,
  featured_price_mzn NUMERIC DEFAULT 250,
  pro_plan_price_monthly_mzn NUMERIC DEFAULT 500,
  mpesa_merchant_number TEXT DEFAULT '841234567',
  emola_merchant_number TEXT DEFAULT '861234567',
  support_email TEXT DEFAULT 'suporte@quelimercado.mz',
  support_phone TEXT DEFAULT '+258 84 123 4567',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir adição de colunas se a tabela já existir
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS free_plan_max_ads INT DEFAULT 3;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS mpesa_merchant_number TEXT DEFAULT '841234567';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS emola_merchant_number TEXT DEFAULT '861234567';

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_settings_select_public" ON public.system_settings;
CREATE POLICY "system_settings_select_public" ON public.system_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "system_settings_update_admin" ON public.system_settings;
CREATE POLICY "system_settings_update_admin" ON public.system_settings
  FOR ALL USING (public.is_admin());

-- Inserir registo padrão se não existir
INSERT INTO public.system_settings (id, auto_approve_ads, ad_validity_days, featured_price_mzn, pro_plan_price_monthly_mzn)
VALUES (1, true, 30, 250, 500)
ON CONFLICT (id) DO NOTHING;
