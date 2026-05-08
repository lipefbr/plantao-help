import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const ratings = await db.rating.findMany({
      where: { receiverId: id },
      include: {
        rater: {
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
            date: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
        : 0

    return NextResponse.json({
      ratings,
      average: Math.round(avgRating * 10) / 10,
      total: ratings.length,
    })
  } catch (error) {
    console.error('Get user ratings error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}
