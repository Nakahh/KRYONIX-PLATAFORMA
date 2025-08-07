#!/bin/bash

# KRYONIX Vercel Deployment Script
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI not found. Installing..."
        npm install -g vercel@latest
        success "Vercel CLI installed"
    else
        success "Vercel CLI found"
    fi
}

# Setup environment variables for Vercel
setup_vercel_env() {
    log "Setting up Vercel environment variables..."
    
    # Required environment variables
    vercel env add NEXT_PUBLIC_API_URL production || true
    vercel env add NEXT_PUBLIC_SITE_URL production || true
    vercel env add NEXT_PUBLIC_ENV production || true
    vercel env add NEXTAUTH_SECRET production || true
    vercel env add NEXTAUTH_URL production || true
    vercel env add JWT_SECRET production || true
    vercel env add ADMIN_TOKEN production || true
    vercel env add WEBHOOK_SECRET production || true
    vercel env add NEXT_TELEMETRY_DISABLED production || true
    
    success "Environment variables configured"
}

# Deploy to Vercel
deploy_to_vercel() {
    log "Starting KRYONIX frontend deployment to Vercel..."
    
    # Check if in git repository
    if [ ! -d ".git" ]; then
        info "Not a git repository. Initializing..."
        git init
        git add .
        git commit -m "Initial commit for Vercel deployment"
    fi
    
    # Login to Vercel if not already logged in
    if ! vercel whoami &> /dev/null; then
        info "Please login to Vercel..."
        vercel login
    fi
    
    # Deploy to production
    info "Deploying to Vercel production..."
    vercel --prod --yes
    
    success "Deployment completed!"
}

# Configure custom domain
configure_domain() {
    read -p "Do you want to configure a custom domain? (y/N): " setup_domain
    
    if [[ $setup_domain =~ ^[Yy]$ ]]; then
        read -p "Enter your custom domain (e.g., kryonix.com.br): " domain
        
        info "Adding domain: $domain"
        vercel domains add "$domain" || echo "Domain may already be added"
        
        info "Domain configuration:"
        info "1. Add these DNS records to your domain:"
        info "   Type: CNAME"
        info "   Name: www (or @)"
        info "   Value: cname.vercel-dns.com"
        info ""
        info "2. Wait for DNS propagation (may take up to 48 hours)"
        info "3. Your site will be available at: https://$domain"
        
        success "Domain setup instructions provided"
    fi
}

# Main deployment function
main() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║     KRYONIX VERCEL DEPLOYMENT v2.0      ║${NC}"
    echo -e "${PURPLE}║   Complete Frontend Deployment Tool     ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check prerequisites
    check_vercel_cli
    
    # Confirm deployment
    read -p "Deploy KRYONIX frontend to Vercel? (Y/n): " confirm
    
    if [[ ! $confirm =~ ^[Nn]$ ]]; then
        deploy_to_vercel
        
        # Setup environment variables
        setup_vercel_env
        
        # Configure domain
        configure_domain
        
        success "🎉 KRYONIX frontend deployment completed!"
        info "📊 Monitor at: https://vercel.com/dashboard"
        info "🔗 Your site: https://kryonix-frontend.vercel.app"
        
        # Show final instructions
        echo ""
        echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
        echo "1. Configure environment variables in Vercel dashboard"
        echo "2. Set up custom domain if needed"
        echo "3. Configure CORS in backend to allow your domain"
        echo "4. Test all functionality on the deployed site"
        
    else
        info "Deployment cancelled."
    fi
}

# Run main function
main "$@"
