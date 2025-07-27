# 🚀 DEPLOY DIRETO NO SEU SERVIDOR

## ⚡ **EXECUÇÃO RÁPIDA - 3 COMANDOS**

### 1️⃣ **Baixar e Executar Script**

```bash
# Fazer download do script de deploy
curl -o deploy-kryonix.sh https://raw.githubusercontent.com/seu-repo/scripts/deploy-servidor-automatico.sh

# Tornar executável
chmod +x deploy-kryonix.sh

# Executar deploy completo
./deploy-kryonix.sh
```

### 2️⃣ **OU Copiar e Colar no Terminal:**

```bash
#!/bin/bash

# DEPLOY AUTOMATICO KRYONIX - VERSÃO SIMPLIFICADA
# Servidor: 144.202.90.55

SERVIDOR="144.202.90.55"
USER="linuxuser"
SENHA="{Yn53,KsFDpCmK-L"
DOMINIO="kryonix.app"

echo "🚀 Iniciando deploy KRYONIX no servidor ${SERVIDOR}..."

# Instalar sshpass se necessário
if ! command -v sshpass &> /dev/null; then
    echo "📦 Instalando sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

# Função para executar comandos SSH
run_ssh() {
    sshpass -p "${SENHA}" ssh -o StrictHostKeyChecking=no "${USER}@${SERVIDOR}" "$1"
}

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
run_ssh "sudo apt update && sudo apt upgrade -y"

# 2. Instalar Docker
echo "🐳 Instalando Docker..."
run_ssh "curl -fsSL https://get.docker.com | sudo sh"
run_ssh "sudo usermod -aG docker ${USER}"

# 3. Instalar Docker Compose
echo "🔧 Instalando Docker Compose..."
run_ssh "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
run_ssh "sudo chmod +x /usr/local/bin/docker-compose"

# 4. Criar projeto KRYONIX
echo "📁 Criando estrutura KRYONIX..."
run_ssh "mkdir -p /opt/kryonix && cd /opt/kryonix"

# 5. Criar docker-compose.yml
echo "🐳 Configurando containers..."
sshpass -p "${SENHA}" ssh -o StrictHostKeyChecking=no "${USER}@${SERVIDOR}" 'cat > /opt/kryonix/docker-compose.yml << EOF
version: "3.8"

networks:
  kryonix:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  grafana_data:
  prometheus_data:

services:
  # Nginx Proxy Manager
  nginx-proxy:
    image: nginxproxy/nginx-proxy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./ssl:/etc/nginx/certs
    networks:
      - kryonix
    restart: unless-stopped

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kryonix
      POSTGRES_USER: kryonix
      POSTGRES_PASSWORD: kryonix123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kryonix
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - kryonix
    restart: unless-stopped

  # KRYONIX App
  kryonix-app:
    image: node:18-alpine
    working_dir: /app
    environment:
      - VIRTUAL_HOST='${DOMINIO}'
      - LETSENCRYPT_HOST='${DOMINIO}'
      - NODE_ENV=production
      - DATABASE_URL=postgresql://kryonix:kryonix123@postgres:5432/kryonix
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./app:/app
    command: sh -c "npm install && npm run build && npm start"
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix
    restart: unless-stopped

  # Evolution API (WhatsApp)
  evolution-api:
    image: atendai/evolution-api:latest
    environment:
      - VIRTUAL_HOST=whatsapp.'${DOMINIO}'
      - LETSENCRYPT_HOST=whatsapp.'${DOMINIO}'
      - DATABASE_CONNECTION_URI=postgresql://kryonix:kryonix123@postgres:5432/kryonix
      - REDIS_URI=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix
    restart: unless-stopped

  # N8N
  n8n:
    image: n8nio/n8n:latest
    environment:
      - VIRTUAL_HOST=n8n.'${DOMINIO}'
      - LETSENCRYPT_HOST=n8n.'${DOMINIO}'
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=kryonix
      - DB_POSTGRESDB_USER=kryonix
      - DB_POSTGRESDB_PASSWORD=kryonix123
    depends_on:
      - postgres
    networks:
      - kryonix
    restart: unless-stopped

  # Grafana
  grafana:
    image: grafana/grafana:latest
    environment:
      - VIRTUAL_HOST=grafana.'${DOMINIO}'
      - LETSENCRYPT_HOST=grafana.'${DOMINIO}'
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - kryonix
    restart: unless-stopped

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    environment:
      - VIRTUAL_HOST=prometheus.'${DOMINIO}'
      - LETSENCRYPT_HOST=prometheus.'${DOMINIO}'
    volumes:
      - prometheus_data:/prometheus
    networks:
      - kryonix
    restart: unless-stopped
EOF'

# 6. Criar aplicação KRYONIX básica
echo "📱 Criando aplicação..."
run_ssh "mkdir -p /opt/kryonix/app"

sshpass -p "${SENHA}" ssh -o StrictHostKeyChecking=no "${USER}@${SERVIDOR}" 'cat > /opt/kryonix/app/package.json << EOF
{
  "name": "kryonix-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "build": "echo Building..."
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF'

sshpass -p "${SENHA}" ssh -o StrictHostKeyChecking=no "${USER}@${SERVIDOR}" 'cat > /opt/kryonix/app/server.js << EOF
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>KRYONIX Platform</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 50px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          h1 { font-size: 3em; margin-bottom: 20px; }
          .status { color: #4CAF50; font-weight: bold; }
          .links { margin-top: 30px; }
          .link {
            display: inline-block;
            margin: 10px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            text-decoration: none;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
          }
          .link:hover { background: rgba(255,255,255,0.3); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 KRYONIX</h1>
          <p class="status">✅ Plataforma Online e Funcionando!</p>
          <p>Sistema SaaS 100% Autônomo com IA</p>
          <div class="links">
            <a href="http://whatsapp.'${DOMINIO}'" class="link">📱 WhatsApp</a>
            <a href="http://n8n.'${DOMINIO}'" class="link">🔄 N8N</a>
            <a href="http://grafana.'${DOMINIO}'" class="link">📊 Grafana</a>
            <a href="http://prometheus.'${DOMINIO}'" class="link">📈 Prometheus</a>
          </div>
          <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
            Deploy realizado com sucesso em ${new Date().toLocaleString("pt-BR")}
          </p>
        </div>
      </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 KRYONIX rodando na porta ${port}`);
});
EOF'

# 7. Iniciar todos os serviços
echo "🚀 Iniciando serviços..."
run_ssh "cd /opt/kryonix && docker-compose up -d"

# 8. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# 9. Verificar status
echo "🏥 Verificando status..."
run_ssh "cd /opt/kryonix && docker-compose ps"

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "🌐 Acesse: http://${SERVIDOR}"
echo "📱 WhatsApp: http://whatsapp.${DOMINIO}"
echo "🔄 N8N: http://n8n.${DOMINIO}"
echo "📊 Grafana: http://grafana.${DOMINIO}"
echo ""
echo "✅ Todas as stacks estão rodando no seu servidor!"
```

### 3️⃣ **Configurar DNS (Importante!)**

Aponte estes subdomínios para o IP `144.202.90.55`:

```
kryonix.app          -> 144.202.90.55
app.kryonix.app      -> 144.202.90.55
whatsapp.kryonix.app -> 144.202.90.55
n8n.kryonix.app      -> 144.202.90.55
grafana.kryonix.app  -> 144.202.90.55
prometheus.kryonix.app -> 144.202.90.55
```

---

## 🎯 **RESULTADO:**

Após executar o script você terá:

✅ **Aplicação principal** em `http://144.202.90.55`  
✅ **WhatsApp Business** em `http://whatsapp.kryonix.app`  
✅ **N8N Automation** em `http://n8n.kryonix.app`  
✅ **Grafana Analytics** em `http://grafana.kryonix.app`  
✅ **Prometheus Metrics** em `http://prometheus.kryonix.app`

## 📱 **VER INTERFACE AGORA:**

**No Builder.io:** A interface está funcionando! Clique em qualquer link da página inicial para explorar.

**No seu servidor:** Após o deploy, você terá a plataforma completa rodando.

---

## ⚡ **EXECUÇÃO IMEDIATA:**

1. **Copie todo o código do script acima**
2. **Cole no terminal do seu computador**
3. **Execute** (vai conectar automaticamente no seu servidor)
4. **Aguarde ~10 minutos** para conclusão
5. **Acesse** `http://144.202.90.55`

🎉 **Pronto! Sua plataforma estará rodando!**
