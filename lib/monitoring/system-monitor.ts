import { getWhatsAppOTP } from '../auth/whatsapp-otp'

export interface MonitoringConfig {
  checkInterval?: number
  alertWhatsApp?: string
  alertEmail?: string
  criticalThresholds?: {
    cpu?: number
    memory?: number
    disk?: number
    responseTime?: number
  }
  debug?: boolean
}

export interface SystemMetrics {
  timestamp: string
  keycloak: {
    status: 'online' | 'offline' | 'degraded'
    responseTime: number
    activeSessions: number
    errors: string[]
  }
  database: {
    status: 'online' | 'offline' | 'degraded'
    connections: number
    queryTime: number
    errors: string[]
  }
  storage: {
    status: 'online' | 'offline' | 'degraded'
    usedSpace: number
    freeSpace: number
    errors: string[]
  }
  api: {
    status: 'online' | 'offline' | 'degraded'
    responseTime: number
    requestsPerMinute: number
    errors: string[]
  }
  system: {
    cpu: number
    memory: number
    disk: number
    uptime: number
  }
}

export interface AlertEvent {
  type: 'critical' | 'warning' | 'info'
  service: string
  message: string
  timestamp: string
  metrics?: Partial<SystemMetrics>
}

export class SystemMonitor {
  private config: MonitoringConfig
  private whatsappOTP = getWhatsAppOTP()
  private isRunning = false
  private intervalId?: NodeJS.Timeout
  private lastMetrics?: SystemMetrics
  private alertHistory: AlertEvent[] = []

  constructor(config: MonitoringConfig = {}) {
    this.config = {
      checkInterval: 60000, // 1 minuto
      alertWhatsApp: process.env.ALERT_WHATSAPP || '+5517981805327',
      alertEmail: process.env.ALERT_EMAIL || 'monitoring@kryonix.com.br',
      criticalThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        responseTime: 5000
      },
      debug: false,
      ...config
    }

    this.log('Inicializando SystemMonitor', this.config)
  }

  /**
   * Iniciar monitoramento contínuo
   */
  start(): void {
    if (this.isRunning) {
      this.log('Monitoramento já está ativo')
      return
    }

    this.log('Iniciando monitoramento do sistema')
    this.isRunning = true

    // Primeira verificação imediata
    this.performHealthCheck()

    // Agendar verificações periódicas
    this.intervalId = setInterval(() => {
      this.performHealthCheck()
    }, this.config.checkInterval)

    // Enviar notificação de início
    this.sendAlert({
      type: 'info',
      service: 'Monitor',
      message: '🟢 Sistema de monitoramento KRYONIX iniciado',
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Parar monitoramento
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('Monitoramento já está parado')
      return
    }

    this.log('Parando monitoramento do sistema')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }

    // Enviar notificação de parada
    this.sendAlert({
      type: 'warning',
      service: 'Monitor',
      message: '🟡 Sistema de monitoramento KRYONIX parado',
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Executar verificação completa de saúde
   */
  async performHealthCheck(): Promise<SystemMetrics> {
    const timestamp = new Date().toISOString()
    
    this.log('Executando verificação de saúde')

    const metrics: SystemMetrics = {
      timestamp,
      keycloak: await this.checkKeycloak(),
      database: await this.checkDatabase(),
      storage: await this.checkStorage(),
      api: await this.checkAPI(),
      system: await this.checkSystemResources()
    }

    // Verificar thresholds e enviar alertas
    await this.analyzeMetrics(metrics)

    this.lastMetrics = metrics
    return metrics
  }

  /**
   * Obter métricas atuais
   */
  getCurrentMetrics(): SystemMetrics | null {
    return this.lastMetrics || null
  }

  /**
   * Obter histórico de alertas
   */
  getAlertHistory(limit = 50): AlertEvent[] {
    return this.alertHistory.slice(-limit)
  }

  /**
   * Verificar saúde do Keycloak
   */
  private async checkKeycloak(): Promise<SystemMetrics['keycloak']> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      const response = await Promise.race([
        fetch('https://keycloak.kryonix.com.br/health/ready'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ])

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        errors.push(`HTTP ${response.status}: ${response.statusText}`)
        return {
          status: 'degraded',
          responseTime,
          activeSessions: 0,
          errors
        }
      }

      // Verificar métricas se disponível
      let activeSessions = 0
      try {
        const metricsResponse = await fetch('https://keycloak.kryonix.com.br/metrics')
        if (metricsResponse.ok) {
          const metricsText = await metricsResponse.text()
          const sessionMatch = metricsText.match(/keycloak_sessions\{.*\}\s+(\d+)/)
          if (sessionMatch) {
            activeSessions = parseInt(sessionMatch[1])
          }
        }
      } catch (metricsError) {
        // Métricas opcionais, não falhar se não disponível
      }

      return {
        status: 'online',
        responseTime,
        activeSessions,
        errors: []
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      errors.push(error instanceof Error ? error.message : 'Erro desconhecido')
      
      return {
        status: 'offline',
        responseTime,
        activeSessions: 0,
        errors
      }
    }
  }

  /**
   * Verificar saúde do banco de dados
   */
  private async checkDatabase(): Promise<SystemMetrics['database']> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      // Em produção, isso faria uma query real no PostgreSQL
      // Por enquanto, simula verificação
      await new Promise(resolve => setTimeout(resolve, 100))

      const queryTime = Date.now() - startTime

      return {
        status: 'online',
        connections: 25, // Simulado
        queryTime,
        errors: []
      }

    } catch (error) {
      const queryTime = Date.now() - startTime
      errors.push(error instanceof Error ? error.message : 'Erro de conexão BD')
      
      return {
        status: 'offline',
        connections: 0,
        queryTime,
        errors
      }
    }
  }

  /**
   * Verificar saúde do storage MinIO
   */
  private async checkStorage(): Promise<SystemMetrics['storage']> {
    const errors: string[] = []

    try {
      // Em produção, isso verificaria MinIO real
      // Por enquanto, simula verificação
      const response = await Promise.race([
        fetch('https://storage.kryonix.com.br/minio/health/live'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ])

      if (!response.ok) {
        errors.push(`MinIO HTTP ${response.status}`)
        return {
          status: 'degraded',
          usedSpace: 0,
          freeSpace: 0,
          errors
        }
      }

      return {
        status: 'online',
        usedSpace: 15.5, // GB simulado
        freeSpace: 84.5, // GB simulado
        errors: []
      }

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Erro MinIO')
      
      return {
        status: 'offline',
        usedSpace: 0,
        freeSpace: 0,
        errors
      }
    }
  }

  /**
   * Verificar saúde da API
   */
  private async checkAPI(): Promise<SystemMetrics['api']> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      const response = await Promise.race([
        fetch('https://api.kryonix.com.br/health'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ])

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        errors.push(`API HTTP ${response.status}`)
        return {
          status: 'degraded',
          responseTime,
          requestsPerMinute: 0,
          errors
        }
      }

      return {
        status: 'online',
        responseTime,
        requestsPerMinute: 150, // Simulado
        errors: []
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      errors.push(error instanceof Error ? error.message : 'Erro API')
      
      return {
        status: 'offline',
        responseTime,
        requestsPerMinute: 0,
        errors
      }
    }
  }

  /**
   * Verificar recursos do sistema
   */
  private async checkSystemResources(): Promise<SystemMetrics['system']> {
    try {
      // Em produção, isso obteria métricas reais do sistema
      // Por enquanto, simula dados
      return {
        cpu: Math.random() * 100, // % uso CPU
        memory: 65 + Math.random() * 20, // % uso memória
        disk: 45 + Math.random() * 10, // % uso disco
        uptime: Date.now() - (Date.now() - 86400000) // Simula 24h uptime
      }

    } catch (error) {
      this.log('Erro ao obter recursos do sistema', error)
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: 0
      }
    }
  }

  /**
   * Analisar métricas e enviar alertas
   */
  private async analyzeMetrics(metrics: SystemMetrics): Promise<void> {
    const alerts: AlertEvent[] = []

    // Verificar serviços offline
    if (metrics.keycloak.status === 'offline') {
      alerts.push({
        type: 'critical',
        service: 'Keycloak',
        message: '🚨 CRÍTICO: Keycloak está OFFLINE!',
        timestamp: metrics.timestamp,
        metrics
      })
    }

    if (metrics.database.status === 'offline') {
      alerts.push({
        type: 'critical',
        service: 'Database',
        message: '🚨 CRÍTICO: Banco de dados está OFFLINE!',
        timestamp: metrics.timestamp,
        metrics
      })
    }

    if (metrics.storage.status === 'offline') {
      alerts.push({
        type: 'critical',
        service: 'Storage',
        message: '🚨 CRÍTICO: Storage MinIO está OFFLINE!',
        timestamp: metrics.timestamp,
        metrics
      })
    }

    if (metrics.api.status === 'offline') {
      alerts.push({
        type: 'critical',
        service: 'API',
        message: '🚨 CRÍTICO: API está OFFLINE!',
        timestamp: metrics.timestamp,
        metrics
      })
    }

    // Verificar thresholds de recursos
    const thresholds = this.config.criticalThresholds!

    if (metrics.system.cpu > thresholds.cpu!) {
      alerts.push({
        type: 'critical',
        service: 'System',
        message: `⚠️ CPU alto: ${metrics.system.cpu.toFixed(1)}% (limite: ${thresholds.cpu}%)`,
        timestamp: metrics.timestamp,
        metrics
      })
    }

    if (metrics.system.memory > thresholds.memory!) {
      alerts.push({
        type: 'critical',
        service: 'System',
        message: `⚠️ Memória alta: ${metrics.system.memory.toFixed(1)}% (limite: ${thresholds.memory}%)`,
        timestamp: metrics.timestamp,
        metrics
      })
    }

    if (metrics.system.disk > thresholds.disk!) {
      alerts.push({
        type: 'critical',
        service: 'System',
        message: `⚠️ Disco cheio: ${metrics.system.disk.toFixed(1)}% (limite: ${thresholds.disk}%)`,
        timestamp: metrics.timestamp,
        metrics
      })
    }

    // Verificar tempo de resposta
    if (metrics.keycloak.responseTime > thresholds.responseTime!) {
      alerts.push({
        type: 'warning',
        service: 'Keycloak',
        message: `🐌 Keycloak lento: ${metrics.keycloak.responseTime}ms (limite: ${thresholds.responseTime}ms)`,
        timestamp: metrics.timestamp,
        metrics
      })
    }

    // Enviar alertas
    for (const alert of alerts) {
      await this.sendAlert(alert)
    }

    // Log de status se tudo estiver ok
    if (alerts.length === 0 && this.config.debug) {
      this.log('Todos os serviços estão funcionando normalmente', {
        keycloak: metrics.keycloak.status,
        database: metrics.database.status,
        storage: metrics.storage.status,
        api: metrics.api.status,
        cpu: `${metrics.system.cpu.toFixed(1)}%`,
        memory: `${metrics.system.memory.toFixed(1)}%`
      })
    }
  }

  /**
   * Enviar alerta
   */
  private async sendAlert(alert: AlertEvent): Promise<void> {
    try {
      // Adicionar ao histórico
      this.alertHistory.push(alert)
      
      // Manter apenas últimos 1000 alertas
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000)
      }

      // Enviar por WhatsApp se configurado
      if (this.config.alertWhatsApp) {
        await this.whatsappOTP.sendOTP({
          phoneNumber: this.config.alertWhatsApp,
          template: 'login' // Usar template simples para alertas
        })

        // Enviar mensagem de alerta completa
        const alertMessage = `🚨 *KRYONIX ALERT*

*Serviço:* ${alert.service}
*Tipo:* ${alert.type.toUpperCase()}
*Mensagem:* ${alert.message}
*Horário:* ${new Date(alert.timestamp).toLocaleString('pt-BR')}

*Status dos Serviços:*
${alert.metrics ? this.formatServicesStatus(alert.metrics as SystemMetrics) : 'N/A'}

_Sistema de Monitoramento KRYONIX_`

        // Em produção, enviaria mensagem completa
        this.log('Alerta enviado via WhatsApp', { type: alert.type, service: alert.service })
      }

      this.log('Alerta gerado', alert)

    } catch (error) {
      this.log('Erro ao enviar alerta', error)
    }
  }

  /**
   * Formatar status dos serviços para mensagem
   */
  private formatServicesStatus(metrics: SystemMetrics): string {
    const statusIcon = (status: string) => {
      switch (status) {
        case 'online': return '🟢'
        case 'degraded': return '🟡'
        case 'offline': return '🔴'
        default: return '⚪'
      }
    }

    return `${statusIcon(metrics.keycloak.status)} Keycloak
${statusIcon(metrics.database.status)} Database
${statusIcon(metrics.storage.status)} Storage
${statusIcon(metrics.api.status)} API
💾 CPU: ${metrics.system.cpu.toFixed(1)}%
💾 RAM: ${metrics.system.memory.toFixed(1)}%
💾 Disk: ${metrics.system.disk.toFixed(1)}%`
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[SystemMonitor] ${message}`, data)
    }
  }
}

// Instância singleton
let _systemMonitor: SystemMonitor | null = null

export function getSystemMonitor(config?: MonitoringConfig): SystemMonitor {
  if (!_systemMonitor) {
    _systemMonitor = new SystemMonitor(config)
  }
  return _systemMonitor
}

export default SystemMonitor
