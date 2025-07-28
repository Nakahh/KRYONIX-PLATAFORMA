# 📋 TUTORIAL PARTE 01 - AUTENTICAÇÃO E KEYCLOAK
*Tutorial Passo a Passo para Implementação - Nível: Iniciante*

## 🎯 OBJETIVO DESTA PARTE
Configurar o sistema de autenticação principal do KRYONIX usando Keycloak, que será o coração de todo o sistema de login e permissões.

**O que você terá ao final:**
- ✅ Sistema de login funcionando
- ✅ Keycloak configurado em keycloak.kryonix.com.br
- ✅ Usuários podem fazer login com Google, GitHub
- ✅ Sistema de permissões básico funcionando

## ⏱️ TEMPO ESTIMADO
**45-60 minutos** (para quem não tem conhecimento técnico)

## 📋 PRÉ-REQUISITOS
- [ ] Servidor KRYONIX funcionando (IP: 144.202.90.55)
- [ ] Acesso ao Portainer (painel.kryonix.com.br)
- [ ] Acesso aos dados: usuário `kryonix`, senha `Vitor@123456`

## 🤖 IA ASSISTENTE ATIVA
Durante este tutorial, a IA KRYONIX estará te ajudando. Se tiver dúvidas, mande mensagem no WhatsApp: (17) 98180-5327

## 🔧 PASSO A PASSO (SIMPLES)

### PASSO 1: ACESSAR O PORTAINER
**O que você vai fazer:** Entrar no painel de controle dos containers

**Como fazer:**
1. Abrir o navegador (Chrome, Firefox, Safari)
2. Ir para: `https://painel.kryonix.com.br`
3. Fazer login:
   - **Usuário:** `kryonix`
   - **Senha:** `Vitor@123456`
4. Clicar em **"Local"** (ambiente local)

**✅ Como saber se deu certo:** Você verá a tela do Portainer com menus laterais

### PASSO 2: CONFIGURAR STACK DO KEYCLOAK
**O que você vai fazer:** Criar o container do sistema de autenticação

**Como fazer:**
1. No menu lateral, clicar em **"Stacks"**
2. Clicar no botão **"+ Add stack"**
3. Nome da stack: `kryonix-auth`
4. Na área **"Web editor"**, apagar tudo e copiar este código:

```yaml
version: '3.8'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:22.0
    container_name: keycloak-kryonix
    environment:
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgresql-kryonix:5432/keycloak
      - KC_DB_USERNAME=keycloak
      - KC_DB_PASSWORD=Vitor@123456
      - KC_HOSTNAME=keycloak.kryonix.com.br
      - KC_HTTP_ENABLED=true
      - KC_HOSTNAME_STRICT_HTTPS=false
      - KEYCLOAK_ADMIN=kryonix
      - KEYCLOAK_ADMIN_PASSWORD=Vitor@123456
    command: start --optimized
    depends_on:
      - postgresql-keycloak
    networks:
      - kryonix-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(`keycloak.kryonix.com.br`)"
      - "traefik.http.routers.keycloak.tls=true"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"

  postgresql-keycloak:
    image: postgres:15
    container_name: postgresql-keycloak
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=Vitor@123456
    volumes:
      - keycloak_postgres_data:/var/lib/postgresql/data
    networks:
      - kryonix-net

volumes:
  keycloak_postgres_data:
    driver: local

networks:
  kryonix-net:
    external: true
```

5. Clicar no botão **"Deploy the stack"**

**✅ Como saber se deu certo:** Você verá a stack `kryonix-auth` na lista com status verde

### PASSO 3: AGUARDAR INICIALIZAÇÃO
**O que você vai fazer:** Esperar o Keycloak inicializar (pode demorar 2-3 minutos)

**Como fazer:**
1. Na lista de stacks, clicar em `kryonix-auth`
2. Verificar se os 2 containers estão com status **"running"** (verde)
3. Aguardar até ambos ficarem verdes

**⏳ Tempo normal:** 2-5 minutos dependendo do servidor

### PASSO 4: ACESSAR O KEYCLOAK
**O que você vai fazer:** Entrar no painel administrativo do sistema de autenticação

**Como fazer:**
1. Abrir nova aba no navegador
2. Ir para: `https://keycloak.kryonix.com.br`
3. Aguardar carregar (pode demorar no primeiro acesso)
4. Clicar em **"Administration Console"**
5. Fazer login:
   - **Username:** `kryonix`
   - **Password:** `Vitor@123456`

**✅ Como saber se deu certo:** Você verá o painel administrativo do Keycloak

### PASSO 5: CONFIGURAÇÃO AUTOMÁTICA VIA IA
**O que você vai fazer:** Deixar a IA configurar automaticamente as configurações básicas

**Como fazer:**
1. Voltar ao terminal/navegador
2. Executar o script automático:

```bash
# Executar via SSH ou terminal
curl -X POST "https://api.kryonix.com.br/setup/keycloak-auto-config" \
  -H "Content-Type: application/json" \
  -d '{
    "keycloak_url": "https://keycloak.kryonix.com.br",
    "admin_user": "kryonix",
    "admin_password": "Vitor@123456",
    "setup_google_oauth": true,
    "setup_github_oauth": true,
    "create_kryonix_realm": true
  }'
```

**OU (mais simples) - via WhatsApp:**
Mande mensagem: **"Configurar Keycloak Parte 1"** para (17) 98180-5327

**✅ Como saber se deu certo:** Você receberá confirmação via WhatsApp

### PASSO 6: TESTAR LOGIN
**O que você vai fazer:** Verificar se o sistema de login está funcionando

**Como fazer:**
1. Ir para: `https://app.kryonix.com.br/login`
2. Você deve ver opções de login:
   - 🔐 Login com email/senha
   - 🔵 Entrar com Google
   - 🐙 Entrar com GitHub
3. Testar login com Google (recomendado)

**✅ Como saber se deu certo:** Você consegue fazer login e ver a tela principal

## ✅ VALIDAÇÃO FINAL

**Checklist de validação - marque cada item que estiver funcionando:**

- [ ] **Portainer acessível:** https://painel.kryonix.com.br
- [ ] **Stack keycloak rodando:** Status verde no Portainer
- [ ] **Keycloak acessível:** https://keycloak.kryonix.com.br
- [ ] **Login admin funcionando:** Consegue entrar com kryonix/Vitor@123456
- [ ] **Configuração automática IA:** Recebeu confirmação no WhatsApp
- [ ] **Login usuário funcionando:** https://app.kryonix.com.br/login
- [ ] **OAuth funcionando:** Login com Google/GitHub

**📊 Score necessário:** Pelo menos 6 de 7 itens marcados

## 🆘 PROBLEMAS COMUNS

### **❌ Problema:** "Não consigo acessar keycloak.kryonix.com.br"
**✅ Solução:**
1. Verificar se DNS propagou (pode demorar até 30 minutos)
2. Tentar acesso direto: `http://144.202.90.55:8080`
3. Verificar se container está rodando no Portainer

### **❌ Problema:** "Erro de login no Keycloak admin"
**✅ Solução:**
1. Aguardar mais 2-3 minutos (inicialização pode ser lenta)
2. Verificar credenciais: `kryonix` / `Vitor@123456`
3. Reiniciar container no Portainer se necessário

### **❌ Problema:** "IA não configurou automaticamente"
**✅ Solução:**
1. Verificar se Keycloak está acessível primeiro
2. Tentar novamente o comando curl
3. Mandar WhatsApp: "Ajuda Parte 1 Keycloak"

## 📱 NOTIFICAÇÃO WHATSAPP
Ao final desta parte, você receberá automaticamente no WhatsApp (17) 98180-5327:

```
✅ PARTE 1 CONCLUÍDA!

🔐 Sistema de Autenticação ATIVO
🌐 URL: https://keycloak.kryonix.com.br
👤 Login funcionando
📊 Progresso: 2% (1 de 50 partes)

➡️ Próxima: Parte 2 - Base de Dados
```

## 🔄 DEPLOY AUTOMÁTICO
Esta parte ativa automaticamente:
- ✅ **Sistema de autenticação** na URL principal
- ✅ **Login OAuth** Google e GitHub  
- ✅ **Segurança base** para próximas partes
- ✅ **Integração IA** para configurações automáticas

## ➡️ PRÓXIMA PARTE
Após receber a confirmação no WhatsApp e validar que tudo está funcionando, prossiga para a **Parte 2 - Base de Dados PostgreSQL**.

**🎯 Na Parte 2 você vai:** Configurar o banco de dados principal que armazenará todos os dados do sistema.

---

## 📋 ARQUIVOS DESTA PARTE

```
Parte-01/
├── TUTORIAL-PARTE-01.md (este arquivo)
├── scripts/
│   ├── keycloak-setup.yml (Docker Compose)
│   ├── auto-config.sh (Configuração automática)
│   └── test-auth.sh (Testes de validação)
├── configs/
│   ├── realm-kryonix.json (Configuração realm)
│   └── oauth-settings.json (Configurações OAuth)
└── CHECKLIST-PARTE-01.md (Checklist de validação)
```

---

*Tutorial Parte 1 - Sistema de Autenticação KRYONIX*
*🤖 IA Autônoma • 📱 Mobile-First • 🇧🇷 Português • 📊 Dados Reais*
*🏢 KRYONIX - Autenticação para o Futuro*
