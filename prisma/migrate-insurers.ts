/**
 * migrate-insurers.ts
 *
 * Normaliza companiaSeguros → Insurer y linkea cada Siniestro.
 *
 * Uso:
 *   DRY_RUN=true  ts-node prisma/migrate-insurers.ts   → solo muestra, no escribe
 *   DRY_RUN=false ts-node prisma/migrate-insurers.ts   → escribe en DB
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.env.DRY_RUN !== 'false'

function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function toSlug(raw: string): string {
  return normalize(raw).replace(/\s+/g, '-')
}

function toTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\w\S*/g, function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() })
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  MIGRACION: Normalizacion de companias aseguradoras')
  console.log('  Modo: ' + (DRY_RUN ? 'DRY RUN (solo lectura)' : 'ESCRITURA REAL'))
  console.log('='.repeat(60) + '\n')

  const siniestros = await prisma.siniestro.findMany({
    select: { id: true, companiaSeguros: true, insurerId: true },
  })

  console.log('Total siniestros: ' + siniestros.length)
  console.log('Ya vinculados:    ' + siniestros.filter(function(s) { return s.insurerId }).length)
  console.log('Sin vincular:     ' + siniestros.filter(function(s) { return !s.insurerId }).length + '\n')

  // Agrupa por valor normalizado — evitar for...of sobre Map (compat TS target)
  const groupsObj: Record<string, string[]> = {}
  const rawByNorm: Record<string, string> = {}
  const unmatched: Array<{ id: string; raw: string; reason: string }> = []

  siniestros.forEach(function(s) {
    const raw = (s.companiaSeguros || '').trim()

    if (!raw || raw.length < 2) {
      unmatched.push({ id: s.id, raw: raw, reason: 'vacio o demasiado corto' })
      return
    }

    const norm = normalize(raw)
    if (!groupsObj[norm]) {
      groupsObj[norm] = []
      rawByNorm[norm] = raw
    }
    groupsObj[norm].push(s.id)
  })

  const norms = Object.keys(groupsObj)

  // ── Tabla de companias detectadas ─────────────────────────────────────────
  console.log('Companias unicas detectadas: ' + norms.length)
  console.log('-'.repeat(60))
  console.log('  ' + 'Nombre canonico'.padEnd(30) + ' ' + 'Slug'.padEnd(25) + ' Siniestros')
  console.log('-'.repeat(60))

  const insurerIdMap: Record<string, string> = {}

  for (let i = 0; i < norms.length; i++) {
    const norm = norms[i]
    const ids = groupsObj[norm]
    const raw = rawByNorm[norm]
    const name = toTitle(raw)
    const slug = toSlug(raw)
    console.log('  ' + name.padEnd(30) + ' ' + slug.padEnd(25) + ' ' + ids.length)

    if (!DRY_RUN) {
      const insurer = await prisma.insurer.upsert({
        where: { slug: slug },
        create: { name: name, slug: slug },
        update: {},
      })
      insurerIdMap[norm] = insurer.id
    } else {
      insurerIdMap[norm] = '[dry-run:' + slug + ']'
    }
  }

  // ── No matcheados ─────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60))
  if (unmatched.length === 0) {
    console.log('  OK Sin registros no matcheados')
  } else {
    console.log('  ADVERTENCIA: REGISTROS NO MATCHEADOS (' + unmatched.length + ') — requieren revision manual:')
    console.log('-'.repeat(60))
    console.log('  ' + 'Siniestro ID'.padEnd(28) + ' ' + 'Raw value'.padEnd(20) + ' Razon')
    console.log('-'.repeat(60))
    unmatched.forEach(function(u) {
      console.log('  ' + u.id.padEnd(28) + ' ' + (u.raw || '(vacio)').padEnd(20) + ' ' + u.reason)
    })
  }
  console.log('='.repeat(60) + '\n')

  if (DRY_RUN) {
    console.log('DRY RUN completado — no se escribio nada.')
    console.log('Para aplicar: DRY_RUN=false ts-node prisma/migrate-insurers.ts\n')
    return
  }

  // ── Actualiza siniestros ──────────────────────────────────────────────────
  console.log('Actualizando siniestros...')
  let updated = 0

  for (let i = 0; i < norms.length; i++) {
    const norm = norms[i]
    const ids = groupsObj[norm]
    const insurerId = insurerIdMap[norm]
    await prisma.siniestro.updateMany({
      where: { id: { in: ids } },
      data: { insurerId: insurerId },
    })
    updated += ids.length
  }

  console.log('\nActualizacion completada:')
  console.log('   - Vinculados:                              ' + updated)
  console.log('   - Sin vincular (requieren revision manual): ' + unmatched.length + '\n')
}

main()
  .catch(function(e) {
    console.error('Error fatal:', e)
    process.exit(1)
  })
  .finally(function() { return prisma.$disconnect() })
