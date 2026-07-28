-- ==========================================================
-- 11_ads_protect_columns.sql
-- Responsabilidade: Trigger e RPCs para impedir auto-aprovação de anúncios e auto-destaque
-- ==========================================================

CREATE OR REPLACE FUNCTION public.protect_ad_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status := OLD.status;
    NEW.is_featured := OLD.is_featured;
    NEW.featured_until := OLD.featured_until;
    NEW.views_count := OLD.views_count;
    NEW.contacts_count := OLD.contacts_count;
    NEW.rejection_reason := OLD.rejection_reason;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_ad_columns ON public.ads;
CREATE TRIGGER trg_protect_ad_columns
  BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE PROCEDURE public.protect_ad_privileged_columns();

-- RPC para aprovar/rejeitar anúncio (apenas Admin)
CREATE OR REPLACE FUNCTION public.admin_review_ad(
  target_id UUID, approve BOOLEAN, reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem aprovar ou rejeitar anúncios.';
  END IF;

  UPDATE public.ads
  SET status = CASE WHEN approve THEN 'active'::ad_status ELSE 'rejected'::ad_status END,
      rejection_reason = reason
  WHERE id = target_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_table, target_id, details)
  VALUES (auth.uid(), 'review_ad', 'ads', target_id::text, jsonb_build_object('approved', approve, 'reason', reason));
END;
$$;

-- RPC para impulsionar anúncio pago
CREATE OR REPLACE FUNCTION public.boost_ad_paid(target_id UUID, days INT DEFAULT 30)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != (SELECT user_id FROM public.ads WHERE id = target_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas o proprietário do anúncio pode impulsioná-lo.';
  END IF;

  UPDATE public.ads
  SET is_featured = true, featured_until = now() + (days || ' days')::interval
  WHERE id = target_id;
END;
$$;

-- RPC para upgrade de plano pago
CREATE OR REPLACE FUNCTION public.upgrade_plan_paid(target_id UUID, new_plan TEXT DEFAULT 'pro')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != target_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Ação não autorizada para atualizar plano.';
  END IF;

  UPDATE public.profiles
  SET plan = new_plan::plan_type
  WHERE id = target_id;
END;
$$;
