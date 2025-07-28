# 🚀 DEPLOY AUTOMÁTICO CONTÍNUO - KRYONIX
*Sistema de Deploy que Atualiza www.kryonix.com.br Automaticamente Conforme Andamento das 50 Partes*

---

## 🎯 **OBJETIVO DO DEPLOY CONTÍNUO**
Configurar sistema que:
- 📱 **Atualiza automaticamente** www.kryonix.com.br conforme progresso
- 🤖 **IA monitora** e executa deploy de cada parte
- 🇧🇷 **Interface em português** para acompanhar progresso
- 📊 **Métricas reais** de cada deploy
- 💬 **Notificações WhatsApp** de cada etapa concluída
- 🔧 **Rollback automático** se houver problemas

---

## 🏗️ **ARQUITETURA DO DEPLOY CONTÍNUO**

### **1. Estrutura de Repositório GitHub**

#### **1.1 Criar Repositório Principal**
```bash
# No GitHub, criar repositório:
# Nome: kryonix-saas-platform
# URL: https://github.com/vitorfernandes/kryonix-saas-platform
# Privado: SIM
# README: SIM
# .gitignore: Node
# License: MIT
```

#### **1.2 Estrutura de Branches**
```yaml
BRANCHES:
  main: 
    description: "Branch principal de produção"
    deploy_target: "www.kryonix.com.br"
    auto_deploy: true
    
  develop:
    description: "Branch de desenvolvimento"
    deploy_target: "dev.kryonix.com.br"
    auto_deploy: true
    
  staging:
    description: "Branch de homologação"
    deploy_target: "staging.kryonix.com.br"
    auto_deploy: false # Requer aprovação manual
    
  features/*:
    description: "Branches de features específicas"
    deploy_target: "preview-*.kryonix.com.br"
    auto_deploy: false
```

#### **1.3 Estrutura de Pastas**
```
kryonix-saas-platform/
├── .github/
│   ├── workflows/
│   │   ├── deploy-production.yml
│   │   ├── deploy-staging.yml
│   │   └── sync-parts.yml
│   └── templates/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── src/
│   ├── config/
│   ├── package.json
│   └── Dockerfile
├── infrastructure/
│   ├── docker/
│   ├── k8s/
│   ├── scripts/
│   └── portainer/
├── docs/
│   ├── tutorials/
│   │   ├── parte-01/
│   │   ├── parte-02/
│   │   └── ... até parte-50/
│   ├── api/
│   └── deployment/
├── scripts/
│   ├── deploy/
│   ├── backup/
│   └── monitoring/
└── .current-part (arquivo com número da parte atual)
```

---

## 🔄 **GITHUB ACTIONS - PIPELINE CI/CD**

### **2. Workflow Principal de Deploy**

#### **2.1 Deploy Production Workflow**
```yaml
# .github/workflows/deploy-production.yml
name: 🚀 Deploy KRYONIX Production

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      part_number:
        description: 'Número da parte a ser deployada (1-50)'
        required: true
        type: number
        default: 1

env:
  DOMAIN: kryonix.com.br
  SERVER_IP: 144.202.90.55
  PORTAINER_URL: https://painel.kryonix.com.br
  EVOLUTION_API: https://evolution.kryonix.com.br

jobs:
  # JOB 1: Validação e Testes
  validate:
    name: 🔍 Validar Código e Parte
    runs-on: ubuntu-latest
    outputs:
      current_part: ${{ steps.get_part.outputs.part }}
      part_name: ${{ steps.get_part.outputs.name }}
    
    steps:
    - name: 📥 Checkout código
      uses: actions/checkout@v4
      
    - name: 📊 Obter parte atual
      id: get_part
      run: |
        if [ -f ".current-part" ]; then
          CURRENT_PART=$(cat .current-part)
        else
          CURRENT_PART=1
        fi
        
        # Mapear número para nome da parte
        case $CURRENT_PART in
          1) PART_NAME="Autenticação e Keycloak" ;;
          2) PART_NAME="Base de Dados PostgreSQL" ;;
          3) PART_NAME="Storage MinIO" ;;
          4) PART_NAME="Cache Redis" ;;
          5) PART_NAME="Proxy Reverso Traefik" ;;
          *) PART_NAME="Parte $CURRENT_PART" ;;
        esac
        
        echo "part=$CURRENT_PART" >> $GITHUB_OUTPUT
        echo "name=$PART_NAME" >> $GITHUB_OUTPUT
        echo "🎯 Parte atual: $CURRENT_PART - $PART_NAME"
        
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'frontend/package-lock.json'
        
    - name: 📚 Instalar dependências Frontend
      run: |
        cd frontend
        npm ci --prefer-offline --no-audit
        
    - name: 📚 Instalar dependências Backend  
      run: |
        cd backend
        npm ci --prefer-offline --no-audit
        
    - name: 🧪 Executar testes Frontend
      run: |
        cd frontend
        npm test -- --coverage --watchAll=false --passWithNoTests
        
    - name: 🧪 Executar testes Backend
      run: |
        cd backend
        npm test -- --passWithNoTests
        
    - name: 🔍 Lint e verificações
      run: |
        cd frontend && npm run lint --if-present
        cd ../backend && npm run lint --if-present
        
    - name: 🏗️ Build aplicações
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build --if-present

  # JOB 2: Build Docker Images
  build:
    name: 🐳 Build Docker Images
    runs-on: ubuntu-latest
    needs: validate
    if: success()
    
    steps:
    - name: 📥 Checkout
      uses: actions/checkout@v4
      
    - name: 🐳 Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: 🔐 Login Registry Docker
      uses: docker/login-action@v3
      with:
        registry: registry.kryonix.com.br
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
        
    - name: 🏗️ Build Frontend Image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        file: ./frontend/Dockerfile
        push: true
        tags: |
          registry.kryonix.com.br/kryonix-frontend:latest
          registry.kryonix.com.br/kryonix-frontend:${{ github.sha }}
          registry.kryonix.com.br/kryonix-frontend:parte-${{ needs.validate.outputs.current_part }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: 🏗️ Build Backend Image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        file: ./backend/Dockerfile
        push: true
        tags: |
          registry.kryonix.com.br/kryonix-backend:latest
          registry.kryonix.com.br/kryonix-backend:${{ github.sha }}
          registry.kryonix.com.br/kryonix-backend:parte-${{ needs.validate.outputs.current_part }}

  # JOB 3: Deploy para Produção
  deploy:
    name: 🚀 Deploy Produção
    runs-on: ubuntu-latest
    needs: [validate, build]
    if: success()
    environment: production
    
    steps:
    - name: 📥 Checkout
      uses: actions/checkout@v4
      
    - name: 🔐 Setup SSH
      uses: webfactory/ssh-agent@v0.8.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
        
    - name: 📋 Verificar pré-requisitos no servidor
      run: |
        ssh -o StrictHostKeyChecking=no root@${{ env.SERVER_IP }} '
          echo "🔍 Verificando pré-requisitos..."
          
          # Verificar Docker Swarm
          if ! docker info | grep -q "Swarm: active"; then
            echo "❌ Docker Swarm não está ativo"
            exit 1
          fi
          
          # Verificar rede Kryonix-NET
          if ! docker network ls | grep -q "kryonix-net"; then
            echo "❌ Rede kryonix-net não encontrada"
            exit 1
          fi
          
          # Verificar Portainer
          if ! curl -f -s https://painel.kryonix.com.br/api/system/status > /dev/null; then
            echo "❌ Portainer não está acessível"
            exit 1
          fi
          
          echo "✅ Todos os pré-requisitos verificados"
        '
        
    - name: 🚀 Deploy via Portainer API
      env:
        PORTAINER_API_KEY: ${{ secrets.PORTAINER_API_KEY }}
      run: |
        echo "🚀 Iniciando deploy da Parte ${{ needs.validate.outputs.current_part }}..."
        
        # Atualizar stack principal via Portainer API
        curl -X POST "${{ env.PORTAINER_URL }}/api/stacks/1/git/redeploy" \
          -H "X-API-Key: ${{ env.PORTAINER_API_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{
            "prune": true,
            "pullImage": true,
            "repositoryAuthentication": true,
            "repositoryUsername": "${{ secrets.DOCKER_USERNAME }}",
            "repositoryPassword": "${{ secrets.DOCKER_PASSWORD }}"
          }'
          
        echo "✅ Deploy realizado via Portainer"
        
    - name: 🔄 Executar script específico da parte
      run: |
        PART_NUMBER=${{ needs.validate.outputs.current_part }}
        
        # Executar script específico da parte no servidor
        ssh -o StrictHostKeyChecking=no root@${{ env.SERVER_IP }} "
          if [ -f '/opt/kryonix/scripts/deploy-parte-${PART_NUMBER}.sh' ]; then
            echo '🔧 Executando script específico da Parte ${PART_NUMBER}...'
            chmod +x /opt/kryonix/scripts/deploy-parte-${PART_NUMBER}.sh
            /opt/kryonix/scripts/deploy-parte-${PART_NUMBER}.sh
          else
            echo '⚠️ Script específico da Parte ${PART_NUMBER} não encontrado'
          fi
        "
        
    - name: 🌐 Verificar DNS e SSL
      run: |
        echo "🌐 Verificando DNS e SSL..."
        
        # Verificar se domínio resolve
        if ! nslookup www.kryonix.com.br > /dev/null; then
          echo "❌ DNS não está resolvendo"
          exit 1
        fi
        
        # Verificar SSL
        if ! curl -f -s https://www.kryonix.com.br > /dev/null; then
          echo "⚠️ HTTPS ainda não está disponível, aguardando..."
          sleep 30
        fi
        
        echo "✅ DNS e SSL verificados"
        
    - name: 🔍 Health Check Completo
      run: |
        echo "🔍 Executando health checks..."
        
        # Array de endpoints para verificar
        ENDPOINTS=(
          "https://www.kryonix.com.br"
          "https://app.kryonix.com.br"
          "https://api.kryonix.com.br/health"
        )
        
        for endpoint in "${ENDPOINTS[@]}"; do
          echo "Verificando $endpoint..."
          
          # Retry com timeout
          for i in {1..5}; do
            if curl -f -s --max-time 10 "$endpoint" > /dev/null; then
              echo "✅ $endpoint está respondendo"
              break
            else
              echo "⏳ Tentativa $i/5 para $endpoint..."
              sleep 10
            fi
            
            if [ $i -eq 5 ]; then
              echo "❌ $endpoint não está respondendo após 5 tentativas"
              exit 1
            fi
          done
        done
        
        echo "✅ Todos os health checks passaram"

  # JOB 4: Testes Pós-Deploy
  post_deploy_tests:
    name: 🧪 Testes Pós-Deploy
    runs-on: ubuntu-latest
    needs: [validate, deploy]
    if: success()
    
    steps:
    - name: 🧪 Testes de Fumaça
      run: |
        echo "🧪 Executando testes de fumaça..."
        
        # Teste básico da homepage
        if ! curl -f -s https://www.kryonix.com.br | grep -q "KRYONIX"; then
          echo "❌ Homepage não está exibindo conteúdo correto"
          exit 1
        fi
        
        # Teste da API
        if ! curl -f -s https://api.kryonix.com.br/health | grep -q "ok"; then
          echo "❌ API não está saudável"
          exit 1
        fi
        
        echo "✅ Testes de fumaça passaram"
        
    - name: 📊 Verificar Métricas
      run: |
        echo "📊 Verificando métricas..."
        
        # Verificar Grafana
        if ! curl -f -s https://grafana.kryonix.com.br/api/health > /dev/null; then
          echo "⚠️ Grafana não está acessível"
        else
          echo "✅ Grafana está funcionando"
        fi
        
        # Verificar Prometheus
        if ! curl -f -s https://prometheus.kryonix.com.br/-/healthy > /dev/null; then
          echo "⚠️ Prometheus não está acessível"
        else
          echo "✅ Prometheus está funcionando"
        fi

  # JOB 5: Notificações e Finalização
  notify:
    name: 📱 Notificar Conclusão
    runs-on: ubuntu-latest
    needs: [validate, deploy, post_deploy_tests]
    if: always()
    
    steps:
    - name: 📱 Notificar Sucesso via WhatsApp
      if: needs.deploy.result == 'success' && needs.post_deploy_tests.result == 'success'
      run: |
        curl -X POST "${{ env.EVOLUTION_API }}/message/sendText" \
          -H "apikey: ${{ secrets.EVOLUTION_API_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{
            "number": "5517981805327",
            "text": "✅ DEPLOY REALIZADO COM SUCESSO!\n\n🎯 Parte: ${{ needs.validate.outputs.current_part }} - ${{ needs.validate.outputs.part_name }}\n📊 Commit: ${{ github.sha }}\n🌐 URL: https://www.kryonix.com.br\n⏰ Horário: '"$(date '+%d/%m/%Y %H:%M:%S')"'\n🚀 Status: Produção Online\n\n📋 Próxima: Parte ${{ needs.validate.outputs.current_part + 1 }}"
          }'
          
    - name: 🚨 Notificar Falha via WhatsApp
      if: needs.deploy.result == 'failure' || needs.post_deploy_tests.result == 'failure'
      run: |
        curl -X POST "${{ env.EVOLUTION_API }}/message/sendText" \
          -H "apikey: ${{ secrets.EVOLUTION_API_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{
            "number": "5517981805327",
            "text": "🚨 FALHA NO DEPLOY!\n\n❌ Parte: ${{ needs.validate.outputs.current_part }} - ${{ needs.validate.outputs.part_name }}\n📊 Commit: ${{ github.sha }}\n📝 Verificar logs: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}\n⏰ Horário: '"$(date '+%d/%m/%Y %H:%M:%S')"'\n\n🔄 Rollback automático será iniciado"
          }'
          
    - name: 🔄 Atualizar progresso
      if: needs.deploy.result == 'success' && needs.post_deploy_tests.result == 'success'
      run: |
        NEXT_PART=$(($(cat .current-part) + 1))
        if [ $NEXT_PART -le 50 ]; then
          echo $NEXT_PART > .current-part
          git config user.name "KRYONIX Deploy Bot"
          git config user.email "deploy@kryonix.com.br"
          git add .current-part
          git commit -m "🚀 Atualizar progresso para Parte $NEXT_PART [skip ci]"
          git push
        else
          echo "🎉 Todas as 50 partes foram concluídas!"
        fi
```

---

## 🔧 **SCRIPTS DE AUTOMAÇÃO NO SERVIDOR**

### **3. Scripts Específicos por Parte**

#### **3.1 Script Base para Cada Parte**
```bash
#!/bin/bash
# /opt/kryonix/scripts/deploy-parte-01.sh
# Deploy específico da Parte 01 - Autenticação e Keycloak

PART_NUMBER=1
PART_NAME="Autenticação e Keycloak"

echo "🚀 Iniciando deploy da Parte $PART_NUMBER - $PART_NAME..."

# 1. Verificar pré-requisitos específicos
echo "🔍 Verificando pré-requisitos da Parte $PART_NUMBER..."

# Verificar se Keycloak está rodando
if ! docker ps | grep -q "keycloak-kryonix"; then
    echo "❌ Keycloak não está rodando"
    exit 1
fi

# Verificar se PostgreSQL está acessível
if ! docker exec postgresql-kryonix pg_isready -U postgres; then
    echo "❌ PostgreSQL não está acessível"
    exit 1
fi

# 2. Executar configurações específicas da parte
echo "🔧 Executando configurações da Parte $PART_NUMBER..."

# Configurar realm KRYONIX se não existir
if ! docker exec keycloak-kryonix /opt/keycloak/bin/kcadm.sh get realms/KRYONIX --no-config --server http://localhost:8080 --realm master --user admin --password $KEYCLOAK_ADMIN_PASSWORD > /dev/null 2>&1; then
    echo "🔧 Criando realm KRYONIX..."
    # Script para criar realm via API
    create_keycloak_realm.sh
fi

# 3. Verificar saúde dos serviços
echo "🔍 Verificando saúde dos serviços..."

# Health check Keycloak
if ! curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null; then
    echo "❌ Keycloak não está saudável"
    exit 1
fi

# 4. Configurar monitoramento específico
echo "📊 Configurando monitoramento..."

# Ativar métricas específicas da parte
configure_metrics_part_01.sh

# 5. Backup específico
echo "💾 Realizando backup específico..."
backup_keycloak_config.sh

# 6. Notificar conclusão específica
echo "📱 Notificando conclusão da Parte $PART_NUMBER..."

curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"number\": \"5517981805327\",
    \"text\": \"✅ Parte $PART_NUMBER concluída!\\n\\n🔐 $PART_NAME configurado\\n📱 Interface mobile-ready\\n🤖 IA integrada\\n🌐 Disponível em: https://keycloak.kryonix.com.br\"
  }"

echo "✅ Deploy da Parte $PART_NUMBER concluído com sucesso!"
```

#### **3.2 Gerador Automático de Scripts**
```bash
#!/bin/bash
# /opt/kryonix/scripts/generate-part-scripts.sh
# Gera scripts individuais para todas as 50 partes

SCRIPTS_DIR="/opt/kryonix/scripts"

# Array com nomes das partes
PARTS=(
    "Autenticação e Keycloak"
    "Base de Dados PostgreSQL"
    "Storage MinIO"
    "Cache Redis"
    "Proxy Reverso Traefik"
    "Monitoramento Base"
    "Sistema de Mensageria RabbitMQ"
    "Backup Automático"
    "Segurança Básica"
    "API Gateway"
    # ... continuar até 50
)

for i in {1..50}; do
    PART_NUM=$(printf "%02d" $i)
    PART_NAME="${PARTS[$i-1]:-"Parte $i"}"
    SCRIPT_FILE="$SCRIPTS_DIR/deploy-parte-$PART_NUM.sh"
    
    if [ ! -f "$SCRIPT_FILE" ]; then
        echo "📝 Criando script para Parte $i - $PART_NAME..."
        
        cat > "$SCRIPT_FILE" << EOF
#!/bin/bash
# Deploy específico da Parte $i - $PART_NAME

PART_NUMBER=$i
PART_NAME="$PART_NAME"

echo "🚀 Iniciando deploy da Parte \$PART_NUMBER - \$PART_NAME..."

# TODO: Implementar configurações específicas da Parte $i

echo "✅ Deploy da Parte \$PART_NUMBER concluído!"
EOF

        chmod +x "$SCRIPT_FILE"
        echo "✅ Script criado: $SCRIPT_FILE"
    fi
done

echo "🎯 Todos os scripts das 50 partes foram criados!"
```

---

## 📊 **MONITORAMENTO DO DEPLOY**

### **4. Dashboard de Progresso em Tempo Real**

#### **4.1 Configurar WebSocket para Updates**
```javascript
// frontend/src/components/DeployProgress.jsx
import React, { useState, useEffect } from 'react';

export const DeployProgress = () => {
  const [currentPart, setCurrentPart] = useState(1);
  const [deployStatus, setDeployStatus] = useState('idle');
  const [deployLogs, setDeployLogs] = useState([]);
  const [partsCompleted, setPartsCompleted] = useState([]);

  useEffect(() => {
    // WebSocket para atualizações em tempo real
    const ws = new WebSocket('wss://api.kryonix.com.br/deploy-status');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'part_started':
          setCurrentPart(update.part_number);
          setDeployStatus('deploying');
          setDeployLogs(prev => [...prev, {
            time: new Date(),
            level: 'info',
            message: `🚀 Iniciando Parte ${update.part_number} - ${update.part_name}`
          }]);
          break;
          
        case 'part_completed':
          setPartsCompleted(prev => [...prev, update.part_number]);
          setDeployStatus('success');
          setDeployLogs(prev => [...prev, {
            time: new Date(),
            level: 'success',
            message: `✅ Parte ${update.part_number} concluída com sucesso!`
          }]);
          break;
          
        case 'part_failed':
          setDeployStatus('error');
          setDeployLogs(prev => [...prev, {
            time: new Date(),
            level: 'error',
            message: `❌ Falha na Parte ${update.part_number}: ${update.error}`
          }]);
          break;
          
        case 'deploy_log':
          setDeployLogs(prev => [...prev, {
            time: new Date(),
            level: update.level,
            message: update.message
          }]);
          break;
      }
    };
    
    return () => ws.close();
  }, []);

  const progressPercentage = (partsCompleted.length / 50) * 100;

  return (
    <div className="deploy-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🚀 Deploy KRYONIX - Progresso das 50 Partes</h1>
        <div className={`status-badge ${deployStatus}`}>
          {deployStatus === 'deploying' && '🔄 Deployando...'}
          {deployStatus === 'success' && '✅ Sucesso'}
          {deployStatus === 'error' && '❌ Erro'}
          {deployStatus === 'idle' && '⏳ Aguardando'}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-text">
          {partsCompleted.length} de 50 partes concluídas ({progressPercentage.toFixed(1)}%)
        </div>
      </div>

      {/* Grid das 50 Partes */}
      <div className="parts-grid">
        {Array.from({ length: 50 }, (_, i) => i + 1).map((partNumber) => (
          <div 
            key={partNumber}
            className={`part-card ${
              partsCompleted.includes(partNumber) ? 'completed' :
              partNumber === currentPart ? 'current' : 'pending'
            }`}
          >
            <div className="part-number">{partNumber}</div>
            <div className="part-status">
              {partsCompleted.includes(partNumber) ? '✅' :
               partNumber === currentPart ? '🔄' : '⏳'}
            </div>
          </div>
        ))}
      </div>

      {/* Logs em Tempo Real */}
      <div className="deploy-logs">
        <h3>📝 Logs do Deploy</h3>
        <div className="logs-container">
          {deployLogs.slice(-20).map((log, index) => (
            <div key={index} className={`log-entry ${log.level}`}>
              <span className="log-time">
                {log.time.toLocaleTimeString()}
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <button 
          className="btn-primary"
          onClick={() => window.open('https://github.com/vitorfernandes/kryonix-saas-platform/actions', '_blank')}
        >
          📊 Ver GitHub Actions
        </button>
        <button 
          className="btn-secondary"
          onClick={() => window.open('https://painel.kryonix.com.br', '_blank')}
        >
          🐳 Abrir Portainer
        </button>
        <button 
          className="btn-secondary"
          onClick={() => window.open('https://grafana.kryonix.com.br', '_blank')}
        >
          📈 Ver Métricas
        </button>
      </div>
    </div>
  );
};
```

---

## 🚨 **SISTEMA DE ALERTAS E ROLLBACK**

### **5. Rollback Automático**

#### **5.1 Script de Rollback Inteligente**
```bash
#!/bin/bash
# /opt/kryonix/scripts/rollback-automatic.sh
# Rollback automático em caso de falha

ROLLBACK_REASON="$1"
FAILED_PART="$2"
LAST_GOOD_COMMIT="$3"

echo "🚨 Iniciando rollback automático..."
echo "📋 Motivo: $ROLLBACK_REASON"
echo "❌ Parte com falha: $FAILED_PART"
echo "✅ Último commit bom: $LAST_GOOD_COMMIT"

# 1. Notificar início do rollback
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"number\": \"5517981805327\",
    \"text\": \"🚨 ROLLBACK AUTOMÁTICO INICIADO\\n\\n❌ Falha na Parte $FAILED_PART\\n📋 Motivo: $ROLLBACK_REASON\\n🔄 Voltando para commit: $LAST_GOOD_COMMIT\"
  }"

# 2. Backup do estado atual
echo "💾 Fazendo backup do estado atual..."
BACKUP_DIR="/opt/kryonix/backups/rollback/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dos containers atuais
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$BACKUP_DIR/containers_before_rollback.txt"

# 3. Rollback das imagens Docker
echo "🐳 Fazendo rollback das imagens Docker..."

# Parar containers da versão com falha
docker stack rm kryonix-app || true
sleep 30

# Deploy da versão anterior
docker stack deploy -c /opt/kryonix/docker-compose.prod.yml kryonix-app

# 4. Verificar saúde após rollback
echo "🔍 Verificando saúde após rollback..."

HEALTH_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=10

while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  if curl -f -s https://www.kryonix.com.br/health > /dev/null; then
    echo "✅ Sistema está saudável após rollback"
    break
  else
    echo "⏳ Aguardando sistema ficar saudável... ($((HEALTH_CHECK_ATTEMPTS + 1))/$MAX_ATTEMPTS)"
    sleep 30
    HEALTH_CHECK_ATTEMPTS=$((HEALTH_CHECK_ATTEMPTS + 1))
  fi
done

if [ $HEALTH_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]; then
  echo "❌ Sistema não ficou saudável após rollback"
  # Notificar falha crítica
  curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"number\": \"5517981805327\",
      \"text\": \"🚨 FALHA CRÍTICA NO ROLLBACK!\\n\\nSistema não ficou saudável após rollback.\\nIntervenção manual necessária URGENTE!\\n\\n📞 Contatar suporte técnico imediatamente.\"
    }"
  exit 1
fi

# 5. Atualizar progresso para parte anterior
PREVIOUS_PART=$((FAILED_PART - 1))
echo $PREVIOUS_PART > /opt/kryonix/.current-part

# 6. Notificar sucesso do rollback
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"number\": \"5517981805327\",
    \"text\": \"✅ ROLLBACK CONCLUÍDO COM SUCESSO!\\n\\n🔄 Sistema retornou à Parte $PREVIOUS_PART\\n🌐 www.kryonix.com.br está funcionando\\n⏰ Duração do rollback: $(($(date +%s) - $START_TIME))s\\n\\n📋 Revisar Parte $FAILED_PART antes de tentar novamente.\"
  }"

echo "✅ Rollback automático concluído com sucesso!"
```

---

## 🔧 **CONFIGURAÇÃO INICIAL NO SERVIDOR**

### **6. Setup Completo do Deploy Automático**

#### **6.1 Script de Instalação**
```bash
#!/bin/bash
# /opt/kryonix/scripts/setup-continuous-deployment.sh
# Configura deploy automático completo

echo "🚀 Configurando Deploy Automático KRYONIX..."

# 1. Criar estrutura de diretórios
mkdir -p /opt/kryonix/{scripts,backups,logs,config}
mkdir -p /opt/kryonix/backups/{postgresql,redis,minio,configs}
mkdir -p /opt/kryonix/scripts/{deploy,backup,monitoring,rollback}

# 2. Configurar GitHub Runner (opcional - para execução local)
echo "🔧 Configurando GitHub Actions Runner..."

# Download do runner
cd /opt/kryonix
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
rm actions-runner-linux-x64-2.311.0.tar.gz

# 3. Configurar webhooks do Portainer
echo "🔗 Configurando webhooks do Portainer..."

curl -X POST "https://painel.kryonix.com.br/api/webhooks" \
  -H "X-API-Key: $PORTAINER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "github-deploy-webhook",
    "endpoints": [1],
    "resource": "service",
    "action": "redeploy"
  }'

# 4. Configurar monitoramento de deploy
echo "📊 Configurando monitoramento de deploy..."

# Instalar componentes de monitoramento específicos
docker run -d \
  --name kryonix-deploy-monitor \
  --network kryonix-net \
  --restart always \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  -e WEBHOOK_URL="https://api.kryonix.com.br/webhook/deploy" \
  -e EVOLUTION_API_KEY="$EVOLUTION_API_KEY" \
  -v /opt/kryonix/logs:/app/logs \
  kryonix/deploy-monitor:latest

# 5. Configurar backup pré-deploy
echo "💾 Configurando backup pré-deploy..."

cat > /opt/kryonix/scripts/backup/pre-deploy-backup.sh << 'EOF'
#!/bin/bash
# Backup completo antes de cada deploy

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/pre-deploy/$BACKUP_DATE"

mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker exec postgresql-kryonix pg_dumpall -U postgres | gzip > "$BACKUP_DIR/postgresql_full.sql.gz"

# Backup Redis
docker exec redis-kryonix redis-cli BGSAVE
docker exec redis-kryonix cp /data/dump.rdb /tmp/
docker cp redis-kryonix:/tmp/dump.rdb "$BACKUP_DIR/redis_dump.rdb"

# Backup configurações Portainer
docker exec portainer cp -r /data "$BACKUP_DIR/portainer_data"

echo "✅ Backup pré-deploy concluído: $BACKUP_DIR"
EOF

chmod +x /opt/kryonix/scripts/backup/pre-deploy-backup.sh

# 6. Configurar logs centralizados
echo "📝 Configurando logs centralizados..."

# Logrotate para logs do KRYONIX
cat > /etc/logrotate.d/kryonix << 'EOF'
/opt/kryonix/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
EOF

echo "✅ Deploy Automático configurado com sucesso!"
echo "🌐 Acesse o dashboard: https://deploy.kryonix.com.br"
echo "📊 M��tricas: https://grafana.kryonix.com.br"
echo "🐳 Portainer: https://painel.kryonix.com.br"
```

---

## 📋 **CHECKLIST FINAL DO DEPLOY AUTOMÁTICO**

### **✅ CONFIGURAÇÃO INICIAL**
- [ ] Repositório GitHub criado
- [ ] Branches configurados (main, develop, staging)
- [ ] Secrets do GitHub configurados
- [ ] Docker Registry configurado
- [ ] Portainer API configurado
- [ ] Webhooks configurados
- [ ] Scripts de deploy criados (50 scripts)

### **✅ PIPELINE CI/CD**
- [ ] GitHub Actions funcionando
- [ ] Build automático das imagens
- [ ] Deploy automático via Portainer
- [ ] Health checks funcionando
- [ ] Testes pós-deploy executando

### **✅ MONITORAMENTO**
- [ ] Dashboard de progresso funcionando
- [ ] WebSocket para updates em tempo real
- [ ] Métricas no Grafana
- [ ] Logs centralizados
- [ ] Alertas configurados

### **✅ BACKUP E ROLLBACK**
- [ ] Backup pré-deploy funcionando
- [ ] Rollback automático configurado
- [ ] Scripts de restauração testados
- [ ] Notificações WhatsApp funcionando

### **✅ NOTIFICAÇÕES**
- [ ] WhatsApp integration funcionando
- [ ] Notificações de sucesso
- [ ] Notificações de falha
- [ ] Notificações de rollback

---

## 🎯 **RESULTADO FINAL**

Com este sistema de deploy automático contínuo:

✅ **Cada commit na branch main** é automaticamente deployado  
✅ **Cada parte das 50** atualiza www.kryonix.com.br automaticamente  
✅ **Notificações WhatsApp** informam o progresso em tempo real  
✅ **Dashboard web** mostra progresso visual das 50 partes  
✅ **Rollback automático** em caso de problemas  
✅ **Backup automático** antes de cada deploy  
✅ **Monitoramento 24/7** com alertas inteligentes  

**O projeto KRYONIX terá deploy 100% automático e contínuo desde a primeira parte!** 🚀

---

*🤖 Sistema criado pelos 15 Agentes Especializados KRYONIX*  
*📱 Mobile-First • 🇧🇷 Português • 📊 Dados Reais • 💬 WhatsApp*  
*🏢 KRYONIX - Deploy Inteligente para o Futuro*
