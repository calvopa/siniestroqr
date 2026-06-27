'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StepIndicator from '@/components/conductor/StepIndicator'
import FormDatos from '@/components/conductor/FormDatos'
import Card from '@/components/ui/Card'
import { SiniestroFormData } from '@/types'

export default function DatosPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if we came from the welcome page with a valid token
    const storedToken = sessionStorage.getItem('sqr_token')
    if (!storedToken || storedToken !== params.token) {
      router.push(`/siniestro/${params.token}`)
      return
    }
    setTokenValid(true)
  }, [params.token, router])

  const handleSubmit = (data: SiniestroFormData) => {
    // Store form data in sessionStorage
    sessionStorage.setItem('sqr_formdata', JSON.stringify(data))
    router.push(`/siniestro/${params.token}/confirmacion`)
  }

  const handleBack = () => {
    router.push(`/siniestro/${params.token}`)
  }

  if (tokenValid === null) {
    return (
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={2} />
        <Card className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mx-auto" />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <StepIndicator currentStep={2} />
      <Card>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-primary">Tus datos del siniestro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Completá la información de tu vehículo y seguro
          </p>
        </div>
        <FormDatos onSubmit={handleSubmit} onBack={handleBack} />
      </Card>
    </div>
  )
}
