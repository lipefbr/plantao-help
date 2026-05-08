import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, city: true, state: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Fetch all AVAILABLE shifts not published by the user
    const shifts = await db.shift.findMany({
      where: {
        status: 'AVAILABLE',
        sellerId: { not: userId },
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
        hospital: true,
      },
    })

    // Calculate seller ratings
    const sellerIds = [...new Set(shifts.map(s => s.sellerId))]
    const sellerRatingsMap: Record<string, { avgRating: number; totalRatings: number }> = {}

    await Promise.all(
      sellerIds.map(async (sellerId) => {
        const ratings = await db.rating.findMany({
          where: { receiverId: sellerId },
          select: { stars: true },
        })
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
          : 0
        sellerRatingsMap[sellerId] = {
          avgRating: Math.round(avgRating * 10) / 10,
          totalRatings: ratings.length,
        }
      })
    )

    // Score each shift
    const scored = shifts.map((shift) => {
      let score = 0
      const reasons: string[] = []

      // Professional type match (3 points)
      if (shift.professionalType === user.role) {
        score += 3
        reasons.push('Seu tipo')
      }

      // Same state (2 points)
      if (user.state && shift.state.toUpperCase() === user.state.toUpperCase()) {
        score += 2
        reasons.push('Mesma região')
      }

      // Same city (1 point)
      if (user.city && shift.city.toUpperCase() === user.city.toUpperCase()) {
        score += 1
        // Don't add duplicate reason, "Mesma região" already covers it
        if (!reasons.includes('Mesma região')) {
          reasons.push('Mesma cidade')
        }
      }

      // High-rated seller (1 point if avgRating >= 4)
      const sellerRating = sellerRatingsMap[shift.sellerId]
      if (sellerRating && sellerRating.avgRating >= 4) {
        score += 1
        reasons.push('Vendedor top')
      }

      return {
        ...shift,
        seller: {
          ...shift.seller,
          avgRating: sellerRating?.avgRating || 0,
          totalRatings: sellerRating?.totalRatings || 0,
        },
        _score: score,
        _reasons: reasons,
      }
    })

    // Sort by score descending, limit to 5
    const recommended = scored
      .filter(s => s._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 5)
      .map(({ _score, _reasons, ...shift }) => ({
        ...shift,
        score: _score,
        reasons: _reasons,
      }))

    return NextResponse.json(recommended)
  } catch (error) {
    console.error('Get recommended shifts error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar recomendações' },
      { status: 500 }
    )
  }
}
