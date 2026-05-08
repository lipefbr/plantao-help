import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// Create a fresh PrismaClient to ensure schema changes are picked up
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

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type } = body

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'userId, title, message e type são obrigatórios' },
        { status: 400 }
      )
    }

    const validTypes = ['INFO', 'SUCCESS', 'WARNING']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'type deve ser INFO, SUCCESS ou WARNING' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const notification = await prisma.notification.create({
      data: { userId, title, message, type },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 400 }
    )
  }
}
