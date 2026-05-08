import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, professionalType, city, state, deadline, link, status, userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem editar concursos' },
        { status: 403 }
      )
    }

    const existingContest = await db.contest.findUnique({
      where: { id },
    })

    if (!existingContest) {
      return NextResponse.json(
        { error: 'Concurso não encontrado' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (professionalType !== undefined) updateData.professionalType = professionalType
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
    if (link !== undefined) updateData.link = link
    if (status !== undefined) updateData.status = status

    const contest = await db.contest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(contest)
  } catch (error) {
    console.error('Update contest error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar concurso' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem excluir concursos' },
        { status: 403 }
      )
    }

    const existingContest = await db.contest.findUnique({
      where: { id },
    })

    if (!existingContest) {
      return NextResponse.json(
        { error: 'Concurso não encontrado' },
        { status: 404 }
      )
    }

    await db.contest.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Concurso excluído com sucesso' })
  } catch (error) {
    console.error('Delete contest error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir concurso' },
      { status: 500 }
    )
  }
}
