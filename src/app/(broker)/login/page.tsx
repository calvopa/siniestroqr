'use client'

import { useState, FormEvent } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Error al iniciar sesión. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-primary font-black text-xl">SQ</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SiniestroQR</h1>
          <p className="text-blue-200 text-sm mt-1">Panel de Brokers y Aseguradoras</p>
        </div>

        <Card className="shadow-2xl">
          <h2 className="text-xl font-bold text-primary mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-field">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="usuario@aseguradora.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-field">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Ingresar al panel'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-surface rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-2">Credenciales de demo:</p>
            <p className="text-xs text-gray-600 font-mono">demo@seguros.com</p>
            <p className="text-xs text-gray-600 font-mono">demo1234</p>
          </div>
        </Card>

        <p className="text-center text-blue-200 text-xs mt-6">
          ¿Necesitás acceso? Contactá al administrador del sistema.
        </p>
      </div>
    </div>
  )
}
