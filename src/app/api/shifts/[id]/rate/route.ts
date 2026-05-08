import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { raterId, receiverId, stars, comment } = body

    if (!raterId || !receiverId || !stars) {
      return NextResponse.json(
        { error: 'raterId, receiverId e stars são obrigatórios' },
        { status: 400 }
      )
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5 estrelas' },
        { status: 400 }
      )
    }

    // Verify the shift exists
    const shift = await db.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      )
    }

    // Check if rater already rated this shift
    const existingRating = await db.rating.findUnique({
      where: {
        shiftId_raterId: {
          shiftId: id,
          raterId,
        },
      },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'Você já avaliou este plantão' },
        { status: 400 }
      )
    }

    const rating = await db.rating.create({
      data: {
        shiftId: id,
        raterId,
        receiverId,
        stars,
        comment: comment || null,
      },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        shift: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error('Create rating error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    )
  }
}
