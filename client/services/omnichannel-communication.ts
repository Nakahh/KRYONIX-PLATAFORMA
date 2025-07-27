import { apiClient } from "../lib/api-client";

// Tipos para Sistema Omnichannel
export interface Conversation {
  id: string;
  clienteId: string;
  canal: CommunicationChannel;
  status: ConversationStatus;
  prioridade: ConversationPriority;
  assunto: string;
  ultimaMensagem: Message;
  mensagens: Message[];
  agente?: Agent;
  tags: string[];
  criadaEm: Date;
  atualizadaEm: Date;
  tempoResposta?: number;
  satisfacao?: number;
  resolvida: boolean;
  metadata: ConversationMetadata;
}

export type CommunicationChannel =
  | "whatsapp"
  | "email"
  | "sms"
  | "chat-web"
  | "instagram"
  | "facebook"
  | "telegram"
  | "voice"
  | "video"
  | "slack";

export type ConversationStatus =
  | "nova"
  | "em-andamento"
  | "aguardando-cliente"
  | "aguardando-agente"
  | "resolvida"
  | "fechada"
  | "escalada";

export type ConversationPriority = "baixa" | "normal" | "alta" | "urgente";

export interface Message {
  id: string;
  conversacaoId: string;
  remetente: MessageSender;
  conteudo: MessageContent;
  canal: CommunicationChannel;
  tipo: MessageType;
  status: MessageStatus;
  timestamp: Date;
  lida: boolean;
  entregue: boolean;
  respondida: boolean;
  metadata: MessageMetadata;
}

export type MessageType =
  | "texto"
  | "imagem"
  | "audio"
  | "video"
  | "documento"
  | "localizacao"
  | "contato"
  | "template"
  | "interativo";

export type MessageStatus =
  | "enviando"
  | "enviada"
  | "entregue"
  | "lida"
  | "falha";

export interface MessageSender {
  id: string;
  nome: string;
  tipo: "cliente" | "agente" | "bot" | "sistema";
  avatar?: string;
  informacoes?: any;
}

export interface MessageContent {
  texto?: string;
  arquivo?: FileAttachment;
  template?: MessageTemplate;
  botoes?: MessageButton[];
  metadata?: any;
}

export interface FileAttachment {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  thumbnail?: string;
}

export interface MessageTemplate {
  id: string;
  nome: string;
  categoria: string;
  parametros: any[];
}

export interface MessageButton {
  id: string;
  texto: string;
  tipo: "resposta" | "url" | "telefone";
  valor: string;
}

export interface MessageMetadata {
  canal: CommunicationChannel;
  dispositivo?: string;
  localizacao?: GeolocationData;
  entregaAutomatica?: boolean;
  iaGerada?: boolean;
}

export interface ConversationMetadata {
  origem: string;
  campanhaId?: string;
  produtoInteresse?: string;
  funil: FunnelStage;
  score: number;
  ultimaInteracao: Date;
  tempoSessao: number;
}

export type FunnelStage =
  | "awareness"
  | "consideration"
  | "decision"
  | "purchase"
  | "retention";

export interface Agent {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  status: AgentStatus;
  especialidades: string[];
  conversasAtivas: number;
  limiteConversas: number;
  avaliacaoMedia: number;
  tempoMedioResposta: number;
}

export type AgentStatus = "online" | "ocupado" | "ausente" | "offline";

export interface CommunicationChannel {
  id: string;
  nome: string;
  tipo: CommunicationChannelType;
  ativo: boolean;
  configuracao: ChannelConfiguration;
  metricas: ChannelMetrics;
  integracao: ChannelIntegration;
}

export type CommunicationChannelType =
  | "whatsapp"
  | "email"
  | "sms"
  | "chat"
  | "social"
  | "voice";

export interface ChannelConfiguration {
  webhookUrl?: string;
  token?: string;
  credenciais?: any;
  parametros?: any;
  filtros?: ChannelFilter[];
  automacao?: ChannelAutomation;
}

export interface ChannelFilter {
  campo: string;
  operador: "igual" | "contem" | "inicia" | "termina";
  valor: string;
  acao: "aceitar" | "rejeitar" | "encaminhar";
}

export interface ChannelAutomation {
  respostaAutomatica: boolean;
  horarioAtendimento: BusinessHours;
  mensagemBoasVindas?: string;
  mensagemForaHorario?: string;
  encaminhamentoIA: boolean;
}

export interface BusinessHours {
  ativo: boolean;
  horarios: DaySchedule[];
  feriados: Holiday[];
}

export interface DaySchedule {
  dia: number; // 0-6 (domingo-sábado)
  inicio: string; // "09:00"
  fim: string; // "18:00"
  ativo: boolean;
}

export interface Holiday {
  data: Date;
  nome: string;
  ativo: boolean;
}

export interface ChannelMetrics {
  mensagensEnviadas: number;
  mensagensRecebidas: number;
  tempoMedioResposta: number;
  taxaResposta: number;
  satisfacaoMedia: number;
  conversasAbertas: number;
  conversasResolvidas: number;
  periodo: DateRange;
}

export interface ChannelIntegration {
  provedor: string;
  versao: string;
  webhook: string;
  status: "conectado" | "desconectado" | "erro";
  ultimaConexao: Date;
  configuracoes: any;
}

export interface DateRange {
  inicio: Date;
  fim: Date;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  endereco?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
}

export interface AIAssistantResponse {
  resposta: string;
  confianca: number;
  sugestoes: string[];
  acoes: AIAction[];
  contexto: AIContext;
}

export interface AIAction {
  tipo: "responder" | "escalar" | "agendar" | "transferir" | "fechar";
  parametros: any;
  descricao: string;
}

export interface AIContext {
  cliente: CustomerProfile;
  historico: ConversationSummary[];
  intenção: CustomerIntent;
  sentimento: SentimentAnalysis;
}

export interface CustomerProfile {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  empresa?: string;
  segmento: CustomerSegment;
  valor: CustomerValue;
  preferencias: CustomerPreferences;
  historico: CustomerHistory;
}

export type CustomerSegment = "prospect" | "lead" | "cliente" | "vip" | "churn";
export type CustomerValue = "baixo" | "medio" | "alto" | "premium";

export interface CustomerPreferences {
  canalPreferido: CommunicationChannel;
  horarioContato: string;
  idioma: string;
  tratamento: "formal" | "informal";
}

export interface CustomerHistory {
  totalCompras: number;
  valorTotal: number;
  ultimaCompra?: Date;
  produtosFavoritos: string[];
  reclamacoes: number;
  elogios: number;
}

export interface ConversationSummary {
  data: Date;
  canal: CommunicationChannel;
  assunto: string;
  status: ConversationStatus;
  resolucao: string;
  satisfacao?: number;
}

export interface CustomerIntent {
  categoria: IntentCategory;
  confianca: number;
  entidades: ExtractedEntity[];
  acao: IntentAction;
}

export type IntentCategory =
  | "duvida"
  | "reclamacao"
  | "elogio"
  | "compra"
  | "suporte"
  | "cancelamento"
  | "informacao"
  | "agendamento";

export interface ExtractedEntity {
  tipo: string;
  valor: string;
  confianca: number;
}

export type IntentAction =
  | "responder"
  | "escalar"
  | "agendar"
  | "processar"
  | "encaminhar";

export interface SentimentAnalysis {
  polaridade: "positivo" | "neutro" | "negativo";
  intensidade: number; // 0-1
  emocoes: Emotion[];
  urgencia: number; // 0-1
}

export interface Emotion {
  tipo: "felicidade" | "raiva" | "tristeza" | "medo" | "surpresa" | "nojo";
  intensidade: number; // 0-1
}

export interface CommunicationStats {
  totalConversas: number;
  conversasAtivas: number;
  novasConversas: number;
  conversasResolvidas: number;
  tempoMedioResposta: number;
  satisfacaoMedia: number;
  canaisMaisUsados: ChannelUsageStats[];
  agentesAtivos: number;
  picos: PeakHour[];
}

export interface ChannelUsageStats {
  canal: CommunicationChannel;
  mensagens: number;
  conversas: number;
  satisfacao: number;
  crescimento: number;
}

export interface PeakHour {
  hora: number;
  volume: number;
  canais: CommunicationChannel[];
}

class OmnichannelCommunicationService {
  private conversations: Map<string, Conversation> = new Map();
  private agents: Map<string, Agent> = new Map();
  private channels: Map<string, CommunicationChannel> = new Map();
  private wsConnection: WebSocket | null = null;
  private messageQueue: Message[] = [];

  // Inicialização do sistema
  async inicializar(): Promise<void> {
    try {
      await this.carregarCanais();
      await this.carregarAgentes();
      await this.carregarConversasAtivas();
      await this.inicializarWebSocket();
      await this.inicializarIA();

      console.log("✅ Sistema Omnichannel KRYONIX inicializado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao inicializar comunicação omnichannel:", error);
      throw error;
    }
  }

  // Carregamento de configurações
  private async carregarCanais(): Promise<void> {
    try {
      const response = await apiClient.get("/communication/channels");
      const canais = response.data;

      for (const canal of canais) {
        this.channels.set(canal.id, canal);
      }
    } catch (error) {
      // Configuração padrão se não conseguir carregar
      this.criarCanaisPadrao();
    }
  }

  private criarCanaisPadrao(): void {
    const canaisPadrao: CommunicationChannel[] = [
      {
        id: "whatsapp-business",
        nome: "WhatsApp Business",
        tipo: "whatsapp",
        ativo: true,
        configuracao: {
          webhookUrl: `${import.meta.env.VITE_API_URL}/webhooks/whatsapp`,
          token: import.meta.env.VITE_WHATSAPP_TOKEN,
          automacao: {
            respostaAutomatica: true,
            horarioAtendimento: {
              ativo: true,
              horarios: [
                { dia: 1, inicio: "08:00", fim: "18:00", ativo: true },
                { dia: 2, inicio: "08:00", fim: "18:00", ativo: true },
                { dia: 3, inicio: "08:00", fim: "18:00", ativo: true },
                { dia: 4, inicio: "08:00", fim: "18:00", ativo: true },
                { dia: 5, inicio: "08:00", fim: "18:00", ativo: true },
                { dia: 6, inicio: "08:00", fim: "14:00", ativo: true },
                { dia: 0, inicio: "09:00", fim: "12:00", ativo: false },
              ],
              feriados: [],
            },
            mensagemBoasVindas:
              "Olá! 👋 Bem-vindo ao atendimento KRYONIX. Como posso ajudá-lo hoje?",
            mensagemForaHorario:
              "Obrigado pelo contato! Nosso horário de atendimento é de segunda a sexta das 8h às 18h. Responderemos assim que possível.",
            encaminhamentoIA: true,
          },
        },
        metricas: {
          mensagensEnviadas: 2847,
          mensagensRecebidas: 3251,
          tempoMedioResposta: 45000, // 45 segundos
          taxaResposta: 98.5,
          satisfacaoMedia: 4.7,
          conversasAbertas: 23,
          conversasResolvidas: 156,
          periodo: {
            inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            fim: new Date(),
          },
        },
        integracao: {
          provedor: "Evolution API",
          versao: "2.0.0",
          webhook: "/webhooks/whatsapp",
          status: "conectado",
          ultimaConexao: new Date(),
          configuracoes: {},
        },
      },
      {
        id: "chat-web",
        nome: "Chat do Site",
        tipo: "chat",
        ativo: true,
        configuracao: {
          automacao: {
            respostaAutomatica: true,
            horarioAtendimento: {
              ativo: true,
              horarios: [
                { dia: 1, inicio: "08:00", fim: "22:00", ativo: true },
                { dia: 2, inicio: "08:00", fim: "22:00", ativo: true },
                { dia: 3, inicio: "08:00", fim: "22:00", ativo: true },
                { dia: 4, inicio: "08:00", fim: "22:00", ativo: true },
                { dia: 5, inicio: "08:00", fim: "22:00", ativo: true },
                { dia: 6, inicio: "09:00", fim: "18:00", ativo: true },
                { dia: 0, inicio: "10:00", fim: "16:00", ativo: true },
              ],
              feriados: [],
            },
            mensagemBoasVindas:
              "Olá! Sou a assistente virtual da KRYONIX. Em que posso ajudá-lo?",
            encaminhamentoIA: true,
          },
        },
        metricas: {
          mensagensEnviadas: 1234,
          mensagensRecebidas: 1456,
          tempoMedioResposta: 15000, // 15 segundos
          taxaResposta: 95.2,
          satisfacaoMedia: 4.5,
          conversasAbertas: 8,
          conversasResolvidas: 89,
          periodo: {
            inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            fim: new Date(),
          },
        },
        integracao: {
          provedor: "KRYONIX Chat",
          versao: "1.0.0",
          webhook: "/webhooks/chat",
          status: "conectado",
          ultimaConexao: new Date(),
          configuracoes: {},
        },
      },
      {
        id: "email-marketing",
        nome: "Email Marketing",
        tipo: "email",
        ativo: true,
        configuracao: {
          parametros: {
            smtp: {
              host: "smtp.kryonix.com.br",
              port: 587,
              secure: true,
            },
          },
          automacao: {
            respostaAutomatica: true,
            encaminhamentoIA: false,
          },
        },
        metricas: {
          mensagensEnviadas: 15678,
          mensagensRecebidas: 567,
          tempoMedioResposta: 3600000, // 1 hora
          taxaResposta: 87.3,
          satisfacaoMedia: 4.2,
          conversasAbertas: 45,
          conversasResolvidas: 234,
          periodo: {
            inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            fim: new Date(),
          },
        },
        integracao: {
          provedor: "SendGrid",
          versao: "3.0.0",
          webhook: "/webhooks/email",
          status: "conectado",
          ultimaConexao: new Date(),
          configuracoes: {},
        },
      },
    ];

    canaisPadrao.forEach((canal) => {
      this.channels.set(canal.id, canal);
    });
  }

  private async carregarAgentes(): Promise<void> {
    try {
      const response = await apiClient.get("/communication/agents");
      const agentes = response.data;

      for (const agente of agentes) {
        this.agents.set(agente.id, agente);
      }
    } catch (error) {
      // Agentes padrão
      this.criarAgentesPadrao();
    }
  }

  private criarAgentesPadrao(): void {
    const agentesPadrao: Agent[] = [
      {
        id: "agent-ia",
        nome: "Assistente IA KRYONIX",
        email: "ia@kryonix.com.br",
        status: "online",
        especialidades: ["vendas", "suporte", "duvidas"],
        conversasAtivas: 15,
        limiteConversas: 50,
        avaliacaoMedia: 4.8,
        tempoMedioResposta: 2000, // 2 segundos
      },
      {
        id: "agent-carlos",
        nome: "Carlos Eduardo",
        email: "carlos@kryonix.com.br",
        status: "online",
        especialidades: ["vendas", "consultoria"],
        conversasAtivas: 3,
        limiteConversas: 8,
        avaliacaoMedia: 4.9,
        tempoMedioResposta: 45000, // 45 segundos
      },
      {
        id: "agent-marina",
        nome: "Marina Santos",
        email: "marina@kryonix.com.br",
        status: "online",
        especialidades: ["suporte", "tecnico"],
        conversasAtivas: 5,
        limiteConversas: 10,
        avaliacaoMedia: 4.7,
        tempoMedioResposta: 30000, // 30 segundos
      },
    ];

    agentesPadrao.forEach((agente) => {
      this.agents.set(agente.id, agente);
    });
  }

  // WebSocket para comunicação em tempo real
  private async inicializarWebSocket(): Promise<void> {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
      this.wsConnection = new WebSocket(`${wsUrl}/communication`);

      this.wsConnection.onopen = () => {
        console.log("✅ WebSocket conectado para comunicação");
      };

      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.processarMensagemRealtime(data);
      };

      this.wsConnection.onclose = () => {
        console.log("🔄 WebSocket desconectado. Tentando reconectar...");
        setTimeout(() => this.inicializarWebSocket(), 5000);
      };

      this.wsConnection.onerror = (error) => {
        console.error("❌ Erro no WebSocket:", error);
      };
    } catch (error) {
      console.error("❌ Erro ao inicializar WebSocket:", error);
    }
  }

  // Processamento de mensagens em tempo real
  private processarMensagemRealtime(data: any): void {
    switch (data.tipo) {
      case "nova_mensagem":
        this.processarNovaMensagem(data.mensagem);
        break;
      case "status_conversa":
        this.atualizarStatusConversa(data.conversacaoId, data.status);
        break;
      case "agente_status":
        this.atualizarStatusAgente(data.agenteId, data.status);
        break;
      case "metricas_update":
        this.atualizarMetricas(data.metricas);
        break;
    }
  }

  // Sistema de IA
  private async inicializarIA(): Promise<void> {
    // Configurar modelos de IA para diferentes funcionalidades
    console.log("🤖 Sistema de IA para comunicação inicializado");
  }

  // Envio de mensagens
  async enviarMensagem(
    conversacaoId: string,
    conteudo: MessageContent,
    remetente: MessageSender,
  ): Promise<Message> {
    try {
      const conversa = this.conversations.get(conversacaoId);
      if (!conversa) {
        throw new Error("Conversação não encontrada");
      }

      const mensagem: Message = {
        id: `msg-${Date.now()}`,
        conversacaoId,
        remetente,
        conteudo,
        canal: conversa.canal,
        tipo: this.determinarTipoMensagem(conteudo),
        status: "enviando",
        timestamp: new Date(),
        lida: false,
        entregue: false,
        respondida: false,
        metadata: {
          canal: conversa.canal,
          iaGerada: remetente.tipo === "bot",
        },
      };

      // Adicionar à conversa
      conversa.mensagens.push(mensagem);
      conversa.ultimaMensagem = mensagem;
      conversa.atualizadaEm = new Date();

      // Enviar via canal específico
      await this.enviarViaCanal(mensagem);

      // Processar com IA se necessário
      if (remetente.tipo === "cliente") {
        this.processarComIA(mensagem);
      }

      return mensagem;
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      throw error;
    }
  }

  private determinarTipoMensagem(conteudo: MessageContent): MessageType {
    if (conteudo.arquivo) {
      const tipo = conteudo.arquivo.tipo.toLowerCase();
      if (tipo.includes("image")) return "imagem";
      if (tipo.includes("audio")) return "audio";
      if (tipo.includes("video")) return "video";
      return "documento";
    }
    if (conteudo.template) return "template";
    if (conteudo.botoes && conteudo.botoes.length > 0) return "interativo";
    return "texto";
  }

  private async enviarViaCanal(mensagem: Message): Promise<void> {
    const canal = this.channels.get(mensagem.canal as string);
    if (!canal) {
      throw new Error("Canal não encontrado");
    }

    switch (canal.tipo) {
      case "whatsapp":
        await this.enviarWhatsApp(mensagem);
        break;
      case "email":
        await this.enviarEmail(mensagem);
        break;
      case "sms":
        await this.enviarSMS(mensagem);
        break;
      case "chat":
        await this.enviarChatWeb(mensagem);
        break;
      default:
        console.warn(`Canal ${canal.tipo} não implementado`);
    }
  }

  // Implementações específicas por canal
  private async enviarWhatsApp(mensagem: Message): Promise<void> {
    try {
      const response = await apiClient.post("/whatsapp/send", {
        to: mensagem.conversacaoId,
        message: mensagem.conteudo.texto,
        type: mensagem.tipo,
      });

      mensagem.status = "enviada";
      console.log("✅ Mensagem WhatsApp enviada:", response.data);
    } catch (error) {
      mensagem.status = "falha";
      console.error("❌ Erro ao enviar WhatsApp:", error);
    }
  }

  private async enviarEmail(mensagem: Message): Promise<void> {
    try {
      const response = await apiClient.post("/email/send", {
        to: mensagem.conversacaoId,
        subject: "Resposta KRYONIX",
        body: mensagem.conteudo.texto,
      });

      mensagem.status = "enviada";
      console.log("✅ Email enviado:", response.data);
    } catch (error) {
      mensagem.status = "falha";
      console.error("❌ Erro ao enviar email:", error);
    }
  }

  private async enviarSMS(mensagem: Message): Promise<void> {
    try {
      const response = await apiClient.post("/sms/send", {
        to: mensagem.conversacaoId,
        message: mensagem.conteudo.texto,
      });

      mensagem.status = "enviada";
      console.log("✅ SMS enviado:", response.data);
    } catch (error) {
      mensagem.status = "falha";
      console.error("❌ Erro ao enviar SMS:", error);
    }
  }

  private async enviarChatWeb(mensagem: Message): Promise<void> {
    // Enviar via WebSocket para chat do site
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(
        JSON.stringify({
          tipo: "chat_message",
          conversacaoId: mensagem.conversacaoId,
          mensagem,
        }),
      );
      mensagem.status = "enviada";
    } else {
      mensagem.status = "falha";
    }
  }

  // Processamento com IA
  private async processarComIA(mensagem: Message): Promise<void> {
    try {
      const conversa = this.conversations.get(mensagem.conversacaoId);
      if (!conversa) return;

      // Análise de sentimento
      const sentimento = await this.analisarSentimento(
        mensagem.conteudo.texto || "",
      );

      // Detecção de intenção
      const intencao = await this.detectarIntencao(
        mensagem.conteudo.texto || "",
      );

      // Gerar resposta automática se aplicável
      if (
        conversa.metadata.funil === "awareness" ||
        intencao.categoria === "duvida"
      ) {
        const resposta = await this.gerarRespostaIA(mensagem, conversa);
        if (resposta) {
          await this.enviarMensagem(
            conversa.id,
            { texto: resposta.resposta },
            {
              id: "agent-ia",
              nome: "Assistente IA KRYONIX",
              tipo: "bot",
            },
          );
        }
      }

      // Escalar se necessário
      if (
        sentimento.polaridade === "negativo" &&
        sentimento.intensidade > 0.7
      ) {
        await this.escalarConversa(conversa.id, "Alta negatividade detectada");
      }
    } catch (error) {
      console.error("❌ Erro no processamento IA:", error);
    }
  }

  private async analisarSentimento(texto: string): Promise<SentimentAnalysis> {
    // Implementação simplificada - em produção usaria APIs de ML
    const palavrasPositivas = [
      "obrigado",
      "excelente",
      "ótimo",
      "perfeito",
      "adorei",
    ];
    const palavrasNegativas = [
      "problema",
      "ruim",
      "péssimo",
      "erro",
      "reclamação",
    ];

    const textoLower = texto.toLowerCase();
    const positivas = palavrasPositivas.filter((p) =>
      textoLower.includes(p),
    ).length;
    const negativas = palavrasNegativas.filter((p) =>
      textoLower.includes(p),
    ).length;

    let polaridade: "positivo" | "neutro" | "negativo" = "neutro";
    let intensidade = 0.5;

    if (positivas > negativas) {
      polaridade = "positivo";
      intensidade = Math.min(0.8, 0.5 + positivas * 0.1);
    } else if (negativas > positivas) {
      polaridade = "negativo";
      intensidade = Math.min(0.9, 0.5 + negativas * 0.15);
    }

    return {
      polaridade,
      intensidade,
      emocoes: [],
      urgencia: negativas > 2 ? 0.8 : 0.3,
    };
  }

  private async detectarIntencao(texto: string): Promise<CustomerIntent> {
    const textoLower = texto.toLowerCase();

    const intencoes = {
      compra: ["comprar", "preço", "valor", "adquirir", "orçamento"],
      suporte: ["problema", "ajuda", "erro", "não funciona", "bug"],
      duvida: ["como", "onde", "quando", "o que", "dúvida"],
      reclamacao: ["reclamação", "insatisfeito", "péssimo", "ruim"],
      cancelamento: ["cancelar", "parar", "desistir", "não quero"],
    };

    let categoriaDetectada: IntentCategory = "duvida";
    let confianca = 0.5;

    for (const [categoria, palavras] of Object.entries(intencoes)) {
      const matches = palavras.filter((p) => textoLower.includes(p)).length;
      if (matches > 0) {
        categoriaDetectada = categoria as IntentCategory;
        confianca = Math.min(0.9, 0.6 + matches * 0.1);
        break;
      }
    }

    return {
      categoria: categoriaDetectada,
      confianca,
      entidades: [],
      acao: this.definirAcao(categoriaDetectada),
    };
  }

  private definirAcao(categoria: IntentCategory): IntentAction {
    const acoes = {
      duvida: "responder",
      compra: "responder",
      suporte: "escalar",
      reclamacao: "escalar",
      cancelamento: "escalar",
      informacao: "responder",
    };
    return (acoes[categoria] as IntentAction) || "responder";
  }

  private async gerarRespostaIA(
    mensagem: Message,
    conversa: Conversation,
  ): Promise<AIAssistantResponse | null> {
    // Implementação simplificada - em produção usaria GPT-4
    const respostasAutomaticas = {
      preço:
        "Nossos planos começam em R$ 97/mês. Gostaria de conhecer todas as funcionalidades incluídas?",
      "como funciona":
        "A KRYONIX é uma plataforma completa que automatiza WhatsApp, Email Marketing, CRM e muito mais. Posso agendar uma demonstração gratuita para você?",
      demonstração:
        "Perfeito! Posso agendar uma demonstração personalizada. Qual o melhor horário para você?",
      suporte:
        "Entendo que precisa de ajuda. Vou transferir você para um especialista que poderá resolver sua questão imediatamente.",
    };

    const texto = mensagem.conteudo.texto?.toLowerCase() || "";

    for (const [palavra, resposta] of Object.entries(respostasAutomaticas)) {
      if (texto.includes(palavra)) {
        return {
          resposta,
          confianca: 0.8,
          sugestoes: [],
          acoes: [],
          contexto: {
            cliente: await this.obterPerfilCliente(conversa.clienteId),
            historico: [],
            intenção: await this.detectarIntencao(texto),
            sentimento: await this.analisarSentimento(texto),
          },
        };
      }
    }

    return null;
  }

  // Gestão de conversas
  async criarConversa(
    clienteId: string,
    canal: CommunicationChannel,
    mensagemInicial?: Message,
  ): Promise<Conversation> {
    const conversa: Conversation = {
      id: `conv-${Date.now()}`,
      clienteId,
      canal,
      status: "nova",
      prioridade: "normal",
      assunto:
        mensagemInicial?.conteudo.texto?.substring(0, 50) || "Nova conversa",
      ultimaMensagem: mensagemInicial!,
      mensagens: mensagemInicial ? [mensagemInicial] : [],
      tags: [],
      criadaEm: new Date(),
      atualizadaEm: new Date(),
      resolvida: false,
      metadata: {
        origem: canal as string,
        funil: "awareness",
        score: 0,
        ultimaInteracao: new Date(),
        tempoSessao: 0,
      },
    };

    this.conversations.set(conversa.id, conversa);

    // Atribuir agente automaticamente
    await this.atribuirAgente(conversa.id);

    return conversa;
  }

  private async atribuirAgente(conversacaoId: string): Promise<void> {
    const conversa = this.conversations.get(conversacaoId);
    if (!conversa) return;

    // Encontrar agente disponível com menor carga
    const agentesDisponiveis = Array.from(this.agents.values())
      .filter(
        (a) => a.status === "online" && a.conversasAtivas < a.limiteConversas,
      )
      .sort((a, b) => a.conversasAtivas - b.conversasAtivas);

    if (agentesDisponiveis.length > 0) {
      const agente = agentesDisponiveis[0];
      conversa.agente = agente;
      conversa.status = "em-andamento";
      agente.conversasAtivas++;
    }
  }

  private async escalarConversa(
    conversacaoId: string,
    motivo: string,
  ): Promise<void> {
    const conversa = this.conversations.get(conversacaoId);
    if (!conversa) return;

    conversa.status = "escalada";
    conversa.prioridade = "alta";
    conversa.tags.push("escalada", motivo);

    // Notificar supervisores
    console.log(`🚨 Conversa ${conversacaoId} escalada: ${motivo}`);
  }

  // Métodos auxiliares
  private async carregarConversasAtivas(): Promise<void> {
    // Simular conversas ativas
    const conversasExemplo = await this.gerarConversasExemplo();
    conversasExemplo.forEach((conv) => {
      this.conversations.set(conv.id, conv);
    });
  }

  private async gerarConversasExemplo(): Promise<Conversation[]> {
    const agora = new Date();
    return [
      {
        id: "conv-001",
        clienteId: "cliente-001",
        canal: "whatsapp" as CommunicationChannel,
        status: "em-andamento",
        prioridade: "normal",
        assunto: "Dúvida sobre planos",
        ultimaMensagem: {
          id: "msg-001",
          conversacaoId: "conv-001",
          remetente: { id: "cliente-001", nome: "João Silva", tipo: "cliente" },
          conteudo: {
            texto: "Gostaria de saber mais sobre os planos disponíveis",
          },
          canal: "whatsapp" as CommunicationChannel,
          tipo: "texto",
          status: "lida",
          timestamp: new Date(agora.getTime() - 300000),
          lida: true,
          entregue: true,
          respondida: false,
          metadata: { canal: "whatsapp" as CommunicationChannel },
        },
        mensagens: [],
        agente: this.agents.get("agent-carlos"),
        tags: ["vendas", "planos"],
        criadaEm: new Date(agora.getTime() - 900000),
        atualizadaEm: new Date(agora.getTime() - 300000),
        tempoResposta: 45000,
        resolvida: false,
        metadata: {
          origem: "whatsapp",
          funil: "consideration",
          score: 75,
          ultimaInteracao: new Date(agora.getTime() - 300000),
          tempoSessao: 600000,
        },
      },
    ];
  }

  private async obterPerfilCliente(
    clienteId: string,
  ): Promise<CustomerProfile> {
    // Implementação simplificada
    return {
      id: clienteId,
      nome: "Cliente Exemplo",
      segmento: "lead",
      valor: "medio",
      preferencias: {
        canalPreferido: "whatsapp" as CommunicationChannel,
        horarioContato: "09:00-18:00",
        idioma: "pt-BR",
        tratamento: "formal",
      },
      historico: {
        totalCompras: 0,
        valorTotal: 0,
        produtosFavoritos: [],
        reclamacoes: 0,
        elogios: 0,
      },
    };
  }

  // Métodos públicos para interface
  public getTodasConversas(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  public getConversasPorStatus(status: ConversationStatus): Conversation[] {
    return this.getTodasConversas().filter((conv) => conv.status === status);
  }

  public getTodosCanais(): CommunicationChannel[] {
    return Array.from(this.channels.values());
  }

  public getTodosAgentes(): Agent[] {
    return Array.from(this.agents.values());
  }

  public async obterEstatisticas(): Promise<CommunicationStats> {
    const conversas = this.getTodasConversas();

    return {
      totalConversas: conversas.length,
      conversasAtivas: conversas.filter((c) =>
        ["nova", "em-andamento"].includes(c.status),
      ).length,
      novasConversas: conversas.filter((c) => c.status === "nova").length,
      conversasResolvidas: conversas.filter((c) => c.resolvida).length,
      tempoMedioResposta: this.calcularTempoMedioResposta(conversas),
      satisfacaoMedia: this.calcularSatisfacaoMedia(conversas),
      canaisMaisUsados: this.calcularUsageCanais(),
      agentesAtivos: Array.from(this.agents.values()).filter(
        (a) => a.status === "online",
      ).length,
      picos: [],
    };
  }

  private calcularTempoMedioResposta(conversas: Conversation[]): number {
    const tempos = conversas
      .filter((c) => c.tempoResposta)
      .map((c) => c.tempoResposta!);
    return tempos.length > 0
      ? tempos.reduce((a, b) => a + b, 0) / tempos.length
      : 0;
  }

  private calcularSatisfacaoMedia(conversas: Conversation[]): number {
    const avaliacoes = conversas
      .filter((c) => c.satisfacao)
      .map((c) => c.satisfacao!);
    return avaliacoes.length > 0
      ? avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length
      : 0;
  }

  private calcularUsageCanais(): ChannelUsageStats[] {
    const conversas = this.getTodasConversas();
    const canais = this.getTodosCanais();

    return canais.map((canal) => {
      const conversasCanal = conversas.filter((c) => c.canal === canal.id);
      return {
        canal: canal.id as CommunicationChannel,
        mensagens: conversasCanal.reduce(
          (acc, c) => acc + c.mensagens.length,
          0,
        ),
        conversas: conversasCanal.length,
        satisfacao: this.calcularSatisfacaoMedia(conversasCanal),
        crescimento: Math.random() * 20 - 10, // Simular crescimento
      };
    });
  }

  // Métodos para atualização em tempo real
  private processarNovaMensagem(mensagem: Message): void {
    const conversa = this.conversations.get(mensagem.conversacaoId);
    if (conversa) {
      conversa.mensagens.push(mensagem);
      conversa.ultimaMensagem = mensagem;
      conversa.atualizadaEm = new Date();
    }
  }

  private atualizarStatusConversa(
    conversacaoId: string,
    status: ConversationStatus,
  ): void {
    const conversa = this.conversations.get(conversacaoId);
    if (conversa) {
      conversa.status = status;
      conversa.atualizadaEm = new Date();
    }
  }

  private atualizarStatusAgente(agenteId: string, status: AgentStatus): void {
    const agente = this.agents.get(agenteId);
    if (agente) {
      agente.status = status;
    }
  }

  private atualizarMetricas(metricas: any): void {
    // Atualizar métricas dos canais
    console.log("📊 Métricas atualizadas:", metricas);
  }
}

// Instância singleton do serviço
export const omnichannelService = new OmnichannelCommunicationService();

// Inicializar automaticamente quando importado
if (typeof window !== "undefined") {
  omnichannelService.inicializar().catch((error) => {
    console.error("❌ Erro crítico na inicialização omnichannel:", error);
  });
}

export default omnichannelService;
