import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const siniestro = await prisma.siniestro.findUnique({
      where: {
        id: params.id,
        brokerId: session.user.id,
      },
      include: {
        token: {
          include: {
            vehiculo: true,
          },
        },
        broker: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
          },
        },
      },
    })

    if (!siniestro) {
      return NextResponse.json({ error: 'Siniestro no encontrado' }, { status: 404 })
    }

    return NextResponse.json(siniestro)
  } catch (error) {
    console.error('Error fetching siniestro:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { estado } = body

    const validStates = ['PENDIENTE', 'EN_PROCESO', 'PROCESADO', 'CERRADO']
    if (!validStates.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const siniestro = await prisma.siniestro.update({
      where: {
        id: params.id,
        brokerId: session.user.id,
      },
      data: { estado },
    })

    return NextResponse.json(siniestro)
  } catch (error) {
    console.error('Error updating siniestro:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
