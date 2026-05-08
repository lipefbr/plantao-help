import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface ActivityItem {
  id: string
  type: 'shift_published' | 'shift_bought' | 'shift_cancelled' | 'new_rating' | 'registration_approved' | 'contest_opening'
  title: string
  description: string
  createdAt: Date
  icon: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, city: true, state: true, registrationStatus: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const activities: ActivityItem[] = []

    // 1. Shifts published by the user
    const publishedShifts = await db.shift.findMany({
      where: { sellerId: id },
      select: { id: true, title: true, city: true, state: true, value: true, createdAt: true, status: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    for (const shift of publishedShifts) {
      activities.push({
        id: `pub-${shift.id}`,
        type: 'shift_published',
        title: 'Plantão publicado',
        description: `${shift.title} — ${shift.city}/${shift.state}`,
        createdAt: shift.createdAt,
        icon: '📋',
      })
    }

    // 2. Shifts bought by the user (as buyer)
    const boughtShifts = await db.shift.findMany({
      where: { buyerId: id, status: 'SOLD' },
      select: { id: true, title: true, city: true, state: true, value: true, createdAt: true, seller: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    for (const shift of boughtShifts) {
      activities.push({
        id: `bought-${shift.id}`,
        type: 'shift_bought',
        title: 'Plantão comprado',
        description: `${shift.title} — ${shift.city}/${shift.state}`,
        createdAt: shift.createdAt,
        icon: '🛒',
      })
    }

    // 3. Shifts cancelled
    const cancelledShifts = await db.shift.findMany({
      where: {
        OR: [{ sellerId: id }, { buyerId: id }],
        status: 'CANCELLED',
      },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    for (const shift of cancelledShifts) {
      activities.push({
        id: `cancel-${shift.id}`,
        type: 'shift_cancelled',
        title: 'Plantão cancelado',
        description: `${shift.title}`,
        createdAt: shift.updatedAt,
        icon: '❌',
      })
    }

    // 4. Ratings received
    const ratingsReceived = await db.rating.findMany({
      where: { receiverId: id },
      select: { id: true, stars: true, comment: true, createdAt: true, shift: { select: { title: true } }, rater: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    for (const rating of ratingsReceived) {
      activities.push({
        id: `rating-${rating.id}`,
        type: 'new_rating',
        title: 'Nova avaliação recebida',
        description: `${rating.stars} estrela${rating.stars > 1 ? 's' : ''} de ${rating.rater.name} — ${rating.shift.title}`,
        createdAt: rating.createdAt,
        icon: '⭐',
      })
    }

    // 5. Registration approved notification
    if (user.registrationStatus === 'APPROVED') {
      // Check if there's a notification about approval
      const approvalNotification = await db.notification.findFirst({
        where: {
          userId: id,
          type: 'SUCCESS',
          title: { contains: 'aprova' },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (approvalNotification) {
        activities.push({
          id: `approved-${approvalNotification.id}`,
          type: 'registration_approved',
          title: 'Cadastro aprovado',
          description: 'Seu cadastro foi aprovado pela administração',
          createdAt: approvalNotification.createdAt,
          icon: '✅',
        })
      } else {
        // Fallback: use user creation date if no notification found
        activities.push({
          id: `approved-${id}`,
          type: 'registration_approved',
          title: 'Cadastro aprovado',
          description: 'Seu cadastro foi aprovado pela administração',
          createdAt: user.createdAt,
          icon: '✅',
        })
      }
    }

    // 6. Recent contests for user's professional type and region
    if (user.role !== 'ADMIN') {
      const contestWhere: Record<string, unknown> = {
        status: 'ACTIVE',
        professionalType: user.role,
      }
      if (user.state) contestWhere.state = user.state

      const recentContests = await db.contest.findMany({
        where: contestWhere,
        select: { id: true, title: true, city: true, state: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      for (const contest of recentContests) {
        activities.push({
          id: `contest-${contest.id}`,
          type: 'contest_opening',
          title: 'Concurso aberto',
          description: `${contest.title} — ${contest.city}/${contest.state}`,
          createdAt: contest.createdAt,
          icon: '🏛️',
        })
      }
    }

    // Sort all activities by createdAt descending and limit to 10
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const limitedActivities = activities.slice(0, 10).map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }))

    return NextResponse.json(limitedActivities)
  } catch (error) {
    console.error('Get user activity error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
}
