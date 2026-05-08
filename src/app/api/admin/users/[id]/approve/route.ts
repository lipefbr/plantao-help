import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminId } = body

    if (!status || !adminId) {
      return NextResponse.json(
        { error: 'status e adminId são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use APPROVED ou REJECTED' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: adminId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem aprovar/rejeitar usuários' },
        { status: 403 }
      )
    }

    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        registrationStatus: status,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        registrationStatus: true,
        document: true,
        professionalDoc: true,
        phone: true,
        city: true,
        state: true,
        avatar: true,
        bio: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Create notification for the user
    if (status === 'APPROVED') {
      await db.notification.create({
        data: {
          userId: id,
          title: 'Cadastro Aprovado!',
          message: 'Seu cadastro no Plantão Help foi aprovado. Bem-vindo(a)!',
          type: 'SUCCESS',
        },
      })
    } else if (status === 'REJECTED') {
      await db.notification.create({
        data: {
          userId: id,
          title: 'Cadastro Rejeitado',
          message: 'Infelizmente seu cadastro não foi aprovado. Entre em contato para mais informações.',
          type: 'WARNING',
        },
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Approve user error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status do usuário' },
      { status: 500 }
    )
  }
}
