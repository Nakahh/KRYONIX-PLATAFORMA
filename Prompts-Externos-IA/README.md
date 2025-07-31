# 🤖 PROMPTS EXTERNOS - KRYONIX PLATAFORMA
*Guia Completo para IAs darem Continuidade ao Projeto KRYONIX*

---

## 🎯 **SOBRE O PROJETO KRYONIX**

**KRYONIX** é uma **Plataforma SaaS 100% Autônoma por IA** com 8 módulos integrados e 32 stacks tecnológicas funcionando em harmonia.

### **📊 INFORMAÇÕES ESSENCIAIS**
- **Servidor**: 45.76.246.44 (ssh-remote+linuxuser@45.76.246.44)
- **Senha SSH**: 6Cp(U.PAik,8,)m6
- **Domínio Principal**: www.kryonix.com.br
- **GitHub**: https://github.com/Nakahh/KRYONIX-PLATAFORMA
- **Rede Docker**: kryonix-net (Docker Swarm)
- **Total de Partes**: 50 (divididas em 5 fases)

### **🔐 CREDENCIAIS MASTER**
```
LOGIN MASTER (para todos os sistemas):
Usuário: kryonix
Senha: Vitor@123456

URLs Principais:
- Portainer: https://painel.kryonix.com.br
- Keycloak: https://keycloak.kryonix.com.br
- Grafana: https://grafana.kryonix.com.br
- PgAdmin: https://pgadmin.kryonix.com.br
- MinIO: https://minio.kryonix.com.br
```

---

## 🏗️ **ARQUITETURA DO PROJETO**

### **32 STACKS TECNOLÓGICAS**
1. **Infraestrutura (8)**: Traefik, PostgreSQL, Redis, MinIO, Docker, Portainer, Nginx, RabbitMQ
2. **IA (6)**: Ollama, Dify, LangFlow, Jupyter, TensorFlow, PyTorch
3. **Monitoramento (4)**: Prometheus, Grafana, Jaeger, Elasticsearch
4. **SaaS (8)**: Evolution API, Chatwoot, N8N, Mautic, Metabase, Typebot, CRM, Email Marketing
5. **Segurança (3)**: Keycloak, Vault, Fail2Ban
6. **Frontend (3)**: React, Next.js, PWA

### **8 MÓDULOS SAAS**
1. **Análise Avançada e Inteligência Comercial** - R$ 99/mês
2. **Agendamento Inteligente com IA e Cobrança** - R$ 119/mês
3. **Atendimento Omnichannel com IA Multimodal** - R$ 159/mês
4. **CRM & Funil de Vendas com Cobrança** - R$ 179/mês
5. **Email Marketing Multicanal com IA Generativa** - R$ 219/mês
6. **Gestão de Redes Sociais com IA + Agendamento** - R$ 239/mês
7. **Portal do Cliente, Treinamento & Gestão Documental** - R$ 269/mês
8. **Whitelabel & Plataforma Customizável** - R$ 299/mês + R$ 997 setup

---

## 🎯 **EXIGÊNCIAS OBRIGATÓRIAS EM TODAS AS PARTES**

### **📱 MOBILE-FIRST**
- **80% dos usuários são mobile**
- Interface responsiva e touch-friendly
- Performance 60fps garantida
- PWA com modo offline
- Gestos naturais mobile

### **🤖 IA 100% AUTÔNOMA**
- Sistema operando sozinho 24/7
- Tomada de decisões automática
- Auto-otimização contínua
- Processamento voz/imagem
- Machine learning contínuo

### **🇧🇷 PORTUGUÊS BRASILEIRO**
- Interface 100% em português
- Linguagem simplificada para leigos
- Contexto cultural brasileiro
- Termos técnicos traduzidos

### **📊 DADOS REAIS SEMPRE**
- Zero dados mock ou simulados
- Métricas tempo real
- Analytics comportamento real
- Performance real monitorada

### **💬 COMUNICAÇÃO MULTICANAL**
- WhatsApp via Evolution API
- SMS como backup
- Chamadas automáticas IA
- Push notifications mobile
- Integração omnichannel

### **🔧 DEPLOY AUTOMÁTICO**
- CI/CD via GitHub Actions
- Deploy para www.kryonix.com.br
- Rollback automático se problemas
- Notificações WhatsApp de status
- Monitoramento 24/7

---

## 📋 **COMO USAR ESTE GUIA**

### **🚀 PARA IAs INICIANTES NO PROJETO**
1. **Leia este README completo** para entender o contexto
2. **Escolha a parte** que vai executar (01-50)
3. **Use o prompt específico** da pasta correspondente
4. **Execute via terminal** no servidor 144.202.90.55
5. **Valide cada etapa** antes de prosseguir
6. **Notifique conclusão** via WhatsApp

### **🔄 PARA IAs DANDO CONTINUIDADE**
1. **Verifique a parte atual** em `.current-part`
2. **Execute a próxima parte** na sequência
3. **Siga TODAS as exigências** obrigatórias
4. **Atualize progresso** automaticamente
5. **Monitore saúde** de todos os sistemas

---

## 📁 **ESTRUTURA DOS PROMPTS**

### **ORGANIZAÇÃO DAS 50 PARTES**
```
Prompts-Externos-IA/
├── README.md (este arquivo)
├── PARTE-01-KEYCLOAK.md
├── PARTE-02-POSTGRESQL.md
├── PARTE-03-MINIO.md
├── PARTE-04-REDIS.md
├── PARTE-05-TRAEFIK.md
├── ...
└── PARTE-50-GOLIVE.md
```

### **FASES DO PROJETO**
- **FASE 1 (Partes 1-10)**: Fundação - Infraestrutura base
- **FASE 2 (Partes 11-25)**: Core - Aplicação principal
- **FASE 3 (Partes 26-35)**: IA - Inteligência artificial
- **FASE 4 (Partes 36-45)**: SaaS - Módulos específicos
- **FASE 5 (Partes 46-50)**: Finalização - Deploy e go-live

---

## 🛠️ **ACESSO AO SERVIDOR**

### **CONEXÃO SSH**
```bash
ssh root@144.202.90.55
# Senha: Vitor@123456
```

### **ESTRUTURA DE DIRETÓRIOS**
```
/opt/kryonix/
├── scripts/          # Scripts de automação
├── backups/          # Backups automáticos
├── logs/             # Logs do sistema
├── config/           # Configurações
└── data/             # Dados persistentes
```

### **COMANDOS ÚTEIS**
```bash
# Verificar todos os containers
docker ps

# Ver logs de um container
docker logs container-name

# Acessar Portainer
https://painel.kryonix.com.br

# Status da rede Docker
docker network ls | grep kryonix
```

---

## 📞 **COMUNICAÇÃO E NOTIFICAÇÕES**

### **WhatsApp (Evolution API)**
```bash
# Enviar notificação
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: [chave_evolution_api]" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ Mensagem de teste do sistema"
  }'
```

### **Telefone do Cliente**
- **Vitor Fernandes**: +55 17 98180-5327
- **Recebe notificações**: WhatsApp de todas as etapas

---

## 🔍 **MONITORAMENTO E MÉTRICAS**

### **URLs de Monitoramento**
- **Grafana**: https://grafana.kryonix.com.br (kryonix/Vitor@123456)
- **Prometheus**: https://prometheus.kryonix.com.br
- **Logs**: https://logs.kryonix.com.br
- **Status**: https://status.kryonix.com.br

### **Health Checks Importantes**
```bash
# Verificar saúde geral
curl https://www.kryonix.com.br/health

# Verificar API
curl https://api.kryonix.com.br/health

# Verificar Keycloak
curl https://keycloak.kryonix.com.br/health/ready
```

---

## 🚨 **ALERTAS E PROBLEMAS**

### **EM CASO DE PROBLEMA**
1. **Verificar logs**: `docker logs container-name`
2. **Verificar saúde**: Health checks acima
3. **Consultar Grafana**: Métricas detalhadas
4. **Notificar cliente**: WhatsApp automático
5. **Executar rollback**: Se necessário

### **CONTATOS DE EMERGÊNCIA**
- **Cliente**: Vitor Fernandes - +55 17 98180-5327
- **GitHub Issues**: https://github.com/Nakahh/KRYONIX-PLATAFORMA/issues
- **Documentação**: docs.kryonix.com.br

---

## ✅ **CHECKLIST ANTES DE INICIAR**

### **PRÉ-REQUISITOS**
- [ ] ✅ Acesso SSH ao servidor funcionando
- [ ] ✅ Credenciais master testadas
- [ ] ✅ Docker Swarm ativo
- [ ] ✅ Rede kryonix-net funcionando
- [ ] ✅ Todas as 32 stacks rodando
- [ ] ✅ WhatsApp Evolution API funcionando
- [ ] ✅ Monitoramento ativo

### **ANTES DE CADA PARTE**
- [ ] ✅ Ler prompt específico completo
- [ ] ✅ Verificar dependências da parte
- [ ] ✅ Fazer backup se necessário
- [ ] ✅ Executar passo a passo
- [ ] ✅ Validar cada etapa
- [ ] ✅ Notificar conclusão

---

## 🎓 **PARA IAs ESPECIALISTAS**

### **AGENTES ESPECIALIZADOS DISPONÍVEIS**
O projeto conta com 15 agentes especializados que devem ser "consultados" mentalmente:
1. Arquiteto Software Sênior
2. Especialista DevOps
3. Designer UX/UI
4. Especialista IA
5. Analista BI
6. Especialista Segurança
7. Especialista Mobile
8. Expert Comunicação
9. Arquiteto Dados
10. Expert Performance
11. Expert APIs
12. QA Expert
13. Specialist Business
14. Expert Automação
15. Specialist Localização

### **PRINCÍPIOS DE DESENVOLVIMENTO**
- **Simplicidade**: Sempre priorizar soluções simples
- **Autonomia**: Sistema deve operar sozinho
- **Performance**: 60fps mobile sempre
- **Segurança**: LGPD e boas práticas
- **Escalabilidade**: Preparado para crescimento
- **Manutenibilidade**: Código limpo e documentado

---

## 🚀 **COMEÇAR AGORA**

### **PRÓXIMOS PASSOS**
1. **Escolha a parte** a ser executada
2. **Abra o prompt específico** (PARTE-XX-NOME.md)
3. **Conecte no servidor**: `ssh root@144.202.90.55`
4. **Execute os comandos** do prompt
5. **Valide cada etapa**
6. **Notifique conclusão**

### **PRIMEIRA EXECUÇÃO**
Se está começando do zero, inicie pela **PARTE-01-KEYCLOAK.md**

### **CONTINUAÇÃO**
Se está dando continuidade, verifique qual a próxima parte em `.current-part`

---

## 💝 **AGRADECIMENTOS**

Este projeto foi desenvolvido com ❤️ pelos **15 Agentes Especializados KRYONIX** com foco total em:
- 📱 **Mobile-First** (80% usuários)
- 🤖 **IA 100% Autônoma**
- 🇧🇷 **Português para Leigos**
- 📊 **Dados Reais Sempre**
- 💬 **Comunicação Multicanal**
- 🔧 **Deploy Automático**

---

*🏢 KRYONIX - Plataforma SaaS do Futuro*  
*👨‍💼 Cliente: Vitor Fernandes*  
*📱 +55 17 98180-5327*  
*🌐 www.kryonix.com.br*
