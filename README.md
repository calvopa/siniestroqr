# SiniestroQR

Plataforma InsurTech argentina que digitaliza el intercambio de datos entre conductores tras un accidente de tránsito mediante códigos QR.

## Descripción

SiniestroQR permite a brokers y aseguradoras generar códigos QR únicos para cada vehículo asegurado. En caso de siniestro, el otro conductor escanea el QR y completa un formulario con sus datos, que quedan registrados instantáneamente en el sistema de la aseguradora. Se genera una constancia en PDF con hash SHA-256 para validación legal.

## Flujo del sistema

```
[Broker] → Genera QR → Pega en vehículo
[Siniestro] → Conductor tercero escanea QR → Completa formulario → Sistema registra datos
[Broker] → Ve los datos en dashboard → Descarga PDF
```

## Stack tecnológico

- **Frontend/Backend**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js (JWT)
- **PDF**: pdf-lib
- **QR**: qrcode (npm)
- **Docker**: multi-stage build

## Instalación y desarrollo

### Requisitos previos

- Node.js 20+
- PostgreSQL 15+
- npm

### Pasos

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/tu-usuario/siniestroqr.git
cd siniestroqr
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Generar cliente Prisma y sincronizar base de datos
npx prisma generate
npx prisma db push

# 4. Cargar datos de prueba
npm run db:seed

# 5. Iniciar en desarrollo
npm run dev
```

### Con Docker Compose

```bash
# Levantar toda la infra (PostgreSQL + App)
docker compose up -d

# Ver logs
docker compose logs -f app

# Ejecutar seed
docker compose exec app npm run db:seed
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secreto para JWT (mín. 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base de la aplicación | `https://siniestroqr.com` |

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Flujo público del conductor
│   │   └── siniestro/[token]/
│   │       ├── page.tsx          # Paso 1: Bienvenida y validación QR
│   │       ├── datos/page.tsx    # Paso 2: Formulario de datos
│   │       └── confirmacion/     # Paso 3: Confirmación y PDF
│   ├── (broker)/          # Panel de gestión
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── broker/
│   │       ├── siniestro/[id]/   # Detalle del siniestro
│   │       └── qr/[vehiculoId]/  # Vista del QR
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth.js
│       ├── token/[token]/        # Validación de token QR
│       ├── siniestro/            # CRUD siniestros
│       └── pdf/[id]/             # Generación de PDF
├── components/
│   ├── conductor/         # Componentes del flujo público
│   ├── broker/            # Componentes del panel admin
│   └── ui/               # Componentes reutilizables
├── lib/
│   ├── prisma.ts          # Singleton de Prisma
│   ├── tokens.ts          # Validación de tokens QR
│   ├── pdf.ts             # Generación de PDFs con pdf-lib
│   └── qr.ts              # Generación de QR codes
└── types/                 # TypeScript types
```

## URLs

| URL | Descripción |
|---|---|
| `/login` | Login para brokers |
| `/dashboard` | Panel principal del broker |
| `/broker/qr/[vehiculoId]` | Ver y descargar QR del vehículo |
| `/broker/siniestro/[id]` | Detalle de un siniestro |
| `/siniestro/[token]` | Flujo público (conductores) |
| `/api/pdf/[id]` | Descargar PDF del siniestro |

## Credenciales de demo

Después de ejecutar el seed:

```
Email: demo@seguros.com
Password: demo1234
```

## Despliegue en producción

### Con Docker

```bash
# Build
docker build -t siniestroqr .

# Run
docker run -d \
  -e DATABASE_URL=postgresql://... \
  -e NEXTAUTH_SECRET=... \
  -e NEXTAUTH_URL=https://siniestroqr.com \
  -p 3000:3000 \
  siniestroqr
```

### Detrás de Nginx Proxy Manager

Configurar proxy host apuntando a `http://host:3000`.

## Paleta de colores

| Color | Hex | Uso |
|---|---|---|
| Navy | `#0F2744` | Headers, primary |
| Blue | `#1A6BCC` | CTAs, accent |
| Light Blue-Gray | `#F0F4FA` | Backgrounds |
| White | `#FFFFFF` | Cards, forms |
| Green | `#22C55E` | Success |
| Red | `#EF4444` | Errors |

## Licencia

MIT
