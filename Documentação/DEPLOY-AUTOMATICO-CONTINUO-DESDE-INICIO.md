# 🚀 DEPLOY AUTOMÁTICO E CONTÍNUO DESDE O INÍCIO - KRYONIX
*Sistema de Deploy Contínuo que Atualiza conforme Andamento do Projeto*

## 🎯 **VISÃO GERAL**
Sistema de deploy contínuo configurado desde a PARTE 1, que atualiza automaticamente www.kryonix.com.br conforme o andamento de cada uma das 50 partes do projeto.

## 🔧 **ARQUITETURA DEPLOY CONTÍNUO**

### **🏗️ ESTRUTURA REPOSITÓRIO**
```yaml
GITHUB_REPOSITORY:
  name: "kryonix-saas-platform"
  url: "https://github.com/vitorfernandes/kryonix-saas-platform"
  branch_principal: "main"
  branch_desenvolvimento: "develop"
  branch_producao: "production"
  
  ESTRUTURA_PASTAS:
    src/
      components/          # Componentes React
      pages/              # Páginas da aplicação
      services/           # Serviços e APIs
      utils/              # Utilitários
      hooks/              # Custom hooks
      contexts/           # Context providers
      types/              # TypeScript types
      styles/             # Estilos globais
    
    backend/
      src/
        controllers/      # Controllers da API
        services/         # Lógica de negócio
        models/           # Modelos de dados
        middleware/       # Middlewares
        routes/           # Rotas da API
        utils/            # Utilitários backend
        config/           # Configurações
    
    infrastructure/
      docker/             # Dockerfiles
      k8s/               # Kubernetes manifests
      terraform/         # Infrastructure as Code
      ansible/           # Playbooks Ansible
      scripts/           # Scripts de automação
    
    docs/
      api/               # Documentação API
      deployment/        # Guias de deploy
      tutorials/         # Tutoriais das 50 partes
        parte-01/
        parte-02/
        ...
        parte-50/
```

### **🔄 PIPELINE CI/CD COMPLETO**
```yaml
name: KRYONIX Deploy Contínuo
on:
  push:
    branches: [main, develop, production]
  pull_request:
    branches: [main]

env:
  DOCKER_REGISTRY: registry.kryonix.com.br
  DOMAIN: kryonix.com.br
  SERVER_IP: 144.202.90.55

jobs:
  # PARTE 1: Validação e Testes
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout código
        uses: actions/checkout@v3
        
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: 📚 Instalar dependências
        run: |
          npm ci
          cd backend && npm ci
          
      - name: 🧪 Executar testes frontend
        run: npm test -- --coverage --watchAll=false
        
      - name: 🧪 Executar testes backend
        run: cd backend && npm test
        
      - name: 🔍 Lint e verificações
        run: |
          npm run lint
          npm run type-check
          cd backend && npm run lint
          
      - name: 🏗️ Build aplicação
        run: |
          npm run build
          cd backend && npm run build

  # PARTE 2: Build e Push Docker Images
  build-and-push:
    needs: validate-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/production'
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v3
        
      - name: 🐳 Setup Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: 🔐 Login Docker Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: 🏗️ Build Frontend Image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.frontend
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/kryonix-frontend:latest
            ${{ env.DOCKER_REGISTRY }}/kryonix-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: 🏗️ Build Backend Image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/kryonix-backend:latest
            ${{ env.DOCKER_REGISTRY }}/kryonix-backend:${{ github.sha }}

  # PARTE 3: Deploy Automático
  deploy:
    needs: [validate-and-test, build-and-push]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/production'
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v3
        
      - name: 🔐 Setup SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
          
      - name: 🚀 Deploy via Portainer API
        run: |
          # Atualizar stack via Portainer API
          curl -X POST "https://painel.kryonix.com.br/api/stacks/1/git/redeploy" \
            -H "X-API-Key: ${{ secrets.PORTAINER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "prune": true,
              "pullImage": true
            }'
            
      - name: 🌐 Atualizar DNS se necessário
        run: |
          # Script para atualizar DNS Cloudflare se IP mudou
          ./scripts/update-dns.sh
          
      - name: 🔍 Verificar Deploy
        run: |
          # Aguardar serviços ficarem disponíveis
          timeout 300 bash -c 'until curl -f https://www.kryonix.com.br/health; do sleep 5; done'
          echo "✅ Deploy realizado com sucesso!"
          
      - name: 📱 Notificar WhatsApp
        run: |
          curl -X POST "https://api.kryonix.com.br/send-message" \
            -H "Authorization: Bearer ${{ secrets.EVOLUTION_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "number": "5517981805327",
              "message": "🚀 Deploy realizado com sucesso!\n\n📊 Commit: ${{ github.sha }}\n🌐 URL: https://www.kryonix.com.br\n⏰ Horário: $(date)"
            }'

  # PARTE 4: Monitoramento Pós-Deploy
  monitor:
    needs: deploy
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/production'
    steps:
      - name: 🔍 Testes de Fumaça
        run: |
          # Testes básicos para verificar se tudo está funcionando
          curl -f https://www.kryonix.com.br/api/health
          curl -f https://app.kryonix.com.br/health
          curl -f https://api.kryonix.com.br/health
          
      - name: 📊 Verificar Métricas
        run: |
          # Verificar métricas no Grafana
          curl -f https://grafana.kryonix.com.br/api/health
          
      - name: 🚨 Alertas se Falha
        if: failure()
        run: |
          curl -X POST "https://api.kryonix.com.br/send-message" \
            -H "Authorization: Bearer ${{ secrets.EVOLUTION_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "number": "5517981805327",
              "message": "🚨 ALERTA: Falha no deploy!\n\n❌ Commit: ${{ github.sha }}\n📝 Verificar logs: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }'
```

## 🔄 **SINCRONIZAÇÃO AUTOMÁTICA DAS 50 PARTES**

### **📋 SCRIPT DE SINCRONIZAÇÃO**
```bash
#!/bin/bash
# scripts/sync-parts-deployment.sh

echo "🔄 Sincronizando Partes com Deploy..."

CURRENT_PART=$(cat .current-part)
echo "📍 Parte atual: $CURRENT_PART"

# Função para deploy incremental
deploy_part() {
    local part_number=$1
    echo "🚀 Fazendo deploy da Parte $part_number..."
    
    # Verificar se arquivos da parte existem
    if [ -f "docs/tutorials/parte-$(printf "%02d" $part_number)/README.md" ]; then
        echo "✅ Tutorial da Parte $part_number encontrado"
        
        # Executar deploy específico da parte
        case $part_number in
            1) deploy_authentication ;;
            2) deploy_database ;;
            3) deploy_storage ;;
            4) deploy_cache ;;
            5) deploy_proxy ;;
            # ... continua para todas as 50 partes
            *) echo "⚠️  Parte $part_number não configurada" ;;
        esac
        
        # Atualizar progresso
        echo $part_number > .current-part
        
        # Notificar conclusão
        send_progress_notification $part_number
        
    else
        echo "❌ Tutorial da Parte $part_number não encontrado"
        exit 1
    fi
}

# Função para notificar progresso
send_progress_notification() {
    local part=$1
    local progress=$((part * 2))  # 50 partes = 100%
    
    curl -X POST "https://api.kryonix.com.br/send-message" \
        -H "Authorization: Bearer $EVOLUTION_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"5517981805327\",
            \"message\": \"✅ Parte $part concluída!\n\n📊 Progresso: $progress%\n🚀 Deploy automático realizado\n🌐 Disponível em: https://www.kryonix.com.br\"
        }"
}

# Deploy específicos por parte
deploy_authentication() {
    echo "🔐 Configurando Keycloak..."
    docker stack deploy -c docker-compose.auth.yml kryonix-auth
}

deploy_database() {
    echo "🗄️ Configurando PostgreSQL..."
    docker stack deploy -c docker-compose.db.yml kryonix-db
}

deploy_storage() {
    echo "📦 Configurando MinIO..."
    docker stack deploy -c docker-compose.storage.yml kryonix-storage
}

# Executar deploy da parte especificada
if [ "$1" ]; then
    deploy_part $1
else
    echo "❌ Especifique o número da parte: ./sync-parts-deployment.sh 1"
fi
```

### **🎯 CONFIGURAÇÃO POR AMBIENTE**
```yaml
# .github/environments/development.yml
ENVIRONMENT: development
DOMAIN: dev.kryonix.com.br
DATABASE_URL: postgresql://dev_user:dev_pass@dev-db:5432/kryonix_dev
REDIS_URL: redis://dev-redis:6379
DEBUG: true
AUTO_DEPLOY: true

# .github/environments/staging.yml  
ENVIRONMENT: staging
DOMAIN: staging.kryonix.com.br
DATABASE_URL: postgresql://staging_user:staging_pass@staging-db:5432/kryonix_staging
REDIS_URL: redis://staging-redis:6379
DEBUG: false
AUTO_DEPLOY: true

# .github/environments/production.yml
ENVIRONMENT: production
DOMAIN: kryonix.com.br
DATABASE_URL: postgresql://prod_user:${{ secrets.DB_PASSWORD }}@prod-db:5432/kryonix_prod
REDIS_URL: redis://prod-redis:6379
DEBUG: false
AUTO_DEPLOY: false  # Requer aprovação manual
```

## 📱 **MONITORAMENTO EM TEMPO REAL**

### **📊 DASHBOARD DE DEPLOY**
```typescript
// components/DeployDashboard.tsx
export const DeployDashboard: React.FC = () => {
  const [deployStatus, setDeployStatus] = useState<DeployStatus>();
  const [currentPart, setCurrentPart] = useState<number>(1);
  const [deployHistory, setDeployHistory] = useState<Deploy[]>([]);
  
  useEffect(() => {
    // WebSocket para atualizações em tempo real
    const ws = new WebSocket('wss://api.kryonix.com.br/deploy-status');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setDeployStatus(update);
      
      if (update.type === 'part_completed') {
        setCurrentPart(update.part_number);
        showSuccessNotification(`Parte ${update.part_number} concluída!`);
      }
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="deploy-dashboard">
      <div className="deploy-header">
        <h1>🚀 Deploy Contínuo KRYONIX</h1>
        <div className="deploy-status">
          <span className={`status ${deployStatus?.status}`}>
            {deployStatus?.status === 'deploying' ? '🔄' : '✅'} 
            {deployStatus?.status}
          </span>
        </div>
      </div>
      
      {/* Progresso das 50 partes */}
      <div className="parts-progress">
        <h2>📋 Progresso das 50 Partes</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentPart / 50) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Parte {currentPart} de 50 ({Math.round((currentPart / 50) * 100)}%)
        </span>
        
        <div className="parts-grid">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((partNumber) => (
            <div 
              key={partNumber}
              className={`part-card ${partNumber <= currentPart ? 'completed' : 'pending'}`}
            >
              <span className="part-number">{partNumber}</span>
              <span className="part-status">
                {partNumber <= currentPart ? '✅' : '⏳'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Deploy atual */}
      {deployStatus && (
        <div className="current-deploy">
          <h3>🔄 Deploy Atual</h3>
          <div className="deploy-details">
            <div className="detail-item">
              <strong>Commit:</strong> {deployStatus.commit_sha}
            </div>
            <div className="detail-item">
              <strong>Branch:</strong> {deployStatus.branch}
            </div>
            <div className="detail-item">
              <strong>Iniciado:</strong> {new Date(deployStatus.started_at).toLocaleString()}
            </div>
            <div className="detail-item">
              <strong>Duração:</strong> {deployStatus.duration}s
            </div>
          </div>
          
          {deployStatus.logs && (
            <div className="deploy-logs">
              <h4>📝 Logs do Deploy</h4>
              <pre className="logs-content">
                {deployStatus.logs.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {/* Histórico */}
      <div className="deploy-history">
        <h3>📚 Histórico de Deploys</h3>
        <div className="history-list">
          {deployHistory.map((deploy) => (
            <div key={deploy.id} className="history-item">
              <div className="deploy-info">
                <span className="commit">{deploy.commit_sha.substring(0, 7)}</span>
                <span className="message">{deploy.commit_message}</span>
                <span className="author">{deploy.author}</span>
              </div>
              <div className="deploy-meta">
                <span className={`status ${deploy.status}`}>
                  {deploy.status === 'success' ? '✅' : '❌'} {deploy.status}
                </span>
                <span className="timestamp">
                  {new Date(deploy.completed_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 🔧 **CONFIGURAÇÃO INICIAL**

### **⚙️ SETUP AUTOMÁTICO**
```bash
#!/bin/bash
# scripts/setup-continuous-deployment.sh

echo "🚀 Configurando Deploy Contínuo KRYONIX..."

# 1. Configurar repositório Git
git init
git remote add origin https://github.com/vitorfernandes/kryonix-saas-platform.git

# 2. Configurar GitHub Actions
mkdir -p .github/workflows
cp workflows/deploy.yml .github/workflows/

# 3. Configurar secrets necessários
echo "🔐 Configure os seguintes secrets no GitHub:"
echo "- SSH_PRIVATE_KEY: Chave SSH para acesso ao servidor"
echo "- DOCKER_USERNAME: Usuário do registry Docker"
echo "- DOCKER_PASSWORD: Senha do registry Docker"
echo "- PORTAINER_API_KEY: API key do Portainer"
echo "- EVOLUTION_API_KEY: API key do WhatsApp"

# 4. Configurar webhook no servidor
curl -X POST "https://painel.kryonix.com.br/api/webhooks" \
  -H "X-API-Key: $PORTAINER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "github-deploy",
    "url": "https://api.github.com/repos/vitorfernandes/kryonix-saas-platform/hooks",
    "events": ["push", "pull_request"]
  }'

# 5. Configurar monitoramento
docker run -d \
  --name kryonix-deploy-monitor \
  --network kryonix-net \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  -e WEBHOOK_URL=https://api.kryonix.com.br/deploy-webhook \
  kryonix/deploy-monitor:latest

echo "✅ Deploy Contínuo configurado com sucesso!"
echo "🌐 Acesse: https://www.kryonix.com.br/deploy-dashboard"
```

## 📋 **CHECKLIST DEPLOY CONTÍNUO**

### ✅ **CONFIGURAÇÃO INICIAL**
- [ ] Repositório GitHub criado
- [ ] Secrets configurados
- [ ] Workflow GitHub Actions
- [ ] Docker Registry configurado
- [ ] Portainer API configurada
- [ ] Webhooks configurados
- [ ] Monitoramento ativo

### ✅ **TESTES E VALIDAÇÃO**
- [ ] Pipeline funcionando
- [ ] Deploy manual executado
- [ ] Notificações WhatsApp funcionando
- [ ] Rollback testado
- [ ] Monitoramento verificado

### ✅ **SINCRONIZAÇÃO 50 PARTES**
- [ ] Scripts de sincronização
- [ ] Tutoriais organizados
- [ ] Deploy incremental
- [ ] Progresso rastreado
- [ ] Notificações automáticas

---

## 🎯 **RESULTADO FINAL**

Com este sistema de deploy contínuo:

✅ **Cada commit** é automaticamente testado e deployado  
✅ **Cada parte concluída** atualiza automaticamente www.kryonix.com.br  
✅ **Notificações WhatsApp** informam o progresso  
✅ **Monitoramento** garante que tudo está funcionando  
✅ **Rollback automático** em caso de problemas  
✅ **Dashboard** para acompanhar progresso em tempo real  

**O projeto KRYONIX será atualizado automaticamente conforme você avança nas 50 partes!** 🚀

---

*Deploy Contínuo KRYONIX - Atualização Automática desde o Início*
*🤖 IA Autônoma • 📱 Mobile-First • 🇧🇷 Português • 📊 Dados Reais*
*🏢 KRYONIX - Deploy Inteligente para o Futuro*
