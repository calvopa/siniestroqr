import { Prisma } from '@prisma/client'

export function scopedSiniestroWhere(insurerId: string): Prisma.SiniestroWhereInput {
  return { insurerId }
}

export async function auditAccess(params: {
  prisma: any
  insurerId: string
  siniestroId: string
  via: 'PORTAL' | 'API'
  userId?: string
  apiKeyId?: string
}) {
  await params.prisma.insurerAccessLog.create({
    data: {
      insurerId: params.insurerId,
      siniestroId: params.siniestroId,
      via: params.via,
      userId: params.userId,
      apiKeyId: params.apiKeyId,
    },
  })
}
