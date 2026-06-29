import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashApiKey } from '@/lib/insurer-auth'
import crypto from 'crypto'

function generateRawKey(): string {
  return 'sqr_' + crypto.randomBytes(32).toString('base64url')
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.insurerId || session.user.role !== 'ASEGURADORA') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const keys = await prisma.insurerApiKey.findMany({
    where: { insurerId: session.user.insurerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
      revoked: true,
      lastUsedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.insurerId || session.user.role !== 'ASEGURADORA') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { label } = await req.json().catch(() => ({}))

  const rawKey = generateRawKey()
  const hashedKey = hashApiKey(rawKey)

  const record = await prisma.insurerApiKey.create({
    data: {
      insurerId: session.user.insurerId,
      hashedKey,
      label: label?.trim() || null,
    },
    select: { id: true, label: true, createdAt: true },
  })

  // rawKey se devuelve UNA SOLA VEZ — no se puede recuperar después
  return NextResponse.json({ ...record, key: rawKey }, { status: 201 })
}
