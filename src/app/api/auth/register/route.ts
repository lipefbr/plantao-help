import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      role,
      document,
      professionalDoc,
      phone,
      city,
      state,
      companyName,
      bio,
    } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, senha, nome e função são obrigatórios' },
        { status: 400 }
      )
    }

    const validRoles = ['MEDICO', 'ENFERMEIRO', 'TECNICO_ENFERMAGEM', 'EMPRESA', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Função inválida' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const user = await db.user.create({
      data: {
        email,
        password,
        name,
        role,
        document: document || null,
        professionalDoc: professionalDoc || null,
        phone: phone || null,
        city: city || null,
        state: state || null,
        companyName: companyName || null,
        bio: bio || null,
        registrationStatus: 'PENDING',
      },
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 400 }
    )
  }
}
