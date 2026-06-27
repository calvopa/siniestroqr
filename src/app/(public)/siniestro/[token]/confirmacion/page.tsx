'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StepIndicator from '@/components/conductor/StepIndicator'
import ConfirmacionCard from '@/components/conductor/ConfirmacionCard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SiniestroFormData } from '@/types'

interface SubmitResult {
  success: boolean
  siniestroId?: string
  hashDocumento?: string
  error?: string
}

export default function ConfirmacionPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<SiniestroFormData | null>(null)
  const [vehiculoInfo, setVehiculoInfo] = useState<{
    patente: string
    marca: string
    modelo: string
    anio: number
  } | null>(null)
  const [brokerInfo, setBrokerInfo] = useState<{ nombre: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = sessionStorage.getItem('sqr_token')
    const storedData = sessionStorage.getItem('sqr_formdata')
    const storedVehiculo = sessionStorage.getItem('sqr_vehiculo')
    const storedBroker = sessionStorage.getItem('sqr_broker')

    if (!storedToken || storedToken !== params.token || !storedData) {
      router.push(`/siniestro/${params.token}`)
      return
    }

    try {
      setFormData(JSON.parse(storedData))
      if (storedVehiculo) setVehiculoInfo(JSON.parse(storedVehiculo))
      if (storedBroker) setBrokerInfo(JSON.parse(storedBroker))
    } catch {
      router.push(`/siniestro/${params.token}`)
    }
  }, [params.token, router])

  const handleConfirm = async () => {
    if (!formData) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/siniestro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          ...formData,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setResult(data)
        // Clear session data
        sessionStorage.removeItem('sqr_formdata')
      } else {
        setError(data.error || 'Error al registrar el siniestro')
      }
    } catch {
      setError('Error de conexión. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push(`/siniestro/${params.token}/datos`)
  }

  const handleDownloadPDF = () => {
    if (result?.siniestroId) {
      window.open(`/api/pdf/${result.siniestroId}`, '_blank')
    }
  }

  if (!formData) {
    return (
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={3} />
        <Card className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mx-auto" />
        </Card>
      </div>
    )
  }

  // Success state
  if (result?.success) {
    return (
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={3} completed />

        <Card className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            ¡Siniestro Registrado!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Tus datos fueron enviados exitosamente a la aseguradora del vehículo.
          </p>

          <div className="bg-surface rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">ID del siniestro</p>
                <p className="font-mono text-sm font-bold text-primary">{result.siniestroId}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                REGISTRADO
              </span>
            </div>
            {result.hashDocumento && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hash de verificación</p>
                <p className="font-mono text-xs text-gray-600 break-all">{result.hashDocumento}</p>
              </div>
            )}
          </div>

          <Button onClick={handleDownloadPDF} className="w-full mb-3" variant="primary">
            <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar constancia PDF
          </Button>

          <p className="text-xs text-gray-400">
            Guardá el PDF como comprobante del intercambio de datos.
            Conservá el ID del siniestro para futuras consultas.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <StepIndicator currentStep={3} />

      <ConfirmacionCard
        formData={formData}
        vehiculoInfo={vehiculoInfo}
        brokerInfo={brokerInfo}
        onConfirm={handleConfirm}
        onBack={handleBack}
        submitting={submitting}
        error={error}
      />
    </div>
  )
}
