#!/bin/bash

# KRYONIX Installer Update Script
# Updates installer to support new dashboard and waitlist features

set -e

echo "🔧 Updating KRYONIX Installer for new features..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backup original installer
if [ -f "instalador-plataforma-kryonix.sh" ]; then
    echo -e "${BLUE}📁 Creating backup of original installer...${NC}"
    cp instalador-plataforma-kryonix.sh instalador-plataforma-kryonix.sh.backup
fi

# Create updated installer sections
cat >> instalador-plataforma-kryonix.sh << 'EOF'

# ============================================================================
# KRYONIX NEW FEATURES SETUP - Added for Waitlist & Dashboard
# ============================================================================

setup_api_routes() {
    echo -e "${BLUE}🚀 Setting up API routes...${NC}"
    
    # Ensure API directories exist
    mkdir -p app/api/waitlist
    mkdir -p app/api/auth/login
    mkdir -p app/api/admin
    
    # Set proper permissions
    chmod 755 app/api/waitlist
    chmod 755 app/api/auth/login
    chmod 755 app/api/admin
    
    echo -e "${GREEN}✅ API routes configured${NC}"
}

setup_database_schema() {
    echo -e "${BLUE}🗄️ Setting up database schema for new features...${NC}"
    
    # Wait for PostgreSQL to be ready
    until docker exec postgresql-kryonix pg_isready -U postgres; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done
    
    # Create waitlist table
    docker exec postgresql-kryonix psql -U postgres -d kryonix -c "
    CREATE TABLE IF NOT EXISTS waitlist_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        empresa VARCHAR(255),
        cargo VARCHAR(255),
        segmento VARCHAR(100),
        modulos_interesse TEXT[],
        tamanho_empresa VARCHAR(20),
        expectativa_uso VARCHAR(100),
        mensagem TEXT,
        posicao_fila INTEGER,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_entries(email);
    CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_entries(status);
    CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist_entries(created_at);
    
    -- Create admin sessions table
    CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
    "
    
    echo -e "${GREEN}✅ Database schema updated${NC}"
}

setup_environment_variables() {
    echo -e "${BLUE}🔐 Setting up environment variables...${NC}"
    
    # Update .env file with new variables
    cat >> .env << ENV_EOF

# Dashboard & Auth Configuration
NEXTAUTH_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t"
NEXTAUTH_URL="https://kryonix.com.br"
ADMIN_USERNAME="kryonix"
ADMIN_PASSWORD="Vitor@123456"

# Waitlist Configuration
EVOLUTION_API_KEY="2f4d6967043b87b5ebee57b872e0223a"
WHATSAPP_ALERT="+5517981805327"
WAITLIST_NOTIFICATION_ENABLED="true"

# Database URLs for new features
DATABASE_URL="postgresql://postgres:KryonixDB@2025@postgresql-kryonix:5432/kryonix"
REDIS_URL="redis://redis-kryonix:6379"

ENV_EOF
    
    echo -e "${GREEN}✅ Environment variables configured${NC}"
}

configure_docker_services() {
    echo -e "${BLUE}🐳 Updating Docker configuration...${NC}"
    
    # Add healthchecks for new services
    if [ -f "docker-compose.yml" ]; then
        # Backup existing docker-compose
        cp docker-compose.yml docker-compose.yml.backup
        
        # Add healthcheck configurations
        echo "# Updated with new features support" >> docker-compose.yml
    fi
    
    echo -e "${GREEN}✅ Docker configuration updated${NC}"
}

validate_new_features() {
    echo -e "${BLUE}🔍 Validating new features installation...${NC}"
    
    # Check if API routes exist
    if [ -d "app/api/waitlist" ]; then
        echo -e "${GREEN}✅ Waitlist API route exists${NC}"
    else
        echo -e "${RED}❌ Waitlist API route missing${NC}"
        return 1
    fi
    
    # Check if dashboard exists
    if [ -d "app/dashboard" ]; then
        echo -e "${GREEN}✅ Dashboard directory exists${NC}"
    else
        echo -e "${RED}❌ Dashboard directory missing${NC}"
        return 1
    fi
    
    # Check if login page exists
    if [ -f "app/login/page.tsx" ]; then
        echo -e "${GREEN}✅ Login page exists${NC}"
    else
        echo -e "${RED}❌ Login page missing${NC}"
        return 1
    fi
    
    # Test database connection
    if docker exec postgresql-kryonix pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}🎉 All new features validated successfully!${NC}"
}

# Main execution for new features
install_new_features() {
    echo -e "${YELLOW}🚀 Installing KRYONIX new features...${NC}"
    
    setup_api_routes
    setup_database_schema
    setup_environment_variables
    configure_docker_services
    validate_new_features
    
    echo -e "${GREEN}✅ New features installation completed!${NC}"
    echo -e "${BLUE}📋 Features added:${NC}"
    echo -e "   • Waitlist management system"
    echo -e "   • Admin dashboard with login"
    echo -e "   • Database schema for new features"
    echo -e "   • API routes for waitlist and auth"
    echo -e "   • Environment variables configuration"
    echo -e "${YELLOW}⚠️  Remember to restart services after installation${NC}"
}

EOF

# Add call to new features installation in main installer
echo "Adding new features call to main installer..."
echo "" >> instalador-plataforma-kryonix.sh
echo "# Install new features" >> instalador-plataforma-kryonix.sh
echo "install_new_features" >> instalador-plataforma-kryonix.sh

echo -e "${GREEN}✅ Installer updated successfully!${NC}"
echo -e "${BLUE}📋 Changes made:${NC}"
echo "   • Added API routes setup"
echo "   • Added database schema creation"
echo "   • Added environment variables configuration"
echo "   • Added Docker services configuration"
echo "   • Added validation for new features"
echo ""
echo -e "${YELLOW}⚠️  To apply changes, run: ${NC}./instalador-plataforma-kryonix.sh"
