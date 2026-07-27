-- ==========================================================
-- 06_rls_policies.sql
-- Responsabilidade: Ativação de RLS e políticas para Perfis, Anúncios, Mensagens, Reviews e Favoritos
-- ==========================================================

-- Ativação de RLS nas tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND is_banned = false) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Políticas para Ads
DROP POLICY IF EXISTS "ads_select_public" ON public.ads;
CREATE POLICY "ads_select_public" ON public.ads FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "ads_insert_own_not_banned" ON public.ads;
CREATE POLICY "ads_insert_own_not_banned" ON public.ads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = true)
  );

DROP POLICY IF EXISTS "ads_update_own" ON public.ads;
CREATE POLICY "ads_update_own" ON public.ads FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ads_update_admin" ON public.ads;
CREATE POLICY "ads_update_admin" ON public.ads FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "ads_delete_own_or_admin" ON public.ads;
CREATE POLICY "ads_delete_own_or_admin" ON public.ads FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Políticas para Messages
DROP POLICY IF EXISTS "messages_rw_own" ON public.messages;
CREATE POLICY "messages_rw_own" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());

DROP POLICY IF EXISTS "messages_insert_not_banned" ON public.messages;
CREATE POLICY "messages_insert_not_banned" ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = true)
  );

-- Políticas para Reviews e Favorites
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "favorites_owner_only" ON public.favorites;
CREATE POLICY "favorites_owner_only" ON public.favorites FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
