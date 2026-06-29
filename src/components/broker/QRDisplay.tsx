'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface QRDisplayProps {
  vehiculo: {
    id: string
    patente: string
    marca: string
    modelo: string
    anio: number
  }
  token: string
  qrUrl: string
  usos: number
}

export default function QRDisplay({ vehiculo, token, qrUrl, usos }: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Dynamically import qrcode to use in client
        const QRCode = (await import('qrcode')).default
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          color: {
            dark: '#0F2744',
            light: '#FFFFFF',
          },
          width: 300,
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('Error generating QR:', error)
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [qrUrl])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = qrUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `qr-${vehiculo.patente}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* Vehicle info */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vehículo</p>
            <h2 className="text-2xl font-black text-primary dark:text-blue-300 font-mono">{vehiculo.patente}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Usos del QR</p>
            <p className="text-3xl font-black text-accent">{usos}</p>
          </div>
        </div>
      </Card>

      {/* QR Code */}
      <Card className="text-center print:shadow-none">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Código QR para el vehículo
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Escanealo para registrar datos en caso de siniestro
          </p>
        </div>

        {loading ? (
          <div className="w-[300px] h-[300px] flex items-center justify-center mx-auto bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : qrDataUrl ? (
          <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR Code para ${vehiculo.patente}`}
              width={280}
              height={280}
              className="rounded-lg"
            />
          </div>
        ) : (
          <div className="w-[300px] h-[300px] flex items-center justify-center mx-auto bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-500 text-sm">Error al generar QR</p>
          </div>
        )}

        {/* Vehicle label under QR */}
        <div className="mt-4 bg-surface dark:bg-gray-700 rounded-xl p-3 max-w-sm mx-auto">
          <p className="font-black text-primary dark:text-blue-300 font-mono text-xl">{vehiculo.patente}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">SiniestroQR — Escanear en caso de accidente</p>
        </div>
      </Card>

      {/* URL */}
      <Card>
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">URL del QR</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 break-all font-mono">
            {qrUrl}
          </code>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Copiar URL"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        {copied && <p className="text-green-600 text-xs mt-1">URL copiada al portapapeles</p>}
      </Card>

      {/* Token info */}
      <Card>
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Token</p>
        <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{token}</p>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button onClick={handleDownloadQR} variant="primary" disabled={!qrDataUrl} className="flex-1">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar QR
        </Button>
        <Button onClick={handlePrint} variant="secondary" className="flex-1">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-surface dark:bg-gray-700/50 border-0">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Instrucciones de uso</h3>
        <ul className="space-y-1.5">
          {[
            'Imprimí este QR y pegalo en el parabrisas o ventanilla de tu vehículo',
            'En caso de accidente, el otro conductor puede escanearlo con su celular',
            'El sistema registrará los datos del siniestro automáticamente',
            'Recibirás la información en el panel de control',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="flex-shrink-0 w-4 h-4 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
