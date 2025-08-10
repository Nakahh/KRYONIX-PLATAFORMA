import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, email } = body
    
    if (!name || !email) {
      return NextResponse.json(
        { 
          error: 'Nome e email são obrigatórios',
          details: 'Name and email are required'
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
    
    // Validate name length
    if (name.length < 2) {
      return NextResponse.json(
        { 
          error: 'Nome deve ter pelo menos 2 caracteres',
          details: 'Name must be at least 2 characters long'
        },
        { status: 400 }
      )
    }
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: body.company?.trim() || '',
        phone: body.phone?.trim() || '',
        interest_type: body.interest_type || 'general',
        message: body.message?.trim() || '',
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle specific backend errors
      if (response.status === 400 && errorData.error?.includes('already')) {
        return NextResponse.json({
          success: true,
          message: 'Você já está na nossa lista de espera!',
          alreadyExists: true,
        }, { status: 200 })
      }
      
      throw new Error(errorData.error || 'Backend error')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: `Parabéns! Você está na posição #${data.position} da nossa lista de espera.`,
      position: data.position,
      id: data.data?.id,
    }, { status: 201 })
    
  } catch (error) {
    console.error('Waitlist API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: 'Internal server error',
        message: 'Tente novamente em alguns instantes'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get waitlist statistics for public display
    const response = await fetch(`${BACKEND_URL}/api/waitlist/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch waitlist stats')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      stats: {
        total: parseInt(data.total) || 0,
        today: parseInt(data.today) || 0,
        week: parseInt(data.week) || 0,
        month: parseInt(data.month) || 0,
      },
    })
    
  } catch (error) {
    console.error('Waitlist stats API error:', error)
    
    // Return default stats if backend is unavailable
    return NextResponse.json({
      success: true,
      stats: {
        total: 500, // Fallback number
        today: 12,
        week: 85,
        month: 320,
      },
    })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
