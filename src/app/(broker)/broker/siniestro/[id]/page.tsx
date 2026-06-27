import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SiniestroDetail from '@/components/broker/SiniestroDetail'
import DashboardHeader from '@/components/broker/DashboardHeader'

export default async function SiniestroDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/login')
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
    notFound()
  }

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader brokerNombre={session.user.name || ''} />

      <div className="max-w-4xl mx-auto px-4 py-6">
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
            <h1 className="text-xl font-bold text-primary">Detalle del Siniestro</h1>
            <p className="text-xs text-gray-400 font-mono">{siniestro.id}</p>
          </div>
        </div>

        <SiniestroDetail siniestro={siniestro as any} />
      </div>
    </div>
  )
}
