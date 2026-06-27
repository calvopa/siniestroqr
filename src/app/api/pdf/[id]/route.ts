import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSiniestroPDF } from '@/lib/pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const siniestro = await prisma.siniestro.findUnique({
      where: { id: params.id },
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

    const pdfData = {
      id: siniestro.id,
      conductorNombre: siniestro.conductorNombre,
      conductorDni: siniestro.conductorDni,
      conductorTel: siniestro.conductorTel,
      conductorEmail: siniestro.conductorEmail,
      patenteConductor: siniestro.patenteConductor,
      companiaSeguros: siniestro.companiaSeguros,
      nroPoliza: siniestro.nroPoliza,
      descripcion: siniestro.descripcion,
      fechaHora: siniestro.fechaHora,
      latitud: siniestro.latitud,
      longitud: siniestro.longitud,
      vehiculo: {
        patente: siniestro.token.vehiculo.patente,
        marca: siniestro.token.vehiculo.marca,
        modelo: siniestro.token.vehiculo.modelo,
        anio: siniestro.token.vehiculo.anio,
      },
      broker: {
        nombre: siniestro.broker.nombre,
        email: siniestro.broker.email,
        telefono: siniestro.broker.telefono,
      },
      hashDocumento: siniestro.hashDocumento,
    }

    const pdfBytes = await generateSiniestroPDF(pdfData)

    const filename = `siniestro-${siniestro.id.slice(-8)}.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBytes.length),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}
