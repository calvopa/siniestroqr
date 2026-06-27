export interface BrokerSession {
  id: string
  nombre: string
  email: string
}

export interface VehiculoConTokens {
  id: string
  patente: string
  marca: string
  modelo: string
  anio: number
  brokerId: string
  qrTokens: QRTokenData[]
  createdAt: Date
}

export interface QRTokenData {
  id: string
  token: string
  vehiculoId: string
  activo: boolean
  usos: number
  createdAt: Date
}

export interface SiniestroFormData {
  conductorNombre: string
  conductorDni: string
  conductorTel: string
  conductorEmail: string
  patenteConductor: string
  companiaSeguros: string
  nroPoliza: string
  descripcion: string
  latitud?: number
  longitud?: number
}

export interface SiniestroCompleto {
  id: string
  tokenId: string
  brokerId: string
  conductorNombre: string
  conductorDni: string
  conductorTel: string
  conductorEmail: string | null
  patenteConductor: string
  companiaSeguros: string
  nroPoliza: string | null
  fechaHora: Date
  latitud: number | null
  longitud: number | null
  descripcion: string | null
  ipOrigen: string | null
  userAgent: string | null
  hashDocumento: string | null
  estado: string
  createdAt: Date
  token: {
    token: string
    vehiculo: {
      patente: string
      marca: string
      modelo: string
      anio: number
    }
  }
  broker: {
    nombre: string
    email: string
    telefono: string | null
  }
}

export interface TokenValidationResponse {
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

export interface CreateSiniestroRequest {
  token: string
  conductorNombre: string
  conductorDni: string
  conductorTel: string
  conductorEmail?: string
  patenteConductor: string
  companiaSeguros: string
  nroPoliza?: string
  descripcion?: string
  latitud?: number
  longitud?: number
}

export interface CreateSiniestroResponse {
  success: boolean
  siniestroId?: string
  hashDocumento?: string
  error?: string
}
