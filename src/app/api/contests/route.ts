import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const professionalType = searchParams.get('professionalType')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (city) where.city = city
    if (state) where.state = state
    if (professionalType) where.professionalType = professionalType
    if (status) where.status = status

    const contests = await db.contest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contests)
  } catch (error) {
    console.error('Get contests error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar concursos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      professionalType,
      city,
      state,
      deadline,
      link,
      userId,
    } = body

    if (!title || !professionalType || !city || !state || !userId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar concursos' },
        { status: 403 }
      )
    }

    const contest = await db.contest.create({
      data: {
        title,
        description: description || null,
        professionalType,
        city,
        state,
        deadline: deadline ? new Date(deadline) : null,
        link: link || null,
      },
    })

    return NextResponse.json(contest, { status: 201 })
  } catch (error) {
    console.error('Create contest error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar concurso' },
      { status: 400 }
    )
  }
}
