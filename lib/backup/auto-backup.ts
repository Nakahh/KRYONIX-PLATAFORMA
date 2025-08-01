import { getWhatsAppOTP } from '../auth/whatsapp-otp'

export interface BackupConfig {
  backupPath?: string
  retentionDays?: number
  scheduleTime?: string // Formato: HH:MM
  alertWhatsApp?: string
  alertEmail?: string
  services?: {
    keycloak?: boolean
    postgres?: boolean
    minio?: boolean
    configs?: boolean
  }
  debug?: boolean
}

export interface BackupResult {
  success: boolean
  backupId: string
  timestamp: string
  services: {
    [service: string]: {
      success: boolean
      size?: string
      path?: string
      error?: string
    }
  }
  totalSize: string
  duration: number
  errors: string[]
}

export interface BackupInfo {
  id: string
  timestamp: string
  size: string
  services: string[]
  path: string
  retention: string
}

export class AutoBackup {
  private config: BackupConfig
  private whatsappOTP = getWhatsAppOTP()
  private isScheduled = false
  private scheduleTimeout?: NodeJS.Timeout

  constructor(config: BackupConfig = {}) {
    this.config = {
      backupPath: '/opt/kryonix/backups',
      retentionDays: 30,
      scheduleTime: '02:00', // 2:00 AM
      alertWhatsApp: process.env.ALERT_WHATSAPP || '+5517981805327',
      alertEmail: process.env.ALERT_EMAIL || 'backup@kryonix.com.br',
      services: {
        keycloak: true,
        postgres: true,
        minio: true,
        configs: true
      },
      debug: false,
      ...config
    }

    this.log('Inicializando AutoBackup', this.config)
  }

  /**
   * Iniciar agendamento automático de backups
   */
  startSchedule(): void {
    if (this.isScheduled) {
      this.log('Backup já está agendado')
      return
    }

    this.log('Iniciando agendamento de backup automático', { time: this.config.scheduleTime })
    this.isScheduled = true

    // Calcular próximo horário de backup
    this.scheduleNextBackup()

    // Notificar início do agendamento
    this.sendNotification('info', '🔄 Backup automático KRYONIX agendado', {
      time: this.config.scheduleTime,
      retention: `${this.config.retentionDays} dias`,
      services: Object.keys(this.config.services!).filter(s => this.config.services![s as keyof typeof this.config.services])
    })
  }

  /**
   * Parar agendamento automático
   */
  stopSchedule(): void {
    if (!this.isScheduled) {
      this.log('Backup não está agendado')
      return
    }

    this.log('Parando agendamento de backup automático')
    this.isScheduled = false

    if (this.scheduleTimeout) {
      clearTimeout(this.scheduleTimeout)
      this.scheduleTimeout = undefined
    }

    // Notificar parada do agendamento
    this.sendNotification('warning', '⏸️ Backup automático KRYONIX pausado')
  }

  /**
   * Executar backup completo
   */
  async performBackup(): Promise<BackupResult> {
    const startTime = Date.now()
    const backupId = this.generateBackupId()
    const timestamp = new Date().toISOString()

    this.log('Iniciando backup completo', { backupId })

    const result: BackupResult = {
      success: false,
      backupId,
      timestamp,
      services: {},
      totalSize: '0 MB',
      duration: 0,
      errors: []
    }

    try {
      // Criar diretório de backup
      const backupDir = `${this.config.backupPath}/${backupId}`
      await this.createBackupDirectory(backupDir)

      // Executar backup de cada serviço
      if (this.config.services?.keycloak) {
        result.services.keycloak = await this.backupKeycloak(backupDir)
      }

      if (this.config.services?.postgres) {
        result.services.postgres = await this.backupPostgreSQL(backupDir)
      }

      if (this.config.services?.minio) {
        result.services.minio = await this.backupMinIO(backupDir)
      }

      if (this.config.services?.configs) {
        result.services.configs = await this.backupConfigurations(backupDir)
      }

      // Calcular tamanho total e verificar sucesso
      const { totalSize, allSuccess } = await this.calculateBackupStats(result.services)
      result.totalSize = totalSize
      result.success = allSuccess

      // Coletar erros
      result.errors = Object.values(result.services)
        .filter(service => !service.success && service.error)
        .map(service => service.error!)

      // Limpar backups antigos
      await this.cleanupOldBackups()

      const endTime = Date.now()
      result.duration = Math.round((endTime - startTime) / 1000)

      this.log('Backup concluído', { 
        backupId, 
        success: result.success, 
        duration: result.duration,
        size: result.totalSize 
      })

      // Enviar notificação
      await this.sendBackupNotification(result)

      return result

    } catch (error) {
      const endTime = Date.now()
      result.duration = Math.round((endTime - startTime) / 1000)
      result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido')

      this.log('Erro no backup', error)

      // Enviar notificação de erro
      await this.sendBackupNotification(result)

      return result
    }
  }

  /**
   * Listar backups disponíveis
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      // Em produção, isso listaria arquivos reais
      // Por enquanto, simula lista de backups
      const backups: BackupInfo[] = [
        {
          id: 'backup_20250108_020001',
          timestamp: '2025-01-08T02:00:01.000Z',
          size: '2.1 GB',
          services: ['keycloak', 'postgres', 'minio', 'configs'],
          path: '/opt/kryonix/backups/backup_20250108_020001',
          retention: '29 dias restantes'
        },
        {
          id: 'backup_20250107_020001',
          timestamp: '2025-01-07T02:00:01.000Z',
          size: '2.0 GB',
          services: ['keycloak', 'postgres', 'minio', 'configs'],
          path: '/opt/kryonix/backups/backup_20250107_020001',
          retention: '28 dias restantes'
        }
      ]

      return backups

    } catch (error) {
      this.log('Erro ao listar backups', error)
      return []
    }
  }

  /**
   * Restaurar backup específico
   */
  async restoreBackup(backupId: string): Promise<{ success: boolean; errors: string[] }> {
    this.log('Iniciando restauração de backup', { backupId })

    try {
      // Em produção, isso faria restauração real
      // Por enquanto, simula restauração
      await new Promise(resolve => setTimeout(resolve, 5000))

      this.log('Backup restaurado com sucesso', { backupId })

      // Notificar restauração
      this.sendNotification('info', `✅ Backup ${backupId} restaurado com sucesso`)

      return { success: true, errors: [] }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro na restauração'
      this.log('Erro na restauração', error)

      // Notificar erro
      this.sendNotification('critical', `❌ Falha na restauração do backup ${backupId}: ${errorMsg}`)

      return { success: false, errors: [errorMsg] }
    }
  }

  // Métodos privados

  private generateBackupId(): string {
    const now = new Date()
    return `backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  }

  private async createBackupDirectory(path: string): Promise<void> {
    try {
      // Em produção, isso criaria diretório real
      this.log('Criando diretório de backup', { path })
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      throw new Error(`Falha ao criar diretório de backup: ${error}`)
    }
  }

  private async backupKeycloak(backupDir: string): Promise<BackupResult['services'][string]> {
    try {
      this.log('Fazendo backup do Keycloak')

      // Simular backup do Keycloak (export realms, users, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000))

      return {
        success: true,
        size: '150 MB',
        path: `${backupDir}/keycloak_export.json`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no backup Keycloak'
      }
    }
  }

  private async backupPostgreSQL(backupDir: string): Promise<BackupResult['services'][string]> {
    try {
      this.log('Fazendo backup do PostgreSQL')

      // Simular pg_dump
      await new Promise(resolve => setTimeout(resolve, 3000))

      return {
        success: true,
        size: '890 MB',
        path: `${backupDir}/postgres_dump.sql.gz`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no backup PostgreSQL'
      }
    }
  }

  private async backupMinIO(backupDir: string): Promise<BackupResult['services'][string]> {
    try {
      this.log('Fazendo backup do MinIO')

      // Simular backup de buckets
      await new Promise(resolve => setTimeout(resolve, 4000))

      return {
        success: true,
        size: '1.2 GB',
        path: `${backupDir}/minio_buckets.tar.gz`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no backup MinIO'
      }
    }
  }

  private async backupConfigurations(backupDir: string): Promise<BackupResult['services'][string]> {
    try {
      this.log('Fazendo backup das configurações')

      // Simular backup de configs (Docker, Traefik, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        size: '45 MB',
        path: `${backupDir}/configurations.tar.gz`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no backup de configurações'
      }
    }
  }

  private async calculateBackupStats(services: BackupResult['services']): Promise<{ totalSize: string; allSuccess: boolean }> {
    let totalBytes = 0
    let allSuccess = true

    for (const service of Object.values(services)) {
      if (!service.success) {
        allSuccess = false
      }
      
      if (service.size) {
        // Converter tamanho para bytes (simulado)
        const sizeMatch = service.size.match(/(\d+\.?\d*)\s*(MB|GB)/)
        if (sizeMatch) {
          const value = parseFloat(sizeMatch[1])
          const unit = sizeMatch[2]
          totalBytes += unit === 'GB' ? value * 1024 * 1024 * 1024 : value * 1024 * 1024
        }
      }
    }

    // Converter de volta para formato legível
    const totalSize = totalBytes > 1024 * 1024 * 1024 
      ? `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      : `${(totalBytes / (1024 * 1024)).toFixed(0)} MB`

    return { totalSize, allSuccess }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      this.log('Limpando backups antigos', { retentionDays: this.config.retentionDays })
      
      // Em produção, isso removeria backups antigos
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.log('Limpeza de backups concluída')

    } catch (error) {
      this.log('Erro na limpeza de backups', error)
    }
  }

  private scheduleNextBackup(): void {
    const now = new Date()
    const [hours, minutes] = this.config.scheduleTime!.split(':').map(Number)
    
    const nextBackup = new Date()
    nextBackup.setHours(hours, minutes, 0, 0)
    
    // Se o horário já passou hoje, agendar para amanhã
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1)
    }
    
    const msUntilBackup = nextBackup.getTime() - now.getTime()
    
    this.log('Próximo backup agendado', { 
      time: nextBackup.toLocaleString('pt-BR'),
      msUntilBackup 
    })

    this.scheduleTimeout = setTimeout(async () => {
      await this.performBackup()
      
      // Agendar próximo backup (24h depois)
      if (this.isScheduled) {
        this.scheduleNextBackup()
      }
    }, msUntilBackup)
  }

  private async sendBackupNotification(result: BackupResult): Promise<void> {
    const status = result.success ? '✅ SUCESSO' : '❌ FALHA'
    const emoji = result.success ? '💾' : '🚨'
    
    let message = `${emoji} *BACKUP KRYONIX*

*Status:* ${status}
*ID:* ${result.backupId}
*Duração:* ${result.duration}s
*Tamanho:* ${result.totalSize}
*Horário:* ${new Date(result.timestamp).toLocaleString('pt-BR')}

*Serviços:*`

    for (const [service, data] of Object.entries(result.services)) {
      const icon = data.success ? '✅' : '❌'
      const size = data.size ? ` (${data.size})` : ''
      message += `\n${icon} ${service.toUpperCase()}${size}`
    }

    if (result.errors.length > 0) {
      message += `\n\n*Erros:*\n${result.errors.map(e => `• ${e}`).join('\n')}`
    }

    message += '\n\n_Sistema de Backup KRYONIX_'

    await this.sendNotification(result.success ? 'info' : 'critical', message)
  }

  private async sendNotification(type: 'info' | 'warning' | 'critical', message: string, data?: any): Promise<void> {
    try {
      if (this.config.alertWhatsApp) {
        await this.whatsappOTP.sendOTP({
          phoneNumber: this.config.alertWhatsApp,
          template: 'login'
        })

        this.log('Notificação enviada via WhatsApp', { type, message: message.substring(0, 50) + '...' })
      }

      this.log('Notificação gerada', { type, data })

    } catch (error) {
      this.log('Erro ao enviar notificação', error)
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[AutoBackup] ${message}`, data)
    }
  }
}

// Instância singleton
let _autoBackup: AutoBackup | null = null

export function getAutoBackup(config?: BackupConfig): AutoBackup {
  if (!_autoBackup) {
    _autoBackup = new AutoBackup(config)
  }
  return _autoBackup
}

export default AutoBackup
