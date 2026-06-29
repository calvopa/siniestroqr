import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.insurerId || session.user.role !== 'ASEGURADORA') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar que la key pertenece a esta aseguradora
  const key = await prisma.insurerApiKey.findFirst({
    where: { id: params.id, insurerId: session.user.insurerId },
  })

  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.insurerApiKey.update({
    where: { id: params.id },
    data: { revoked: true },
  })

  return NextResponse.json({ ok: true })
}
