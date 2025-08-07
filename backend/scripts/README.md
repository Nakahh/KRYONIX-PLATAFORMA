# 🛠️ Scripts de Instalações KRYONIX

Esta pasta contém todos os scripts necessários para configurar o ambiente KRYONIX no servidor.

## 📋 Scripts Disponíveis

### SCRIPT-PARTE-01-SERVIDOR-KRYONIX.sh
**Configuração Completa da PARTE 1 - Autenticação Keycloak Multi-Tenant**

#### O que faz:
- 🔐 Configura Keycloak multi-tenant completo
- 📱 Sistema de autenticação mobile-first
- 💬 WhatsApp OTP via Evolution API
- 🗄️ Banco de dados isolado por cliente
- 📊 Monitoramento automático 24/7
- 💾 Backup automático diário
- 🌐 Configurações de rede e subdomínios

#### Como usar:
```bash
# No seu servidor (SSH):
bash "Scripts de instalações/SCRIPT-PARTE-01-SERVIDOR-KRYONIX.sh"
```

#### Características:
- ✅ **Automático**: Executa tudo sozinho sem intervenção
- ✅ **Idempotente**: Pode executar múltiplas vezes sem quebrar
- ✅ **Seguro**: Verificações de pré-requisitos e tratamento de erros
- ✅ **Completo**: Configura tudo necessário para a PARTE 1

#### Pré-requisitos no servidor:
- Docker Swarm ativo
- PostgreSQL rodando (postgresql-kryonix)
- Traefik configurado
- Mínimo 5GB espaço livre
- Acesso root

#### Notificações:
- 📱 WhatsApp: +55 17 98180-5327
- 📧 Email: monitoring@kryonix.com.br
- 📊 Logs: /opt/kryonix/logs/

#### Serviços configurados:
- Keycloak: https://keycloak.kryonix.com.br
- Realm: KRYONIX
- Usuários: kryonix (admin), kryonix-ai-service
- Monitoramento: systemctl status kryonix-monitor
- Backup: Cron diário às 02:00

---

*© 2025 KRYONIX - Desenvolvido por Vitor Jayme Fernandes Ferreira*  
*🤖 Assistido por 15 Agentes Especializados em IA*
