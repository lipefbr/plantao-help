import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, address, city, state, phone, userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem editar hospitais' },
        { status: 403 }
      )
    }

    const existingHospital = await db.hospital.findUnique({
      where: { id },
    })

    if (!existingHospital) {
      return NextResponse.json(
        { error: 'Hospital não encontrado' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (phone !== undefined) updateData.phone = phone

    const hospital = await db.hospital.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(hospital)
  } catch (error) {
    console.error('Update hospital error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar hospital' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem excluir hospitais' },
        { status: 403 }
      )
    }

    const existingHospital = await db.hospital.findUnique({
      where: { id },
    })

    if (!existingHospital) {
      return NextResponse.json(
        { error: 'Hospital não encontrado' },
        { status: 404 }
      )
    }

    await db.hospital.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Hospital excluído com sucesso' })
  } catch (error) {
    console.error('Delete hospital error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir hospital' },
      { status: 500 }
    )
  }
}
