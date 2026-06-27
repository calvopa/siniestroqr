import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SiniestroTable from '@/components/broker/SiniestroTable'
import DashboardHeader from '@/components/broker/DashboardHeader'

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

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader brokerNombre={session.user.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-3xl font-black text-primary mt-1">{totalSiniestros}</p>
            <p className="text-xs text-gray-500 mt-1">Siniestros registrados</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-black text-amber-500 mt-1">{pendientes}</p>
            <p className="text-xs text-gray-500 mt-1">Sin procesar</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">En proceso</p>
            <p className="text-3xl font-black text-blue-500 mt-1">{enProceso}</p>
            <p className="text-xs text-gray-500 mt-1">En seguimiento</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Procesados</p>
            <p className="text-3xl font-black text-green-500 mt-1">{procesados}</p>
            <p className="text-xs text-gray-500 mt-1">Finalizados</p>
          </div>
        </div>

        {/* Vehicles section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">Mis Vehículos</h2>
            <span className="text-xs text-gray-400">{vehiculos.length} registrados</span>
          </div>
          {vehiculos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No hay vehículos registrados</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehiculos.map((v) => (
                <a
                  key={v.id}
                  href={`/broker/qr/${v.id}`}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-accent hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="font-bold text-primary font-mono text-sm">{v.patente}</p>
                    <p className="text-xs text-gray-500">
                      {v.marca} {v.modelo} {v.anio}
                    </p>
                    {v.qrTokens[0] && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {v.qrTokens[0].usos} uso{v.qrTokens[0].usos !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.243m-6.243 0H9M6.93 7.071A2 2 0 005 9v1m5-5v-.01M9 4h6M6 20h12M8 16l4-4 4 4"
                    />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Siniestros table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-primary">Siniestros Recientes</h2>
          </div>
          <SiniestroTable siniestros={siniestros} />
        </div>
      </div>
    </div>
  )
}
