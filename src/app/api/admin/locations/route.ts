import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const locations = await db.location.findMany({
      where: { active: true },
      orderBy: [{ state: 'asc' }, { city: 'asc' }],
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar localizações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, state, adminId } = body

    if (!city || !state || !adminId) {
      return NextResponse.json(
        { error: 'Cidade, estado e adminId são obrigatórios' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: adminId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar localizações' },
        { status: 403 }
      )
    }

    const location = await db.location.create({
      data: {
        city,
        state,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Create location error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar localização' },
      { status: 400 }
    )
  }
}
