import QRCode from 'qrcode'

export async function generateQRDataURL(token: string, baseUrl?: string): Promise<string> {
  const url = `${baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/siniestro/${token}`

  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0F2744',
      light: '#FFFFFF',
    },
    width: 300,
  })

  return qrDataUrl
}

export async function generateQRBuffer(token: string, baseUrl?: string): Promise<Buffer> {
  const url = `${baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/siniestro/${token}`

  const buffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    color: {
      dark: '#0F2744',
      light: '#FFFFFF',
    },
    width: 400,
  })

  return buffer
}

export function getQRUrl(token: string, baseUrl?: string): string {
  return `${baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/siniestro/${token}`
}
