# ============================================================================
# KRYONIX Platform - Makefile para Deploy Automático
# ============================================================================

.PHONY: help setup-vercel setup-render deploy-backend deploy-frontend deploy-all health-check clean

# Configurações
FRONTEND_URL ?= https://kryonix-frontend.vercel.app
BACKEND_URL ?= https://kryonix-backend.onrender.com

# Cores para output
GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help: ## Mostrar ajuda
	@echo "$(BLUE)🚀 KRYONIX Platform - Deploy Automation$(NC)"
	@echo "$(BLUE)========================================$(NC)"
	@echo
	@echo "$(GREEN)Comandos disponíveis:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "$(GREEN)Exemplos:$(NC)"
	@echo "  make setup-all          # Configurar tudo automaticamente"
	@echo "  make deploy-all          # Deploy completo (backend + frontend)"
	@echo "  make health-check        # Verificar saúde dos serviços"

setup-vercel: ## Configurar ambiente Vercel
	@echo "$(BLUE)📦 Configurando Vercel CLI...$(NC)"
	@command -v vercel >/dev/null 2>&1 || npm install -g vercel@latest
	@echo "$(GREEN)✅ Vercel CLI pronto$(NC)"

setup-render: ## Configurar ambiente Render
	@echo "$(BLUE)📦 Configurando Render CLI...$(NC)"
	@if ! command -v render >/dev/null 2>&1; then \
		echo "$(YELLOW)Instalando Render CLI...$(NC)"; \
		if [[ "$$OSTYPE" == "darwin"* ]]; then \
			brew install render 2>/dev/null || echo "$(RED)Instale manualmente: https://docs.render.com/cli$(NC)"; \
		else \
			echo "$(RED)Instale o Render CLI: https://docs.render.com/cli$(NC)"; \
		fi \
	fi
	@echo "$(GREEN)✅ Render CLI pronto$(NC)"

setup-all: setup-vercel setup-render ## Configurar todos os ambientes
	@echo "$(GREEN)🎉 Todos os ambientes configurados!$(NC)"

check-prereq: ## Verificar pré-requisitos
	@echo "$(BLUE)🔍 Verificando pré-requisitos...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js não encontrado$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)❌ npm não encontrado$(NC)"; exit 1; }
	@command -v git >/dev/null 2>&1 || { echo "$(RED)❌ git não encontrado$(NC)"; exit 1; }
	@node_version=$$(node --version | cut -d'v' -f2 | cut -d'.' -f1); \
	if [ "$$node_version" -lt 18 ]; then \
		echo "$(RED)❌ Node.js 18+ necessário. Versão atual: $$(node --version)$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Todos os pré-requisitos atendidos$(NC)"

prepare-backend: ## Preparar arquivos para backend
	@echo "$(BLUE)🔧 Preparando arquivos do backend...$(NC)"
	@chmod +x deploy/render-installer.sh
	@echo "$(GREEN)✅ Backend preparado$(NC)"

prepare-frontend: ## Preparar arquivos para frontend  
	@echo "$(BLUE)🔧 Preparando arquivos do frontend...$(NC)"
	@chmod +x deploy/vercel-installer.sh
	@echo "$(GREEN)✅ Frontend preparado$(NC)"

deploy-backend: check-prereq prepare-backend ## Deploy do backend no Render
	@echo "$(BLUE)🚀 Iniciando deploy do backend...$(NC)"
	@./deploy/render-installer.sh
	@echo "$(GREEN)✅ Backend deployado com sucesso!$(NC)"

deploy-frontend: check-prereq prepare-frontend ## Deploy do frontend no Vercel
	@echo "$(BLUE)🚀 Iniciando deploy do frontend...$(NC)"
	@./deploy/vercel-installer.sh
	@echo "$(GREEN)✅ Frontend deployado com sucesso!$(NC)"

deploy-all: deploy-backend deploy-frontend ## Deploy completo (backend + frontend)
	@echo "$(GREEN)🎉 Deploy completo realizado!$(NC)"
	@echo "$(BLUE)📊 URLs dos serviços:$(NC)"
	@echo "  Frontend: $(FRONTEND_URL)"
	@echo "  Backend:  $(BACKEND_URL)"

health-check: ## Verificar saúde dos serviços
	@echo "$(BLUE)🔍 Verificando saúde dos serviços...$(NC)"
	@echo -n "Frontend: "
	@if curl -sf "$(FRONTEND_URL)/health" >/dev/null 2>&1; then \
		echo "$(GREEN)✅ OK$(NC)"; \
	else \
		echo "$(RED)❌ ERRO$(NC)"; \
	fi
	@echo -n "Backend:  "
	@if curl -sf "$(BACKEND_URL)/health" >/dev/null 2>&1; then \
		echo "$(GREEN)✅ OK$(NC)"; \
	else \
		echo "$(RED)❌ ERRO$(NC)"; \
	fi

test-endpoints: health-check ## Testar endpoints principais
	@echo "$(BLUE)🧪 Testando endpoints...$(NC)"
	@echo -n "API Status: "
	@if curl -sf "$(BACKEND_URL)/api/status" >/dev/null 2>&1; then \
		echo "$(GREEN)✅ OK$(NC)"; \
	else \
		echo "$(RED)❌ ERRO$(NC)"; \
	fi

logs-vercel: ## Ver logs do Vercel
	@echo "$(BLUE)📋 Logs do Vercel:$(NC)"
	@vercel logs $(FRONTEND_URL) 2>/dev/null || echo "$(YELLOW)Execute 'vercel login' primeiro$(NC)"

logs-render: ## Ver logs do Render
	@echo "$(BLUE)📋 Logs do Render:$(NC)"
	@render logs kryonix-backend --tail 2>/dev/null || echo "$(YELLOW)Execute 'render auth login' primeiro$(NC)"

status: ## Ver status dos serviços
	@echo "$(BLUE)📊 Status dos serviços:$(NC)"
	@echo "$(YELLOW)Vercel:$(NC)"
	@vercel ls 2>/dev/null || echo "  $(RED)Não autenticado$(NC)"
	@echo "$(YELLOW)Render:$(NC)"
	@render services list 2>/dev/null || echo "  $(RED)Não autenticado$(NC)"

env-setup: ## Configurar variáveis de ambiente
	@echo "$(BLUE)⚙️ Configurando variáveis de ambiente...$(NC)"
	@echo "$(YELLOW)Vercel - Configure as seguintes variáveis:$(NC)"
	@echo "  NEXT_PUBLIC_API_URL=$(BACKEND_URL)"
	@echo "  NODE_ENV=production"
	@echo
	@echo "$(YELLOW)Render - As principais são auto-configuradas:$(NC)"
	@echo "  DATABASE_URL (automático)"
	@echo "  REDIS_URL (automático)"
	@echo "  JWT_SECRET (auto-gerado)"

clean: ## Limpar arquivos temporários
	@echo "$(BLUE)🧹 Limpando arquivos temporários...$(NC)"
	@rm -f deploy/*.backup deploy/*.tmp deploy/*.log
	@rm -f next.config.vercel.js package.frontend.json package.backend.json
	@rm -f Dockerfile.render post-deploy.sh
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

reset: clean ## Reset completo (limpar + recriar configs)
	@echo "$(BLUE)🔄 Reset completo...$(NC)"
	@rm -f vercel.json render.yaml .vercelignore
	@echo "$(GREEN)✅ Reset concluído$(NC)"

# Deploy rápido para desenvolvimento
dev-deploy: ## Deploy rápido para testes
	@echo "$(BLUE)⚡ Deploy rápido para desenvolvimento...$(NC)"
	@echo "$(YELLOW)Backend...$(NC)"
	@render deploy --service=kryonix-backend 2>/dev/null || echo "Configure Render primeiro"
	@echo "$(YELLOW)Frontend...$(NC)" 
	@vercel --prod 2>/dev/null || echo "Configure Vercel primeiro"
	@echo "$(GREEN)✅ Deploy rápido concluído$(NC)"

# Backup dos arquivos de configuração
backup: ## Fazer backup das configurações
	@echo "$(BLUE)💾 Fazendo backup...$(NC)"
	@mkdir -p backup/$(shell date +%Y%m%d_%H%M%S)
	@cp -r deploy/ backup/$(shell date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@cp vercel.json backup/$(shell date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@cp render.yaml backup/$(shell date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@echo "$(GREEN)✅ Backup criado em backup/$(shell date +%Y%m%d_%H%M%S)$(NC)"

# Comandos de manutenção
update-deps: ## Atualizar dependências
	@echo "$(BLUE)📦 Atualizando dependências...$(NC)"
	@npm update
	@npm audit fix --force
	@echo "$(GREEN)✅ Dependências atualizadas$(NC)"

# Monitoramento contínuo
monitor: ## Monitoramento contínuo (Ctrl+C para parar)
	@echo "$(BLUE)📊 Monitoramento contínuo iniciado...$(NC)"
	@echo "$(YELLOW)Pressione Ctrl+C para parar$(NC)"
	@while true; do \
		echo -n "$$(date '+%H:%M:%S') - "; \
		if curl -sf "$(BACKEND_URL)/health" >/dev/null 2>&1; then \
			echo -n "$(GREEN)Backend OK$(NC) "; \
		else \
			echo -n "$(RED)Backend DOWN$(NC) "; \
		fi; \
		if curl -sf "$(FRONTEND_URL)/health" >/dev/null 2>&1; then \
			echo "$(GREEN)Frontend OK$(NC)"; \
		else \
			echo "$(RED)Frontend DOWN$(NC)"; \
		fi; \
		sleep 30; \
	done

# Informações do projeto
info: ## Mostrar informações do projeto
	@echo "$(BLUE)ℹ️  Informações do Projeto KRYONIX$(NC)"
	@echo "$(BLUE)================================$(NC)"
	@echo "$(YELLOW)Frontend URL:$(NC) $(FRONTEND_URL)"
	@echo "$(YELLOW)Backend URL:$(NC)  $(BACKEND_URL)"
	@echo "$(YELLOW)Health Frontend:$(NC) $(FRONTEND_URL)/health"
	@echo "$(YELLOW)Health Backend:$(NC)  $(BACKEND_URL)/health"
	@echo "$(YELLOW)API Status:$(NC) $(BACKEND_URL)/api/status"
	@echo
	@echo "$(YELLOW)Dashboards:$(NC)"
	@echo "  Vercel: https://vercel.com/dashboard"
	@echo "  Render: https://dashboard.render.com"
