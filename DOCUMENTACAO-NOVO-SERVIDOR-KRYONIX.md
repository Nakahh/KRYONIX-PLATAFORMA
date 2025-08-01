# 🖥️ DOCUMENTAÇÃO NOVO SERVIDOR KRYONIX

## 📋 **INFORMAÇÕES DO SERVIDOR ATUALIZADA**
- **IP**: 45.76.246.44
- **Acesso SSH**: ssh-remote+linuxuser@45.76.246.44
- **Senha**: 6Cp(U.PAik,8,)m6
- **Sistema**: Linux
- **Usuário**: linuxuser

## 🔑 **CREDENCIAIS DE ACESSO**
```bash
# Conectar via SSH
ssh-remote+linuxuser@45.76.246.44

# Senha quando solicitada:
6Cp(U.PAik,8,)m6
```

## 🚀 **COMANDOS PARA DEPLOY**
```bash
# 1. Conectar ao servidor
ssh-remote+linuxuser@45.76.246.44

# 2. Navegar para o diretório do projeto
cd /opt/kryonix

# 3. Atualizar repositório
git pull origin main

# 4. Executar deploy
./deploy-kryonix.sh
```

## 🔧 **CONFIGURAÇÕES IMPORTANTES**
- **Diretório Projeto**: /opt/kryonix
- **Domínio Principal**: www.kryonix.com.br
- **Rede Docker**: kryonix-network
- **Backup Dir**: /opt/kryonix/backups

## 📊 **SERVIÇOS PRINCIPAIS KRYONIX**
- **Traefik**: Proxy reverso e SSL
- **Portainer**: https://painel.kryonix.com.br
- **Keycloak**: https://keycloak.kryonix.com.br
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e sessões
- **RabbitMQ**: https://rabbitmq.kryonix.com.br
- **MinIO**: Storage de arquivos
- **Evolution API**: https://api.kryonix.com.br
- **Supabase**: https://supabase.kryonix.com.br
- **Langfuse**: https://langfuse.kryonix.com.br
- **WuzAPI**: https://wuzapi.kryonix.com.br
- **Ntfy**: https://ntfy.kryonix.com.br

## ⚠️ **COMANDOS DE MONITORAMENTO**
```bash
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

# Verificar stack KRYONIX
docker stack ps kryonix
```

## 🔄 **COMANDOS DE MANUTENÇÃO KRYONIX**
```bash
# Reiniciar todos os serviços
docker-compose down && docker-compose up -d

# Backup completo
./backup-kryonix.sh

# Verificar integridade
./health-check-kryonix.sh

# Deploy stack completa
docker stack deploy -c docker-stack.yml kryonix

# Verificar serviços ativos
docker service ls
```

## 🎯 **STACKS TECNOLÓGICAS ATIVAS**
1. **Keycloak** - Autenticação
2. **PostgreSQL** - Banco de dados
3. **MinIO** - Storage
4. **Redis** - Cache
5. **Traefik** - Proxy reverso
6. **Monitoring** - Grafana + Prometheus
7. **RabbitMQ** - Mensageria
8. **Evolution API** - WhatsApp
9. **Supabase** - Backend-as-a-Service
10. **Langfuse** - AI Observability
11. **WuzAPI** - WhatsApp alternativo
12. **Ntfy** - Notificações push

## 📱 **URLs DE ACESSO PRINCIPAIS**
```
🌐 DOMÍNIOS KRYONIX:
- Principal: https://www.kryonix.com.br
- API: https://api.kryonix.com.br
- Dashboard: https://dashboard.kryonix.com.br
- Painel: https://painel.kryonix.com.br

🔧 FERRAMENTAS:
- Keycloak: https://keycloak.kryonix.com.br
- Grafana: https://grafana.kryonix.com.br
- RabbitMQ: https://rabbitmq.kryonix.com.br
- Supabase: https://supabase.kryonix.com.br
- Langfuse: https://langfuse.kryonix.com.br
- WuzAPI: https://wuzapi.kryonix.com.br
- Ntfy: https://ntfy.kryonix.com.br
```

## 🔐 **CREDENCIAIS PADRÃO**
```
MASTER LOGIN (maioria dos serviços):
Usuário: kryonix
Senha: Vitor@123456

RabbitMQ:
Usuário: kryonix
Senha: 8ed56dd2b7dc80f9dd205a348e1dd303

Servidor SSH:
Usuário: linuxuser
Senha: 6Cp(U.PAik,8,)m6

Evolution API:
Global Key: 2f4d6967043b87b5ebee57b872e0223a

WuzAPI:
API Key: 7e028e043f25f57860f18e0e84548b0e

Ntfy:
Basic Auth: a3J5b25peDpWaXRvckAxMjM0NTY=
```

## 🎯 **MÓDULOS SAAS KRYONIX**
1. **Análise Avançada e Inteligência Comercial** - R$ 99/mês
2. **Agendamento Inteligente com IA e Cobrança** - R$ 119/mês
3. **Atendimento Omnichannel IA Multimodal** - R$ 159/mês
4. **CRM & Funil Vendas com Cobrança** - R$ 179/mês
5. **Email Marketing Multicanal IA Generativa** - R$ 219/mês
6. **Gestão Redes Sociais IA + Agendamento** - R$ 239/mês
7. **Portal Cliente, Treinamento & Gestão** - R$ 269/mês
8. **Whitelabel Plataforma Customizável** - R$ 329/mês

## 📊 **ARQUITETURA MULTI-TENANT**
- **Isolamento completo** por cliente
- **Row Level Security (RLS)** em PostgreSQL
- **Cache namespacedo** por tenant no Redis
- **Keycloak realms** separados por cliente
- **WebSocket channels** isolados
- **SDK unificado** @kryonix/sdk
- **Mobile-first** para 80% usuários mobile
- **LGPD compliance** automático

## 🔄 **CONTINUAÇÃO DO PROJETO**
O projeto KRYONIX está na **PARTE-17** de 50 partes totais.

**Próximas partes prioritárias:**
- PARTE-17: Logs e Auditoria Multi-tenant
- PARTE-18: Relatórios e Analytics  
- PARTE-19: Integrações Externas
- PARTE-20: API Gateway

**Status atual:** 19/50 partes completas (38% progresso)

---
*Servidor atualizado - KRYONIX Platform Multi-Tenant*
*SSH: ssh-remote+linuxuser@45.76.246.44*
*🏢 KRYONIX - Conectando Tecnologias*
