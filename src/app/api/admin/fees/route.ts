import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const fees = await db.registrationFee.findMany({
      orderBy: { professionalType: 'asc' },
    })

    return NextResponse.json(fees)
  } catch (error) {
    console.error('Get fees error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar taxas' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, value, adminId } = body

    if (!id || value === undefined || !adminId) {
      return NextResponse.json(
        { error: 'id, valor e adminId são obrigatórios' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: adminId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar taxas' },
        { status: 403 }
      )
    }

    const existingFee = await db.registrationFee.findUnique({
      where: { id },
    })

    if (!existingFee) {
      return NextResponse.json(
        { error: 'Taxa não encontrada' },
        { status: 404 }
      )
    }

    const fee = await db.registrationFee.update({
      where: { id },
      data: {
        value: parseFloat(String(value)),
      },
    })

    return NextResponse.json(fee)
  } catch (error) {
    console.error('Update fee error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar taxa' },
      { status: 500 }
    )
  }
}
