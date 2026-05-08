import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const state = searchParams.get('state')

    const where: Record<string, unknown> = {}

    if (city) where.city = city
    if (state) where.state = state

    const hospitals = await db.hospital.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(hospitals)
  } catch (error) {
    console.error('Get hospitals error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar hospitais' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, city, state, phone, userId } = body

    if (!name || !city || !state || !userId) {
      return NextResponse.json(
        { error: 'Nome, cidade, estado e userId são obrigatórios' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar hospitais' },
        { status: 403 }
      )
    }

    const hospital = await db.hospital.create({
      data: {
        name,
        address: address || null,
        city,
        state,
        phone: phone || null,
      },
    })

    return NextResponse.json(hospital, { status: 201 })
  } catch (error) {
    console.error('Create hospital error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar hospital' },
      { status: 400 }
    )
  }
}
