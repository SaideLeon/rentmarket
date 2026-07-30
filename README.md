# Mussika Online 🇲🇿

**Mussika Online** é uma plataforma marketplace local de alugueres, serviços e produtos em Moçambique (com foco em Quelimane, Província da Zambézia). Conecta prestadores de serviços independentes (eletricistas, costureiras, explicadores, fretes), comerciantes locais e moradores para a compra, venda e aluguer de produtos e serviços.

---

## 🌟 Principais Funcionalidades

- **Progressive Web App (PWA)**: Aplicação instalável em Android, iOS e Desktop, com suporte offline e ícones otimizados (incluindo maskable icons).
- **Pesquisa Inteligente & por Voz**: Pesquisa por texto e voz em Português via Web Speech API.
- **Categorias e Bairros Locais**: Filtros de busca por bairros de Quelimane (Coalane, Sangariveira, Zalala, Brandão, Aeroporto, etc.) e modalidade (Aluguer, Venda, Serviço).
- **Pagamentos Móveis Integrados (PaySuite)**: Integração com M-Pesa, e-Mola e cartões bancários para subscrição de planos e destaque de anúncios.
- **Autenticação Dupla**: Suporte a autenticação nativa Supabase (E-mail/Palavra-passe e Google OAuth) com sincronização para o estado da aplicação.
- **Verificação de Identidade Segura**: Envio de documentos (BI/NUIT) para armazenamento seguro e atribuição de selo oficial de verificação.
- **Painel de Moderação em Tempo Real**:
  - Aprovação e rejeição de anúncios.
  - Verificação de selos de confiança de vendedores/prestadores.
  - Suspensão e gestão de utilizadores.
  - Atualizações automáticas em tempo real.
  - Gráficos e estatísticas de desempenho da plataforma.
- **Contacto Direto**: Atalhos imediatos para chamadas telefónicas, WhatsApp e envio de e-mails via Gmail API.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router, Server Actions e Middleware)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Backend & Base de Dados**: Supabase Postgres com Row Level Security (RLS)
- **Autenticação**: Supabase Auth (Email + Google OAuth)
- **Armazenamento de Ficheiros**: Supabase Storage (`anuncios` e `documentos`)
- **Processamento de Imagens**: Sharp (Geração automatizada de ícones PWA)
- **Animações e Ícones**: Motion + Lucide React
- **Gráficos**: Recharts

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório e Instalar Dependências

```bash
git clone <url-do-repositorio>
cd mussika-online
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um ficheiro `.env.local` na raiz do projeto baseado no `.env.example`:

```env
GEMINI_API_KEY="Sua_Chave_Gemini"
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-publica"
PAYSUITE_API_KEY="sua-chave-paysuite"
```

### 3. Gerar os Ícones PWA (Opcional)

Para recalcular e gerar os ícones PWA PNG a partir do ícone fonte:

```bash
node scripts/generate-pwa-icons.js
```

### 4. Configurar a Base de Dados Supabase

1. Abra o **SQL Editor** no painel do Supabase.
2. Execute o script contido no ficheiro `supabase-schema.sql`.
3. No separador **Storage**, certifique-se de criar dois buckets:
   - `anuncios` (Público - para fotografias dos produtos).
   - `documentos` (Privado - para cópias de BI/NUIT dos utilizadores).

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Aceda a [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔐 Segurança e RLS (Row Level Security)

Todas as tabelas do PostgreSQL possuem políticas de **Row Level Security (RLS)** ativas:

- Utilizadores suspensos ficam impedidos de publicar anúncios ou enviar mensagens.
- O bucket `documentos` impede o acesso público direto, exigindo uma URL assinada disponibilizada apenas a administradores (`role = 'admin'`).
- O ficheiro `middleware.ts` protege as rotas `/admin` diretamente no servidor.

---

## 📱 Suporte Mobile & PWA

O projeto inclui navegação responsiva dedicada para dispositivos móveis (`MobileNav.tsx`), banner de instalação PWA (`PWAInstaller.tsx`), botões adaptados para toque e suporte completo para ecrãs móveis.
