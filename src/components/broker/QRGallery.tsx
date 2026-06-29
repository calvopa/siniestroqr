'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Vehicle {
  id: string
  patente: string
  marca: string
  modelo: string
  anio: number
  token: string | null
  qrUrl: string | null
  usos: number
}

export default function QRGallery({ vehicles }: { vehicles: Vehicle[] }) {
  const [qrImages, setQrImages] = useState<Record<string, string>>({})

  useEffect(() => {
    const generateAll = async () => {
      const QRCode = (await import('qrcode')).default
      const results: Record<string, string> = {}
      for (const v of vehicles) {
        if (!v.qrUrl) continue
        try {
          results[v.id] = await QRCode.toDataURL(v.qrUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            color: { dark: '#0F2744', light: '#FFFFFF' },
            width: 160,
          })
        } catch {}
      }
      setQrImages(results)
    }
    if (vehicles.length > 0) generateAll()
  }, [vehicles])

  if (vehicles.length === 0) {
    return (
      <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
        No hay vehículos registrados. Contactá al administrador para agregar vehículos.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((v) => (
        <div
          key={v.id}
          className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center gap-3 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
        >
          {/* QR Image */}
          <div className="w-36 h-36 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-xl">
            {qrImages[v.id] ? (
              <img src={qrImages[v.id]} alt={`QR ${v.patente}`} className="w-32 h-32 rounded-lg" />
            ) : (
              <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            )}
          </div>

          {/* Vehicle info */}
          <div className="text-center">
            <p className="font-black text-primary dark:text-blue-300 font-mono text-lg">{v.patente}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {v.marca} {v.modelo} {v.anio}
            </p>
            {v.token && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {v.usos} uso{v.usos !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Actions */}
          <Link
            href={`/broker/qr/${v.id}`}
            className="w-full text-center text-xs font-semibold text-accent hover:text-primary dark:hover:text-blue-300 border border-accent hover:border-primary dark:border-blue-500 dark:hover:border-blue-300 rounded-lg py-2 transition-colors"
          >
            Ver QR completo
          </Link>
        </div>
      ))}
    </div>
  )
}
