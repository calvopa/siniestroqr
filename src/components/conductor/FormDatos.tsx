'use client'

import { useState, FormEvent, useEffect } from 'react'
import { SiniestroFormData } from '@/types'
import Button from '@/components/ui/Button'

interface FormDatosProps {
  onSubmit: (data: SiniestroFormData) => void
  onBack: () => void
}

const COMPANIAS_SEGUROS = [
  'La Segunda',
  'Sancor Seguros',
  'San Cristóbal Seguros',
  'Federación Patronal',
  'Rivadavia',
  'Meridional',
  'Galicia Seguros',
  'SMG Seguros',
  'Mapfre',
  'Zurich',
  'HDI Seguros',
  'Allianz',
  'BBVA Seguros',
  'Nación Seguros',
  'La Caja',
  'Otro',
]

export default function FormDatos({ onSubmit, onBack }: FormDatosProps) {
  const [form, setForm] = useState<SiniestroFormData>({
    conductorNombre: '',
    conductorDni: '',
    conductorTel: '',
    conductorEmail: '',
    patenteConductor: '',
    companiaSeguros: '',
    nroPoliza: '',
    descripcion: '',
    latitud: undefined,
    longitud: undefined,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SiniestroFormData, string>>>({})
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Try to restore from sessionStorage if user went back
    const stored = sessionStorage.getItem('sqr_formdata')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setForm(parsed)
      } catch { /* ignore */ }
    }
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        }))
        setGeoStatus('success')
      },
      () => {
        setGeoStatus('error')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SiniestroFormData, string>> = {}

    if (!form.conductorNombre.trim()) newErrors.conductorNombre = 'El nombre es requerido'
    if (!form.conductorDni.trim()) newErrors.conductorDni = 'El DNI es requerido'
    else if (!/^\d{7,8}$/.test(form.conductorDni.replace(/\./g, '')))
      newErrors.conductorDni = 'Ingresá un DNI válido (7-8 dígitos)'
    if (!form.conductorTel.trim()) newErrors.conductorTel = 'El teléfono es requerido'
    if (!form.patenteConductor.trim()) newErrors.patenteConductor = 'La patente es requerida'
    if (!form.companiaSeguros.trim()) newErrors.companiaSeguros = 'La compañía es requerida'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(form)
    }
  }

  const handleChange = (field: keyof SiniestroFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Personal data */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
          Datos personales
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label-field">
              Nombre y apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.conductorNombre}
              onChange={(e) => handleChange('conductorNombre', e.target.value)}
              className={`input-field ${errors.conductorNombre ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              placeholder="Juan Pérez"
            />
            {errors.conductorNombre && (
              <p className="text-red-500 text-xs mt-1">{errors.conductorNombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">
                DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.conductorDni}
                onChange={(e) => handleChange('conductorDni', e.target.value)}
                className={`input-field ${errors.conductorDni ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                placeholder="28456789"
                maxLength={10}
              />
              {errors.conductorDni && (
                <p className="text-red-500 text-xs mt-1">{errors.conductorDni}</p>
              )}
            </div>
            <div>
              <label className="label-field">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.conductorTel}
                onChange={(e) => handleChange('conductorTel', e.target.value)}
                className={`input-field ${errors.conductorTel ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                placeholder="+54 11 1234-5678"
              />
              {errors.conductorTel && (
                <p className="text-red-500 text-xs mt-1">{errors.conductorTel}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label-field">Email (opcional)</label>
            <input
              type="email"
              value={form.conductorEmail}
              onChange={(e) => handleChange('conductorEmail', e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
            />
          </div>
        </div>
      </div>

      {/* Vehicle data */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
          Tu vehículo
        </h3>
        <div>
          <label className="label-field">
            Patente de tu vehículo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.patenteConductor}
            onChange={(e) => handleChange('patenteConductor', e.target.value.toUpperCase())}
            className={`input-field font-mono uppercase ${errors.patenteConductor ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            placeholder="AB123CD"
            maxLength={7}
          />
          {errors.patenteConductor && (
            <p className="text-red-500 text-xs mt-1">{errors.patenteConductor}</p>
          )}
        </div>
      </div>

      {/* Insurance data */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
          Tu seguro
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label-field">
              Compañía de seguros <span className="text-red-500">*</span>
            </label>
            <select
              value={form.companiaSeguros}
              onChange={(e) => handleChange('companiaSeguros', e.target.value)}
              className={`input-field bg-white ${errors.companiaSeguros ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            >
              <option value="">Seleccioná tu compañía</option>
              {COMPANIAS_SEGUROS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.companiaSeguros && (
              <p className="text-red-500 text-xs mt-1">{errors.companiaSeguros}</p>
            )}
          </div>

          <div>
            <label className="label-field">Número de póliza (opcional)</label>
            <input
              type="text"
              value={form.nroPoliza}
              onChange={(e) => handleChange('nroPoliza', e.target.value)}
              className="input-field"
              placeholder="POL-2024-XXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label-field">Descripción del siniestro (opcional)</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          className="input-field resize-none"
          rows={3}
          placeholder="Describí brevemente cómo ocurrió el accidente..."
          maxLength={500}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{form.descripcion.length}/500</p>
      </div>

      {/* Geolocation */}
      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Ubicación del siniestro</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {geoStatus === 'success'
                ? `${form.latitud?.toFixed(4)}, ${form.longitud?.toFixed(4)}`
                : 'Opcional — ayuda a documentar el lugar'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={geoStatus === 'loading' || geoStatus === 'success'}
            className={`
              text-xs px-3 py-2 rounded-lg font-medium transition-colors
              ${geoStatus === 'success' ? 'bg-green-100 text-green-700' : ''}
              ${geoStatus === 'error' ? 'bg-red-100 text-red-600' : ''}
              ${geoStatus === 'idle' ? 'bg-accent text-white hover:bg-primary-light' : ''}
              ${geoStatus === 'loading' ? 'bg-gray-100 text-gray-400' : ''}
            `}
          >
            {geoStatus === 'idle' && 'Compartir ubicación'}
            {geoStatus === 'loading' && 'Obteniendo...'}
            {geoStatus === 'success' && 'Ubicación obtenida'}
            {geoStatus === 'error' && 'No disponible'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          Volver
        </Button>
        <Button type="submit" variant="primary" className="flex-[2]">
          Revisar datos
          <svg className="w-4 h-4 ml-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
