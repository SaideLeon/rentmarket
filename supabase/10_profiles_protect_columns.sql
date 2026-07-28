-- ==========================================================
-- 10_profiles_protect_columns.sql
-- Responsabilidade: Trigger BEFORE UPDATE em public.profiles para impedir
-- que utilizadores normais alterem campos privilegiados (role, plan, is_banned, etc.)
-- ==========================================================

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se quem faz o UPDATE não é administrador, mantém os valores antigos das colunas sensíveis
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.plan := OLD.plan;
    NEW.is_banned := OLD.is_banned;
    NEW.banned_at := OLD.banned_at;
    NEW.banned_by := OLD.banned_by;
    NEW.ban_reason := OLD.ban_reason;
    NEW.verification_status := OLD.verification_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_privileged_columns();
