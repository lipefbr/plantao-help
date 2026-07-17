import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { price: 'asc' },
      include: { _count: { select: { users: true } } },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description, features, maxShifts, isActive, adminId } = body

    if (!adminId) {
      return NextResponse.json({ error: 'adminId é obrigatório' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const plan = await db.plan.create({
      data: { name, price, description, features, maxShifts: maxShifts || 0, isActive: isActive !== false },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json({ error: 'Erro ao criar plano' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, price, description, features, maxShifts, isActive, adminId } = body

    if (!adminId) {
      return NextResponse.json({ error: 'adminId é obrigatório' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const plan = await db.plan.update({
      where: { id },
      data: { name, price, description, features, maxShifts: maxShifts || 0, isActive },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Update plan error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminId = searchParams.get('adminId')

    if (!id || !adminId) {
      return NextResponse.json({ error: 'id e adminId são obrigatórios' }, { status: 400 })
    }

    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await db.plan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete plan error:', error)
    return NextResponse.json({ error: 'Erro ao excluir plano' }, { status: 500 })
  }
}
