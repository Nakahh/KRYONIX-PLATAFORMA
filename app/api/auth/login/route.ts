import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Configura\u00e7\u00f5es de seguran\u00e7a
const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

if (!ADMIN_PASSWORD_HASH) {
  console.warn('\u26a0\ufe0f ADMIN_PASSWORD_HASH n\u00e3o configurado - usando senha padr\u00e3o (INSEGURO)')
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validar entrada
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Usu\u00e1rio e senha s\u00e3o obrigat\u00f3rios' },
        { status: 400 }
      )
    }

    // Verificar usu\u00e1rio
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inv\u00e1lidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    let isValidPassword = false
    
    if (ADMIN_PASSWORD_HASH) {
      // Usar hash configurado
      isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    } else {
      // Fallback inseguro apenas para desenvolvimento
      console.warn('\u26a0\ufe0f Usando autentica\u00e7\u00e3o insegura - configure ADMIN_PASSWORD_HASH')
      isValidPassword = password === 'admin123' // Senha padr\u00e3o tempor\u00e1ria
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inv\u00e1lidas' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      token
    })

  } catch (error) {
    console.error('Erro na autentica\u00e7\u00e3o:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
