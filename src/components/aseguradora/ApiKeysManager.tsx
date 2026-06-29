'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface ApiKey {
  id: string
  label: string | null
  revoked: boolean
  lastUsedAt: string | null
  createdAt: string
}

interface NewKey extends ApiKey {
  key: string
}

export default function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [label, setLabel] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newKey, setNewKey] = useState<NewKey | null>(null)
  const [copied, setCopied] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    const res = await fetch('/api/insurer/api-keys')
    if (res.ok) setKeys(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/insurer/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      if (res.ok) {
        const data: NewKey = await res.json()
        setNewKey(data)
        setLabel('')
        setShowForm(false)
        fetchKeys()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('¿Revocar esta API key? Dejará de funcionar inmediatamente.')) return
    setRevoking(id)
    try {
      await fetch(`/api/insurer/api-keys/${id}`, { method: 'DELETE' })
      fetchKeys()
    } finally {
      setRevoking(null)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Nueva key generada — mostrar solo una vez */}
      {newKey && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">API Key creada</p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                ⚠️ Guardala ahora. No la vamos a volver a mostrar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2.5 font-mono text-gray-800 dark:text-gray-200 break-all">
              {newKey.key}
            </code>
            <button
              onClick={() => handleCopy(newKey.key)}
              className="flex-shrink-0 p-2.5 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
              title="Copiar"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Usala como: <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">Authorization: Bearer {newKey.key.slice(0, 20)}...</code>
          </p>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            Entendido, ya la guardé
          </button>
        </div>
      )}

      {/* Formulario nueva key */}
      {showForm ? (
        <Card>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Nueva API Key</h3>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Etiqueta (ej: Producción, Testing...)"
              className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={creating}>
              {creating ? 'Creando...' : 'Crear'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </form>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva API Key
          </Button>
        </div>
      )}

      {/* Lista de keys */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay API keys todavía</p>
            <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Creá una para integrar tu sistema con SiniestroQR</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 text-left font-medium">Etiqueta</th>
                <th className="px-5 py-3 text-left font-medium hidden sm:table-cell">Creada</th>
                <th className="px-5 py-3 text-left font-medium hidden md:table-cell">Último uso</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{k.label || <span className="text-gray-400 italic">Sin etiqueta</span>}</p>
                    <p className="text-xs text-gray-400 font-mono">{k.id.slice(0, 12)}...</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-gray-500 dark:text-gray-400">
                    {new Date(k.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-xs text-gray-500 dark:text-gray-400">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      k.revoked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {k.revoked ? 'Revocada' : 'Activa'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!k.revoked && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        disabled={revoking === k.id}
                        className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors disabled:opacity-50"
                      >
                        {revoking === k.id ? 'Revocando...' : 'Revocar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Instrucciones de uso */}
      <Card className="bg-gray-50 dark:bg-gray-800/50 border-0">
        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Cómo usar la API</h3>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <p>Incluí la key en el header <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono">Authorization</code> de cada request:</p>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-3 overflow-x-auto text-xs leading-relaxed">{`# Listar siniestros (paginado)
curl ${process.env.NEXT_PUBLIC_URL || 'http://tu-servidor:3101'}/api/v1/claims \\
  -H "Authorization: Bearer sqr_tukey..."

# Filtrar por estado y fecha
curl "/api/v1/claims?status=PENDIENTE&from=2026-01-01" \\
  -H "Authorization: Bearer sqr_tukey..."

# Detalle de un siniestro
curl /api/v1/claims/cmq123... \\
  -H "Authorization: Bearer sqr_tukey..."`}</pre>
        </div>
      </Card>
    </div>
  )
}
