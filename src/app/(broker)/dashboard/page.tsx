import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SiniestroTable from '@/components/broker/SiniestroTable'
import DashboardHeader from '@/components/broker/DashboardHeader'
import QRGallery from '@/components/broker/QRGallery'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/login')
  }

  const brokerId = session.user.id

  // Fetch siniestros for this broker
  const siniestros = await prisma.siniestro.findMany({
    where: { brokerId },
    include: {
      token: {
        include: {
          vehiculo: {
            select: { patente: true, marca: true, modelo: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch vehicles for QR management
  const vehiculos = await prisma.vehiculo.findMany({
    where: { brokerId },
    include: {
      qrTokens: {
        where: { activo: true },
        select: { token: true, usos: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Stats
  const totalSiniestros = siniestros.length
  const pendientes = siniestros.filter((s) => s.estado === 'PENDIENTE').length
  const procesados = siniestros.filter((s) => s.estado === 'PROCESADO').length
  const enProceso = siniestros.filter((s) => s.estado === 'EN_PROCESO').length

  const vehiculosForGallery = vehiculos.map(v => ({
    id: v.id,
    patente: v.patente,
    marca: v.marca,
    modelo: v.modelo,
    anio: v.anio,
    token: v.qrTokens[0]?.token ?? null,
    qrUrl: v.qrTokens[0] ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/siniestro/${v.qrTokens[0].token}` : null,
    usos: v.qrTokens[0]?.usos ?? 0,
  }))

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-900">
      <DashboardHeader brokerNombre={session.user.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-3xl font-black text-primary dark:text-blue-300 mt-1">{totalSiniestros}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Siniestros registrados</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-black text-amber-500 mt-1">{pendientes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sin procesar</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">En proceso</p>
            <p className="text-3xl font-black text-blue-500 mt-1">{enProceso}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En seguimiento</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Procesados</p>
            <p className="text-3xl font-black text-green-500 mt-1">{procesados}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Finalizados</p>
          </div>
        </div>

        {/* QR Gallery section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary dark:text-blue-300">Mis Vehículos y QRs</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">{vehiculos.length} registrados</span>
          </div>
          <QRGallery vehicles={vehiculosForGallery} />
        </div>

        {/* Siniestros table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-primary dark:text-blue-300">Siniestros Recientes</h2>
          </div>
          <SiniestroTable siniestros={siniestros} />
        </div>
      </div>
    </div>
  )
}
