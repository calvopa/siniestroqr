import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.siniestro.deleteMany()
  await prisma.qRToken.deleteMany()
  await prisma.vehiculo.deleteMany()
  await prisma.broker.deleteMany()

  // Create broker
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const broker = await prisma.broker.create({
    data: {
      nombre: 'Seguros del Sur',
      email: 'demo@seguros.com',
      password: hashedPassword,
      telefono: '+54 11 4567-8900',
    },
  })

  console.log('Broker created:', broker.email)

  // Create vehicles
  const vehiculo1 = await prisma.vehiculo.create({
    data: {
      patente: 'AA123BB',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      brokerId: broker.id,
    },
  })

  const vehiculo2 = await prisma.vehiculo.create({
    data: {
      patente: 'CC456DD',
      marca: 'Ford',
      modelo: 'Focus',
      anio: 2021,
      brokerId: broker.id,
    },
  })

  const vehiculo3 = await prisma.vehiculo.create({
    data: {
      patente: 'EE789FF',
      marca: 'Volkswagen',
      modelo: 'Gol',
      anio: 2020,
      brokerId: broker.id,
    },
  })

  console.log('Vehicles created:', vehiculo1.patente, vehiculo2.patente, vehiculo3.patente)

  // Create QR tokens
  const token1 = await prisma.qRToken.create({
    data: {
      vehiculoId: vehiculo1.id,
      activo: true,
    },
  })

  const token2 = await prisma.qRToken.create({
    data: {
      vehiculoId: vehiculo2.id,
      activo: true,
    },
  })

  const token3 = await prisma.qRToken.create({
    data: {
      vehiculoId: vehiculo3.id,
      activo: true,
    },
  })

  console.log('QR Tokens created:', token1.token, token2.token, token3.token)

  // Create some sample siniestros
  await prisma.siniestro.create({
    data: {
      tokenId: token1.id,
      brokerId: broker.id,
      conductorNombre: 'Carlos Rodriguez',
      conductorDni: '28456789',
      conductorTel: '+54 11 5678-9012',
      conductorEmail: 'carlos@email.com',
      patenteConductor: 'GG111HH',
      companiaSeguros: 'La Segunda',
      nroPoliza: 'POL-2024-001',
      descripcion: 'Choque leve en interseccion de Av. Corrientes y Callao',
      latitud: -34.6037,
      longitud: -58.3816,
      estado: 'PENDIENTE',
      hashDocumento: 'abc123def456',
    },
  })

  await prisma.siniestro.create({
    data: {
      tokenId: token2.id,
      brokerId: broker.id,
      conductorNombre: 'Maria Gonzalez',
      conductorDni: '35678901',
      conductorTel: '+54 11 6789-0123',
      conductorEmail: 'maria@email.com',
      patenteConductor: 'II222JJ',
      companiaSeguros: 'Sancor Seguros',
      nroPoliza: 'POL-2024-002',
      descripcion: 'Raspadura en estacionamiento del shopping',
      latitud: -34.5897,
      longitud: -58.4020,
      estado: 'PROCESADO',
      hashDocumento: 'ghi789jkl012',
    },
  })

  console.log('Sample siniestros created')

  // Seed Insurers
  const sancor = await prisma.insurer.upsert({
    where: { slug: 'sancor-seguros' },
    update: {},
    create: {
      name: 'Sancor Seguros',
      slug: 'sancor-seguros',
    },
  })

  const laSegunda = await prisma.insurer.upsert({
    where: { slug: 'la-segunda' },
    update: {},
    create: {
      name: 'La Segunda',
      slug: 'la-segunda',
    },
  })

  console.log('Insurers created:', sancor.name, laSegunda.name)

  const hashedDemoPassword = await bcrypt.hash('demo1234', 12)

  await prisma.insurerUser.upsert({
    where: { email: 'sancor@seguros.com' },
    update: {},
    create: {
      nombre: 'Sancor Seguros Demo',
      email: 'sancor@seguros.com',
      password: hashedDemoPassword,
      insurerId: sancor.id,
    },
  })

  await prisma.insurerUser.upsert({
    where: { email: 'lasegunda@seguros.com' },
    update: {},
    create: {
      nombre: 'La Segunda Demo',
      email: 'lasegunda@seguros.com',
      password: hashedDemoPassword,
      insurerId: laSegunda.id,
    },
  })

  console.log('InsurerUsers created: sancor@seguros.com, lasegunda@seguros.com')

  console.log('\n=== SEED COMPLETED ===')
  console.log('Login credentials:')
  console.log('  Email: demo@seguros.com')
  console.log('  Password: demo1234')
  console.log('\nAseguradora credentials:')
  console.log('  Email: sancor@seguros.com / Password: demo1234')
  console.log('  Email: lasegunda@seguros.com / Password: demo1234')
  console.log('\nQR Token URLs (for testing):')
  console.log(`  http://localhost:3000/siniestro/${token1.token}`)
  console.log(`  http://localhost:3000/siniestro/${token2.token}`)
  console.log(`  http://localhost:3000/siniestro/${token3.token}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
