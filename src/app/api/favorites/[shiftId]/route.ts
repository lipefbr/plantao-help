import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  try {
    const { shiftId } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_shiftId: { userId, shiftId },
      },
    })

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorito não encontrado' },
        { status: 404 }
      )
    }

    await prisma.favorite.delete({
      where: {
        userId_shiftId: { userId, shiftId },
      },
    })

    return NextResponse.json({ message: 'Favorito removido com sucesso' })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { error: 'Erro ao remover favorito' },
      { status: 500 }
    )
  }
}
