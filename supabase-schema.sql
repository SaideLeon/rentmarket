-- ==========================================================
-- QUELIMERCADO / RENT MARKET QUELIMANE - PROD SUPABASE SCHEMA
-- ==========================================================

-- 0. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'pro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('none', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('servico', 'produto');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE price_type AS ENUM ('fixed', 'negotiable', 'starting_at');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE ad_status AS ENUM ('pending_approval', 'active', 'paused', 'expired', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE report_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'fake_contact', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verif_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  bairro TEXT DEFAULT 'Centro da Cidade',
  city TEXT DEFAULT 'Quelimane',
  bio TEXT,
  role user_role NOT NULL DEFAULT 'user',
  plan plan_type NOT NULL DEFAULT 'free',
  verification_status verification_status NOT NULL DEFAULT 'none',
  document_type TEXT,
  document_number TEXT,
  document_url TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ambos',
  subcategories TEXT[] NOT NULL DEFAULT '{}'
);

-- 3. ADS
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_type listing_type NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  category_name TEXT,
  subcategory TEXT NOT NULL,
  price NUMERIC,
  price_type price_type DEFAULT 'fixed',
  bairro TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  cover_image TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status ad_status NOT NULL DEFAULT 'pending_approval',
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  contacts_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ads_status_idx ON public.ads(status);
CREATE INDEX IF NOT EXISTS ads_user_idx ON public.ads(user_id);

-- 4. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- 7. REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason report_reason NOT NULL,
  details TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VERIFICATION REQUESTS (Private document bucket references)
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  document_image_path TEXT NOT NULL,
  status verif_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- HELPER FUNCTIONS & TRIGGERS
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, whatsapp, bairro, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data->>'bairro', 'Centro da Cidade'),
    'Quelimane'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND is_banned = false)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Ads Policies
DROP POLICY IF EXISTS "ads_select_public" ON public.ads;
CREATE POLICY "ads_select_public" ON public.ads FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "ads_insert_own_not_banned" ON public.ads;
CREATE POLICY "ads_insert_own_not_banned" ON public.ads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = true
    )
  );

DROP POLICY IF EXISTS "ads_update_own" ON public.ads;
CREATE POLICY "ads_update_own" ON public.ads FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ads_update_admin" ON public.ads;
CREATE POLICY "ads_update_admin" ON public.ads FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "ads_delete_own_or_admin" ON public.ads;
CREATE POLICY "ads_delete_own_or_admin" ON public.ads FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Messages Policies
DROP POLICY IF EXISTS "messages_rw_own" ON public.messages;
CREATE POLICY "messages_rw_own" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());

DROP POLICY IF EXISTS "messages_insert_not_banned" ON public.messages;
CREATE POLICY "messages_insert_not_banned" ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = true)
  );

-- Reviews Policies
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Favorites Policies
DROP POLICY IF EXISTS "favorites_owner_only" ON public.favorites;
CREATE POLICY "favorites_owner_only" ON public.favorites FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reports Policies
DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
CREATE POLICY "reports_select_own_or_admin" ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE USING (public.is_admin());

-- Verification Requests Policies
DROP POLICY IF EXISTS "verif_insert_own" ON public.verification_requests;
CREATE POLICY "verif_insert_own" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "verif_select_own_or_admin" ON public.verification_requests;
CREATE POLICY "verif_select_own_or_admin" ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "verif_update_admin" ON public.verification_requests;
CREATE POLICY "verif_update_admin" ON public.verification_requests FOR UPDATE USING (public.is_admin());

-- Notifications & Audit Log
DROP POLICY IF EXISTS "notif_owner_select" ON public.notifications;
CREATE POLICY "notif_owner_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_owner_update" ON public.notifications;
CREATE POLICY "notif_owner_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_system_insert" ON public.notifications;
CREATE POLICY "notif_system_insert" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "audit_admin_only" ON public.admin_audit_log;
CREATE POLICY "audit_admin_only" ON public.admin_audit_log FOR ALL USING (public.is_admin());

-- ==========================================================
-- ADMIN RPC FUNCTIONS
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
