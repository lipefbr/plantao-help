import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminId = searchParams.get('adminId')

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
        { error: 'Acesso negado. Apenas administradores podem acessar estes dados' },
        { status: 403 }
      )
    }

    // Get all sold shifts for revenue calculation
    const soldShifts = await db.shift.findMany({
      where: { status: 'SOLD' },
      select: {
        value: true,
        city: true,
        state: true,
        createdAt: true,
      },
    })

    const allShifts = await db.shift.findMany({
      select: {
        value: true,
        status: true,
        createdAt: true,
      },
    })

    // Total revenue (all sold shifts)
    const totalRevenue = soldShifts.reduce((sum, s) => sum + s.value, 0)

    // Revenue this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const revenueThisMonth = soldShifts
      .filter(s => new Date(s.createdAt) >= startOfMonth)
      .reduce((sum, s) => sum + s.value, 0)

    // Revenue last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const revenueLastMonth = soldShifts
      .filter(s => {
        const d = new Date(s.createdAt)
        return d >= startOfLastMonth && d <= endOfLastMonth
      })
      .reduce((sum, s) => sum + s.value, 0)

    // Average shift value
    const averageShiftValue = soldShifts.length > 0
      ? totalRevenue / soldShifts.length
      : 0

    // Revenue trend (percentage change from last month)
    const revenueTrend = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : revenueThisMonth > 0 ? 100 : 0

    // Top earning cities
    const cityRevenue: Record<string, { city: string; state: string; revenue: number; count: number }> = {}
    for (const s of soldShifts) {
      const key = `${s.city}-${s.state}`
      if (!cityRevenue[key]) {
        cityRevenue[key] = { city: s.city, state: s.state, revenue: 0, count: 0 }
      }
      cityRevenue[key].revenue += s.value
      cityRevenue[key].count += 1
    }

    const topCities = Object.values(cityRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Top earning states
    const stateRevenue: Record<string, { state: string; revenue: number; count: number }> = {}
    for (const s of soldShifts) {
      if (!stateRevenue[s.state]) {
        stateRevenue[s.state] = { state: s.state, revenue: 0, count: 0 }
      }
      stateRevenue[s.state].revenue += s.value
      stateRevenue[s.state].count += 1
    }

    const topStates = Object.values(stateRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Total shifts count
    const totalSoldShifts = soldShifts.length
    const totalAllShifts = allShifts.length

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      revenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
      averageShiftValue: Math.round(averageShiftValue * 100) / 100,
      revenueTrend: Math.round(revenueTrend * 100) / 100,
      topCities,
      topStates,
      totalSoldShifts,
      totalAllShifts,
    })
  } catch (error) {
    console.error('Get admin revenue error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados de receita' },
      { status: 500 }
    )
  }
}
