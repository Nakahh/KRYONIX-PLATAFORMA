# 🚀 TUTORIAL COMPLETO DE DEPLOY KRYONIX

**Guia passo-a-passo para instalação e configuração da Plataforma KRYONIX no seu servidor**

## 📋 PRÉ-REQUISITOS

### 🖥️ Servidor Recomendado

- **RAM**: Mínimo 8GB (Recomendado: 16GB+)
- **CPU**: 4 cores (Recomendado: 8 cores+)
- **Disco**: 100GB SSD (Recomendado: 500GB+)
- **OS**: Ubuntu 20.04+ ou CentOS 8+
- **Conectividade**: IP fixo + domínio configurado

### 🌐 Domínio e DNS

1. Registre um domínio (ex: `seusite.com.br`)
2. Configure os seguintes subdomínios no seu DNS:
   ```
   app.seusite.com.br      -> IP_DO_SERVIDOR
   api.seusite.com.br      -> IP_DO_SERVIDOR
   evolution.seusite.com.br -> IP_DO_SERVIDOR
   n8n.seusite.com.br      -> IP_DO_SERVIDOR
   typebot.seusite.com.br  -> IP_DO_SERVIDOR
   mautic.seusite.com.br   -> IP_DO_SERVIDOR
   grafana.seusite.com.br  -> IP_DO_SERVIDOR
   prometheus.seusite.com.br -> IP_DO_SERVIDOR
   ```

---

## 🎯 PASSO 1: PREPARAÇÃO DO SERVIDOR

### Conectar no servidor via SSH

```bash
ssh root@SEU_IP_SERVIDOR
```

### Atualizar o sistema

```bash
apt update && apt upgrade -y
```

### Instalar dependências básicas

```bash
apt install -y curl wget git nano htop unzip
```

---

## 🐳 PASSO 2: INSTALAR DOCKER

### Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### Instalar Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Verificar instalação

```bash
docker --version
docker-compose --version
```

---

## 📦 PASSO 3: BAIXAR E CONFIGURAR KRYONIX

### Criar diretório e clonar repositório

```bash
mkdir -p /opt/kryonix
cd /opt/kryonix
git clone https://github.com/SEU_USUARIO/kryonix-platform.git platform
cd platform
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

**Configure as seguintes variáveis:**

```bash
# Domínio principal
DOMAIN=seusite.com.br

# Banco de dados
DATABASE_HOST=postgres
DATABASE_USER=kryonix
DATABASE_PASSWORD=SENHA_SUPER_FORTE_123

# Administração
ADMIN_EMAIL=admin@seusite.com.br
ADMIN_PASSWORD=SENHA_ADMIN_FORTE_456

# APIs externas (opcional)
OPENAI_API_KEY=sk-sua-chave-openai
EVOLUTION_API_KEY=sua-chave-evolution
```

---

## ⚡ PASSO 4: DEPLOY AUTOMÁTICO (1-CLICK)

### Tornar o script executável

```bash
chmod +x scripts/kryonix-auto-deploy.sh
```

### Executar deploy completo

```bash
./scripts/kryonix-auto-deploy.sh
```

**Este comando irá:**

- ✅ Verificar todas as dependências
- ✅ Criar backup automático
- ✅ Construir todas as aplicações
- ✅ Configurar Docker containers
- ✅ Instalar todas as 25+ stacks
- ✅ Configurar SSL automático
- ✅ Executar health checks
- ✅ Configurar monitoramento

**⏰ Tempo estimado: 15-30 minutos**

---

## 🔧 PASSO 5: CONFIGURAÇÃO DAS STACKS

### Upload automático das configurações

```bash
chmod +x scripts/upload-all-stacks.sh
./scripts/upload-all-stacks.sh
```

**Este comando configurará automaticamente:**

- 📱 Evolution API (WhatsApp)
- 🔄 N8N (Automação de workflows)
- 🤖 Typebot (Chatbots)
- 📧 Mautic (Email marketing)
- 📊 Grafana (Dashboards)
- 📈 Prometheus (Monitoramento)
- 💬 Chatwoot (Atendimento)
- 🎯 E todas as outras stacks

---

## 🎉 PASSO 6: VERIFICA��ÃO E ACESSO

### Verificar se tudo está funcionando

```bash
docker-compose ps
```

**Você deve ver todos os serviços com status "Up"**

### Acessar a plataforma

1. **Aplicação Principal**: https://app.seusite.com.br
2. **Painel Admin**: https://app.seusite.com.br/admin
3. **Grafana**: https://grafana.seusite.com.br
4. **Evolution API**: https://evolution.seusite.com.br
5. **N8N**: https://n8n.seusite.com.br

### Credenciais padrão

- **Admin**: Email e senha configurados no `.env`
- **Grafana**: admin / senha configurada no `.env`
- **N8N**: admin / senha123 (altere imediatamente)

---

## 🔒 PASSO 7: CONFIGURAR SSL (AUTOMÁTICO)

O sistema configurará SSL automaticamente via Let's Encrypt.

### Verificar certificados

```bash
docker-compose logs nginx-proxy
```

### Forçar renovação (se necessário)

```bash
docker-compose exec nginx-proxy /app/cert_status
```

---

## 🔄 PASSO 8: CONFIGURAR DEPLOY AUTOMÁTICO

### Configurar webhook do GitHub

1. Vá em seu repositório no GitHub
2. Settings → Webhooks → Add webhook
3. **URL**: `https://api.seusite.com.br/deploy/webhook`
4. **Content type**: `application/json`
5. **Secret**: Gere uma chave secreta
6. **Events**: Select individual → Push

### Configurar variável de ambiente

```bash
echo "GITHUB_WEBHOOK_SECRET=SUA_CHAVE_SECRETA" >> .env
docker-compose restart kryonix-app
```

**A partir de agora, qualquer push para a branch `main` fará deploy automático!**

---

## 🔍 PASSO 9: MONITORAMENTO E LOGS

### Ver logs em tempo real

```bash
# Logs da aplicação principal
docker-compose logs -f kryonix-app

# Logs de todas as stacks
docker-compose logs -f

# Health check de todas as stacks
./scripts/kryonix-auto-deploy.sh health
```

### Acessar métricas

- **Grafana**: https://grafana.seusite.com.br
- **Prometheus**: https://prometheus.seusite.com.br
- **Status geral**: https://app.seusite.com.br/status

---

## 🛠️ PASSO 10: CONFIGURAÇÕES ESPECÍFICAS

### WhatsApp (Evolution API)

1. Acesse: https://evolution.seusite.com.br
2. Vá em "Instances" → "Create Instance"
3. Digite um nome para sua instância
4. Escaneie o QR Code com seu WhatsApp
5. Configure webhooks para integração

### Email Marketing (Mautic)

1. Acesse: https://mautic.seusite.com.br
2. Faça login com as credenciais do `.env`
3. Configure seus provedores de email (SMTP)
4. Crie suas primeiras campanhas

### Automação (N8N)

1. Acesse: https://n8n.seusite.com.br
2. Importe workflows da pasta `stack-uploads/n8n/workflows/`
3. Configure as credenciais das APIs
4. Ative os workflows

### Chatbots (Typebot)

1. Acesse: https://typebot.seusite.com.br
2. Importe fluxos da pasta `stack-uploads/typebot/flows/`
3. Configure integrações com WhatsApp
4. Publique seus bots

---

## 🚨 RESOLUÇÃO DE PROBLEMAS

### Se algum serviço não subir

```bash
# Verificar logs específicos
docker-compose logs NOME_DO_SERVICO

# Reiniciar serviço específico
docker-compose restart NOME_DO_SERVICO

# Verificar recursos do servidor
htop
df -h
```

### Se o deployment falhar

```bash
# Fazer rollback automático
./scripts/kryonix-auto-deploy.sh rollback

# Verificar backups disponíveis
ls -la /opt/kryonix/backups/
```

### Se houver problemas de memória

```bash
# Otimizar Docker
docker system prune -f
docker volume prune -f

# Verificar uso de memória
free -h
docker stats
```

---

## 🔄 MANUTENÇÃO CONTÍNUA

### Backup automático (já configurado)

- Backups diários automáticos em `/opt/kryonix/backups/`
- Retenção de 7 dias
- Inclui código, banco de dados e volumes

### Atualizações automáticas

- Deploy automático via GitHub webhook
- Health checks automáticos
- Rollback automático em caso de falha

### Monitoramento 24/7

- IA autônoma monitora todas as stacks
- Auto-healing em caso de problemas
- Alertas automáticos via Discord/Slack/Email

---

## �� SUPORTE

### Logs importantes

- **Deploy**: `/var/log/kryonix/deploy-*.log`
- **Aplicação**: `docker-compose logs kryonix-app`
- **Healing**: `/var/log/kryonix/healing-*.log`

### Comandos úteis

```bash
# Status completo do sistema
./scripts/kryonix-auto-deploy.sh health

# Reiniciar tudo
docker-compose restart

# Ver uso de recursos
htop
docker stats

# Backup manual
./scripts/kryonix-auto-deploy.sh backup
```

### Contato

- **Email**: suporte@kryonix.com.br
- **Discord**: [Link do Discord]
- **GitHub Issues**: [Link do repositório]

---

## 🎯 PRÓXIMOS PASSOS

Após o deploy bem-sucedido:

1. ✅ **Teste todas as funcionalidades**
2. ✅ **Configure suas integrações específicas**
3. ✅ **Treine sua equipe** no uso da plataforma
4. ✅ **Configure alertas** personalizados
5. ✅ **Monitore performance** via Grafana
6. ✅ **Escale recursos** conforme necessário

---

**🎉 PARABÉNS! Sua plataforma KRYONIX está funcionando 100%!**

_Este tutorial foi criado para usuários sem conhecimento técnico. Em caso de dúvidas, consulte nossa equipe de suporte._
