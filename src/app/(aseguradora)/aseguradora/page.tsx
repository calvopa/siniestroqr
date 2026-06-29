import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scopedSiniestroWhere } from '@/lib/scoping'
import AseguradoraHeader from '@/components/aseguradora/AseguradoraHeader'
import SiniestroTableInsurer from '@/components/aseguradora/SiniestroTableInsurer'

export default async function AseguradoraDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.insurerId || session.user.role !== 'ASEGURADORA') redirect('/login')

  const insurerId = session.user.insurerId

  const insurer = await prisma.insurer.findUnique({ where: { id: insurerId } })

  const siniestros = await prisma.siniestro.findMany({
    where: scopedSiniestroWhere(insurerId),
    include: {
      token: { include: { vehiculo: { select: { patente: true, marca: true, modelo: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const total = siniestros.length
  const pendientes = siniestros.filter((s) => s.estado === 'PENDIENTE').length
  const enProceso = siniestros.filter((s) => s.estado === 'EN_PROCESO').length
  const procesados = siniestros.filter((s) => s.estado === 'PROCESADO').length

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-900">
      <AseguradoraHeader />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Insurer name */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-primary dark:text-white">{insurer?.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Panel de siniestros — solo lectura</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: total, color: 'text-primary dark:text-white' },
            { label: 'Pendientes', value: pendientes, color: 'text-amber-500' },
            { label: 'En proceso', value: enProceso, color: 'text-blue-500' },
            { label: 'Procesados', value: procesados, color: 'text-green-500' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-3xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-primary dark:text-white">Siniestros</h2>
          </div>
          <SiniestroTableInsurer siniestros={siniestros as any} />
        </div>
      </div>
    </div>
  )
}
