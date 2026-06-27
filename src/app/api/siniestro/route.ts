import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken, incrementTokenUso } from '@/lib/tokens'
import { calculateHash } from '@/lib/pdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      token,
      conductorNombre,
      conductorDni,
      conductorTel,
      conductorEmail,
      patenteConductor,
      companiaSeguros,
      nroPoliza,
      descripcion,
      latitud,
      longitud,
    } = body

    // Validate required fields
    if (!token || !conductorNombre || !conductorDni || !conductorTel || !patenteConductor || !companiaSeguros) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validate token
    const tokenData = await validateToken(token)
    if (!tokenData.valid || !tokenData.tokenId || !tokenData.broker) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o inactivo' },
        { status: 400 }
      )
    }

    // Get IP and user agent
    const ipOrigen =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Calculate hash of submitted data
    const hashData = {
      token,
      conductorNombre,
      conductorDni,
      conductorTel,
      patenteConductor,
      companiaSeguros,
      timestamp: new Date().toISOString(),
    }
    const hashDocumento = calculateHash(hashData)

    // Create siniestro
    const siniestro = await prisma.siniestro.create({
      data: {
        tokenId: tokenData.tokenId,
        brokerId: tokenData.broker.id,
        conductorNombre,
        conductorDni,
        conductorTel,
        conductorEmail: conductorEmail || null,
        patenteConductor,
        companiaSeguros,
        nroPoliza: nroPoliza || null,
        descripcion: descripcion || null,
        latitud: latitud ? parseFloat(String(latitud)) : null,
        longitud: longitud ? parseFloat(String(longitud)) : null,
        ipOrigen,
        userAgent,
        hashDocumento,
        estado: 'PENDIENTE',
      },
    })

    // Increment token usage
    await incrementTokenUso(token)

    return NextResponse.json({
      success: true,
      siniestroId: siniestro.id,
      hashDocumento,
    })
  } catch (error) {
    console.error('Error creating siniestro:', error)
    return NextResponse.json(
      { success: false, error: 'Error al registrar el siniestro' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not supported' }, { status: 405 })
}
