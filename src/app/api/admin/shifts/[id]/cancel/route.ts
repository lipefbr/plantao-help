import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { adminId, reason } = body

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
        { error: 'Acesso negado. Apenas administradores podem cancelar plantões' },
        { status: 403 }
      )
    }

    // Find the shift
    const shift = await db.shift.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true } },
        buyer: { select: { id: true, name: true } },
      },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      )
    }

    if (shift.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Plantão já está cancelado' },
        { status: 400 }
      )
    }

    // Cancel the shift
    const updatedShift = await db.shift.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        seller: { select: { id: true, name: true } },
        buyer: { select: { id: true, name: true } },
        hospital: { select: { id: true, name: true } },
      },
    })

    // Send notification to the seller
    const reasonText = reason ? ` Motivo: ${reason}` : ''
    await db.notification.create({
      data: {
        userId: shift.sellerId,
        title: 'Plantão cancelado pela administração',
        message: `Seu plantão "${shift.title}" foi cancelado pelo administrador.${reasonText}`,
        type: 'WARNING',
      },
    })

    // If there's a buyer, notify them too
    if (shift.buyerId) {
      await db.notification.create({
        data: {
          userId: shift.buyerId,
          title: 'Plantão cancelado',
          message: `O plantão "${shift.title}" que você comprou foi cancelado pela administração.${reasonText}`,
          type: 'WARNING',
        },
      })
    }

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error('Cancel shift error:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar plantão' },
      { status: 500 }
    )
  }
}
