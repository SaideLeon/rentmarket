# QueliMercado (Rent Market Quelimane) 🇲🇿

**QueliMercado** é uma plataforma marketplace local focada na cidade de Quelimane, Província da Zambézia, Moçambique. Conecta prestadores de serviços independentes (eletricistas, costureiras, explicadores, fretes), comerciantes locais e moradores para a compra, venda e aluguer de produtos e serviços.

---

## 🌟 Principais Funcionalidades

- **Pesquisa por Voz**: Pesquisa rápida em Português com reconhecimento de voz via Web Speech API.
- **Categorias Locais**: Filtros organizados por bairros de Quelimane (Coalane, Sangariveira, Zalala, Brandão, Aeroporto, etc.).
- **Autenticação Dupla**: Suporte a autenticação nativa Supabase (E-mail/Palavra-passe e Google OAuth) com sincronização para estado local.
- **Verificação de Identidade Segura**: Envio de documentos (BI/NUIT) para armazenamento em **bucket privado** no Supabase Storage (`documentos`), com geração de URLs assinadas temporárias exclusivamente para administradores.
- **Painel de Moderação em Tempo Real**:
  - Aprovação e rejeição de anúncios.
  - Verificação de selos de confiança.
  - Suspensão e banimento de utilizadores via RPC com desativação automática de anúncios ativos.
  - Atualização automática via **Supabase Realtime**.
  - Gráficos de tendências de crescimento de 30 dias com estatísticas diárias e acumuladas.
- **Contacto Direto**: Botões de chamada e atalhos diretos para conversa no WhatsApp.
- **Notificações por E-mail (Gmail API)**: Alertas automáticos ao anunciante quando recebe uma nova mensagem.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router, Server Actions e Middleware)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Backend & Base de Dados**: Supabase Postgres com Row Level Security (RLS)
- **Autenticação**: Supabase Auth (Email + Google OAuth)
- **Armazenamento de Ficheiros**: Supabase Storage (Bucket público `anuncios` e bucket privado `documentos`)
- **Animações e Ícones**: Motion + Lucide React
- **Gráficos**: Recharts

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório e Instalar Dependências

```bash
git clone <url-do-repositorio>
cd rentmarket
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um ficheiro `.env.local` na raiz do projeto baseado no `.env.example`:

```env
GEMINI_API_KEY="Sua_Chave_Gemini"
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-publica"
```

### 3. Configurar a Base de Dados Supabase

1. Abra o **SQL Editor** no painel do Supabase.
2. Execute o script contido no ficheiro `supabase-schema.sql`.
3. No separador **Storage**, certifique-se de criar dois buckets:
   - `anuncios` (Público - para fotografias dos produtos).
   - `documentos` (Privado - para cópias de BI/NUIT dos utilizadores).

### 4. Criar o Primeiro Administrador

No SQL Editor do Supabase, promova a sua conta de utilizador para administrador:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu-email@dominio.com';
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Aceda a [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔐 Segurança e RLS (Row Level Security)

Todas as tabelas do PostgreSQL possuem políticas de **Row Level Security (RLS)** ativas:

- Utilizadores banidos ficam impedidos de publicar anúncios ou enviar mensagens.
- O bucket `documentos` impede o acesso público direto, exigindo uma URL assinada (`createSignedUrl`) disponibilizada apenas a utilizadores com `role = 'admin'`.
- A função `is_admin()` utiliza `SECURITY DEFINER` para evitar recursão infinita no RLS.
- O ficheiro `middleware.ts` protege as rotas `/admin` diretamente no servidor.

---

## 📱 Suporte Mobile

O projeto inclui navegação responsiva dedicada para dispositivos móveis (`MobileNav.tsx`), botões adaptados para toque e otimização para ecrãs de telemóveis.
