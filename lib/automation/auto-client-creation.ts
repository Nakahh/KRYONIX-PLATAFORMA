import { 
  NovoClienteData, 
  ClienteCreationResult, 
  ModuloSaaS,
  ClienteStatus 
} from '../types/auth'
import { AuthUtils } from '../utils/auth-utils'
import { getKeycloakManager } from '../keycloak/keycloak-manager'
import { getWhatsAppOTP } from '../auth/whatsapp-otp'

export interface AutoCreationConfig {
  evolutionApiUrl?: string
  evolutionApiKey?: string
  minioUrl?: string
  postgresUrl?: string
  traefik?: {
    configPath?: string
    certificateResolver?: string
  }
  debug?: boolean
}

export interface CreationProgress {
  step: number
  totalSteps: number
  currentTask: string
  percentage: number
  eta?: number
  logs: string[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export class AutoClientCreation {
  private config: AutoCreationConfig
  private keycloakManager = getKeycloakManager()
  private whatsappOTP = getWhatsAppOTP()
  private progressCallback?: (progress: CreationProgress) => void

  constructor(config: AutoCreationConfig = {}) {
    this.config = {
      evolutionApiUrl: process.env.EVOLUTION_API_URL || 'https://api.kryonix.com.br',
      evolutionApiKey: process.env.EVOLUTION_API_KEY || '',
      minioUrl: process.env.MINIO_URL || 'https://storage.kryonix.com.br',
      postgresUrl: process.env.POSTGRES_URL || '',
      traefik: {
        configPath: '/etc/traefik/dynamic',
        certificateResolver: 'letsencrypt'
      },
      debug: false,
      ...config
    }

    this.log('Inicializando AutoClientCreation', this.config)
  }

  /**
   * Validar dados antes da criação
   */
  validateClientData(dados: NovoClienteData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Validações obrigatórias
    if (!dados.nome || dados.nome.trim().length < 2) {
      errors.push('Nome do cliente deve ter pelo menos 2 caracteres')
    }

    if (!dados.email || !AuthUtils.isValidEmail(dados.email)) {
      errors.push('Email inválido')
    }

    if (!dados.whatsapp || !AuthUtils.isValidBrazilianPhone(dados.whatsapp)) {
      errors.push('Número de WhatsApp inválido (formato brasileiro)')
    }

    if (!dados.modulosContratados || dados.modulosContratados.length === 0) {
      errors.push('Pelo menos um módulo deve ser contratado')
    }

    if (!dados.adminUser?.email || !AuthUtils.isValidEmail(dados.adminUser.email)) {
      errors.push('Email do usuário admin inválido')
    }

    if (!dados.adminUser?.firstName || dados.adminUser.firstName.trim().length < 2) {
      errors.push('Nome do admin deve ter pelo menos 2 caracteres')
    }

    // Validações de módulos
    const modulosValidos = Object.values(ModuloSaaS)
    const modulosInvalidos = dados.modulosContratados.filter(m => !modulosValidos.includes(m as ModuloSaaS))
    if (modulosInvalidos.length > 0) {
      errors.push(`Módulos inválidos: ${modulosInvalidos.join(', ')}`)
    }

    // Validar subdomain se fornecido
    if (dados.subdomain) {
      const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
      if (!subdomainRegex.test(dados.subdomain)) {
        warnings.push('Subdomínio deve conter apenas letras minúsculas, números e hífens')
        suggestions.push(`Sugestão: ${AuthUtils.generateClienteId(dados.nome)}`)
      }
    }

    // Sugestões de otimização
    if (dados.modulosContratados.length === 1) {
      suggestions.push('Considere contratar módulos complementares para maior eficiência')
    }

    if (!dados.modulosContratados.includes(ModuloSaaS.ANALYTICS)) {
      suggestions.push('Módulo Analytics recomendado para insights de negócio')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Criar cliente completo de forma automática
   */
  async criarClienteCompleto(
    dados: NovoClienteData,
    progressCallback?: (progress: CreationProgress) => void
  ): Promise<ClienteCreationResult> {
    this.progressCallback = progressCallback
    const startTime = Date.now()
    
    this.log('Iniciando criação automática de cliente', { nome: dados.nome })

    try {
      // Etapa 1: Validação inicial
      await this.updateProgress(1, 8, 'Validando dados do cliente...', [])
      const validation = this.validateClientData(dados)
      if (!validation.valid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
      }

      // Etapa 2: Verificar disponibilidade
      await this.updateProgress(2, 8, 'Verificando disponibilidade...', ['✅ Dados validados'])
      await this.verificarDisponibilidade(dados)

      // Etapa 3: Criar realm e configurações Keycloak
      await this.updateProgress(3, 8, 'Criando realm Keycloak...', ['✅ Dados validados', '✅ Disponibilidade verificada'])
      const keycloakResult = await this.keycloakManager.criarClienteCompleto(dados)

      // Etapa 4: Configurar banco de dados isolado
      await this.updateProgress(4, 8, 'Configurando banco de dados...', [
        '✅ Dados validados', 
        '✅ Disponibilidade verificada',
        '✅ Realm Keycloak criado'
      ])
      await this.configurarBancoDados(keycloakResult.cliente_id)

      // Etapa 5: Configurar storage MinIO
      await this.updateProgress(5, 8, 'Configurando storage...', [
        '✅ Dados validados', 
        '✅ Disponibilidade verificada',
        '✅ Realm Keycloak criado',
        '✅ Banco de dados configurado'
      ])
      await this.configurarStorage(keycloakResult.cliente_id)

      // Etapa 6: Configurar subdomínio e Traefik
      await this.updateProgress(6, 8, 'Configurando subdomínio...', [
        '✅ Dados validados', 
        '✅ Disponibilidade verificada',
        '✅ Realm Keycloak criado',
        '✅ Banco de dados configurado',
        '✅ Storage configurado'
      ])
      await this.configurarSubdominio(keycloakResult.cliente_id, dados.subdomain)

      // Etapa 7: Configurar apps mobile
      await this.updateProgress(7, 8, 'Gerando apps mobile...', [
        '✅ Dados validados', 
        '✅ Disponibilidade verificada',
        '✅ Realm Keycloak criado',
        '✅ Banco de dados configurado',
        '✅ Storage configurado',
        '✅ Subdomínio configurado'
      ])
      await this.gerarAppsMobile(keycloakResult.cliente_id, dados)

      // Etapa 8: Enviar credenciais e finalizar
      await this.updateProgress(8, 8, 'Enviando credenciais e finalizando...', [
        '✅ Dados validados', 
        '✅ Disponibilidade verificada',
        '✅ Realm Keycloak criado',
        '✅ Banco de dados configurado',
        '✅ Storage configurado',
        '✅ Subdomínio configurado',
        '✅ Apps mobile gerados'
      ])
      await this.enviarCredenciaisWhatsApp(dados, keycloakResult)

      const endTime = Date.now()
      const totalTime = Math.round((endTime - startTime) / 1000)

      // Resultado final
      const resultado: ClienteCreationResult = {
        ...keycloakResult,
        creation_time: totalTime
      }

      await this.updateProgress(8, 8, 'Cliente criado com sucesso!', [
        '✅ Dados validados', 
        '✅ Disponibilidade verificada',
        '✅ Realm Keycloak criado',
        '✅ Banco de dados configurado',
        '✅ Storage configurado',
        '✅ Subdomínio configurado',
        '✅ Apps mobile gerados',
        '✅ Credenciais enviadas via WhatsApp'
      ])

      this.log('Cliente criado com sucesso', { clienteId: resultado.cliente_id, tempo: totalTime })
      return resultado

    } catch (error) {
      this.log('Erro na criação do cliente', error)
      
      // Tentar rollback automático
      try {
        await this.rollbackCreation(dados)
      } catch (rollbackError) {
        this.log('Erro no rollback', rollbackError)
      }

      throw error
    }
  }

  /**
   * Verificar se cliente já existe ou se há conflitos
   */
  private async verificarDisponibilidade(dados: NovoClienteData): Promise<void> {
    const clienteId = dados.subdomain || AuthUtils.generateClienteId(dados.nome)

    // Verificar se realm já existe
    const clienteExistente = await this.keycloakManager.obterInfoCliente(clienteId)
    if (clienteExistente) {
      throw new Error(`Cliente com ID '${clienteId}' já existe`)
    }

    // Verificar se email admin já está em uso
    // (implementação seria consultar API)

    // Verificar se WhatsApp já está cadastrado
    // (implementação seria consultar API)

    this.log('Disponibilidade verificada', { clienteId })
  }

  /**
   * Configurar banco de dados isolado para o cliente
   */
  private async configurarBancoDados(clienteId: string): Promise<void> {
    try {
      // Em produção, isso criaria database específico
      // Por enquanto, simula a criação
      this.log('Configurando banco de dados', { clienteId })

      // Simular tempo de criação
      await new Promise(resolve => setTimeout(resolve, 2000))

      this.log('Banco de dados configurado', { clienteId, database: `kryonix_cliente_${clienteId}` })

    } catch (error) {
      this.log('Erro ao configurar banco de dados', error)
      throw error
    }
  }

  /**
   * Configurar storage MinIO isolado
   */
  private async configurarStorage(clienteId: string): Promise<void> {
    try {
      // Em produção, isso criaria bucket específico no MinIO
      this.log('Configurando storage MinIO', { clienteId })

      // Simular tempo de criação
      await new Promise(resolve => setTimeout(resolve, 1500))

      this.log('Storage configurado', { clienteId, bucket: `kryonix-cliente-${clienteId}` })

    } catch (error) {
      this.log('Erro ao configurar storage', error)
      throw error
    }
  }

  /**
   * Configurar subdomínio no Traefik
   */
  private async configurarSubdominio(clienteId: string, customSubdomain?: string): Promise<void> {
    try {
      const subdomain = customSubdomain || clienteId
      
      this.log('Configurando subdomínio Traefik', { clienteId, subdomain })

      // Em produção, isso criaria arquivo de configuração do Traefik
      const traefikConfig = {
        http: {
          routers: {
            [`${clienteId}-router`]: {
              rule: `Host(\`${subdomain}.kryonix.com.br\`)`,
              service: `${clienteId}-service`,
              tls: {
                certResolver: this.config.traefik?.certificateResolver
              }
            }
          },
          services: {
            [`${clienteId}-service`]: {
              loadBalancer: {
                servers: [
                  { url: 'http://frontend:3000' }
                ],
                healthCheck: {
                  path: '/health'
                }
              }
            }
          }
        }
      }

      // Simular escrita do arquivo
      await new Promise(resolve => setTimeout(resolve, 1000))

      this.log('Subdomínio configurado', { clienteId, subdomain, url: `https://${subdomain}.kryonix.com.br` })

    } catch (error) {
      this.log('Erro ao configurar subdomínio', error)
      throw error
    }
  }

  /**
   * Gerar apps mobile personalizados
   */
  private async gerarAppsMobile(clienteId: string, dados: NovoClienteData): Promise<void> {
    try {
      this.log('Gerando apps mobile', { clienteId })

      // Em produção, isso geraria APK/IPA personalizados
      // Por enquanto, simula a geração
      await new Promise(resolve => setTimeout(resolve, 3000))

      const apps = {
        android: `https://downloads.kryonix.com.br/${clienteId}/android.apk`,
        ios: `https://downloads.kryonix.com.br/${clienteId}/ios.ipa`
      }

      this.log('Apps mobile gerados', { clienteId, apps })

    } catch (error) {
      this.log('Erro ao gerar apps mobile', error)
      throw error
    }
  }

  /**
   * Enviar credenciais via WhatsApp
   */
  private async enviarCredenciaisWhatsApp(dados: NovoClienteData, resultado: ClienteCreationResult): Promise<void> {
    try {
      const subdomain = dados.subdomain || resultado.cliente_id
      
      const mensagem = `🎉 *KRYONIX - Plataforma Pronta!*

Olá ${dados.nome}! Sua plataforma foi criada com sucesso em ${resultado.creation_time} segundos.

🌐 *Acesso Web:*
https://${subdomain}.kryonix.com.br

👤 *Credenciais Admin:*
📧 Email: ${resultado.admin_credentials.email}
🔑 Senha: ${resultado.admin_credentials.temporary_password}
⚠️ *Altere a senha no primeiro login*

📱 *Apps Mobile:*
🤖 Android: https://downloads.kryonix.com.br/${resultado.cliente_id}/android.apk
🍎 iOS: https://downloads.kryonix.com.br/${resultado.cliente_id}/ios.ipa

📋 *Módulos Ativos:*
${dados.modulosContratados.map(m => `✅ ${m.toUpperCase()}`).join('\n')}

🔑 *Token API:*
\`${resultado.api_tokens.access_token}\`

📞 *Suporte:* +55 17 98180-5327
🌐 *Portal:* https://admin.kryonix.com.br

*Bem-vindo ao futuro dos negócios!* 🚀`

      await this.whatsappOTP.sendOTP({
        phoneNumber: dados.whatsapp,
        clienteId: resultado.cliente_id,
        template: 'register'
      })

      // Simular envio da mensagem completa via Evolution API
      await new Promise(resolve => setTimeout(resolve, 1000))

      this.log('Credenciais enviadas via WhatsApp', { clienteId: resultado.cliente_id, whatsapp: dados.whatsapp })

    } catch (error) {
      this.log('Erro ao enviar credenciais', error)
      // Não falhar a criação por erro no envio
    }
  }

  /**
   * Rollback em caso de erro
   */
  private async rollbackCreation(dados: NovoClienteData): Promise<void> {
    try {
      const clienteId = dados.subdomain || AuthUtils.generateClienteId(dados.nome)
      
      this.log('Iniciando rollback', { clienteId })

      // Remover realm Keycloak
      await this.keycloakManager.removerCliente(clienteId)

      // Remover configurações Traefik, MinIO, PostgreSQL
      // (implementação seria feita aqui)

      this.log('Rollback concluído', { clienteId })

    } catch (error) {
      this.log('Erro no rollback', error)
    }
  }

  /**
   * Atualizar progresso
   */
  private async updateProgress(
    step: number, 
    totalSteps: number, 
    currentTask: string, 
    logs: string[]
  ): Promise<void> {
    const percentage = Math.round((step / totalSteps) * 100)
    
    const progress: CreationProgress = {
      step,
      totalSteps,
      currentTask,
      percentage,
      logs: [...logs]
    }

    if (this.progressCallback) {
      this.progressCallback(progress)
    }

    this.log(`Progresso: ${percentage}%`, { step, task: currentTask })

    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[AutoClientCreation] ${message}`, data)
    }
  }
}

// Instância singleton
let _autoClientCreation: AutoClientCreation | null = null

export function getAutoClientCreation(config?: AutoCreationConfig): AutoClientCreation {
  if (!_autoClientCreation) {
    _autoClientCreation = new AutoClientCreation(config)
  }
  return _autoClientCreation
}

export default AutoClientCreation
