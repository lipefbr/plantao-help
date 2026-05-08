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
        { error: 'Acesso negado. Apenas administradores podem acessar estas estatísticas' },
        { status: 403 }
      )
    }

    // Calculate date ranges for last 6 months
    const now = new Date()
    const months: { start: Date; end: Date; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      const label = start.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
      months.push({ start, end, label })
    }

    // Run all queries in parallel
    const [
      allShifts,
      allUsers,
      monthlyShiftCounts,
      monthlyRevenue,
    ] = await Promise.all([
      // All shifts for status distribution
      db.shift.findMany({
        select: { status: true, value: true, createdAt: true },
      }),
      // All users for role distribution
      db.user.findMany({
        select: { role: true },
      }),
      // Monthly shift creation counts
      Promise.all(
        months.map(async (m) => {
          const count = await db.shift.count({
            where: {
              createdAt: {
                gte: m.start,
                lte: m.end,
              },
            },
          })
          return { month: m.label, count }
        })
      ),
      // Monthly revenue (sold shifts)
      Promise.all(
        months.map(async (m) => {
          const result = await db.shift.findMany({
            where: {
              status: 'SOLD',
              createdAt: {
                gte: m.start,
                lte: m.end,
              },
            },
            select: { value: true },
          })
          const revenue = result.reduce((sum, s) => sum + s.value, 0)
          return { month: m.label, revenue: Math.round(revenue * 100) / 100 }
        })
      ),
    ])

    // Shift status distribution
    const shiftStatusData = [
      { name: 'Disponível', value: allShifts.filter(s => s.status === 'AVAILABLE').length, status: 'AVAILABLE' },
      { name: 'Vendido', value: allShifts.filter(s => s.status === 'SOLD').length, status: 'SOLD' },
      { name: 'Cancelado', value: allShifts.filter(s => s.status === 'CANCELLED').length, status: 'CANCELLED' },
    ].filter(d => d.value > 0)

    // User registration by role (excluding ADMIN)
    const userRoleData = [
      { name: 'Médico(a)', value: allUsers.filter(u => u.role === 'MEDICO').length, role: 'MEDICO' },
      { name: 'Enfermeiro(a)', value: allUsers.filter(u => u.role === 'ENFERMEIRO').length, role: 'ENFERMEIRO' },
      { name: 'Téc. Enfermagem', value: allUsers.filter(u => u.role === 'TECNICO_ENFERMAGEM').length, role: 'TECNICO_ENFERMAGEM' },
      { name: 'Empresa', value: allUsers.filter(u => u.role === 'EMPRESA').length, role: 'EMPRESA' },
    ].filter(d => d.value > 0)

    return NextResponse.json({
      monthlyShifts: monthlyShiftCounts,
      shiftStatus: shiftStatusData,
      userRoles: userRoleData,
      monthlyRevenue,
    })
  } catch (error) {
    console.error('Get admin analytics error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados de analytics' },
      { status: 500 }
    )
  }
}
