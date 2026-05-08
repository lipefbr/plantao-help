import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminId = searchParams.get('adminId')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId é obrigatório' },
        { status: 400 }
      )
    }

    // Verify admin role
    const admin = await db.user.findUnique({
      where: { id: adminId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar estes dados' },
        { status: 403 }
      )
    }

    // Build where clause
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Build order by
    let orderBy: any = {}
    switch (sortBy) {
      case 'value':
        orderBy = { value: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
      case 'status':
        orderBy = { status: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
      case 'date':
      default:
        orderBy = { date: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
    }

    const shifts = await db.shift.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy,
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Get admin shifts error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar plantões' },
      { status: 500 }
    )
  }
}
