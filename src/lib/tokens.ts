import { prisma } from './prisma'

export async function validateToken(token: string) {
  try {
    const qrToken = await prisma.qRToken.findUnique({
      where: { token },
      include: {
        vehiculo: {
          include: {
            broker: {
              select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
      },
    })

    if (!qrToken) {
      return { valid: false, error: 'Token no encontrado' }
    }

    if (!qrToken.activo) {
      return { valid: false, error: 'Este QR ya no está activo' }
    }

    return {
      valid: true,
      tokenId: qrToken.id,
      vehiculo: {
        patente: qrToken.vehiculo.patente,
        marca: qrToken.vehiculo.marca,
        modelo: qrToken.vehiculo.modelo,
        anio: qrToken.vehiculo.anio,
      },
      broker: {
        id: qrToken.vehiculo.broker.id,
        nombre: qrToken.vehiculo.broker.nombre,
        email: qrToken.vehiculo.broker.email,
        telefono: qrToken.vehiculo.broker.telefono,
      },
    }
  } catch (error) {
    console.error('Error validating token:', error)
    return { valid: false, error: 'Error al validar el token' }
  }
}

export async function incrementTokenUso(token: string) {
  try {
    await prisma.qRToken.update({
      where: { token },
      data: { usos: { increment: 1 } },
    })
  } catch (error) {
    console.error('Error incrementing token usage:', error)
  }
}
