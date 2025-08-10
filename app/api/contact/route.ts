import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, email, message } = body
    
    if (!name || !email || !message) {
      return NextResponse.json(
        { 
          error: 'Nome, email e mensagem são obrigatórios',
          details: 'Name, email, and message are required'
        },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Formato de email inválido',
          details: 'Invalid email format'
        },
        { status: 400 }
      )
    }
    
    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { 
          error: 'Mensagem deve ter pelo menos 10 caracteres',
          details: 'Message must be at least 10 characters long'
        },
        { status: 400 }
      )
    }
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: body.phone?.trim() || '',
        company: body.company?.trim() || '',
        subject: body.subject?.trim() || 'Contato via site',
        message: message.trim(),
        type: body.type || 'general',
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Backend error')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Responderemos em até 24 horas.',
      id: data.id,
    }, { status: 201 })
    
  } catch (error) {
    console.error('Contact API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: 'Internal server error',
        message: 'Tente novamente em alguns instantes ou entre em contato via WhatsApp'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
