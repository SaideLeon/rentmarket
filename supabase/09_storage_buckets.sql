-- ==========================================================
-- 09_storage_buckets.sql
-- Responsabilidade: Buckets de Storage e políticas RLS em storage.objects
-- ==========================================================

-- 1. Buckets do Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('anuncios', 'anuncios', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- NOTA: O RLS em storage.objects já vem habilitado por padrão pelo Supabase.
-- Executar ALTER TABLE em storage.objects causa o erro 42501 (must be owner of table objects).

-- 2. Políticas para o bucket 'anuncios' (Público)
DROP POLICY IF EXISTS "Public Read Anuncios" ON storage.objects;
CREATE POLICY "Public Read Anuncios" ON storage.objects
  FOR SELECT USING (bucket_id = 'anuncios');

DROP POLICY IF EXISTS "Authenticated Upload Anuncios" ON storage.objects;
CREATE POLICY "Authenticated Upload Anuncios" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'anuncios' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owner/Admin Update Anuncios" ON storage.objects;
CREATE POLICY "Owner/Admin Update Anuncios" ON storage.objects
  FOR UPDATE USING (bucket_id = 'anuncios' AND (auth.uid() = owner OR public.is_admin()));

DROP POLICY IF EXISTS "Owner/Admin Delete Anuncios" ON storage.objects;
CREATE POLICY "Owner/Admin Delete Anuncios" ON storage.objects
  FOR DELETE USING (bucket_id = 'anuncios' AND (auth.uid() = owner OR public.is_admin()));

-- 3. Políticas para o bucket 'documentos' (Privado)
DROP POLICY IF EXISTS "Authenticated Upload Documentos" ON storage.objects;
CREATE POLICY "Authenticated Upload Documentos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documentos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owner or Admin Read Documentos" ON storage.objects;
CREATE POLICY "Owner or Admin Read Documentos" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos' AND (auth.uid() = owner OR public.is_admin()));

DROP POLICY IF EXISTS "Owner or Admin Delete Documentos" ON storage.objects;
CREATE POLICY "Owner or Admin Delete Documentos" ON storage.objects
  FOR DELETE USING (bucket_id = 'documentos' AND (auth.uid() = owner OR public.is_admin()));
