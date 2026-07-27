-- ==========================================================
-- 02_categories_and_ads.sql
-- Responsabilidade: Tabelas de Categorias e Anúncios (com Índices)
-- ==========================================================

-- 1. CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ambos',
  subcategories TEXT[] NOT NULL DEFAULT '{}'
);

-- 2. ANÚNCIOS
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
