# KRYONIX Emergency Deployment Makefile
# Execute all deployment strategies simultaneously

.PHONY: all deploy-all health-check backup emergency-mode restore deploy-vercel deploy-render test

# Default target - deploy everything
all: deploy-all

# Main deployment target - all strategies
deploy-all: backup health-check deploy-vercel deploy-render emergency-mode
	@echo "🎉 ALL DEPLOYMENT STRATEGIES EXECUTED!"
	@echo "✅ Check Vercel: https://vercel.com/dashboard"
	@echo "✅ Check Render: https://dashboard.render.com"
	@echo "✅ Local server: http://localhost:8080"

# Create emergency backup
backup:
	@echo "💾 Creating emergency backup..."
	@mkdir -p emergency-backups
	@tar -czf emergency-backups/kryonix-backup-$$(date +%Y%m%d_%H%M%S).tar.gz \
		--exclude=node_modules \
		--exclude=.next \
		--exclude=emergency-backups \
		.
	@echo "✅ Backup created in emergency-backups/"

# Health check
health-check:
	@echo "🔍 Running health checks..."
	@curl -sf http://localhost:8080/health || echo "❌ Server not responding"
	@npm run validate-install-inline || echo "❌ Dependencies issue"
	@echo "✅ Health check complete"

# Deploy to Vercel
deploy-vercel:
	@echo "🌐 Deploying to Vercel..."
	@if command -v vercel >/dev/null 2>&1; then \
		vercel --prod --force || echo "❌ Vercel deploy failed"; \
	else \
		echo "⚠️ Vercel CLI not found - install with: npm i -g vercel"; \
	fi

# Deploy to Render (via git push)
deploy-render:
	@echo "🔧 Deploying to Render..."
	@git add . 2>/dev/null || true
	@git commit -m "Emergency deployment $$(date)" 2>/dev/null || true
	@git push origin main 2>/dev/null || echo "❌ Git push failed"
	@echo "✅ Render deployment triggered (if git configured)"

# Emergency simplified mode
emergency-mode:
	@echo "🚨 Setting up emergency mode..."
	@cp package-emergency.json package-emergency-backup.json
	@cp server-simple.js server-simple-backup.js
	@echo "✅ Emergency files ready (use emergency-simplify.sh to activate)"

# Restore from emergency mode
restore:
	@echo "🔄 Restoring from emergency mode..."
	@bash emergency-restore.sh 2>/dev/null || echo "❌ Restore script failed"

# Test all endpoints
test:
	@echo "🧪 Testing all endpoints..."
	@curl -sf http://localhost:8080/health || echo "❌ Health endpoint failed"
	@curl -sf http://localhost:8080/api/status || echo "❌ Status endpoint failed"
	@curl -sf http://localhost:8080/ || echo "❌ Root endpoint failed"
	@echo "✅ Endpoint tests complete"

# Monitor deployment status
monitor:
	@echo "👀 Monitoring deployment status..."
	@while true; do \
		echo "$$(date): Checking server..."; \
		curl -sf http://localhost:8080/health >/dev/null && echo "✅ Server OK" || echo "❌ Server DOWN"; \
		sleep 30; \
	done

# Emergency help
help:
	@echo "🆘 KRYONIX Emergency Deployment Commands:"
	@echo "========================================="
	@echo "make deploy-all     - Execute all deployment strategies"
	@echo "make backup         - Create emergency backup"
	@echo "make health-check   - Run system health checks"
	@echo "make deploy-vercel  - Deploy to Vercel only"
	@echo "make deploy-render  - Deploy to Render only"
	@echo "make emergency-mode - Setup emergency simplified mode"
	@echo "make restore        - Restore from emergency mode"
	@echo "make test          - Test all endpoints"
	@echo "make monitor       - Monitor deployment status"
	@echo "make help          - Show this help"
	@echo ""
	@echo "🎯 Quick start: make deploy-all"
	@echo "🚨 Emergency: bash emergency-simplify.sh"
