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

    // Get all shifts where user is seller or buyer
    const shifts = await db.shift.findMany({
      where: {
        OR: [
          { sellerId: userId },
          { buyerId: userId },
        ],
      },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        value: true,
        city: true,
        state: true,
        status: true,
        professionalType: true,
        sellerId: true,
        buyerId: true,
        hospital: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    })

    // Group shifts by date
    const groupedByDate: Record<string, typeof shifts> = {}
    for (const shift of shifts) {
      const dateKey = new Date(shift.date).toISOString().split('T')[0]
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = []
      }
      groupedByDate[dateKey].push(shift)
    }

    // Format response with type info (published vs bought)
    const result = Object.entries(groupedByDate).map(([date, dateShifts]) => ({
      date,
      shifts: dateShifts.map(s => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        value: s.value,
        city: s.city,
        state: s.state,
        status: s.status,
        professionalType: s.professionalType,
        type: s.sellerId === userId ? 'published' as const : 'bought' as const,
        hospital: s.hospital?.name || null,
      })),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get calendar shifts error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar plantões do calendário' },
      { status: 500 }
    )
  }
}
