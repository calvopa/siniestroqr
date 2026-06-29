'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Siniestro {
  id: string
  conductorNombre: string
  conductorDni: string
  patenteConductor: string
  companiaSeguros: string
  estado: string
  fechaHora: Date
  token: {
    vehiculo: {
      patente: string
      marca: string
      modelo: string
    }
  }
}

interface SiniestroTableProps {
  siniestros: Siniestro[]
}

const estadoBadge: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700 border border-amber-200',
  EN_PROCESO: 'bg-blue-100 text-blue-700 border border-blue-200',
  PROCESADO: 'bg-green-100 text-green-700 border border-green-200',
  CERRADO: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const estadoLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  PROCESADO: 'Procesado',
  CERRADO: 'Cerrado',
}

export default function SiniestroTable({ siniestros }: SiniestroTableProps) {
  const [filter, setFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  const filtered = siniestros.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.estado === filter
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      s.conductorNombre.toLowerCase().includes(searchLower) ||
      s.conductorDni.includes(search) ||
      s.patenteConductor.toLowerCase().includes(searchLower) ||
      s.token.vehiculo.patente.toLowerCase().includes(searchLower)
    return matchesFilter && matchesSearch
  })

  if (siniestros.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-400 dark:text-gray-500 font-medium">No hay siniestros registrados aún</p>
        <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Los siniestros aparecerán aquí cuando conductores escaneen tus QRs</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DNI o patente..."
          className="flex-1 min-w-48 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
        />
        <div className="flex gap-1 flex-wrap">
          {['ALL', 'PENDIENTE', 'EN_PROCESO', 'PROCESADO', 'CERRADO'].map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filter === state
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {state === 'ALL' ? 'Todos' : estadoLabel[state]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-10">No hay resultados para esta búsqueda</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-3 text-left font-medium">Conductor</th>
                <th className="px-6 py-3 text-left font-medium hidden md:table-cell">Patentes</th>
                <th className="px-6 py-3 text-left font-medium hidden lg:table-cell">Seguro</th>
                <th className="px-6 py-3 text-left font-medium">Fecha</th>
                <th className="px-6 py-3 text-left font-medium">Estado</th>
                <th className="px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{s.conductorNombre}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">DNI {s.conductorDni}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-300">
                      Mi: {s.token.vehiculo.patente}
                    </p>
                    <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
                      3ro: {s.patenteConductor}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-gray-600 dark:text-gray-300">{s.companiaSeguros}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {new Date(s.fechaHora).toLocaleDateString('es-AR')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(s.fechaHora).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${estadoBadge[s.estado] || estadoBadge.PENDIENTE}`}>
                      {estadoLabel[s.estado] || s.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/broker/siniestro/${s.id}`}
                      className="inline-flex items-center gap-1 text-accent hover:text-primary dark:hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                      Ver
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          Mostrando {filtered.length} de {siniestros.length} siniestros
        </div>
      )}
    </div>
  )
}
