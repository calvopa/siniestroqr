'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StepIndicator from '@/components/conductor/StepIndicator'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface TokenInfo {
  valid: boolean
  vehiculo?: {
    patente: string
    marca: string
    modelo: string
    anio: number
  }
  broker?: {
    nombre: string
  }
  token?: string
  error?: string
}

export default function SiniestroWelcomePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/token/${params.token}`)
        const data = await res.json()
        setTokenInfo(data)

        if (data.valid) {
          // Store token and vehicle info in sessionStorage for next steps
          sessionStorage.setItem('sqr_token', params.token)
          sessionStorage.setItem('sqr_vehiculo', JSON.stringify(data.vehiculo))
          sessionStorage.setItem('sqr_broker', JSON.stringify(data.broker))
        }
      } catch {
        setError('No se pudo validar el código QR. Verifica tu conexión.')
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [params.token])

  const handleContinue = () => {
    router.push(`/siniestro/${params.token}/datos`)
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={1} />
        <Card className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Validando código QR...</p>
        </Card>
      </div>
    )
  }

  if (error || !tokenInfo?.valid) {
    return (
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={1} />
        <Card className="text-center py-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">QR Inválido</h2>
          <p className="text-gray-500 text-sm">
            {error || tokenInfo?.error || 'Este código QR no es válido o ya no está activo.'}
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Contactá al titular del vehículo para obtener un QR actualizado.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <StepIndicator currentStep={1} />

      <Card className="mb-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-1">QR Verificado</h1>
          <p className="text-gray-500 text-sm">
            Estás a punto de registrar un siniestro con el titular de este vehículo
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Vehículo del otro conductor
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Patente</p>
              <p className="font-bold text-primary text-lg font-mono">{tokenInfo.vehiculo?.patente}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Año</p>
              <p className="font-semibold text-gray-700">{tokenInfo.vehiculo?.anio}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Marca</p>
              <p className="font-semibold text-gray-700">{tokenInfo.vehiculo?.marca}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Modelo</p>
              <p className="font-semibold text-gray-700">{tokenInfo.vehiculo?.modelo}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-3 pt-3">
            <p className="text-xs text-gray-400">Aseguradora</p>
            <p className="font-semibold text-gray-700">{tokenInfo.broker?.nombre}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Importante</p>
              <p className="text-xs text-amber-700 mt-1">
                Los datos que ingreses quedarán registrados y serán enviados a la aseguradora del vehículo escaneado.
                Asegurate de ingresar información correcta y verdadera.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full" size="lg">
          Continuar con mis datos
          <svg className="w-5 h-5 ml-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </Card>

      <p className="text-center text-xs text-gray-400">
        Tus datos estarán protegidos. Solo accederá la aseguradora del vehículo involucrado.
      </p>
    </div>
  )
}
