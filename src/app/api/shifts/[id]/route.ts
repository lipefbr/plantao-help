import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const shift = await db.shift.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            role: true,
            professionalDoc: true,
            avatar: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
        hospital: true,
        ratings: {
          include: {
            rater: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      )
    }

    // Calculate seller's average rating
    const sellerRatings = await db.rating.findMany({
      where: { receiverId: shift.sellerId },
      select: { stars: true },
    })
    const avgRating =
      sellerRatings.length > 0
        ? sellerRatings.reduce((sum, r) => sum + r.stars, 0) / sellerRatings.length
        : 0

    return NextResponse.json({
      ...shift,
      seller: {
        ...shift.seller,
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings: sellerRatings.length,
      },
    })
  } catch (error) {
    console.error('Get shift error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar plantão' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, buyerId } = body

    const shift = await db.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      )
    }

    if (action === 'buy') {
      if (!buyerId) {
        return NextResponse.json(
          { error: 'buyerId é obrigatório' },
          { status: 400 }
        )
      }

      if (shift.status !== 'AVAILABLE') {
        return NextResponse.json(
          { error: 'Plantão não está disponível' },
          { status: 400 }
        )
      }

      if (shift.sellerId === buyerId) {
        return NextResponse.json(
          { error: 'Você não pode comprar seu próprio plantão' },
          { status: 400 }
        )
      }

      const buyer = await db.user.findUnique({
        where: { id: buyerId },
      })

      if (!buyer) {
        return NextResponse.json(
          { error: 'Comprador não encontrado' },
          { status: 404 }
        )
      }

      const updatedShift = await db.shift.update({
        where: { id },
        data: {
          buyerId,
          status: 'SOLD',
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              role: true,
              professionalDoc: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          hospital: true,
        },
      })

      return NextResponse.json(updatedShift)
    }

    if (action === 'cancel') {
      if (shift.status === 'CANCELLED') {
        return NextResponse.json(
          { error: 'Plantão já está cancelado' },
          { status: 400 }
        )
      }

      const updatedShift = await db.shift.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              role: true,
              professionalDoc: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          hospital: true,
        },
      })

      return NextResponse.json(updatedShift)
    }

    return NextResponse.json(
      { error: 'Ação inválida. Use "buy" ou "cancel"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update shift error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar plantão' },
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

    const shift = await db.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      )
    }

    const updatedShift = await db.shift.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error('Delete shift error:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar plantão' },
      { status: 500 }
    )
  }
}
