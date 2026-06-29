import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scopedSiniestroWhere, auditAccess } from '@/lib/scoping'
import AseguradoraHeader from '@/components/aseguradora/AseguradoraHeader'
import PhotoGallery from '@/components/aseguradora/PhotoGallery'
import Card from '@/components/ui/Card'

const SiniestroMap = dynamic(() => import('@/components/aseguradora/SiniestroMap'), { ssr: false })

export default async function SiniestroDetailAseguradora({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.insurerId || session.user.role !== 'ASEGURADORA') redirect('/login')

  const insurerId = session.user.insurerId

  const siniestro = await prisma.siniestro.findFirst({
    where: { id: params.id, ...scopedSiniestroWhere(insurerId) },
    include: {
      token: { include: { vehiculo: true } },
      broker: { select: { nombre: true, email: true } },
      photos: true,
    },
  })

  if (!siniestro) notFound()

  // Audit log
  await auditAccess({ prisma, insurerId, siniestroId: siniestro.id, via: 'PORTAL', userId: session.user.id })

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-900">
      <AseguradoraHeader />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/aseguradora" className="text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary dark:text-white">Detalle del Siniestro</h1>
            <p className="text-xs text-gray-400 font-mono">{siniestro.id}</p>
          </div>
          <div className="ml-auto">
            <a
              href={`/api/pdf/${siniestro.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {/* Estado */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Estado</p>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                  siniestro.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                  siniestro.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-700' :
                  siniestro.estado === 'PROCESADO' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{siniestro.estado}</span>
              </div>
              <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                <p>{new Date(siniestro.fechaHora).toLocaleDateString('es-AR')}</p>
                <p>{new Date(siniestro.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </Card>

          {/* Vehículos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Vehículo Asegurado</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Patente</p>
              <p className="font-black font-mono text-lg text-primary dark:text-blue-300">{siniestro.token.vehiculo.patente}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{siniestro.token.vehiculo.marca} {siniestro.token.vehiculo.modelo} {siniestro.token.vehiculo.anio}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">Broker</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{siniestro.broker.nombre}</p>
              </div>
            </Card>
            <Card>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Conductor Tercero</h3>
              <p className="font-bold text-gray-900 dark:text-white">{siniestro.conductorNombre}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">DNI {siniestro.conductorDni}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Teléfono</p>
                  <a href={`tel:${siniestro.conductorTel}`} className="text-accent text-sm hover:underline">{siniestro.conductorTel}</a>
                </div>
                {siniestro.conductorEmail && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                    <a href={`mailto:${siniestro.conductorEmail}`} className="text-accent text-sm hover:underline break-all">{siniestro.conductorEmail}</a>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">Patente</p>
                <p className="font-bold font-mono text-primary dark:text-blue-300">{siniestro.patenteConductor}</p>
              </div>
            </Card>
          </div>

          {/* Seguro */}
          <Card>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Seguro del Tercero</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Compañía</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{siniestro.companiaSeguros}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Póliza</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{siniestro.nroPoliza || '—'}</p>
              </div>
            </div>
          </Card>

          {/* Descripción */}
          {siniestro.descripcion && (
            <Card>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Descripción del siniestro</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{siniestro.descripcion}</p>
            </Card>
          )}

          {/* Mapa */}
          {siniestro.latitud && siniestro.longitud && (
            <Card>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Geolocalización</h3>
              <SiniestroMap lat={siniestro.latitud} lng={siniestro.longitud} accuracy={siniestro.geoAccuracy} />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {siniestro.latitud.toFixed(6)}, {siniestro.longitud.toFixed(6)}
                {siniestro.geoAccuracy && ` · Precisión: ±${siniestro.geoAccuracy.toFixed(0)}m`}
              </p>
            </Card>
          )}

          {/* Fotos */}
          <Card>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Fotos ({siniestro.photos.length})
            </h3>
            <PhotoGallery
              siniestroId={siniestro.id}
              photos={siniestro.photos.map((p) => ({ id: p.id, mimeType: p.mimeType, takenAt: p.takenAt?.toISOString() ?? null }))}
            />
          </Card>

          {/* Cadena de custodia */}
          <Card>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Cadena de Custodia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">IP origen</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{siniestro.ipOrigen || '—'}</p>
              </div>
              {siniestro.hashDocumento && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Hash SHA-256</p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">{siniestro.hashDocumento}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
