import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/insurer-auth'
import { scopedSiniestroWhere, auditAccess } from '@/lib/scoping'
import { checkRateLimit } from '@/lib/rate-limit'
import { signPhotoUrl } from '@/lib/signed-url'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await validateApiKey(req.headers.get('authorization'))
  if (!auth.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(auth.apiKeyId)
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const siniestro = await prisma.siniestro.findFirst({
    where: { id: params.id, ...scopedSiniestroWhere(auth.insurerId) },
    include: {
      token: { include: { vehiculo: { select: { patente: true, marca: true, modelo: true } } } },
      photos: { select: { id: true, mimeType: true, takenAt: true, latitude: true, longitude: true } },
      broker: { select: { nombre: true } },
    },
  })

  if (!siniestro) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Audit log
  await auditAccess({ prisma, insurerId: auth.insurerId, siniestroId: siniestro.id, via: 'API', apiKeyId: auth.apiKeyId })

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: siniestro.id,
    status: siniestro.estado,
    createdAt: siniestro.createdAt,
    parties: [
      {
        role: 'conductor_tercero',
        name: siniestro.conductorNombre,
        dni: siniestro.conductorDni,
        phone: siniestro.conductorTel,
        plate: siniestro.patenteConductor,
        insurer: siniestro.companiaSeguros,
        policyNumber: siniestro.nroPoliza,
        description: siniestro.descripcion,
        location: siniestro.latitud && siniestro.longitud ? {
          lat: siniestro.latitud,
          lng: siniestro.longitud,
          accuracy: siniestro.geoAccuracy,
          capturedAt: siniestro.geoCapturedAt,
        } : null,
      },
    ],
    insuredVehicle: {
      plate: siniestro.token.vehiculo.patente,
      make: siniestro.token.vehiculo.marca,
      model: siniestro.token.vehiculo.modelo,
      broker: siniestro.broker.nombre,
    },
    photos: siniestro.photos.map((p) => ({
      id: p.id,
      url: signPhotoUrl(p.id, baseUrl),
      mimeType: p.mimeType,
      takenAt: p.takenAt,
    })),
    chainOfCustody: {
      sessionId: siniestro.tokenId,
      hash: siniestro.hashDocumento,
    },
  })
}
