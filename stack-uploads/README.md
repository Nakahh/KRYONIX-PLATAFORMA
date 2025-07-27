# 📂 KRYONIX Stack Uploads

Esta pasta centraliza todos os arquivos que precisam ser enviados manualmente para as stacks externas.

## 📋 Estrutura de Pastas

```
stack-uploads/
├── evolution-api/          # Arquivos para Evolution API
├── n8n/                   # Workflows e configurações N8N
├── typebot/               # Flows e configurações Typebot
├── chatwoot/              # Configurações e assets Chatwoot
├── mautic/                # Templates e campanhas Mautic
├── grafana/               # Dashboards e configurações Grafana
├── dify-ai/               # Agentes e conhecimento Dify AI
├── strapi/                # Schemas e configurações Strapi
├── directus/              # Collections e configurações Directus
├── supabase/              # Migrations e funções Supabase
└── shared/                # Arquivos compartilhados entre stacks
```

## 🚀 Como Usar

1. **Desenvolvimento**: Os arquivos são gerados automaticamente durante o desenvolvimento
2. **Deploy Manual**: Caso não consiga via terminal, use os arquivos desta pasta
3. **Backup**: Mantenha sempre uma cópia atualizada dos arquivos

## 📝 Instruções Específicas

### Evolution API

- Upload dos webhooks e configurações de instância
- Arquivo: `evolution-api/webhook-config.json`

### N8N

- Import dos workflows brasileiros
- Pasta: `n8n/workflows/`

### Typebot

- Import dos flows de chatbot
- Pasta: `typebot/flows/`

### Outros

- Cada stack tem instruções específicas em sua pasta

## ⚠️ Importante

- **NUNCA** commite credenciais ou tokens nesta pasta
- Use apenas arquivos de configuração e templates
- Mantenha a estrutura organizada para facilitar deploy
