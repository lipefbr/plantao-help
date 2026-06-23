import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * In a production system this would send a recovery email with a token.
 * In this demo we simply verify the email exists and return a success
 * message (always 200 to avoid email enumeration).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Check if user exists (but don't reveal to client)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true },
    })

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: user
        ? `Se o email ${email} estiver cadastrado, você receberá instruções para redefinir sua senha.`
        : 'Se o email informado estiver cadastrado, você receberá instruções para redefinir sua senha.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
