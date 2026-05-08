import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, city, state, bio, professionalDoc } = body

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(bio !== undefined && { bio }),
        ...(professionalDoc !== undefined && { professionalDoc }),
      }
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      registrationStatus: user.registrationStatus,
      city: user.city,
      state: user.state,
      professionalDoc: user.professionalDoc,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      companyName: user.companyName,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
