'use client'

import { SiniestroFormData } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ConfirmacionCardProps {
  formData: SiniestroFormData
  vehiculoInfo: {
    patente: string
    marca: string
    modelo: string
    anio: number
  } | null
  brokerInfo: { nombre: string } | null
  onConfirm: () => void
  onBack: () => void
  submitting: boolean
  error: string | null
}

interface FieldRowProps {
  label: string
  value: string | undefined | null
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value || '—'}</span>
    </div>
  )
}

export default function ConfirmacionCard({
  formData,
  vehiculoInfo,
  brokerInfo,
  onConfirm,
  onBack,
  submitting,
  error,
}: ConfirmacionCardProps) {
  return (
    <div className="space-y-4">
      {/* Vehicle involved */}
      {vehiculoInfo && (
        <Card>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Vehículo del otro conductor
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-400">Patente</p>
              <p className="font-bold text-primary font-mono">{vehiculoInfo.patente}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vehículo</p>
              <p className="font-medium text-gray-700">
                {vehiculoInfo.marca} {vehiculoInfo.modelo} {vehiculoInfo.anio}
              </p>
            </div>
          </div>
          {brokerInfo && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Aseguradora</p>
              <p className="font-medium text-gray-700">{brokerInfo.nombre}</p>
            </div>
          )}
        </Card>
      )}

      {/* Your data */}
      <Card>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Tus datos personales
        </h3>
        <FieldRow label="Nombre" value={formData.conductorNombre} />
        <FieldRow label="DNI" value={formData.conductorDni} />
        <FieldRow label="Teléfono" value={formData.conductorTel} />
        <FieldRow label="Email" value={formData.conductorEmail} />
      </Card>

      {/* Vehicle and insurance */}
      <Card>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Tu vehículo y seguro
        </h3>
        <FieldRow label="Patente" value={formData.patenteConductor} />
        <FieldRow label="Compañía" value={formData.companiaSeguros} />
        <FieldRow label="Nro. de póliza" value={formData.nroPoliza} />
      </Card>

      {/* Description */}
      {formData.descripcion && (
        <Card>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Descripción
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{formData.descripcion}</p>
        </Card>
      )}

      {/* Location */}
      {formData.latitud && formData.longitud && (
        <Card>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Ubicación registrada
          </h3>
          <p className="text-sm text-gray-700 font-mono">
            {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
          </p>
          <a
            href={`https://maps.google.com/?q=${formData.latitud},${formData.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent text-xs mt-1 hover:underline inline-block"
          >
            Ver en Google Maps →
          </a>
        </Card>
      )}

      {/* Warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-700">
          Al confirmar, tus datos serán enviados a la aseguradora del vehículo involucrado y
          se generará una constancia digital con validez legal.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={submitting}
          className="flex-1"
        >
          Editar datos
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onConfirm}
          disabled={submitting}
          className="flex-[2]"
        >
          {submitting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Registrando...
            </>
          ) : (
            <>
              Confirmar y enviar
              <svg className="w-4 h-4 ml-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
