import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, email, partnership_type } = body
    
    if (!name || !email || !partnership_type) {
      return NextResponse.json(
        { 
          error: 'Nome, email e tipo de parceria são obrigatórios',
          details: 'Name, email, and partnership type are required'
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
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/partnerships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone: body.phone || '',
        company: body.company || '',
        partnership_type,
        investment_range: body.investment_range || '',
        message: body.message || '',
        revenue: body.revenue || '',
        employees: body.employees || '',
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Backend error')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Solicitação de parceria enviada com sucesso',
      id: data.id,
    }, { status: 201 })
    
  } catch (error) {
    console.error('Partnership API error:', error)
    
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
    // Get partnership statistics (if needed for public display)
    const response = await fetch(`${BACKEND_URL}/api/partnerships/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch partnership stats')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data,
    })
    
  } catch (error) {
    console.error('Partnership stats API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar estatísticas',
        details: 'Error fetching statistics'
      },
      { status: 500 }
    )
  }
}
