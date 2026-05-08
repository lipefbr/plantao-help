import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { currentPassword, newPassword } = await request.json()

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Simple password check (no hashing in MVP)
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    await db.user.update({
      where: { id },
      data: { password: newPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 })
  }
}
