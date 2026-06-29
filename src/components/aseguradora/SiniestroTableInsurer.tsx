'use client'
import { useState } from 'react'
import Link from 'next/link'

interface SiniestroRow {
  id: string
  estado: string
  createdAt: string | Date
  fechaHora: string | Date
  conductorNombre: string
  patenteConductor: string
  companiaSeguros: string
  token: {
    vehiculo: {
      patente: string
      marca: string
      modelo: string
    }
  }
}

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  EN_PROCESO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESADO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function SiniestroTableInsurer({ siniestros }: { siniestros: SiniestroRow[] }) {
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')

  const filtered = siniestros.filter((s) => {
    const matchEstado = !estadoFilter || s.estado === estadoFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      s.conductorNombre.toLowerCase().includes(q) ||
      s.patenteConductor.toLowerCase().includes(q) ||
      s.token.vehiculo.patente.toLowerCase().includes(q) ||
      s.companiaSeguros.toLowerCase().includes(q)
    return matchEstado && matchSearch
  })

  return (
    <div className="p-6 pt-0">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 pt-4">
        <input
          type="text"
          placeholder="Buscar por nombre, patente, aseguradora..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="input-field sm:w-40"
        >
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="PROCESADO">Procesado</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No se encontraron siniestros</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-left">
                <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Conductor Tercero</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">Aseguradora</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                      {new Date(s.fechaHora).toLocaleDateString('es-AR')}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">
                      {new Date(s.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-bold font-mono text-primary dark:text-blue-300">{s.token.vehiculo.patente}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{s.token.vehiculo.marca} {s.token.vehiculo.modelo}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300">{s.conductorNombre}</p>
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500">{s.patenteConductor}</p>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{s.companiaSeguros}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ESTADO_COLORS[s.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/aseguradora/siniestro/${s.id}`}
                      className="text-accent hover:text-primary dark:hover:text-blue-300 font-medium text-xs transition-colors"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
