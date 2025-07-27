# 📁 PASTA CENTRALIZADA PARA UPLOADS NAS STACKS

Esta pasta contém **todos os arquivos** que precisam ser enviados manualmente para as stacks externas caso a configuração automática via terminal não funcione.

## 🎯 **ESTRUTURA ORGANIZADA**

```
stack-uploads/
├── evolution-api/          # WhatsApp Business API
├── n8n/                   # Workflows e automações
├── typebot/               # Chatbots e flows
├── mautic/                # Marketing automation
├── dify/                  # IA workflows
├── ollama/                # Modelos IA locais
├── chatwoot/              # Central de atendimento
├── grafana/               # Dashboards
├── prometheus/            # Configurações de métricas
├── postgresql/            # Scripts de banco
├── redis/                 # Configurações cache
├── minio/                 # Object storage
├── nginx/                 # Configurações proxy
├── docker/                # Compose files
├── ssl-certificates/      # Certificados SSL
└── shared/                # Arquivos compartilhados
```

## 🔧 **COMO USAR**

### 1. **Identificar a Stack**

Encontre a pasta da stack que você precisa configurar.

### 2. **Baixar Arquivos**

Use o script automático ou baixe manualmente:

```bash
# Download automático de todos os arquivos
./scripts/download-stack-files.sh evolution-api

# Ou baixe manualmente via interface
```

### 3. **Upload Manual**

Se a configuração automática falhar, use estes arquivos para upload manual.

## 📋 **ARQUIVOS POR STACK**

### **Evolution API** (`evolution-api/`)

- `config.json` - Configuração principal
- `webhook-config.json` - Webhooks KRYONIX
- `instances.json` - Configuração de instâncias
- `auth-keys.json` - Chaves de autenticação

### **N8N** (`n8n/`)

- `workflows/` - Workflows pré-configurados
- `credentials.json` - Credenciais KRYONIX
- `settings.json` - Configurações N8N
- `templates/` - Templates brasileiros

### **Typebot** (`typebot/`)

- `flows/` - Fluxos de chatbot
- `themes/` - Temas personalizados
- `integrations.json` - Integrações
- `brazilian-templates/` - Templates BR

### **Mautic** (`mautic/`)

- `campaigns/` - Campanhas pré-configuradas
- `segments.json` - Segmentação
- `emails/` - Templates de email
- `forms/` - Formulários

### **Dify AI** (`dify/`)

- `workflows/` - Workflows de IA
- `knowledge-base/` - Base de conhecimento
- `agents.json` - Configuração de agentes
- `models.json` - Modelos configurados

### **Ollama** (`ollama/`)

- `models/` - Modelos baixados
- `config.json` - Configuração Ollama
- `custom-models/` - Modelos customizados

### **Grafana** (`grafana/`)

- `dashboards/` - Dashboards KRYONIX
- `datasources.json` - Fontes de dados
- `alerting/` - Configurações de alerta
- `plugins.json` - Plugins necessários

### **Prometheus** (`prometheus/`)

- `prometheus.yml` - Configuração principal
- `rules/` - Regras de alerta
- `targets.json` - Targets de scraping
- `federation.yml` - Configuração federation

## 🚀 **SCRIPTS AUTOMATIZADOS**

### **Download de Arquivos**

```bash
# Baixar arquivos de uma stack específica
./scripts/download-stack-files.sh [STACK_NAME]

# Baixar todos os arquivos de todas as stacks
./scripts/download-all-stack-files.sh
```

### **Upload Automático**

```bash
# Upload automático para uma stack
./scripts/upload-to-stack.sh [STACK_NAME]

# Upload para todas as stacks
./scripts/upload-all-stacks.sh
```

### **Verificação de Configuração**

```bash
# Verificar se todas as stacks estão configuradas
./scripts/verify-stacks-config.sh

# Gerar relatório de configuração
./scripts/generate-config-report.sh
```

## 📖 **TUTORIAIS DETALHADOS**

### **1. Upload Manual Evolution API**

1. Acesse `https://api.kryonix.com.br/manager`
2. Faça login com suas credenciais
3. Vá em "Settings" → "Import Configuration"
4. Faça upload do arquivo `evolution-api/config.json`
5. Reinicie a API

### **2. Upload Manual N8N**

1. Acesse `https://n8n.kryonix.com.br`
2. Login como administrador
3. Vá em "Settings" → "Import"
4. Selecione todos os arquivos da pasta `n8n/workflows/`
5. Configure credenciais com dados de `credentials.json`

### **3. Upload Manual Typebot**

1. Acesse `https://typebot.kryonix.com.br/typebots`
2. Clique em "Import"
3. Selecione arquivos da pasta `typebot/flows/`
4. Configure webhooks conforme `integrations.json`

### **4. Upload Manual Mautic**

1. Acesse `https://mautic.kryonix.com.br/s/dashboard`
2. Vá em "Settings" → "Configuration"
3. Import campanhas de `mautic/campaigns/`
4. Configure segmentação com `segments.json`

## ⚙️ **CONFIGURAÇÕES AVANÇADAS**

### **Variáveis de Ambiente**

Todos os arquivos usam variáveis que são automaticamente substituídas:

```bash
${DOMAIN}                 # kryonix.com.br
${API_KEY}               # Chave API gerada
${WEBHOOK_URL}           # URL webhook KRYONIX
${DATABASE_URL}          # URL banco PostgreSQL
${REDIS_URL}             # URL Redis
${ADMIN_EMAIL}           # Email administrador
${SMTP_CONFIG}           # Configuração SMTP
```

### **SSL/TLS**

Certificados SSL estão em `ssl-certificates/`:

- `kryonix.com.br.crt` - Certificado principal
- `kryonix.com.br.key` - Chave privada
- `ca-bundle.crt` - Bundle CA

### **Backup e Restauração**

```bash
# Backup de todas as configurações
./scripts/backup-stacks-config.sh

# Restaurar configurações
./scripts/restore-stacks-config.sh [BACKUP_FILE]
```

## 🔍 **SOLUÇÃO DE PROBLEMAS**

### **Arquivo não encontrado**

1. Verifique se executou o script de download
2. Confirme permissões da pasta
3. Tente baixar manualmente pela interface

### **Upload falha**

1. Verifique conectividade com a stack
2. Confirme credenciais de acesso
3. Verifique formato do arquivo
4. Tente upload via terminal primeiro

### **Configuração não aplicada**

1. Reinicie a stack após upload
2. Verifique logs da stack
3. Confirme se variáveis foram substituídas
4. Valide sintaxe dos arquivos JSON

## 📞 **SUPORTE**

Se encontrar problemas:

1. **Logs detalhados**: `./scripts/check-stack-logs.sh [STACK_NAME]`
2. **Status das stacks**: `./scripts/check-all-stacks-status.sh`
3. **Configuração**: `./scripts/validate-config.sh`

## 🎉 **RESULTADO ESPERADO**

Após configurar todos os arquivos, todas as 25+ stacks devem estar:

- ✅ Conectadas ao KRYONIX
- ✅ Com métricas sendo coletadas
- ✅ Integradas entre si
- ✅ Funcionando autonomamente

**🚀 OBJETIVO**: Upload de 1 clique para configurar tudo automaticamente!
