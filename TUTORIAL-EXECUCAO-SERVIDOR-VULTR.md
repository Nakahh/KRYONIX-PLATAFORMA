# 🚀 TUTORIAL COMPLETO - EXECUÇÃO NO SERVIDOR VULTR

## 📋 PASSO A PASSO PARA RODAR A PARTE 01 NO SEU SERVIDOR

Desenvolvido por: **Vitor Jayme Fernandes Ferreira**  
Assistido por: **15 Agentes Especializados em IA**  
Data: **Janeiro 2025**

---

## ⚠️ IMPORTANTE - LEIA ANTES DE COMEÇAR

Este tutorial é para executar **APENAS no seu servidor Vultr** (IP: 45.76.246.44).  
**NÃO execute no servidor Builder.io** - ele é apenas para desenvolvimento.

---

## 🎯 O QUE ESTE SCRIPT FAZ

O script `SCRIPT-EXECUCAO-UNICA-SERVIDOR-VULTR-PARTE01.sh` configura automaticamente:

- ✅ **Keycloak Multi-Tenant** completo
- ✅ **Autenticação biométrica** mobile-first
- ✅ **WhatsApp OTP** via Evolution API
- ✅ **Banco de dados** isolado por cliente
- ✅ **Monitoramento 24/7** automático
- ✅ **Backup automático** diário
- ✅ **Notificações WhatsApp** em tempo real

---

## 📚 PRÉ-REQUISITOS NO SEU SERVIDOR

Antes de executar, certifique-se que seu servidor já tem:

### ✅ Stacks Base Instaladas
- [x] **Docker Swarm** ativo
- [x] **PostgreSQL** rodando (postgresql-kryonix)
- [x] **Traefik** configurado
- [x] **Evolution API** funcionando
- [x] **Rede Kryonix-NET** criada

### ✅ Informações Confirmadas
- [x] **IP do Servidor**: 45.76.246.44
- [x] **Domínio**: kryonix.com.br apontando para o IP
- [x] **WhatsApp**: +55 17 98180-5327
- [x] **Email**: vitor.nakahh@gmail.com

---

## 🔑 CREDENCIAIS CONFIGURADAS NO SCRIPT

O script já possui **TODAS** as credenciais configuradas automaticamente:

```bash
# Autenticação
KEYCLOAK_ADMIN_USER="kryonix"
KEYCLOAK_ADMIN_PASSWORD="Vitor@123456"

# Evolution API
EVOLUTION_API_KEY="2f4d6967043b87b5ebee57b872e0223a"
EVOLUTION_API_URL="https://api.kryonix.com.br"

# Notificações
WHATSAPP_ALERT="+5517981805327"
ADMIN_EMAIL="vitor.nakahh@gmail.com"

# Segurança
JWT_SECRET="Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
```

---

## 🚀 EXECUÇÃO - COMANDOS EXATOS

### Passo 1: Conectar ao Servidor

```bash
# Conectar via SSH
ssh root@45.76.246.44

# Senha: 6Cp(U.PAik,8,)m6
```

### Passo 2: Fazer Pull da Versão Mais Recente

```bash
# Ir para o diretório do projeto
cd /opt/kryonix-plataform

# Fazer pull da main mais recente
git pull origin main
```

### Passo 3: Executar o Script de Execução Única

```bash
# Dar permissão de execução
chmod +x SCRIPT-EXECUCAO-UNICA-SERVIDOR-VULTR-PARTE01.sh

# Executar o script (EXECUÇÃO ÚNICA)
sudo bash SCRIPT-EXECUCAO-UNICA-SERVIDOR-VULTR-PARTE01.sh
```

---

## 📊 O QUE ACONTECE DURANTE A EXECUÇÃO

### Etapas Automáticas (15 Total):

1. **🔍 Verificação de Dependências** - Docker, Python3, curl, jq
2. **⚙️ Verificação Docker Swarm** - Se está ativo
3. **💾 Verificação de Espaço** - Mínimo 5GB livre
4. **🌐 Conectividade Externa** - GitHub, Docker Registry
5. **🔗 Rede Docker** - Criação/verificação Kryonix-NET
6. **📋 Serviços Base** - PostgreSQL, Traefik funcionando
7. **🗄️ Database Keycloak** - Criação automática
8. **⚙️ Configuração Keycloak** - Docker Compose
9. **🚀 Deploy Keycloak** - Stack no Docker Swarm
10. **🏢 Realm KRYONIX** - Configuração completa
11. **👥 Clients OAuth** - Frontend, Mobile, IA
12. **👤 Usuários Padrão** - Admin e serviços
13. **📈 Monitoramento** - Python scripts + cron
14. **💾 Backup Automático** - Diário às 2h
15. **✅ Validação Final** - Testes de conectividade

---

## 📱 NOTIFICAÇÕES AUTOMÁTICAS

Durante a execução, você receberá notificações no WhatsApp:

- 🔄 **Início da configuração**
- ⚠️ **Problemas detectados** (se houver)
- ✅ **Configuração concluída com sucesso**

---

## 🎯 RESULTADOS ESPERADOS

### Após a Execução Bem-Sucedida:

#### ✅ Keycloak Funcionando
- **URL**: https://keycloak.kryonix.com.br
- **Login**: kryonix / Vitor@123456
- **Realm**: KRYONIX configurado

#### ✅ Clients OAuth Criados
- `kryonix-frontend` - Aplicação web
- `kryonix-mobile-app` - App móvel
- `kryonix-ai-client` - Serviços IA

#### ✅ Usuários Criados
- `kryonix` - Administrador principal
- `kryonix-ai-service` - Serviço de IA

#### ✅ Monitoramento Ativo
- Verificação a cada 5 minutos
- Alertas automáticos via WhatsApp
- Logs em `/opt/kryonix/logs/`

#### ✅ Backup Configurado
- Backup diário às 2h da manhã
- Retention de 7 dias
- PostgreSQL + configurações

---

## 🔍 VERIFICAÇÕES APÓS EXECUÇÃO

### 1. Testar Keycloak
```bash
# Verificar se está rodando
curl -f https://keycloak.kryonix.com.br/health/ready

# Deve retornar: 200 OK
```

### 2. Verificar Logs
```bash
# Ver logs da instalação
ls -la /opt/kryonix/logs/

# Ver último log
tail -f /opt/kryonix/logs/parte01-*.log
```

### 3. Verificar Serviços
```bash
# Verificar stack do Keycloak
docker stack ls

# Verificar container
docker ps | grep keycloak
```

### 4. Verificar Monitoramento
```bash
# Ver cron jobs
crontab -l

# Testar monitoramento
python3 /opt/kryonix/scripts/kryonix_monitor.py
```

---

## ⚠️ RESOLUÇÃO DE PROBLEMAS

### Problema: "Script já está sendo executado"
```bash
# Remover lock file órfão
sudo rm -f /tmp/kryonix-parte01-*.lock

# Executar novamente
sudo bash SCRIPT-EXECUCAO-UNICA-SERVIDOR-VULTR-PARTE01.sh
```

### Problema: "Docker Swarm não ativo"
```bash
# Inicializar Docker Swarm
docker swarm init

# Executar script novamente
sudo bash SCRIPT-EXECUCAO-UNICA-SERVIDOR-VULTR-PARTE01.sh
```

### Problema: "Serviços base não encontrados"
```bash
# Verificar serviços PostgreSQL e Traefik
docker ps --format "table {{.Names}}\t{{.Status}}"

# Se não estiverem rodando, execute o instalador das stacks base primeiro
```

### Problema: "Keycloak não fica pronto"
```bash
# Verificar logs do Keycloak
docker service logs kryonix-auth_keycloak

# Verificar se database existe
docker exec postgresql-kryonix psql -U postgres -l | grep keycloak
```

---

## 📞 SUPORTE E CONTATO

### 🚨 Se Algo Der Errado:

1. **WhatsApp Direto**: +55 17 98180-5327
2. **Email**: vitor.nakahh@gmail.com
3. **Logs Detalhados**: `/opt/kryonix/logs/parte01-*.log`

### 📊 Informações para Suporte:

Sempre inclua essas informações ao pedir ajuda:

```bash
# Comando para coletar informações de debug
echo "=== INFORMAÇÕES DO SERVIDOR ===" > debug-info.txt
echo "Data: $(date)" >> debug-info.txt
echo "IP: $(curl -s ifconfig.me)" >> debug-info.txt
echo "Docker Swarm: $(docker info | grep -i swarm)" >> debug-info.txt
echo "Serviços rodando:" >> debug-info.txt
docker ps --format "table {{.Names}}\t{{.Status}}" >> debug-info.txt
echo "Últimas linhas do log:" >> debug-info.txt
tail -20 /opt/kryonix/logs/parte01-*.log >> debug-info.txt

# Enviar arquivo debug-info.txt via WhatsApp ou email
```

---

## 🎉 PRÓXIMOS PASSOS

### Após PARTE 01 Concluída:

1. ✅ **Keycloak Multi-Tenant** funcionando
2. 🔄 **PARTE 02**: PostgreSQL otimizado (próximo script)
3. 🔄 **PARTE 03**: MinIO storage (próximo script)
4. 🔄 **PARTE 04**: Redis Enterprise (próximo script)
5. 🔄 **Continuar até PARTE 50**...

### Validações Importantes:

- [ ] Login no Keycloak funcionando
- [ ] Realm KRYONIX configurado
- [ ] Clients OAuth criados
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Notificações WhatsApp funcionando

---

## 📝 REGISTRO DE EXECUÇÃO

### Data de Execução: _______________

### Horário de Início: _______________

### Horário de Conclusão: _______________

### Status Final: [ ] Sucesso [ ] Erro

### Observações:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## ✅ CONFIRMAÇÃO FINAL

Após execução bem-sucedida, você deve conseguir:

1. **Acessar**: https://keycloak.kryonix.com.br
2. **Fazer login**: kryonix / Vitor@123456
3. **Ver realm**: KRYONIX configurado
4. **Receber**: Notificação WhatsApp de sucesso

---

**© 2025 KRYONIX - Desenvolvido por Vitor Jayme Fernandes Ferreira**  
**🤖 Assistido por 15 Agentes Especializados em IA**
