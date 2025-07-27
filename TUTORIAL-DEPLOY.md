# 🚀 Tutorial Completo de Deploy - KRYONIX Platform

## Guia Definitivo para Deploy da Plataforma Autônoma de Automação e IA

### 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Servidor](#configuração-do-servidor)
3. [Subdomínios Profissionais](#subdomínios-profissionais)
4. [Deploy da Aplicação](#deploy-da-aplicação)
5. [Configuração de Monitoramento](#configuração-de-monitoramento)
6. [Segurança e SSL](#segurança-e-ssl)
7. [Backup e Manutenção](#backup-e-manutenção)
8. [Troubleshooting](#troubleshooting)
9. [Deploy Automatizado via GitHub Actions](#deploy-automatizado)

---

## 🎯 Pré-requisitos

### Infraestrutura Necessária

- **Servidor VPS/Cloud**: Mínimo 4GB RAM, 2 vCPUs, 50GB SSD
- **Sistema Operacional**: Ubuntu 22.04 LTS ou superior
- **Domínio**: Registrado com acesso ao DNS (ex: kryonix.com.br)
- **Certificados SSL**: Let's Encrypt (automático) ou comercial
- **Acesso SSH**: Root ou sudo para instalação

### Software Requerido

- Docker & Docker Compose
- Nginx (reverse proxy)
- Node.js 18+ (para build local)
- Git
- UFW (firewall)

### Conhecimentos Técnicos

- Comandos básicos de Linux
- Configuração de DNS
- Noções de Docker/containers
- Configuração básica de nginx

---

## 🖥️ Configuração do Servidor

### 1. Preparação do Ambiente

```bash
# Conectar ao servidor
ssh root@SEU_IP_SERVIDOR

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git vim nano ufw fail2ban

# Criar usuário para aplicação (opcional mas recomendado)
adduser kryonix
usermod -aG sudo kryonix
```

### 2. Instalação do Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Inicializar Docker
systemctl start docker
systemctl enable docker
```

### 3. Instalação do Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Inicializar serviços
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx
```

---

## 🌐 Subdomínios Profissionais

### Configuração DNS (CloudFlare/Provedor)

Configure os seguintes registros A no seu provedor DNS:

```dns
Tipo: A | Nome: app      | Valor: SEU_IP_SERVIDOR | TTL: 300
Tipo: A | Nome: admin    | Valor: SEU_IP_SERVIDOR | TTL: 300
Tipo: A | Nome: gateway  | Valor: SEU_IP_SERVIDOR | TTL: 300
Tipo: A | Nome: monitor  | Valor: SEU_IP_SERVIDOR | TTL: 300
Tipo: A | Nome: metrics  | Valor: SEU_IP_SERVIDOR | TTL: 300
Tipo: A | Nome: status   | Valor: SEU_IP_SERVIDOR | TTL: 300
```

### URLs da Plataforma

Após a configuração, você terá acesso às seguintes URLs:

- **🌐 Aplicação Principal**: https://app.kryonix.com.br
- **👤 Painel Administrativo**: https://admin.kryonix.com.br
- **🔧 Gateway de APIs**: https://gateway.kryonix.com.br
- **📊 Monitoramento (Grafana)**: https://monitor.kryonix.com.br
- **📈 Métricas (Prometheus)**: https://metrics.kryonix.com.br
- **📊 Status da Plataforma**: https://status.kryonix.com.br

### Script Automatizado de Configuração

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/kryonix-platform.git
cd kryonix-platform

# Executar script de configuração de subdomínios
sudo chmod +x scripts/setup-subdomains.sh
sudo ./scripts/setup-subdomains.sh

# Ou com parâmetros customizados
sudo ./scripts/setup-subdomains.sh --domain seudominio.com.br --ip SEU_IP
```

---

## 🚀 Deploy da Aplicação

### 1. Preparação do Código

```bash
# Clonar repositório (se ainda não fez)
git clone https://github.com/SEU_USUARIO/kryonix-platform.git
cd kryonix-platform

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

### 2. Variáveis de Ambiente Essenciais

```env
# Configurações Gerais
NODE_ENV=production
PORT=3000
DOMAIN=kryonix.com.br

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/kryonix
REDIS_URL=redis://localhost:6379

# Autenticação
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
SESSION_SECRET=seu_session_secret_aqui

# APIs Externas
OPENAI_API_KEY=sk-...
WHATSAPP_API_KEY=...
N8N_API_KEY=...

# Email/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_app

# Monitoramento
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_ADMIN_PASSWORD=senha_segura

# Enterprise
ENTERPRISE_LICENSE_KEY=sua_licenca_enterprise
SAML_CERT_PATH=/etc/ssl/certs/saml.crt
LDAP_URL=ldap://seu.domain.com
```

### 3. Build e Deploy

```bash
# Instalar dependências
npm install

# Build da aplicação
npm run build

# Deploy com Docker Compose
docker-compose up -d

# Verificar containers
docker-compose ps
```

### 4. Configuração do Nginx

```bash
# Copiar configuração de subdomínios
sudo cp nginx/kryonix-subdomains.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/kryonix-subdomains.conf /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl reload nginx
```

---

## 📊 Configuração de Monitoramento

### Prometheus (Métricas)

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: "kryonix-api"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: "/api/metrics"
    scrape_interval: 10s

  - job_name: "node-exporter"
    static_configs:
      - targets: ["localhost:9100"]

  - job_name: "nginx"
    static_configs:
      - targets: ["localhost:9113"]

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

### Grafana (Dashboards)

```bash
# Acessar Grafana
https://monitor.kryonix.com.br

# Credenciais padrão:
# User: admin
# Password: (definido no .env)

# Importar dashboards prontos:
# - KRYONIX System Overview (ID: 12345)
# - WhatsApp Analytics (ID: 12346)
# - N8N Workflows (ID: 12347)
# - Enterprise Metrics (ID: 12348)
```

---

## 🔒 Segurança e SSL

### 1. Firewall (UFW)

```bash
# Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir serviços essenciais
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Restringir portas internas (apenas local)
sudo ufw allow from 127.0.0.1 to any port 3000
sudo ufw allow from 127.0.0.1 to any port 3001
sudo ufw allow from 127.0.0.1 to any port 9090

# Ativar firewall
sudo ufw enable
sudo ufw status
```

### 2. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificados para todos os subdomínios
sudo certbot --nginx -d app.kryonix.com.br \
                     -d admin.kryonix.com.br \
                     -d gateway.kryonix.com.br \
                     -d monitor.kryonix.com.br \
                     -d metrics.kryonix.com.br \
                     -d status.kryonix.com.br \
                     --email admin@kryonix.com.br \
                     --agree-tos \
                     --non-interactive \
                     --redirect

# Configurar renovação automática
echo "0 12 * * * root /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'" | sudo tee -a /etc/crontab
```

### 3. Hardening do Sistema

```bash
# Configurar Fail2Ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Configuração recomendada para nginx
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

# Reiniciar Fail2Ban
sudo systemctl restart fail2ban
```

---

## 💾 Backup e Manutenção

### 1. Script de Backup Automatizado

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backup/kryonix"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="kryonix"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos uploads e arquivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /app/uploads /app/stack-uploads

# Backup das configurações
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz /etc/nginx /app/.env

# Limpar backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

### 2. Cron Job para Backup

```bash
# Adicionar ao crontab
sudo crontab -e

# Backup diário às 2h da manhã
0 2 * * * /app/scripts/backup.sh >> /var/log/kryonix-backup.log 2>&1
```

### 3. Monitoramento de Sistema

```bash
# Script de health check
#!/bin/bash
# scripts/health-check.sh

# Verificar serviços
systemctl is-active --quiet nginx || echo "ALERT: Nginx is down"
systemctl is-active --quiet docker || echo "ALERT: Docker is down"

# Verificar containers
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "Up" && echo "ALERT: Some containers are down"

# Verificar espaço em disco
DISK_USAGE=$(df / | awk 'NR==2{printf "%.0f", $5}')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage is ${DISK_USAGE}%"
fi

# Verificar memória
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "ALERT: Memory usage is ${MEM_USAGE}%"
fi
```

---

## 🔧 Troubleshooting

### Problemas Comuns e Soluções

#### 1. Aplicação não carrega (apenas loading screen)

```bash
# Verificar logs da aplicação
docker-compose logs app

# Verificar se todas as dependências estão instaladas
npm install

# Verificar variáveis de ambiente
cat .env

# Reiniciar containers
docker-compose restart
```

#### 2. SSL/HTTPS não funciona

```bash
# Verificar status dos certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Verificar configuração do Nginx
sudo nginx -t

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

#### 3. Subdomínios não resolvem

```bash
# Verificar DNS
dig app.kryonix.com.br
nslookup gateway.kryonix.com.br

# Verificar configuração do Nginx
sudo nginx -T | grep server_name

# Testar conectividade
curl -I https://app.kryonix.com.br
```

#### 4. Performance baixa

```bash
# Verificar recursos do sistema
htop
free -h
df -h

# Otimizar Nginx
# Aumentar worker_processes e worker_connections no nginx.conf

# Otimizar aplicação
# Ativar cache, compressão gzip, CDN
```

### Logs Importantes

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
sudo journalctl -u docker -f

# Logs de segurança
sudo tail -f /var/log/auth.log
sudo fail2ban-client status
```

---

## 🤖 Deploy Automatizado via GitHub Actions

### 1. Configuração do Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy KRYONIX Platform

on:
  push:
    branches: [main, production]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Deploy to Production
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app/kryonix-platform
            git pull origin main
            npm ci --production
            npm run build
            docker-compose down
            docker-compose up -d

      - name: Health Check
        run: |
          sleep 30
          curl -f https://app.kryonix.com.br/api/health || exit 1

      - name: Notify Success
        if: success()
        run: echo "✅ Deploy realizado com sucesso!"

      - name: Notify Failure
        if: failure()
        run: echo "❌ Falha no deploy. Verifique os logs."
```

### 2. Secrets do GitHub

Configure os seguintes secrets no GitHub:

```
HOST: IP do seu servidor
USERNAME: usuário SSH
SSH_KEY: chave privada SSH
DATABASE_URL: URL do banco de dados
JWT_SECRET: chave JWT
OPENAI_API_KEY: chave da OpenAI
... (outras variáveis sensíveis)
```

### 3. Webhook para Deploy Automático

```javascript
// server/routes/deploy-webhook.ts
app.post("/api/deploy-webhook", (req, res) => {
  const { ref, repository } = req.body;

  if (ref === "refs/heads/main" && repository.name === "kryonix-platform") {
    // Executar deploy automático
    exec(
      "cd /app && git pull && npm run build && docker-compose restart",
      (error, stdout, stderr) => {
        if (error) {
          console.error("Deploy failed:", error);
          return res.status(500).json({ error: "Deploy failed" });
        }

        res.json({ message: "Deploy successful", output: stdout });
      },
    );
  } else {
    res.status(400).json({ error: "Invalid webhook" });
  }
});
```

---

## ✅ Checklist Final de Deploy

### Pré-Deploy

- [ ] Servidor configurado com recursos adequados
- [ ] DNS configurado para todos os subdomínios
- [ ] Certificados SSL instalados
- [ ] Firewall configurado
- [ ] Variáveis de ambiente definidas

### Durante o Deploy

- [ ] Código baixado/atualizado
- [ ] Dependências instaladas
- [ ] Build da aplicação executado
- [ ] Containers Docker rodando
- [ ] Nginx configurado e funcionando

### Pós-Deploy

- [ ] Health checks passando
- [ ] Todos os subdomínios acessíveis
- [ ] HTTPS funcionando
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Logs funcionando
- [ ] Performance aceitável

### Testes de Funcionalidade

- [ ] Login/autenticação funcionando
- [ ] WhatsApp integration ativa
- [ ] N8N workflows operacionais
- [ ] Typebot chatbots funcionando
- [ ] Analytics coletando dados
- [ ] Enterprise features (se aplicável)

---

## 📞 Suporte e Manutenção

### Contatos de Emergência

- **Desenvolvedor**: dev@kryonix.com.br
- **DevOps**: devops@kryonix.com.br
- **Suporte 24/7**: suporte@kryonix.com.br

### Documentação Adicional

- [Documentação da API](https://gateway.kryonix.com.br/docs)
- [Guia do Usuário](https://app.kryonix.com.br/help)
- [FAQ Técnico](https://status.kryonix.com.br/faq)

### Atualizações

- **Versão Atual**: 1.0.0-enterprise
- **Próxima Release**: Consulte [GitHub Releases](https://github.com/seu-usuario/kryonix-platform/releases)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

**🎉 Parabéns! Sua plataforma KRYONIX está pronta para produção!**

_Este tutorial foi criado para garantir um deploy seguro e eficiente da plataforma KRYONIX. Para suporte adicional, consulte nossa documentação online ou entre em contato com a equipe técnica._
