/**
 * Formatadores específicos para o mercado brasileiro
 * KRYONIX - Plataforma SaaS Autônoma
 */

// Formatação de moeda brasileira
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Formatação de números grandes (K, M, B)
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('pt-BR');
};

// Formatação de data brasileira
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

// Formatação de data e hora brasileira
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Formatação de tempo relativo em português
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'agora há pouco';
  if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `há ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  
  return formatDate(d);
};

// Formatação de porcentagem
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Formatação de telefone brasileiro
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11) {
    // Celular: (11) 99999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    // Fixo: (11) 9999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Retorna original se não conseguir formatar
};

// Saudação baseada no horário brasileiro
export const getGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour >= 5 && hour < 12) {
    greeting = '🌅 Bom dia';
  } else if (hour >= 12 && hour < 18) {
    greeting = '☀️ Boa tarde';
  } else {
    greeting = '🌙 Boa noite';
  }
  
  return name ? `${greeting}, ${name}!` : `${greeting}!`;
};

// Status traduzidos para português
export const statusTranslations = {
  // Status gerais
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  error: 'Erro',
  success: 'Sucesso',
  warning: 'Atenção',
  
  // Status de pagamento
  paid: 'Pago',
  unpaid: 'Não pago',
  overdue: 'Vencido',
  refunded: 'Reembolsado',
  
  // Status WhatsApp
  connected: 'Conectado',
  disconnected: 'Desconectado',
  connecting: 'Conectando',
  
  // Status de usuário
  verified: 'Verificado',
  unverified: 'Não verificado',
  blocked: 'Bloqueado',
} as const;

// Traduzir status
export const translateStatus = (status: string): string => {
  return statusTranslations[status.toLowerCase() as keyof typeof statusTranslations] || status;
};

// Formatação de tempo de duração
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

// Cores por status para UX brasileira
export const getStatusColor = (status: string): string => {
  const statusColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    active: 'text-green-600',
    inactive: 'text-gray-600',
    pending: 'text-yellow-600',
    connected: 'text-green-600',
    disconnected: 'text-red-600',
    connecting: 'text-yellow-600',
  };
  
  return statusColors[status.toLowerCase() as keyof typeof statusColors] || 'text-gray-600';
};

// Mensagens motivacionais para empreendedores brasileiros
export const getMotivationalMessage = (): string => {
  const messages = [
    '💪 Continue construindo seu império digital!',
    '🚀 Seu negócio está crescendo a cada dia!',
    '⭐ Grandes resultados vêm de pequenas ações diárias',
    '🎯 Foco e determinação levam ao sucesso!',
    '💎 Sua perseverança vai render frutos!',
    '🔥 Empreendedorismo é transformar sonhos em realidade!',
    '🏆 Cada cliente conquistado é uma vitória!',
    '💡 Inovação é o segredo do crescimento!',
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};
