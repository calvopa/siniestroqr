import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/insurer-auth'
import { scopedSiniestroWhere } from '@/lib/scoping'
import { checkRateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get('authorization'))
  if (!auth.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(auth.apiKeyId)
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const cursor = searchParams.get('cursor')
  const take = 20

  const where: any = { ...scopedSiniestroWhere(auth.insurerId) }
  if (status) where.estado = status
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const siniestros = await prisma.siniestro.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, estado: true, createdAt: true, fechaHora: true,
      conductorNombre: true, conductorDni: true, patenteConductor: true, companiaSeguros: true,
      token: { include: { vehiculo: { select: { patente: true } } } },
    },
  })

  const hasMore = siniestros.length > take
  const items = hasMore ? siniestros.slice(0, take) : siniestros
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return NextResponse.json({
    data: items,
    pagination: { cursor: nextCursor, hasMore },
  })
}
