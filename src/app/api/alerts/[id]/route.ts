import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const alert = await db.shiftAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      )
    }

    if (alert.userId !== userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este alerta' },
        { status: 403 }
      )
    }

    await db.shiftAlert.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir alerta' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, active } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const alert = await db.shiftAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alerta não encontrado' },
        { status: 404 }
      )
    }

    if (alert.userId !== userId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este alerta' },
        { status: 403 }
      )
    }

    const updated = await db.shiftAlert.update({
      where: { id },
      data: { active: active !== undefined ? active : alert.active },
    })

    return NextResponse.json({ alert: updated })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar alerta' },
      { status: 500 }
    )
  }
}
