-- ==========================================================
-- 01_profiles.sql
-- Responsabilidade: Tabela de perfis e trigger de sincronização de utilizadores
-- ==========================================================

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

-- Trigger de criação automática do perfil no signup via Supabase Auth
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
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o email já existe num perfil pré-existente (ex: registado por email/password antes de usar Google OAuth),
    -- actualiza o perfil existente associando o novo auth id sem bloquear a criação da sessão no Auth
    BEGIN
      UPDATE public.profiles
      SET id = NEW.id,
          name = COALESCE(NEW.raw_user_meta_data->>'name', name),
          avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
          updated_at = NOW()
      WHERE email = NEW.email;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    RETURN NEW;
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
