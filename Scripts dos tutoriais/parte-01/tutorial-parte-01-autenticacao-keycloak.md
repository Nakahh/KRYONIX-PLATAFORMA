# 🔐 PARTE-01: AUTENTICAÇÃO E KEYCLOAK - TUTORIAL COMPLETO
*Configuração de Autenticação Mobile-First com IA 100% Autônoma*

---

## 🎯 **OBJETIVO DA PARTE 01**
Configurar o sistema de autenticação Keycloak integrado com todas as 32 stacks, focado em:
- 📱 **Mobile-First** (80% usuários mobile)
- 🤖 **IA 100% Autônoma** gerenciando tudo
- 🇧🇷 **Interface Português** para leigos
- 📊 **Dados Reais** sempre
- 💬 **WhatsApp + SMS** para autenticação
- 🔧 **Deploy Automático** para www.kryonix.com.br

---

## 👥 **AGENTES ESPECIALIZADOS RESPONSÁVEIS**
- 🔐 **Especialista em Segurança** (Líder)
- 🏗️ **Arquiteto Software Sênior**
- 📱 **Especialista Mobile**
- 🤖 **Especialista IA**
- 🔧 **Especialista DevOps**

---

## 📋 **CHECKLIST OBRIGATÓRIO ANTES DE INICIAR**
- [ ] ✅ Todas as 32 stacks estão funcionando
- [ ] ✅ Domínio www.kryonix.com.br está apontado
- [ ] ✅ Portainer está acessível
- [ ] ✅ Docker Swarm está ativo na rede "Kryonix-NET"
- [ ] ✅ Subdomínio keycloak.kryonix.com.br está configurado
- [ ] ✅ PostgreSQL está funcionando para dados do Keycloak

---

## 🛠️ **CONFIGURAÇÕES NO SERVIDOR (VIA PORTAINER)**

### **1. Configurar Keycloak via Portainer**

#### **1.1 Acessar Portainer**
```bash
# Acesse via navegador:
https://painel.kryonix.com.br
# Login: admin
# Senha: [sua_senha_portainer]
```

#### **1.2 Ir para Stacks > Keycloak**
- Navegue até **Stacks**
- Localize **keycloak-kryonix**
- Clique em **Edit this stack**

#### **1.3 Configurar Environment Variables**
```yaml
# No editor do Portainer, configure:
KEYCLOAK_ADMIN: admin
KEYCLOAK_ADMIN_PASSWORD: [sua_senha_segura]
KC_DB: postgres
KC_DB_URL: jdbc:postgresql://postgresql-kryonix:5432/keycloak
KC_DB_USERNAME: keycloak_user
KC_DB_PASSWORD: [sua_senha_db]
KC_HOSTNAME: keycloak.kryonix.com.br
KC_PROXY: edge
KC_HTTP_ENABLED: true
```

#### **1.4 Configurar Labels Traefik**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.keycloak.rule=Host(`keycloak.kryonix.com.br`)"
  - "traefik.http.routers.keycloak.tls=true"
  - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
  - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
```

---

## 🗄️ **CONFIGURAÇÃO DO BANCO DE DADOS**

### **2. Criar Database no PostgreSQL**

#### **2.1 Acessar PostgreSQL via Portainer**
```bash
# No Portainer, vá para Containers > postgresql-kryonix
# Clique em "Console" e execute:
docker exec -it postgresql-kryonix psql -U postgres
```

#### **2.2 Criar Database e Usuário**
```sql
-- Criar database para Keycloak
CREATE DATABASE keycloak;

-- Criar usuário específico
CREATE USER keycloak_user WITH PASSWORD 'sua_senha_segura_aqui';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;

-- Verificar criação
\l
\q
```

---

## 🚀 **DEPLOY E INICIALIZAÇÃO**

### **3. Deploy via Portainer**

#### **3.1 Deploy do Stack**
```bash
# No Portainer, após configurar as variables:
# 1. Clique em "Update the stack"
# 2. Marque "Pull and redeploy"
# 3. Clique em "Update"
```

#### **3.2 Verificar Logs**
```bash
# No Portainer:
# Containers > keycloak-kryonix > Logs
# Aguarde logs mostrarem: "Keycloak running"
```

#### **3.3 Testar Acesso**
```bash
# Navegador:
https://keycloak.kryonix.com.br
# Login: admin
# Senha: [sua_senha_keycloak]
```

---

## 🔧 **CONFIGURAÇÃO INICIAL KEYCLOAK**

### **4. Setup Inicial no Keycloak**

#### **4.1 Primeiro Acesso**
1. Acesse `https://keycloak.kryonix.com.br`
2. Login com admin/senha
3. Aceitar termos e condições

#### **4.2 Criar Realm KRYONIX**
```bash
# No Keycloak Admin:
# 1. Clique em "Master" (dropdown top-left)
# 2. Clique "Create Realm"
# 3. Nome: "KRYONIX"
# 4. Display name: "KRYONIX - Plataforma SaaS"
# 5. Enabled: ON
# 6. Clique "Create"
```

#### **4.3 Configurar Realm Settings**
```yaml
# Em Realm Settings > General:
Display name: "KRYONIX - Acesso à Plataforma"
HTML Display name: "<strong>KRYONIX</strong> - Sua Plataforma de Negócios"
Frontend URL: "https://keycloak.kryonix.com.br"
Admin Console URL: "https://keycloak.kryonix.com.br"

# Em Realm Settings > Login:
User registration: ON
Remember me: ON
Email as username: ON
Login with email: ON
Duplicate emails: OFF
Edit username: OFF
Reset password: ON
```

#### **4.4 Configurar Themes (Português)**
```yaml
# Em Realm Settings > Themes:
Login theme: "keycloak.v2"
Account theme: "keycloak.v3" 
Admin console theme: "keycloak.v2"
Email theme: "keycloak"

# Em Realm Settings > Localization:
Internationalization: ON
Supported locales: pt-BR
Default locale: pt-BR
```

---

## 📱 **CONFIGURAÇÃO MOBILE-FIRST**

### **5. Cliente Mobile (React App)**

#### **5.1 Criar Client para App Mobile**
```bash
# No Keycloak Admin > KRYONIX realm:
# 1. Clients > Create client
# 2. Client type: OpenID Connect
# 3. Client ID: "kryonix-mobile-app"
# 4. Name: "KRYONIX Mobile App"
# 5. Next > Next > Save
```

#### **5.2 Configurar Client Settings**
```yaml
# Em Client > Settings:
Client authentication: ON
Authorization: ON
Standard flow: ON
Direct access grants: ON
Implicit flow: OFF
Service accounts roles: ON

# Valid redirect URIs:
https://app.kryonix.com.br/*
https://www.kryonix.com.br/*
http://localhost:3000/*

# Valid post logout redirect URIs:
https://app.kryonix.com.br
https://www.kryonix.com.br

# Web origins:
https://app.kryonix.com.br
https://www.kryonix.com.br

# Admin URL:
https://app.kryonix.com.br
```

#### **5.3 Configurar Mappers para Mobile**
```bash
# Em Client > Client scopes > kryonix-mobile-app-dedicated:
# Add mapper > By configuration > User Property

# Mapper 1:
Name: "mobile-number"
User Property: "mobileNumber"
Token Claim Name: "mobile_number"
Claim JSON Type: String
Add to ID token: ON
Add to access token: ON

# Mapper 2:
Name: "preferred-language"
User Property: "locale"
Token Claim Name: "locale"
Claim JSON Type: String
Add to ID token: ON
Add to access token: ON
```

---

## 🤖 **INTEGRAÇÃO COM IA (DIFY + OLLAMA)**

### **6. Configurar IA para Autenticação**

#### **6.1 Criar Usuário de Serviço para IA**
```bash
# No Keycloak Admin > KRYONIX realm:
# Users > Add user

# Configuração:
Username: "kryonix-ai-service"
Email: "ai@kryonix.com.br"
First name: "KRYONIX"
Last name: "IA Service"
Email verified: ON
Enabled: ON

# Credentials:
# Set password: [senha_segura_ia]
# Temporary: OFF
```

#### **6.2 Criar Role para IA**
```bash
# Realm roles > Create role:
Role name: "kryonix-ai-admin"
Description: "Administrador IA com acesso total"

# Assign to user:
# Users > kryonix-ai-service > Role mapping
# Assign role: "kryonix-ai-admin"
```

#### **6.3 Client para IA**
```bash
# Clients > Create client:
Client ID: "kryonix-ai-client"
Name: "KRYONIX IA Integration"
Client authentication: ON
Service accounts roles: ON
Standard flow: OFF
Direct access grants: ON
```

---

## 💬 **INTEGRAÇÃO WHATSAPP + SMS**

### **7. Configurar Autenticação via WhatsApp**

#### **7.1 Custom Authenticator (Deploy)**
```bash
# No seu VSCode server, criar arquivo:
# /opt/kryonix/keycloak/whatsapp-auth-extension.jar

# Deploy via Portainer:
# 1. Containers > keycloak-kryonix > Console
# 2. cp /opt/kryonix/keycloak/whatsapp-auth-extension.jar /opt/keycloak/providers/
# 3. Restart container
```

#### **7.2 Configurar Flow de Autenticação**
```bash
# Authentication > Flows > Create flow:
Alias: "KRYONIX WhatsApp Flow"
Description: "Autenticação via WhatsApp para usuários mobile"
Flow type: "Generic"

# Add execution:
Provider: "WhatsApp OTP Authenticator"
Requirement: "REQUIRED"
```

#### **7.3 Configurar WhatsApp Settings**
```yaml
# Authentication > Flows > KRYONIX WhatsApp Flow > Config:
WhatsApp API URL: "https://evolution.kryonix.com.br/message/sendText"
API Token: "[seu_token_evolution_api]"
Message Template: "🔐 Seu código KRYONIX: {CODE}. Válido por 5 minutos."
Code Length: 6
Code TTL: 300
Default Country Code: "+55"
```

---

## 🔄 **AUTOMAÇÃO COMPLETA COM N8N**

### **8. Workflow de Autenticação Automática**

#### **8.1 Acessar N8N**
```bash
# Navegador:
https://n8n.kryonix.com.br
# Criar workflow: "Keycloak-Auto-Auth"
```

#### **8.2 Webhook de Novos Usuários**
```json
{
  "httpMethod": "POST",
  "path": "/webhook/new-user-keycloak",
  "responseMode": "onReceived",
  "options": {}
}
```

#### **8.3 Workflow Nodes**
```yaml
1. Webhook Trigger (Keycloak new user)
2. Extract User Data
3. Send WhatsApp Welcome (Evolution API)
4. Add User to CRM (Chatwoot)
5. Create User Profile (PostgreSQL)
6. Send Email Verification
7. Log to Analytics (Metabase)
```

---

## 📊 **MÉTRICAS E MONITORAMENTO**

### **9. Dashboard de Autenticação**

#### **9.1 Configurar Prometheus Metrics**
```yaml
# No Keycloak, ativar métricas:
# Metrics > Enable: ON

# Endpoints de métricas:
- https://keycloak.kryonix.com.br/metrics
- /realms/KRYONIX/protocol/openid_connect/auth
- /realms/KRYONIX/protocol/openid_connect/token
```

#### **9.2 Dashboard Grafana**
```bash
# Acessar: https://grafana.kryonix.com.br
# Import dashboard ID: 10441 (Keycloak)
# Configurar data source: Prometheus
```

#### **9.3 Alertas Via WhatsApp**
```yaml
# Configurar alertas para:
- Logins falhados > 5 tentativas
- Novos usuários registrados
- Problemas de conectividade
- Performance degradada
- Tentativas de acesso inválido
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **10. Checklist de Testes**

#### **10.1 Testes Funcionais**
- [ ] ✅ Login via email/senha funciona
- [ ] ✅ Login via WhatsApp OTP funciona
- [ ] ✅ Registro de novos usuários funciona
- [ ] ✅ Reset de senha via email funciona
- [ ] ✅ Reset de senha via WhatsApp funciona
- [ ] ✅ Interface está em português
- [ ] ✅ Design está mobile-friendly
- [ ] ✅ SSO funciona com outras apps

#### **10.2 Testes Mobile**
```bash
# Testar em dispositivos:
# 1. Android Chrome
# 2. iOS Safari
# 3. PWA instalada
# 4. Diferentes tamanhos de tela
# 5. Conexão lenta/offline
```

#### **10.3 Testes de Integração**
- [ ] ✅ IA consegue autenticar usuários
- [ ] ✅ Evolution API recebe webhooks
- [ ] ✅ Chatwoot sincroniza usuários
- [ ] ✅ Métricas aparecem no Grafana
- [ ] ✅ Logs aparecem no Elasticsearch

---

## 🚀 **DEPLOY FINAL**

### **11. Deploy Automático**

#### **11.1 Verificar Health Check**
```bash
# Comando no terminal do servidor:
curl -f https://keycloak.kryonix.com.br/health/ready
curl -f https://keycloak.kryonix.com.br/health/live
```

#### **11.2 Configurar Backup Automático**
```bash
# No Portainer, criar stack de backup:
version: '3.8'
services:
  keycloak-backup:
    image: postgres:15
    command: pg_dump -h postgresql-kryonix -U keycloak_user keycloak
    environment:
      PGPASSWORD: [senha_db]
    deploy:
      replicas: 0
      restart_policy:
        condition: none
    networks:
      - kryonix-net
```

#### **11.3 Notificação de Conclusão**
```bash
# Enviar via Evolution API:
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: [seu_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-01 CONCLUÍDA!\n\n🔐 Keycloak configurado com sucesso\n📱 Mobile-first ativo\n🤖 IA integrada\n🇧🇷 Interface em português\n💬 WhatsApp funcionando\n\n🚀 Sistema pronto para PARTE-02!"
  }'
```

---

## 📋 **SITUAÇÃO APÓS PARTE-01**

### **✅ O QUE FOI CONFIGURADO:**
- 🔐 Keycloak funcionando em `keycloak.kryonix.com.br`
- 📱 Interface mobile-first em português
- 🤖 IA integrada para automação
- 💬 Autenticação via WhatsApp/SMS
- 📊 Métricas e monitoramento ativos
- 🔄 Backup automático configurado
- 🚀 Deploy automático funcionando

### **✅ PRÓXIMAS ETAPAS:**
- **PARTE-02**: Configurar PostgreSQL otimizado
- **PARTE-03**: Configurar MinIO para storage
- **PARTE-04**: Configurar Redis para cache
- **PARTE-05**: Otimizar Traefik proxy

---

## 🤖 **PROMPT PARA IA EXECUTAR NO VSCODE**

```prompt
Você é o KRYONIX IA Assistant especializado em execução de tutoriais. Execute a PARTE-01 do projeto KRYONIX seguindo estas instruções EXATAS:

CONTEXTO:
- Servidor: 144.202.90.55
- Domínio: www.kryonix.com.br
- Todas as 32 stacks estão rodando
- Foco: Mobile-first (80% usuários)
- Interface: 100% português para leigos
- IA: 100% autônoma
- Dados: sempre reais

TAREFAS OBRIGATÓRIAS:
1. Verificar se Keycloak está acessível em keycloak.kryonix.com.br
2. Configurar realm KRYONIX com settings mobile-first
3. Criar client para aplicação mobile React
4. Integrar com WhatsApp via Evolution API
5. Configurar workflow N8N para automação
6. Testar autenticação mobile completa
7. Verificar métricas no Grafana
8. Enviar notificação WhatsApp de conclusão

VALIDAÇÕES OBRIGATÓRIAS:
- Interface em português ✅
- Mobile-friendly ✅  
- WhatsApp funcionando ✅
- IA integrada ✅
- Métricas ativas ✅
- Backup configurado ✅

Execute passo a passo, valide cada etapa e reporte status detalhado.
```

---

*📅 Tutorial criado para execução na PARTE-01*  
*🏢 KRYONIX - Plataforma SaaS 100% Autônoma*  
*👨‍💼 Cliente: Vitor Fernandes*  
*🤖 Assistido por: 15 Agentes Especializados KRYONIX*
