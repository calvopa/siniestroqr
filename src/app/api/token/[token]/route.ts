import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/tokens'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token no proporcionado' }, { status: 400 })
    }

    const result = await validateToken(token)

    if (!result.valid) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in token validation:', error)
    return NextResponse.json(
      { valid: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
