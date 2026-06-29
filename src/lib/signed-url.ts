import crypto from 'crypto'

const SECRET = process.env.PHOTO_SIGNING_SECRET || 'dev-secret-change-in-prod'
const TTL_SECONDS = 3600 // 1 hour

export function signPhotoUrl(photoId: string, baseUrl: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(`${photoId}:${exp}`)
    .digest('hex')
  return `${baseUrl}/api/v1/photos/${photoId}?exp=${exp}&sig=${sig}`
}

export function verifyPhotoSignature(photoId: string, exp: string, sig: string): boolean {
  const now = Math.floor(Date.now() / 1000)
  if (now > parseInt(exp, 10)) return false
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${photoId}:${exp}`)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
}
