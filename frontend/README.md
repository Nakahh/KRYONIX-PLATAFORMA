# KRYONIX Frontend

Frontend da plataforma KRYONIX - SaaS 100% Autônomo por IA para o mercado brasileiro.

## 🚀 Deploy no Vercel

Este frontend está configurado para deploy automático no Vercel.

### 1. Deploy Automático
```bash
# Conecte seu repositório ao Vercel
# O deploy será automático a cada push na branch main
```

### 2. Configuração de Variáveis
No painel do Vercel, configure:
```
NEXT_PUBLIC_API_URL=https://kryonix-backend.onrender.com
```

### 3. Comandos Disponíveis
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 🏗️ Arquitetura

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TailwindCSS
- **Comunicação**: API REST via cliente customizado
- **Estado**: Context API + React Hooks
- **Tipos**: TypeScript

## 📱 Features

- ✅ Mobile-first design (80% usuários mobile)
- ✅ Dark mode completo
- ✅ PWA ready
- ✅ Interface 100% português brasileiro
- ✅ Comunicação com backend via API REST
- ✅ Sistema de autenticação
- ✅ 8 módulos SaaS integrados

## 🔗 Integração com Backend

O frontend consome APIs do backend através do cliente `lib/api/client.ts`:

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const response = await apiClient.get('/api/users');

// POST request
const result = await apiClient.post('/api/users', userData);
```

## 📦 Estrutura

```
frontend/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── lib/             # Utilitários e API client
├── hooks/           # React hooks customizados
├── public/          # Assets estáticos
└── styles/          # Estilos globais
```

## 🌐 URLs

- **Desenvolvimento**: http://localhost:3000
- **Produção**: https://kryonix-frontend.vercel.app
- **Backend API**: https://kryonix-backend.onrender.com

## 📊 Performance

- ⚡ Build otimizado com SWC
- 🚀 Standalone output
- 📦 Tree shaking automático
- 🎯 Code splitting
- 💾 Cache otimizado

Desenvolvido para rodar no **Vercel** com máxima performance e escalabilidade.
