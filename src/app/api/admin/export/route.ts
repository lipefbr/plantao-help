import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminId = searchParams.get('adminId')
    const type = searchParams.get('type') as 'shifts' | 'users' | 'revenue' | null

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId é obrigatório' },
        { status: 400 }
      )
    }

    if (!type || !['shifts', 'users', 'revenue'].includes(type)) {
      return NextResponse.json(
        { error: 'type deve ser "shifts", "users" ou "revenue"' },
        { status: 400 }
      )
    }

    // Verify admin role
    const admin = await db.user.findUnique({
      where: { id: adminId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem exportar dados' },
        { status: 403 }
      )
    }

    let csv = ''

    if (type === 'shifts') {
      const shifts = await db.shift.findMany({
        include: {
          seller: { select: { name: true } },
          buyer: { select: { name: true } },
          hospital: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      csv = 'Título,Status,Data,Valor,Cidade,Estado,Vendedor,Comprador,Hospital\n'
      for (const s of shifts) {
        const date = new Date(s.date).toISOString().split('T')[0]
        csv += `"${s.title}","${s.status}","${date}","${s.value.toFixed(2)}","${s.city}","${s.state}","${s.seller.name}","${s.buyer?.name || ''}","${s.hospital?.name || ''}"\n`
      }
    } else if (type === 'users') {
      const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
      })

      csv = 'Nome,Email,Papel,Status,Cidade,Estado,Documento Profissional,Data de Cadastro\n'
      for (const u of users) {
        const date = new Date(u.createdAt).toISOString().split('T')[0]
        csv += `"${u.name}","${u.email}","${u.role}","${u.registrationStatus}","${u.city || ''}","${u.state || ''}","${u.professionalDoc || ''}","${date}"\n`
      }
    } else if (type === 'revenue') {
      // Get sold shifts grouped by month
      const soldShifts = await db.shift.findMany({
        where: { status: 'SOLD' },
        orderBy: { date: 'asc' },
      })

      // Group by month
      const monthMap = new Map<string, { totalRevenue: number; shiftCount: number; totalValue: number }>()

      for (const s of soldShifts) {
        const d = new Date(s.date)
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const existing = monthMap.get(monthKey) || { totalRevenue: 0, shiftCount: 0, totalValue: 0 }
        existing.totalRevenue += s.value
        existing.shiftCount += 1
        existing.totalValue += s.value
        monthMap.set(monthKey, existing)
      }

      csv = 'Mês,Receita Total,Quantidade Plantões,Valor Médio\n'
      const sortedMonths = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      for (const [month, data] of sortedMonths) {
        const avg = data.shiftCount > 0 ? data.totalValue / data.shiftCount : 0
        csv += `"${month}","${data.totalRevenue.toFixed(2)}","${data.shiftCount}","${avg.toFixed(2)}"\n`
      }
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Admin export error:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
