import { NextRequest, NextResponse } from 'next/server'
import { verifyPhotoSignature } from '@/lib/signed-url'
import { validateApiKey } from '@/lib/insurer-auth'
import { scopedSiniestroWhere } from '@/lib/scoping'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const PHOTOS_DIR = process.env.PHOTOS_DIR || '/data/photos'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = req.nextUrl
  const exp = searchParams.get('exp')
  const sig = searchParams.get('sig')

  // Accept signed URL or valid API key
  let insurerId: string | null = null

  if (exp && sig) {
    if (!verifyPhotoSignature(params.id, exp, sig)) {
      return NextResponse.json({ error: 'Invalid or expired signature' }, { status: 401 })
    }
    // Signed URL — still need to find the photo's insurer for scope
    const photo = await prisma.siniestroPhoto.findUnique({
      where: { id: params.id },
      include: { siniestro: { select: { insurerId: true } } },
    })
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    insurerId = photo.siniestro.insurerId
  } else {
    const auth = await validateApiKey(req.headers.get('authorization'))
    if (!auth.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    insurerId = auth.insurerId
  }

  const photo = await prisma.siniestroPhoto.findFirst({
    where: {
      id: params.id,
      siniestro: scopedSiniestroWhere(insurerId!),
    },
  })

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const filePath = path.join(PHOTOS_DIR, photo.storageKey)
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: { 'Content-Type': photo.mimeType, 'Cache-Control': 'private, max-age=3600' },
  })
}
