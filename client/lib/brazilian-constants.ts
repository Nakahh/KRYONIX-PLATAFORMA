/**
 * Constantes específicas para o mercado brasileiro
 * KRYONIX - Plataforma SaaS Autônoma
 */

// Dispositivos móveis populares no Brasil
export const POPULAR_BRAZILIAN_DEVICES = {
  iphone: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone SE'],
  samsung: ['Galaxy A54', 'Galaxy S23', 'Galaxy A34', 'Galaxy A14'],
  xiaomi: ['Redmi Note 12', 'Redmi 12', 'POCO X5'],
  motorola: ['Moto G23', 'Moto G13', 'Moto E22'],
} as const;

// Operadoras brasileiras
export const BRAZILIAN_CARRIERS = [
  'Vivo',
  'Claro',
  'TIM',
  'Oi',
  'Algar',
  'Sercomtel',
] as const;

// Estados brasileiros (para localização)
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
] as const;

// Fusos horários brasileiros
export const BRAZILIAN_TIMEZONES = [
  { value: 'America/Rio_Branco', label: 'Acre (UTC-5)' },
  { value: 'America/Manaus', label: 'Amazonas (UTC-4)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' },
] as const;

// Horários comerciais brasileiros
export const BRAZILIAN_BUSINESS_HOURS = {
  weekdays: {
    start: '08:00',
    lunch: { start: '12:00', end: '14:00' },
    end: '18:00',
  },
  saturday: {
    start: '08:00',
    end: '12:00',
  },
  holidays: 'Conforme calendário nacional',
} as const;

// Feriados nacionais brasileiros (principais)
export const BRAZILIAN_HOLIDAYS = [
  { date: '01-01', name: 'Confraternização Universal' },
  { date: '04-21', name: 'Tiradentes' },
  { date: '05-01', name: 'Dia do Trabalhador' },
  { date: '09-07', name: 'Independência do Brasil' },
  { date: '10-12', name: 'Nossa Senhora Aparecida' },
  { date: '11-02', name: 'Finados' },
  { date: '11-15', name: 'Proclamação da República' },
  { date: '12-25', name: 'Natal' },
] as const;

// Segmentos de negócio populares no Brasil
export const BRAZILIAN_BUSINESS_SEGMENTS = [
  'E-commerce',
  'Alimentação & Bebidas',
  'Moda & Beleza',
  'Saúde & Bem-estar',
  'Educação',
  'Consultoria',
  'Serviços Financeiros',
  'Tecnologia',
  'Imobiliário',
  'Turismo',
  'Agronegócio',
  'Varejo',
  'Atacado',
  'Logística',
  'Marketing Digital',
  'Serviços Gerais',
] as const;

// Tipos de empresa no Brasil
export const BRAZILIAN_COMPANY_TYPES = [
  { value: 'MEI', label: 'Microempreendedor Individual (MEI)' },
  { value: 'ME', label: 'Microempresa (ME)' },
  { value: 'EPP', label: 'Empresa de Pequeno Porte (EPP)' },
  { value: 'LTDA', label: 'Sociedade Limitada (LTDA)' },
  { value: 'SA', label: 'Sociedade Anônima (SA)' },
  { value: 'EIRELI', label: 'Empresa Individual (EIRELI)' },
] as const;

// Bancos populares no Brasil
export const BRAZILIAN_BANKS = [
  'Banco do Brasil',
  'Bradesco',
  'Itaú',
  'Santander',
  'Caixa Econômica Federal',
  'Nubank',
  'Inter',
  'C6 Bank',
  'PicPay',
  'Mercado Pago',
  'PagSeguro',
  'Stone',
] as const;

// Métodos de pagamento populares no Brasil
export const BRAZILIAN_PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX', icon: '💸', priority: 1 },
  { id: 'credit_card', name: 'Cartão de Crédito', icon: '💳', priority: 2 },
  { id: 'debit_card', name: 'Cartão de Débito', icon: '💳', priority: 3 },
  { id: 'boleto', name: 'Boleto Bancário', icon: '📋', priority: 4 },
  { id: 'bank_transfer', name: 'Transferência Bancária', icon: '🏦', priority: 5 },
  { id: 'digital_wallet', name: 'Carteira Digital', icon: '📱', priority: 6 },
] as const;

// Redes sociais populares no Brasil
export const BRAZILIAN_SOCIAL_NETWORKS = [
  { name: 'WhatsApp', usage: 92, icon: '📱' },
  { name: 'Instagram', usage: 84, icon: '📷' },
  { name: 'Facebook', usage: 76, icon: '👥' },
  { name: 'YouTube', usage: 89, icon: '📺' },
  { name: 'TikTok', usage: 67, icon: '🎵' },
  { name: 'LinkedIn', usage: 45, icon: '💼' },
  { name: 'Twitter/X', usage: 34, icon: '🐦' },
  { name: 'Telegram', usage: 28, icon: '✈️' },
] as const;

// Métricas importantes para empreendedores brasileiros
export const BRAZILIAN_KPI_CATEGORIES = {
  revenue: {
    name: 'Receita',
    metrics: ['MRR', 'Faturamento Mensal', 'Ticket Médio', 'Crescimento'],
    icon: '💰',
  },
  whatsapp: {
    name: 'WhatsApp',
    metrics: ['Mensagens Enviadas', 'Taxa de Resposta', 'Conversões', 'Instâncias'],
    icon: '📱',
  },
  customers: {
    name: 'Clientes',
    metrics: ['Novos Clientes', 'Churn Rate', 'LTV', 'CAC'],
    icon: '👥',
  },
  automation: {
    name: 'Automação',
    metrics: ['Fluxos Ativos', 'Tempo Economizado', 'Taxa de Sucesso', 'ROI'],
    icon: '⚙️',
  },
  marketing: {
    name: 'Marketing',
    metrics: ['Leads', 'Conversão', 'CPC', 'ROAS'],
    icon: '📈',
  },
} as const;

// Ações rápidas para empreendedores brasileiros
export const QUICK_ACTIONS_BRAZIL = [
  {
    id: 'whatsapp_business',
    title: 'Conectar WhatsApp Business',
    description: 'Configure sua conta comercial agora',
    icon: '📱',
    priority: 'high',
    category: 'communication',
  },
  {
    id: 'pix_setup',
    title: 'Configurar PIX',
    description: 'Receba pagamentos instantâneos',
    icon: '💸',
    priority: 'high',
    category: 'payment',
  },
  {
    id: 'nfe_integration',
    title: 'Integrar Nota Fiscal',
    description: 'Emissão automática de NFe/NFCe',
    icon: '📋',
    priority: 'medium',
    category: 'fiscal',
  },
  {
    id: 'automation_setup',
    title: 'Criar Automação',
    description: 'Automatize processos repetitivos',
    icon: '⚙️',
    priority: 'medium',
    category: 'automation',
  },
  {
    id: 'chatbot_create',
    title: 'Criar Chatbot',
    description: 'Atendimento 24h automatizado',
    icon: '🤖',
    priority: 'medium',
    category: 'ai',
  },
  {
    id: 'analytics_setup',
    title: 'Configurar Analytics',
    description: 'Acompanhe métricas importantes',
    icon: '📊',
    priority: 'low',
    category: 'analytics',
  },
] as const;

// Mensagens de sistema em português brasileiro
export const SYSTEM_MESSAGES = {
  loading: 'Carregando...',
  saving: 'Salvando...',
  success: 'Sucesso!',
  error: 'Ops! Algo deu errado',
  no_data: 'Nenhum dado encontrado',
  try_again: 'Tente novamente',
  confirm: 'Tem certeza?',
  cancel: 'Cancelar',
  save: 'Salvar',
  edit: 'Editar',
  delete: 'Excluir',
  add: 'Adicionar',
  view: 'Visualizar',
  download: 'Baixar',
  upload: 'Enviar',
  search: 'Pesquisar',
  filter: 'Filtrar',
  sort: 'Ordenar',
  export: 'Exportar',
  import: 'Importar',
  copy: 'Copiar',
  share: 'Compartilhar',
  print: 'Imprimir',
  close: 'Fechar',
} as const;

// Configurações de PWA para Brasil
export const PWA_CONFIG_BRAZIL = {
  name: 'KRYONIX - Automação Empresarial',
  short_name: 'KRYONIX',
  description: 'Automatize seu negócio no Brasil com IA e WhatsApp',
  theme_color: '#00875f',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait-primary',
  lang: 'pt-BR',
  start_url: '/',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
} as const;
