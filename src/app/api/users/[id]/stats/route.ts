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
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Run all queries in parallel for better performance
    const [
      publishedShifts,
      soldShifts,
      cancelledShifts,
      boughtShifts,
      ratingsReceived,
      allUserShifts,
    ] = await Promise.all([
      // Shifts published (seller)
      db.shift.findMany({
        where: { sellerId: id },
        select: { id: true, status: true, value: true, city: true, state: true, startTime: true, endTime: true },
      }),
      // Shifts sold (seller, status SOLD)
      db.shift.findMany({
        where: { sellerId: id, status: 'SOLD' },
        select: { value: true },
      }),
      // Shifts cancelled (seller, status CANCELLED)
      db.shift.findMany({
        where: { sellerId: id, status: 'CANCELLED' },
        select: { id: true },
      }),
      // Shifts bought (buyer)
      db.shift.findMany({
        where: { buyerId: id },
        select: { id: true, value: true },
      }),
      // Ratings received
      db.rating.findMany({
        where: { receiverId: id },
        select: { stars: true },
      }),
      // All shifts for location/type analysis
      db.shift.findMany({
        where: {
          OR: [{ sellerId: id }, { buyerId: id }],
        },
        select: { city: true, state: true, startTime: true, endTime: true },
      }),
    ])

    // Calculate totals
    const totalPublished = publishedShifts.length
    const totalSold = soldShifts.length
    const totalCancelled = cancelledShifts.length
    const totalBought = boughtShifts.length

    // Total earned from sold shifts
    const totalEarned = soldShifts.reduce((sum, s) => sum + s.value, 0)

    // Total spent on bought shifts
    const totalSpent = boughtShifts.reduce((sum, s) => sum + s.value, 0)

    // Average rating
    const avgRating = ratingsReceived.length > 0
      ? ratingsReceived.reduce((sum, r) => sum + r.stars, 0) / ratingsReceived.length
      : 0

    // Most common city/state for shifts
    const cityCount = new Map<string, number>()
    const stateCount = new Map<string, number>()
    for (const s of allUserShifts) {
      if (s.city) cityCount.set(s.city, (cityCount.get(s.city) || 0) + 1)
      if (s.state) stateCount.set(s.state, (stateCount.get(s.state) || 0) + 1)
    }
    const mostCommonCity = Array.from(cityCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    const mostCommonState = Array.from(stateCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    // Most common shift type (Diurno/Noturno/Misto)
    const shiftTypeCount = new Map<string, number>()
    for (const s of allUserShifts) {
      const startHour = parseInt(s.startTime.split(':')[0])
      const endHour = parseInt(s.endTime.split(':')[0])
      let type: string
      if (startHour >= 6 && startHour < 18 && endHour <= 20) type = 'Diurno'
      else if ((startHour >= 18 || startHour < 6) && (endHour <= 8 || endHour > 0)) type = 'Noturno'
      else type = 'Misto'
      shiftTypeCount.set(type, (shiftTypeCount.get(type) || 0) + 1)
    }
    const mostCommonShiftType = Array.from(shiftTypeCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    // Account age in days
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Profile completion percentage
    const fields = [
      !!user.email,
      !!user.phone,
      !!user.city,
      !!user.state,
      !!user.professionalDoc,
      !!user.bio,
      !!user.name,
      !!user.document,
    ]
    const profileCompletion = Math.round(
      (fields.filter(Boolean).length / fields.length) * 100
    )

    // Activity score (based on shifts + ratings count)
    // Max score is 100, calculated from: published (up to 30) + bought (up to 20) + ratings (up to 30) + sold (up to 20)
    const publishScore = Math.min(30, totalPublished * 3)
    const buyScore = Math.min(20, totalBought * 4)
    const ratingScore = Math.min(30, ratingsReceived.length * 6)
    const soldScore = Math.min(20, totalSold * 4)
    const activityScore = Math.min(100, publishScore + buyScore + ratingScore + soldScore)

    // Completion rate (% sold vs published, excluding cancelled)
    const completionRate = totalPublished > 0
      ? Math.round((totalSold / (totalPublished - totalCancelled || 1)) * 100)
      : 0

    return NextResponse.json({
      totalPublished,
      totalSold,
      totalCancelled,
      totalBought,
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      avgRating: Math.round(avgRating * 10) / 10,
      mostCommonCity,
      mostCommonState,
      mostCommonShiftType,
      accountAgeDays,
      profileCompletion,
      activityScore,
      completionRate: Math.min(100, completionRate),
      totalRatingsReceived: ratingsReceived.length,
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do usuário' },
      { status: 500 }
    )
  }
}
