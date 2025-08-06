import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validação básica dos dados obrigatórios
    const requiredFields = ['nome', 'email', 'telefone', 'empresa', 'cargo', 'segmento']
    
    for (const field of requiredFields) {
      if (!data[field] || !data[field].trim()) {
        return NextResponse.json(
          { error: `Campo ${field} é obrigatório` },
          { status: 400 }
        )
      }
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Gerar posição na fila (simulado)
    const posicaoFila = Math.floor(Math.random() * 500) + 100

    // Preparar dados para armazenamento
    const waitlistEntry = {
      id: crypto.randomUUID(),
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      telefone: data.telefone.trim(),
      empresa: data.empresa.trim(),
      cargo: data.cargo.trim(),
      segmento: data.segmento,
      modulosInteresse: data.modulosInteresse || [],
      tamanhoEmpresa: data.tamanhoEmpresa || '1-10',
      expectativaUso: data.expectativaUso || '',
      mensagem: data.mensagem || '',
      posicaoFila,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      createdAt: new Date().toISOString(),
      status: 'ativo'
    }

    // Simular armazenamento (em produção seria salvo no banco de dados)
    console.log('Nova entrada na lista de espera:', waitlistEntry)
    
    // Enviar notificação via WhatsApp para o admin (simulado)
    const whatsappMessage = generateAdminNotification(waitlistEntry)
    console.log('Notificação para admin:', whatsappMessage)

    // Log para analytics
    console.log(`[WAITLIST] Nova inscrição: ${data.nome} (${data.email}) - Posição: ${posicaoFila}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Inscrição realizada com sucesso',
        position: posicaoFila,
        id: waitlistEntry.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao processar inscrição:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao processar sua inscrição. Tente novamente.'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificação de autenticação simples (em produção usar JWT)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Simular retorno de dados da lista de espera
    const mockData = {
      total: 1247,
      today: 23,
      entries: [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@empresa.com',
          telefone: '(11) 99999-9999',
          empresa: 'Silva & Associados',
          segmento: 'Advocacia e Direito',
          posicaoFila: 456,
          createdAt: new Date().toISOString()
        }
      ]
    }

    return NextResponse.json(mockData, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar dados da lista de espera:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para gerar notificação para o admin
function generateAdminNotification(entry: any): string {
  let message = `🎯 *NOVA INSCRIÇÃO - FILA DE ESPERA KRYONIX*\n\n`
  message += `👤 *Nome:* ${entry.nome}\n`
  message += `📧 *Email:* ${entry.email}\n`
  message += `📱 *Telefone:* ${entry.telefone}\n`
  message += `🏢 *Empresa:* ${entry.empresa}\n`
  message += `💼 *Cargo:* ${entry.cargo}\n`
  message += `🎯 *Segmento:* ${entry.segmento}\n`
  message += `👥 *Tamanho:* ${entry.tamanhoEmpresa}\n`
  
  if (entry.expectativaUso) {
    message += `⏰ *Expectativa:* ${entry.expectativaUso}\n`
  }
  
  message += `\n`
  
  if (entry.modulosInteresse.length > 0) {
    message += `💡 *Módulos de Interesse:*\n`
    entry.modulosInteresse.forEach((modulo: string) => {
      message += `• ${modulo}\n`
    })
    message += `\n`
  }
  
  if (entry.mensagem) {
    message += `💬 *Mensagem:*\n${entry.mensagem}\n\n`
  }
  
  message += `🏆 *Posição na Fila:* #${entry.posicaoFila}\n`
  message += `📅 *Data:* ${new Date(entry.createdAt).toLocaleString('pt-BR')}\n`
  message += `🌐 *IP:* ${entry.ipAddress}\n\n`
  message += `🚀 *Próximo passo:* Entrar em contato em até 24h`
  
  return message
}

// Função auxiliar para validar dados de entrada
function validateWaitlistData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validações obrigatórias
  if (!data.nome || data.nome.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres')
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email inválido')
  }
  
  if (!data.telefone || data.telefone.trim().length < 10) {
    errors.push('Telefone inválido')
  }
  
  if (!data.empresa || data.empresa.trim().length < 2) {
    errors.push('Nome da empresa é obrigatório')
  }
  
  if (!data.cargo || data.cargo.trim().length < 2) {
    errors.push('Cargo é obrigatório')
  }
  
  if (!data.segmento) {
    errors.push('Segmento de negócio é obrigatório')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
