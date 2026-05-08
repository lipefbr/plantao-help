import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

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
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar estas estatísticas' },
        { status: 403 }
      )
    }

    // Run all queries in parallel for better performance
    const [
      allUsers,
      allShifts,
      allContests,
      totalHospitals,
      totalLocations,
      totalRatings,
      recentPendingUsers,
      recentShifts,
    ] = await Promise.all([
      prisma.user.findMany({
        select: { role: true, registrationStatus: true },
      }),
      prisma.shift.findMany({
        select: { status: true, value: true },
      }),
      prisma.contest.findMany({
        select: { status: true },
      }),
      prisma.hospital.count(),
      prisma.location.count(),
      prisma.rating.count(),
      prisma.user.findMany({
        where: { registrationStatus: 'PENDING' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.shift.findMany({
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          hospital: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // User breakdown by role
    const totalUsers = allUsers.length
    const usersByRole = allUsers.reduce<Record<string, number>>((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    // Shift breakdown by status
    const totalShifts = allShifts.length
    const shiftsByStatus = allShifts.reduce<Record<string, number>>((acc, shift) => {
      acc[shift.status] = (acc[shift.status] || 0) + 1
      return acc
    }, {})

    // Contest breakdown by status
    const totalContests = allContests.length
    const contestsByStatus = allContests.reduce<Record<string, number>>((acc, contest) => {
      acc[contest.status] = (acc[contest.status] || 0) + 1
      return acc
    }, {})

    // Calculate average shift value
    const averageShiftValue =
      totalShifts > 0
        ? allShifts.reduce((sum, s) => sum + s.value, 0) / totalShifts
        : 0

    // Calculate revenue (sum of sold shift values)
    const revenue = allShifts
      .filter((s) => s.status === 'SOLD')
      .reduce((sum, s) => sum + s.value, 0)

    return NextResponse.json({
      totalUsers,
      usersByRole,
      totalShifts,
      shiftsByStatus,
      totalContests,
      contestsByStatus,
      totalHospitals,
      totalLocations,
      totalRatings,
      recentRegistrations: recentPendingUsers,
      recentShifts,
      averageShiftValue: Math.round(averageShiftValue * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
