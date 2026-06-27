import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRDisplay from '@/components/broker/QRDisplay'
import DashboardHeader from '@/components/broker/DashboardHeader'

export default async function QRPage({ params }: { params: { vehiculoId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/login')
  }

  const vehiculo = await prisma.vehiculo.findFirst({
    where: {
      id: params.vehiculoId,
      brokerId: session.user.id,
    },
    include: {
      qrTokens: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!vehiculo) {
    notFound()
  }

  // If no active token, create one
  let activeToken = vehiculo.qrTokens[0]
  if (!activeToken) {
    activeToken = await prisma.qRToken.create({
      data: {
        vehiculoId: vehiculo.id,
        activo: true,
      },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const qrUrl = `${baseUrl}/siniestro/${activeToken.token}`

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader brokerNombre={session.user.name || ''} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Código QR del Vehículo</h1>
            <p className="text-xs text-gray-400 font-mono">
              {vehiculo.patente} — {vehiculo.marca} {vehiculo.modelo}
            </p>
          </div>
        </div>

        <QRDisplay
          vehiculo={{
            id: vehiculo.id,
            patente: vehiculo.patente,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            anio: vehiculo.anio,
          }}
          token={activeToken.token}
          qrUrl={qrUrl}
          usos={activeToken.usos}
        />
      </div>
    </div>
  )
}
