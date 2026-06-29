'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface SiniestroDetailProps {
  siniestro: {
    id: string
    conductorNombre: string
    conductorDni: string
    conductorTel: string
    conductorEmail: string | null
    patenteConductor: string
    companiaSeguros: string
    nroPoliza: string | null
    fechaHora: Date
    latitud: number | null
    longitud: number | null
    descripcion: string | null
    ipOrigen: string | null
    userAgent: string | null
    hashDocumento: string | null
    estado: string
    token: {
      token: string
      vehiculo: {
        patente: string
        marca: string
        modelo: string
        anio: number
      }
    }
    broker: {
      nombre: string
      email: string
      telefono: string | null
    }
  }
}

const STATES = ['PENDIENTE', 'EN_PROCESO', 'PROCESADO', 'CERRADO']

const estadoBadge: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  PROCESADO: 'bg-green-100 text-green-700',
  CERRADO: 'bg-gray-100 text-gray-600',
}

export default function SiniestroDetail({ siniestro }: SiniestroDetailProps) {
  const [estado, setEstado] = useState(siniestro.estado)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpdateEstado = async (newEstado: string) => {
    setUpdating(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/siniestro/${siniestro.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      })
      if (res.ok) {
        setEstado(newEstado)
        setMessage({ type: 'success', text: 'Estado actualizado correctamente' })
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar el estado' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadPDF = () => {
    window.open(`/api/pdf/${siniestro.id}`, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Status and actions */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Estado actual</p>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${estadoBadge[estado]}`}>
              {estado}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATES.filter((s) => s !== estado).map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateEstado(s)}
                disabled={updating}
                className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium text-gray-600 dark:text-gray-300"
              >
                Marcar {s.replace('_', ' ')}
              </button>
            ))}
            <Button onClick={handleDownloadPDF} variant="primary" size="sm">
              <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </Button>
          </div>
        </div>
        {message && (
          <div
            className={`mt-3 text-xs p-2 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </Card>

      {/* Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Vehículo Asegurado
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Patente</p>
              <p className="font-bold text-primary dark:text-blue-300 font-mono text-lg">{siniestro.token.vehiculo.patente}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Vehículo</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {siniestro.token.vehiculo.marca} {siniestro.token.vehiculo.modelo} {siniestro.token.vehiculo.anio}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">Aseguradora</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{siniestro.broker.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{siniestro.broker.email}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Conductor Tercero
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Nombre</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{siniestro.conductorNombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">DNI</p>
              <p className="font-medium dark:text-gray-200">{siniestro.conductorDni}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Teléfono</p>
                <a href={`tel:${siniestro.conductorTel}`} className="text-accent text-sm hover:underline">
                  {siniestro.conductorTel}
                </a>
              </div>
              {siniestro.conductorEmail && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                  <a href={`mailto:${siniestro.conductorEmail}`} className="text-accent text-sm hover:underline break-all">
                    {siniestro.conductorEmail}
                  </a>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">Patente de su vehículo</p>
              <p className="font-bold font-mono text-primary dark:text-blue-300">{siniestro.patenteConductor}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insurance */}
      <Card>
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Seguro del Tercero
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Compañía</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">{siniestro.companiaSeguros}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Nro. de póliza</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">{siniestro.nroPoliza || '—'}</p>
          </div>
        </div>
      </Card>

      {/* Description */}
      {siniestro.descripcion && (
        <Card>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Descripción del siniestro
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{siniestro.descripcion}</p>
        </Card>
      )}

      {/* Location and metadata */}
      <Card>
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Metadata técnica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Fecha y hora</p>
            <p className="text-sm font-medium dark:text-gray-200">
              {new Date(siniestro.fechaHora).toLocaleString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {siniestro.latitud && siniestro.longitud && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Ubicación GPS</p>
              <a
                href={`https://maps.google.com/?q=${siniestro.latitud},${siniestro.longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-sm hover:underline"
              >
                {siniestro.latitud.toFixed(4)}, {siniestro.longitud.toFixed(4)} →
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">IP origen</p>
            <p className="text-sm font-mono dark:text-gray-300">{siniestro.ipOrigen || '—'}</p>
          </div>
          {siniestro.hashDocumento && (
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Hash SHA-256</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {siniestro.hashDocumento}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
