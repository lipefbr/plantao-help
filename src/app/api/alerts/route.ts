import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const alerts = await db.shiftAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar alertas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, professionalType, city, state, minValue, maxValue, shiftType } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const alert = await db.shiftAlert.create({
      data: {
        userId,
        professionalType: professionalType || null,
        city: city || null,
        state: state || null,
        minValue: minValue ? parseFloat(minValue) : null,
        maxValue: maxValue ? parseFloat(maxValue) : null,
        shiftType: shiftType || null,
        active: true,
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar alerta' },
      { status: 500 }
    )
  }
}
