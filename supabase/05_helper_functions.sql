-- ==========================================================
-- 05_helper_functions.sql
-- Responsabilidade: Funções auxiliares (ex: verificação de admin)
-- ==========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_banned = false
  );
$$;
