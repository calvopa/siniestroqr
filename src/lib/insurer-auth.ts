import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function validateApiKey(authHeader: string | null): Promise<{
  valid: false
} | {
  valid: true
  insurerId: string
  apiKeyId: string
}> {
  if (!authHeader?.startsWith('Bearer ')) return { valid: false }
  const key = authHeader.slice(7)
  const hashed = hashApiKey(key)
  const record = await prisma.insurerApiKey.findUnique({
    where: { hashedKey: hashed },
  })
  if (!record || record.revoked) return { valid: false }
  await prisma.insurerApiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  })
  return { valid: true, insurerId: record.insurerId, apiKeyId: record.id }
}
