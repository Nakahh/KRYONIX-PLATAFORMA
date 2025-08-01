#!/bin/bash
# ============================================================================
# SCRIPT DE ATUALIZAÇÃO DE SERVIDOR/IP KRYONIX
# Atualiza todas as referências do servidor antigo para o novo
# ============================================================================

echo "🔄 INICIANDO ATUALIZAÇÃO DE SERVIDOR/IP KRYONIX..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Informações antigas e novas
OLD_IP="144.202.90.55"
NEW_IP="45.76.246.44"
OLD_SSH="ssh root@144.202.90.55"
NEW_SSH="ssh-remote+linuxuser@45.76.246.44"
OLD_PASSWORD="Vitor@123456"
NEW_PASSWORD="6Cp(U.PAik,8,)m6"

echo -e "${BLUE}📋 Informações de atualização:${NC}"
echo -e "   🔴 IP Antigo: $OLD_IP"
echo -e "   🟢 IP Novo: $NEW_IP"
echo -e "   🔴 SSH Antigo: $OLD_SSH"
echo -e "   🟢 SSH Novo: $NEW_SSH"
echo -e "   🔴 Senha Antiga: $OLD_PASSWORD"
echo -e "   🟢 Senha Nova: $NEW_PASSWORD"
echo ""

# Backup antes das mudanças
BACKUP_DIR="backup-servidor-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}💾 Criando backup em: $BACKUP_DIR${NC}"

# Lista de arquivos para atualizar
ARQUIVOS_PARA_ATUALIZAR=(
    "Prompts-Externos-IA/README.md"
    "Documentação/DEPLOY-AUTOMATICO-KRYONIX.md"
    "Documentação/ETAPA-ZERO-ANÁLISE-COMPLETA-DO-PROJETO-KRYONIX.md"
    "Prompts-Externos-IA/PARTE-07-RABBITMQ.md"
    "Prompts-Externos-IA/PARTE-01-KEYCLOAK.md"
    "Prompts-Externos-IA/PARTE-02-POSTGRESQL.md"
    "Prompts-Externos-IA/PARTE-03-MINIO.md"
    "Prompts-Externos-IA/PARTE-04-REDIS.md"
    "Prompts-Externos-IA/PARTE-05-TRAEFIK.md"
    "Prompts-Externos-IA/PARTE-06-MONITORING.md"
    "Prompts-Externos-IA/PARTE-08-BACKUP.md"
    "Prompts-Externos-IA/PARTE-09-SECURITY.md"
    "Prompts-Externos-IA/PARTE-10-GATEWAY.md"
    "Prompts-Externos-IA/PARTE-11-FRONTEND.md"
    "Prompts-Externos-IA/PARTE-12-DASHBOARD.md"
    "Prompts-Externos-IA/PARTE-36-EVOLUTION.md"
    "Prompts-Externos-IA/PARTE-37-CHATWOOT.md"
    "Prompts-Externos-IA/PARTE-50-GOLIVE.md"
)

contador_arquivos=0
contador_alteracoes=0

# Função para atualizar um arquivo
atualizar_arquivo() {
    local arquivo="$1"
    
    if [[ ! -f "$arquivo" ]]; then
        echo -e "   ${RED}❌ Arquivo não encontrado: $arquivo${NC}"
        return 1
    fi
    
    # Fazer backup do arquivo
    cp "$arquivo" "$BACKUP_DIR/"
    
    # Contar ocorrências antes
    local ocorrencias_ip=$(grep -c "$OLD_IP" "$arquivo" 2>/dev/null || echo "0")
    local ocorrencias_ssh=$(grep -c "ssh root@" "$arquivo" 2>/dev/null || echo "0")
    
    if [[ $ocorrencias_ip -eq 0 && $ocorrencias_ssh -eq 0 ]]; then
        echo -e "   ⚪ $arquivo - Nenhuma alteração necessária"
        return 0
    fi
    
    # Fazer as substituições
    sed -i.bak "s/$OLD_IP/$NEW_IP/g" "$arquivo"
    sed -i.bak "s/ssh root@$OLD_IP/ssh-remote+linuxuser@$NEW_IP/g" "$arquivo"
    sed -i.bak "s/ssh root@$OLD_IP/ssh-remote+linuxuser@$NEW_IP/g" "$arquivo"
    
    # Contar ocorrências após
    local ocorrencias_ip_depois=$(grep -c "$NEW_IP" "$arquivo" 2>/dev/null || echo "0")
    
    echo -e "   ${GREEN}✅ $arquivo - $ocorrencias_ip IPs atualizados${NC}"
    
    ((contador_arquivos++))
    ((contador_alteracoes += ocorrencias_ip))
    
    # Remover arquivo .bak
    rm -f "${arquivo}.bak"
}

# Atualizar arquivos específicos
echo -e "${BLUE}🔄 Atualizando arquivos específicos...${NC}"
for arquivo in "${ARQUIVOS_PARA_ATUALIZAR[@]}"; do
    atualizar_arquivo "$arquivo"
done

# Buscar e atualizar todos os arquivos .md com o IP antigo
echo -e "${BLUE}🔍 Buscando outros arquivos .md com IP antigo...${NC}"
while IFS= read -r -d '' arquivo; do
    if grep -q "$OLD_IP" "$arquivo" 2>/dev/null; then
        atualizar_arquivo "$arquivo"
    fi
done < <(find . -name "*.md" -type f -print0 2>/dev/null)

# Buscar e atualizar arquivos .sh
echo -e "${BLUE}🔍 Buscando arquivos .sh com IP antigo...${NC}"
while IFS= read -r -d '' arquivo; do
    if grep -q "$OLD_IP" "$arquivo" 2>/dev/null; then
        atualizar_arquivo "$arquivo"
    fi
done < <(find . -name "*.sh" -type f -print0 2>/dev/null)

# Criar arquivo de documentação das mudanças
cat > "$BACKUP_DIR/MUDANCAS-REALIZADAS.md" << EOF
# 📋 RELATÓRIO DE ATUALIZAÇÃO SERVIDOR/IP KRYONIX

## 🔄 Mudanças Realizadas
- **Data**: $(date '+%d/%m/%Y %H:%M:%S')
- **IP Antigo**: $OLD_IP
- **IP Novo**: $NEW_IP
- **SSH Antigo**: $OLD_SSH
- **SSH Novo**: $NEW_SSH

## 📊 Estatísticas
- **Arquivos Atualizados**: $contador_arquivos
- **Total de Alterações**: $contador_alteracoes
- **Backup Localização**: $BACKUP_DIR

## 📁 Arquivos Principais Atualizados
$(for arquivo in "${ARQUIVOS_PARA_ATUALIZAR[@]}"; do echo "- $arquivo"; done)

## 🔄 Comandos de Reversão (se necessário)
Para reverter as mudanças, execute:
\`\`\`bash
# Restaurar arquivos do backup
cp $BACKUP_DIR/* ./
\`\`\`

## ✅ Verificação
Para verificar se as mudanças foram aplicadas:
\`\`\`bash
# Verificar se não há mais referências ao IP antigo
grep -r "$OLD_IP" . --include="*.md" --include="*.sh"

# Verificar se as novas referências estão presentes
grep -r "$NEW_IP" . --include="*.md" --include="*.sh"
\`\`\`

---
*Atualização automática KRYONIX - Servidor/IP*
EOF

# Criar arquivo de documentação específica do novo servidor
cat > "DOCUMENTACAO-NOVO-SERVIDOR.md" << EOF
# 🖥️ DOCUMENTAÇÃO NOVO SERVIDOR KRYONIX

## 📋 **INFORMAÇÕES DO SERVIDOR**
- **IP**: $NEW_IP
- **Acesso SSH**: $NEW_SSH
- **Senha**: $NEW_PASSWORD
- **Sistema**: Linux
- **Usuário**: linuxuser

## 🔑 **CREDENCIAIS DE ACESSO**
\`\`\`bash
# Conectar via SSH
$NEW_SSH

# Senha quando solicitada:
$NEW_PASSWORD
\`\`\`

## 🚀 **COMANDOS PARA DEPLOY**
\`\`\`bash
# 1. Conectar ao servidor
$NEW_SSH

# 2. Navegar para o diretório do projeto
cd /opt/kryonix

# 3. Atualizar repositório
git pull origin main

# 4. Executar deploy
./deploy-kryonix.sh
\`\`\`

## 🔧 **CONFIGURAÇÕES IMPORTANTES**
- **Diretório Projeto**: /opt/kryonix
- **Domínio Principal**: www.kryonix.com.br
- **Rede Docker**: kryonix-network
- **Backup Dir**: /opt/kryonix/backups

## 📊 **SERVIÇOS PRINCIPAIS**
- **Traefik**: Proxy reverso e SSL
- **Portainer**: https://painel.kryonix.com.br
- **Keycloak**: https://keycloak.kryonix.com.br
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e sessões
- **RabbitMQ**: Mensageria
- **MinIO**: Storage de arquivos

## ⚠️ **COMANDOS DE MONITORAMENTO**
\`\`\`bash
# Verificar status dos containers
docker ps

# Ver logs dos serviços
docker logs [container_name]

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h

# Verificar CPU
top
\`\`\`

## 🔄 **COMANDOS DE MANUTENÇÃO**
\`\`\`bash
# Reiniciar todos os serviços
docker-compose down && docker-compose up -d

# Backup completo
./backup-kryonix.sh

# Verificar integridade
./health-check-kryonix.sh
\`\`\`

---
*Documentação do servidor atualizada - KRYONIX Platform*
*IP: $NEW_IP | SSH: $NEW_SSH*
EOF

# Verificação final
echo -e "${BLUE}🔍 Verificação final...${NC}"
remaining_old=$(grep -r "$OLD_IP" . --include="*.md" --include="*.sh" 2>/dev/null | wc -l)
new_references=$(grep -r "$NEW_IP" . --include="*.md" --include="*.sh" 2>/dev/null | wc -l)

echo ""
echo -e "${GREEN}🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${BLUE}📊 Relatório Final:${NC}"
echo -e "   📁 Arquivos atualizados: $contador_arquivos"
echo -e "   🔄 Total de alterações: $contador_alteracoes"
echo -e "   📋 Referências antigas restantes: $remaining_old"
echo -e "   ✅ Novas referências criadas: $new_references"
echo -e "   💾 Backup criado em: $BACKUP_DIR"
echo ""

if [[ $remaining_old -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: Ainda existem $remaining_old referências ao IP antigo${NC}"
    echo -e "   Execute: grep -r '$OLD_IP' . --include='*.md' --include='*.sh'"
    echo ""
fi

echo -e "${GREEN}📋 Próximos passos:${NC}"
echo -e "   1. Revisar mudanças: git diff"
echo -e "   2. Testar conexão: $NEW_SSH"
echo -e "   3. Fazer commit: git add . && git commit -m 'Update server IP to $NEW_IP'"
echo -e "   4. Fazer deploy no novo servidor"
echo ""

echo -e "${BLUE}📄 Documentações criadas:${NC}"
echo -e "   📋 $BACKUP_DIR/MUDANCAS-REALIZADAS.md"
echo -e "   🖥️  DOCUMENTACAO-NOVO-SERVIDOR.md"
echo ""

echo -e "${GREEN}✅ Atualização de servidor/IP concluída!${NC}"
EOF
