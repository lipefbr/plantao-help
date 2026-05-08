import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const professionalType = searchParams.get('professionalType')
    const status = searchParams.get('status') || 'AVAILABLE'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const sellerId = searchParams.get('sellerId')
    const buyerId = searchParams.get('buyerId')
    const allStatuses = searchParams.get('allStatuses') === 'true'

    const where: Record<string, unknown> = {}

    if (!allStatuses) {
      where.status = status
    }

    if (sellerId) where.sellerId = sellerId
    if (buyerId) where.buyerId = buyerId

    if (city) where.city = city
    if (state) where.state = state
    if (professionalType) where.professionalType = professionalType
    if (minPrice || maxPrice) {
      where.value = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      }
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const shifts = await db.shift.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating for each seller
    const shiftsRatings = await Promise.all(
      shifts.map(async (shift) => {
        const sellerRatings = await db.rating.findMany({
          where: { receiverId: shift.sellerId },
          select: { stars: true },
        })
        const avgRating =
          sellerRatings.length > 0
            ? sellerRatings.reduce((sum, r) => sum + r.stars, 0) / sellerRatings.length
            : 0
        const totalRatings = sellerRatings.length
        return {
          ...shift,
          seller: {
            ...shift.seller,
            avgRating: Math.round(avgRating * 10) / 10,
            totalRatings,
          },
        }
      })
    )

    return NextResponse.json(shiftsRatings)
  } catch (error) {
    console.error('Get shifts error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar plantões' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      value,
      location,
      city,
      state,
      professionalType,
      hospitalId,
      sellerId,
    } = body

    if (!title || !date || !startTime || !endTime || !value || !location || !city || !state || !professionalType || !sellerId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const seller = await db.user.findUnique({
      where: { id: sellerId },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado' },
        { status: 404 }
      )
    }

    const shift = await db.shift.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        startTime,
        endTime,
        value: parseFloat(String(value)),
        location,
        city,
        state,
        professionalType,
        hospitalId: hospitalId || null,
        sellerId,
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

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('Create shift error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar plantão' },
      { status: 400 }
    )
  }
}
