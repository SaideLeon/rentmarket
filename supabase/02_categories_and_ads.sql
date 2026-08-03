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

-- Seed das categorias predefinidas
INSERT INTO public.categories (id, name, slug, icon, type, subcategories) VALUES
  ('cat_serv_obras', 'Construção e Obras', 'construcao-e-obras', 'Hammer', 'servico', ARRAY['Eletricistas', 'Canalizadores', 'Pedreiros', 'Pintores', 'Serralheiros', 'Gesso e Teto Falso']),
  ('cat_serv_beleza', 'Beleza e Estética', 'beleza-e-estetica', 'Scissors', 'servico', ARRAY['Cabeleireiros e Barbeiros', 'Tranças e Extensões', 'Manicure e Pedicure', 'Maquilhagem', 'Massagens']),
  ('cat_serv_aulas', 'Aulas e Explicações', 'aulas-e-explicacoes', 'GraduationCap', 'servico', ARRAY['Matemática e Física', 'Língua Portuguesa', 'Inglês', 'Informática Básica', 'Música e Instrumentos']),
  ('cat_serv_transporte', 'Transporte e Fretes', 'transporte-e-fretes', 'Truck', 'servico', ARRAY['Fretes de Carga', 'Transporte de Mudanças', 'Táxi Privado e Txopela', 'Motorista Particular']),
  ('cat_serv_tecnologia', 'Tecnologia e Informática', 'tecnologia-e-informatica', 'Laptop', 'servico', ARRAY['Reparação de Telemóveis', 'Reparação de Computadores', 'Instalação de Câmeras/CCTV', 'Redes e Wi-Fi', 'Design e Fotografia']),
  ('cat_serv_gastronomia', 'Gastronomia e Festas', 'gastronomia-e-festas', 'Utensils', 'servico', ARRAY['Bolos por Encomenda', 'Catering e Buffets', 'Decoração de Eventos', 'Animação e DJ', 'Doces e Salgados']),
  ('cat_serv_reparacoes', 'Reparações Domésticas', 'reparacoes-domesticas', 'Wrench', 'servico', ARRAY['Mecânica de Carros e Motas', 'Reparação de Geleiras/AC', 'Costura e Ajustes de Roupa', 'Jardinagem']),
  ('cat_prod_alimentacao', 'Alimentação e Produtos Frescos', 'alimentacao-e-frescos', 'Apple', 'produto', ARRAY['Peixe Fresco e Marisco', 'Frutas e Vegetais', 'Mandioca e Matapa', 'Comida Caseira Pronta', 'Produtos Naturais']),
  ('cat_prod_moda', 'Moda e Capulanas', 'moda-e-capulanas', 'Shirt', 'produto', ARRAY['Capulanas Originais', 'Roupas Masculinas', 'Roupas Femininas', 'Calçados', 'Acessórios e Bijuteria']),
  ('cat_prod_eletronica', 'Eletrónica e Telemóveis', 'eletronica-e-telemoveis', 'Smartphone', 'produto', ARRAY['Telemóveis e Tablets', 'Computadores e Laptops', 'Televisores e Som', 'Acessórios e Carregadores', 'Eletrodomésticos']),
  ('cat_prod_artesanato', 'Artesanato e Decoração', 'artesanato-e-decoracao', 'Palette', 'produto', ARRAY['Esculturas em Madeira', 'Quadros e Pinturas', 'Móveis de Bambu/Cana', 'Cestaria e Utensílios']),
  ('cat_prod_veiculos', 'Veículos e Peças', 'veiculos-e-pecas', 'Car', 'produto', ARRAY['Motocicletas e Txopelas', 'Carros Usados', 'Bicicletas', 'Peças e Acessórios']),
  ('cat_prod_infoprodutos', 'Infoprodutos e Livros Digitais', 'infoprodutos-e-livros-digitais', 'BookOpen', 'produto', ARRAY['E-books e Livros Digitais', 'Cursos e Formações Online', 'Templates e Documentos', 'Softwares e Scripts', 'Mentorias e Consultorias'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  type = EXCLUDED.type,
  subcategories = EXCLUDED.subcategories;

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
