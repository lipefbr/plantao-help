import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

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

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Get shift details separately
    const shiftIds = favorites.map(f => f.shiftId)
    const shifts = await prisma.shift.findMany({
      where: { id: { in: shiftIds } },
      include: {
        seller: {
          select: { id: true, name: true, role: true, professionalDoc: true },
        },
        hospital: true,
      },
    })

    // Calculate average rating for each shift's seller
    const shiftsMap = new Map()
    await Promise.all(
      shifts.map(async (shift) => {
        const sellerRatings = await prisma.rating.findMany({
          where: { receiverId: shift.sellerId },
          select: { stars: true },
        })
        const avgRating =
          sellerRatings.length > 0
            ? sellerRatings.reduce((sum, r) => sum + r.stars, 0) / sellerRatings.length
            : 0
        shiftsMap.set(shift.id, {
          ...shift,
          seller: {
            ...shift.seller,
            avgRating: Math.round(avgRating * 10) / 10,
            totalRatings: sellerRatings.length,
          },
        })
      })
    )

    const result = favorites.map(f => ({
      ...f,
      shift: shiftsMap.get(f.shiftId) || null,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar favoritos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, shiftId } = body

    if (!userId || !shiftId) {
      return NextResponse.json(
        { error: 'userId e shiftId são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if shift exists
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_shiftId: { userId, shiftId },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Plantão já está nos favoritos' },
        { status: 409 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        shiftId,
      },
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error('Create favorite error:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar favorito' },
      { status: 400 }
    )
  }
}
