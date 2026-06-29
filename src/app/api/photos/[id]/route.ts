import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const PHOTOS_DIR = process.env.PHOTOS_DIR || '/data/photos'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

  const photo = await prisma.siniestroPhoto.findUnique({
    where: { id: params.id },
    include: { siniestro: { select: { brokerId: true, insurerId: true } } },
  })

  if (!photo) return new NextResponse('Not found', { status: 404 })

  // Scope check
  const isBroker = session.user.role !== 'ASEGURADORA' && photo.siniestro.brokerId === session.user.id
  const isInsurer = session.user.role === 'ASEGURADORA' && photo.siniestro.insurerId === session.user.insurerId
  if (!isBroker && !isInsurer) return new NextResponse('Not found', { status: 404 })

  const filePath = path.join(PHOTOS_DIR, photo.storageKey)
  if (!fs.existsSync(filePath)) return new NextResponse('Not found', { status: 404 })

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': photo.mimeType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
