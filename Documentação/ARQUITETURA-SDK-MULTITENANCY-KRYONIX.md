# 🏗️ ARQUITETURA SDK E MULTI-TENANCY KRYONIX
*Documentação Completa: API Modular, SDK Unificado, Multi-Tenancy e Geração Automática de Plataformas*

---

## 🎯 **VISÃO GERAL DA ARQUITETURA**

O KRYONIX utiliza uma arquitetura modular baseada em:
- **SDK Unificado** que funciona para todos os módulos e clientes
- **APIs Modulares** por submódulo, não por stack individual
- **Multi-Tenancy** com isolamento completo por cliente
- **Geração Automática** de plataformas baseada em prompts IA
- **Docker Stack Única** com serviços modulares

---

## 📦 **ESTRUTURA DE APIS - MODULAR POR SUBMÓDULO**

### **🧩 CONCEITO PRINCIPAL**
```yaml
ARQUITETURA_API:
  conceito: "1 API por MÓDULO contratado (não por stack)"
  total_apis_principais: 8  # Uma para cada módulo SaaS
  apis_internas: "32 stacks se comunicam internamente"
  sdk_unificado: "1 SDK consome todas as 8 APIs"
  
  EXEMPLO_MODULAR:
    módulo_crm:
      api_exposta: "✅ api.kryonix.com/crm"
      stacks_internas: ["postgresql", "redis", "minio", "prometheus"]
      submódulos:
        - gestao_leads
        - pipeline_vendas
        - automacao_cobranca
        - relatorios_vendas
        
    módulo_whatsapp:
      api_exposta: "✅ api.kryonix.com/whatsapp"
      stacks_internas: ["evolution-api", "chatwoot", "n8n", "redis"]
      submódulos:
        - envio_mensagens
        - automacao_respostas
        - chatbot_ia
        - analytics_conversas
```

### **🔄 COMUNICAÇÃO ENTRE MÓDULOS**
```typescript
// Cliente → SDK → API Módulo → Stacks Internas
class ComunicacaoModular {
  // Cliente usa apenas o SDK simplificado
  async exemploUsoCliente() {
    const kryonix = new KryonixSDK({
      apiKey: 'cliente_token',
      módulos: ['crm', 'whatsapp', 'agendamento']
    });
    
    // SDK faz chamadas para APIs modulares específicas
    await kryonix.crm.criarLead({ nome: "João Silva" });
    await kryonix.whatsapp.enviarMensagem({ 
      contato: "+5511999999999", 
      texto: "Olá João!" 
    });
  }
  
  // Internamente, cada API orquestra suas stacks
  async exemploInternoModuloCRM() {
    // API CRM usa múltiplas stacks internamente
    const lead = await this.postgresql.salvarLead(dados);
    await this.redis.cache(`lead_${lead.id}`, lead);
    await this.prometheus.contarMetrica('leads_criados');
    await this.rabbitmq.notificarNovoLead(lead);
    
    return lead;
  }
}
```

---

## 🛠️ **SDK UNIFICADO KRYONIX**

### **📱 UM SDK PARA TODOS OS MÓDULOS E CLIENTES**
```typescript
// SDK Principal - Funciona para todos os clientes
class KryonixSDK {
  constructor(config: KryonixConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = "https://api.kryonix.com.br";
    this.clienteId = this.extrairClienteId(config.apiKey);
    
    // Inicializar módulos conforme permissões
    this.inicializarModulosPermitidos();
  }
  
  // Módulos disponíveis dinamicamente
  public crm?: CRMModule;
  public whatsapp?: WhatsAppModule;
  public agendamento?: AgendamentoModule;
  public financeiro?: FinanceiroModule;
  public marketing?: MarketingModule;
  public analytics?: AnalyticsModule;
  public portal?: PortalModule;
  public whitelabel?: WhitelabelModule;
  
  private async inicializarModulosPermitidos() {
    const permissoes = await this.verificarPermissoes();
    
    // Só inicializa módulos que o cliente contratou
    if (permissoes.includes('crm')) {
      this.crm = new CRMModule(this.httpClient);
    }
    if (permissoes.includes('whatsapp')) {
      this.whatsapp = new WhatsAppModule(this.httpClient);
    }
    // ... outros módulos
  }
  
  private async verificarPermissoes(): Promise<string[]> {
    const response = await this.httpClient.get('/auth/permissions');
    return response.data.módulos;
  }
}

// Exemplo de uso pelo cliente Siqueira Campos
const siqueiraCampos = new KryonixSDK({
  apiKey: 'sk_siqueira_campos_abc123',
  módulos: ['crm', 'agendamento', 'whatsapp'] // Apenas os contratados
});

// Uso simples
await siqueiraCampos.crm.criarImovel({
  tipo: 'apartamento',
  valor: 250000,
  endereco: 'São Paulo, SP'
});
```

### **🔐 CONTROLE DE ACESSO POR PAGAMENTO**
```typescript
class ControleAcessoKryonix {
  async validarAcesso(clienteId: string, modulo: string): Promise<boolean> {
    const cliente = await this.buscarCliente(clienteId);
    
    // Verifica status do pagamento
    if (cliente.status !== 'ativo') {
      throw new Error('Cliente inativo - pagamento em atraso');
    }
    
    // Verifica se módulo está contratado
    if (!cliente.modulosContratados.includes(modulo)) {
      throw new Error(`Módulo ${modulo} não contratado`);
    }
    
    // Verifica limites de uso
    const usoAtual = await this.verificarUsoMensal(clienteId, modulo);
    if (usoAtual >= cliente.limites[modulo]) {
      throw new Error(`Limite de uso do módulo ${modulo} excedido`);
    }
    
    return true;
  }
  
  async bloquearClientePorFaltaPagamento(clienteId: string) {
    await this.database.updateCliente(clienteId, { 
      status: 'bloqueado',
      dataBlockeio: new Date(),
      motivo: 'inadimplencia'
    });
    
    // Notificar via WhatsApp
    await this.whatsapp.enviarNotificacao(clienteId, {
      tipo: 'bloqueio',
      mensagem: 'Sua conta foi suspensa por falta de pagamento.'
    });
  }
}
```

---

## 🏢 **MULTI-TENANCY COMPLETO**

### **🔄 ISOLAMENTO POR CLIENTE**
```yaml
MULTI_TENANCY_ARCHITECTURE:
  estratégia: "Database por cliente + Schema isolation"
  
  BANCO_PRINCIPAL_KRYONIX:
    nome: "kryonix_core"
    função: "Controle de clientes, planos, pagamentos"
    tabelas:
      - clientes
      - planos_contratados
      - pagamentos
      - permissoes_modulos
      
  BANCOS_POR_CLIENTE:
    padrão: "kryonix_cliente_{cliente_id}"
    exemplo: "kryonix_cliente_siqueiracampos"
    isolamento: "100% - dados nunca se misturam"
    
  CRIACAO_AUTOMATICA:
    trigger: "Cliente paga e confirma contratação"
    processo:
      1: "IA cria banco exclusivo do cliente"
      2: "IA executa migrations específicas"
      3: "IA configura permissões e acessos"
      4: "IA gera token de acesso exclusivo"
      5: "IA envia credenciais por email/WhatsApp"
```

### **💾 GESTÃO AUTOMÁTICA DE BANCOS**
```typescript
class MultitennacyManager {
  async criarNovoCliente(dadosCliente: NovoClienteData) {
    const clienteId = this.gerarClienteId(dadosCliente.nome);
    
    // 1. Criar registro no banco principal
    await this.database.clientes.create({
      id: clienteId,
      nome: dadosCliente.nome,
      email: dadosCliente.email,
      status: 'ativo',
      modulosContratados: dadosCliente.planos,
      databaseName: `kryonix_cliente_${clienteId}`
    });
    
    // 2. IA cria banco isolado para o cliente
    await this.criarBancoCliente(clienteId);
    
    // 3. IA executa migrations necessárias
    await this.executarMigrationsCliente(clienteId, dadosCliente.planos);
    
    // 4. IA gera token de acesso
    const token = await this.gerarTokenCliente(clienteId);
    
    // 5. IA configura .env personalizado
    const envConfig = await this.gerarEnvCliente(clienteId, token);
    
    // 6. IA envia configurações por email/WhatsApp
    await this.enviarCredenciaisCliente(dadosCliente, envConfig);
    
    return { clienteId, token, databaseName: `kryonix_cliente_${clienteId}` };
  }
  
  async alterarConexaoDinamica(clienteId: string) {
    const cliente = await this.buscarCliente(clienteId);
    
    // SDK/API conecta dinamicamente no banco do cliente
    const conexao = new DatabaseConnection({
      host: process.env.DB_HOST,
      database: cliente.databaseName,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    return conexao;
  }
}
```

---

## 🐳 **ARQUITETURA DOCKER ÚNICA STACK**

### **📦 UMA STACK, MÚLTIPLOS SERVIÇOS**
```yaml
DOCKER_ARCHITECTURE:
  conceito: "1 Stack Docker com serviços modulares"
  nome_stack: "kryonix-platform"
  
  ESTRUTURA_STACK:
    # Infraestrutura base
    proxy: "traefik (roteamento inteligente)"
    database: "postgresql (multi-database)"
    cache: "redis (multi-namespace)"
    storage: "minio (multi-bucket)"
    queue: "rabbitmq (multi-vhost)"
    
    # APIs modulares (1 por módulo SaaS)
    api_crm: "kryonix-api-crm"
    api_whatsapp: "kryonix-api-whatsapp" 
    api_agendamento: "kryonix-api-agendamento"
    api_financeiro: "kryonix-api-financeiro"
    api_marketing: "kryonix-api-marketing"
    api_analytics: "kryonix-api-analytics"
    api_portal: "kryonix-api-portal"
    api_whitelabel: "kryonix-api-whitelabel"
    
    # Frontend unificado
    frontend: "kryonix-web-app"
    
    # IA e automação
    ai_ollama: "ollama-local-llm"
    ai_dify: "dify-conversational"
    automation: "n8n-workflows"
    
    # Monitoramento
    monitoring: "grafana + prometheus"
    logs: "elasticsearch + kibana"
```

### **🔧 DOCKER-COMPOSE MODULAR**
```yaml
# docker-compose.yml - Stack única modular
version: '3.8'

services:
  # === APIS MODULARES ===
  api-crm:
    image: kryonix/api-crm:latest
    environment:
      - MODULO=crm
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/
      - REDIS_URL=redis://redis:6379/0
    networks:
      - kryonix-network
    deploy:
      replicas: 2
      
  api-whatsapp:
    image: kryonix/api-whatsapp:latest
    environment:
      - MODULO=whatsapp
      - EVOLUTION_API_URL=http://evolution-api:8080
    networks:
      - kryonix-network
    deploy:
      replicas: 1
      
  # === FRONTEND UNIFICADO ===
  frontend:
    image: kryonix/frontend:latest
    environment:
      - API_BASE_URL=https://api.kryonix.com.br
      - MULTI_TENANT=true
    networks:
      - kryonix-network
    deploy:
      replicas: 3
      
  # === INFRAESTRUTURA ===
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=kryonix_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kryonix-network
      
networks:
  kryonix-network:
    driver: overlay
    
volumes:
  postgres_data:
```

---

## 📱 **GERAÇÃO AUTOMÁTICA DE APPS MÓVEIS**

### **🤖 PROCESSO AUTOMATIZADO POR IA**
```yaml
MOBILE_APP_GENERATION:
  trigger: "Cliente solicita app móvel"
  processo_ia:
    1: "IA analisa módulos contratados pelo cliente"
    2: "IA gera configuração específica do app"
    3: "IA usa Capacitor.js para wrapper nativo"
    4: "IA configura tema/branding do cliente"
    5: "IA compila APK (Android) e IPA (iOS)"
    6: "IA envia apps prontos para cliente"
    
  TECNOLOGIA:
    base: "Progressive Web App (PWA)"
    wrapper: "Capacitor.js ou React Native"
    distribuição: "APK direto ou lojas oficiais"
    
  CUSTO_PUBLICACAO:
    google_play: "$25 USD (pagamento único)"
    apple_store: "$99 USD/ano"
    
  AUTOMATIZACAO:
    build_pipeline: "GitHub Actions automatizado"
    branding: "Logo, cores, nome automático"
    funcionalidades: "Apenas módulos contratados"
```

### **📲 FLUXO DE CRIAÇÃO DO APP**
```typescript
class MobileAppGenerator {
  async gerarAppCliente(clienteId: string, configuracao: AppConfig) {
    const cliente = await this.buscarCliente(clienteId);
    
    // 1. IA analisa módulos contratados
    const modulosAtivos = cliente.modulosContratados;
    
    // 2. IA gera configuração personalizada
    const appConfig = {
      nome: configuracao.nomeApp || `${cliente.nome} App`,
      bundleId: `com.kryonix.${clienteId}`,
      logo: configuracao.logo || cliente.logo,
      cores: configuracao.tema || cliente.brandingColors,
      módulos: modulosAtivos,
      apiEndpoint: `https://api.kryonix.com.br`,
      clienteToken: cliente.token
    };
    
    // 3. IA gera código do app
    await this.gerarCodigoApp(appConfig);
    
    // 4. IA compila para Android/iOS
    const builds = await this.compilarApp(appConfig);
    
    // 5. IA envia apps para cliente
    await this.enviarAppsParaCliente(cliente, builds);
    
    return builds;
  }
  
  private async compilarApp(config: AppConfig) {
    // Build Android (APK)
    const androidBuild = await this.capacitor.buildAndroid(config);
    
    // Build iOS (IPA) - requer macOS
    const iosBuild = await this.capacitor.buildIOS(config);
    
    return {
      android: androidBuild.apkPath,
      ios: iosBuild.ipaPath,
      downloadLinks: {
        android: `https://downloads.kryonix.com.br/apps/${config.bundleId}.apk`,
        ios: `https://downloads.kryonix.com.br/apps/${config.bundleId}.ipa`
      }
    };
  }
}
```

---

## 🎨 **GERAÇÃO AUTOMÁTICA DE PLATAFORMAS**

### **🧠 IA BUILDER - GERAÇÃO POR PROMPT**
```yaml
IA_PLATFORM_BUILDER:
  input: "Cliente descreve necessidade em poucas palavras"
  processamento_ia:
    1: "IA interpreta o prompt do cliente"
    2: "IA identifica módulos e submódulos necessários"
    3: "IA gera configuração personalizada"
    4: "IA apresenta proposta para aprovação"
    5: "Cliente confirma e efetua pagamento"
    6: "IA cria plataforma automaticamente"
    
  EXEMPLO_PROMPT:
    cliente_input: "Preciso de CRM + agenda para minha clínica"
    ia_analysis:
      módulos_necessários: ["crm", "agendamento", "whatsapp"]
      submódulos_crm: ["gestao_pacientes", "prontuarios", "historico"]
      submódulos_agenda: ["consultas", "lembretes", "pagamentos"]
      integracoes: ["whatsapp_lembretes", "sms_backup"]
      
  RESULTADO_AUTOMATICO:
    subdomain: "clinica-cliente.kryonix.com.br"
    database: "kryonix_cliente_clinica"
    dashboard: "Personalizado para clínicas"
    apps_mobile: "Android + iOS configurados"
```

### **⚡ FLUXO COMPLETO DE CRIAÇÃO**
```typescript
class IABuilder {
  async processarSolicitacaoCliente(prompt: string, clienteData: ClienteData) {
    // 1. IA analisa o prompt
    const analise = await this.ollama.analisarPrompt(prompt, {
      contexto: "criação_plataforma_saas",
      foco: "identificar_modulos_necessarios",
      target: "brasileiro_leigo_programacao"
    });
    
    // 2. IA identifica módulos e configurações
    const configuracao = {
      módulos: analise.modulosNecessarios,
      submódulos: analise.submódulosEspecíficos,
      integrações: analise.integraçõesRecomendadas,
      personalização: analise.personalizaçãoSugerida
    };
    
    // 3. IA calcula preço automaticamente
    const preço = this.calcularPreçoModulos(configuracao.módulos);
    
    // 4. IA apresenta proposta para cliente
    const proposta = await this.gerarProposta(configuracao, preço);
    
    // 5. Se cliente aprovar → IA cria tudo automaticamente
    if (await this.aguardarAprovacaoCliente(proposta)) {
      return await this.criarPlataformaCompleta(configuracao, clienteData);
    }
  }
  
  private async criarPlataformaCompleta(config: PlataformaConfig, cliente: ClienteData) {
    // IA executa criação completa automaticamente
    const resultado = {
      subdomain: await this.criarSubdominio(cliente),
      database: await this.criarBancoCliente(cliente, config.módulos),
      dashboard: await this.gerarDashboardPersonalizado(config),
      apis: await this.ativarAPIsModulos(config.módulos),
      sdk: await this.gerarSDKPersonalizado(cliente),
      apps: await this.gerarAppsMobile(cliente, config),
      documentacao: await this.gerarDocumentacaoCliente(config)
    };
    
    // IA envia tudo pronto para o cliente
    await this.entregarPlataformaPronta(cliente, resultado);
    
    return resultado;
  }
}
```

---

## 🔄 **INTEGRAÇÃO EVOLUTION API + N8N**

### **💬 AUTOMAÇÃO COMPLETA WHATSAPP**
```yaml
WHATSAPP_AUTOMATION:
  evolution_api:
    funcao: "Conexão direta com WhatsApp Business"
    features: ["envio", "recebimento", "mídia", "grupos"]
    
  n8n_integration:
    funcao: "Automação de fluxos WhatsApp"
    workflows:
      - resposta_automatica_ia
      - lead_qualification
      - agendamento_automatico
      - cobranca_automatica
      - suporte_multimodal
      
  FLUXO_AUTOMATIZADO:
    1: "Cliente envia mensagem WhatsApp"
    2: "Evolution API recebe e repassa para N8N"
    3: "N8N processa com IA (Ollama/Dify)"
    4: "IA determina ação (agendar, cobrar, informar)"
    5: "N8N executa ação nos módulos necessários"
    6: "Resposta automática via WhatsApp"
```

### **🤖 INTEGRAÇÃO COMPLETA IA**
```typescript
class WhatsAppIAIntegration {
  async processarMensagemWhatsApp(mensagem: WhatsAppMessage) {
    // 1. Evolution API recebe mensagem
    const contexto = await this.extrairContexto(mensagem);
    
    // 2. IA analisa intenção
    const analiseIA = await this.ollama.analisarMensagem(mensagem.texto, {
      cliente: contexto.cliente,
      historico: contexto.historico,
      modulos_disponiveis: contexto.modulosAtivos
    });
    
    // 3. N8N executa fluxo automatizado
    const fluxo = await this.n8n.executarFluxo(analiseIA.intencao, {
      dados: mensagem,
      cliente: contexto.cliente,
      acao_recomendada: analiseIA.acao
    });
    
    // 4. IA gera resposta personalizada
    const resposta = await this.dify.gerarResposta({
      contexto: analiseIA,
      cliente_perfil: contexto.cliente,
      historico_conversa: contexto.historico,
      resultado_fluxo: fluxo.resultado
    });
    
    // 5. Evolution API envia resposta
    await this.evolutionAPI.enviarMensagem({
      to: mensagem.from,
      message: resposta.texto,
      attachments: resposta.anexos
    });
    
    return { processed: true, action: fluxo.acao, response: resposta };
  }
}
```

---

## ✅ **CHECKLIST IMPLEMENTAÇÃO**

### **📋 COMPONENTES ESSENCIAIS**
- [ ] **SDK Unificado** - Funciona para todos os módulos/clientes
- [ ] **APIs Modulares** - 8 APIs (uma por módulo SaaS)
- [ ] **Multi-tenancy** - Banco isolado por cliente
- [ ] **Docker Stack Única** - Serviços modulares organizados
- [ ] **Controle Pagamento** - Ativação/desativação automática
- [ ] **Geração Apps Mobile** - Android/iOS automatizado
- [ ] **IA Builder** - Criação por prompt automática
- [ ] **Evolution + N8N** - WhatsApp automation completa
- [ ] **Sistema .env** - Configuração automática por cliente

### **🎯 RESULTADO FINAL**
Uma arquitetura **modular**, **escalável** e **100% automatizada** onde:
- Clientes descrevem necessidades → IA cria plataforma completa
- SDK único funciona para todos → Integração simplificada
- Cada cliente isolado → Segurança e personalização total
- Apps móveis gerados automaticamente → Presença mobile completa
- WhatsApp + IA totalmente integrados → Comunicação inteligente

---

*🏢 KRYONIX - Arquitetura Modular para o Futuro dos Negócios*
