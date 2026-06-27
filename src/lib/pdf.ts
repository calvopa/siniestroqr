import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import crypto from 'crypto'

interface SiniestroData {
  id: string
  conductorNombre: string
  conductorDni: string
  conductorTel: string
  conductorEmail?: string | null
  patenteConductor: string
  companiaSeguros: string
  nroPoliza?: string | null
  descripcion?: string | null
  fechaHora: Date
  latitud?: number | null
  longitud?: number | null
  vehiculo: {
    patente: string
    marca: string
    modelo: string
    anio: number
  }
  broker: {
    nombre: string
    email: string
    telefono?: string | null
  }
  hashDocumento?: string | null
}

export async function generateSiniestroPDF(data: SiniestroData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const navyBlue = rgb(0.059, 0.153, 0.267) // #0F2744
  const instBlue = rgb(0.102, 0.420, 0.800) // #1A6BCC
  const lightGray = rgb(0.941, 0.957, 0.980) // #F0F4FA
  const darkGray = rgb(0.2, 0.2, 0.2)
  const medGray = rgb(0.5, 0.5, 0.5)
  const white = rgb(1, 1, 1)
  const green = rgb(0.133, 0.773, 0.369) // #22C55E

  const { width, height } = page.getSize()

  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: navyBlue,
  })

  // Header text
  page.drawText('SiniestroQR', {
    x: 40,
    y: height - 45,
    size: 28,
    font: helveticaBold,
    color: white,
  })

  page.drawText('Constancia de Intercambio de Datos en Siniestro', {
    x: 40,
    y: height - 70,
    size: 11,
    font: helvetica,
    color: rgb(0.8, 0.9, 1),
  })

  // Date on right side
  const fechaStr = new Date(data.fechaHora).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  page.drawText(fechaStr, {
    x: width - 180,
    y: height - 55,
    size: 11,
    font: helvetica,
    color: rgb(0.8, 0.9, 1),
  })

  let currentY = height - 130

  // Section helper
  const drawSection = (title: string, yPos: number) => {
    page.drawRectangle({
      x: 30,
      y: yPos - 8,
      width: width - 60,
      height: 26,
      color: lightGray,
    })
    page.drawRectangle({
      x: 30,
      y: yPos - 8,
      width: 4,
      height: 26,
      color: instBlue,
    })
    page.drawText(title, {
      x: 42,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: navyBlue,
    })
    return yPos - 35
  }

  const drawField = (label: string, value: string, x: number, y: number, labelWidth = 130) => {
    page.drawText(label + ':', {
      x,
      y,
      size: 9,
      font: helveticaBold,
      color: medGray,
    })
    page.drawText(value || '—', {
      x: x + labelWidth,
      y,
      size: 10,
      font: helvetica,
      color: darkGray,
    })
  }

  // VEHICULO ASEGURADO section
  currentY = drawSection('Vehiculo Asegurado', currentY)
  drawField('Patente', data.vehiculo.patente, 40, currentY)
  drawField('Marca', data.vehiculo.marca, 320, currentY)
  currentY -= 20
  drawField('Modelo', data.vehiculo.modelo, 40, currentY)
  drawField('Año', String(data.vehiculo.anio), 320, currentY)
  currentY -= 30

  // BROKER section
  currentY = drawSection('Aseguradora / Broker', currentY)
  drawField('Empresa', data.broker.nombre, 40, currentY)
  drawField('Telefono', data.broker.telefono || '—', 320, currentY)
  currentY -= 20
  drawField('Email', data.broker.email, 40, currentY)
  currentY -= 30

  // CONDUCTOR TERCERO section
  currentY = drawSection('Conductor Tercero', currentY)
  drawField('Nombre Completo', data.conductorNombre, 40, currentY)
  drawField('DNI', data.conductorDni, 320, currentY)
  currentY -= 20
  drawField('Telefono', data.conductorTel, 40, currentY)
  drawField('Email', data.conductorEmail || '—', 320, currentY)
  currentY -= 20
  drawField('Patente Vehiculo', data.patenteConductor, 40, currentY)
  currentY -= 30

  // SEGURO DEL TERCERO section
  currentY = drawSection('Seguro del Tercero', currentY)
  drawField('Compañia', data.companiaSeguros, 40, currentY)
  drawField('Nro Poliza', data.nroPoliza || '—', 320, currentY)
  currentY -= 30

  // DESCRIPCION section
  if (data.descripcion) {
    currentY = drawSection('Descripcion del Siniestro', currentY)
    // Word wrap description
    const words = data.descripcion.split(' ')
    let line = ''
    const maxWidth = 500
    const lineHeight = 16
    for (const word of words) {
      const testLine = line ? line + ' ' + word : word
      const testWidth = helvetica.widthOfTextAtSize(testLine, 10)
      if (testWidth > maxWidth && line) {
        page.drawText(line, { x: 40, y: currentY, size: 10, font: helvetica, color: darkGray })
        currentY -= lineHeight
        line = word
      } else {
        line = testLine
      }
    }
    if (line) {
      page.drawText(line, { x: 40, y: currentY, size: 10, font: helvetica, color: darkGray })
      currentY -= lineHeight
    }
    currentY -= 15
  }

  // UBICACION section
  if (data.latitud && data.longitud) {
    currentY = drawSection('Ubicacion del Siniestro', currentY)
    drawField('Latitud', String(data.latitud.toFixed(6)), 40, currentY)
    drawField('Longitud', String(data.longitud.toFixed(6)), 320, currentY)
    currentY -= 20
    const mapsUrl = `https://maps.google.com/?q=${data.latitud},${data.longitud}`
    page.drawText('Google Maps: ' + mapsUrl, {
      x: 40,
      y: currentY,
      size: 8,
      font: helvetica,
      color: instBlue,
    })
    currentY -= 30
  }

  // Footer
  const footerY = 60

  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerY + 10,
    color: lightGray,
  })

  // Hash
  if (data.hashDocumento) {
    page.drawText('Hash SHA-256:', {
      x: 40,
      y: footerY - 5,
      size: 8,
      font: helveticaBold,
      color: medGray,
    })
    page.drawText(data.hashDocumento, {
      x: 40,
      y: footerY - 18,
      size: 7,
      font: helvetica,
      color: medGray,
    })
  }

  // ID
  page.drawText(`ID: ${data.id}`, {
    x: width - 260,
    y: footerY - 5,
    size: 8,
    font: helvetica,
    color: medGray,
  })

  page.drawText('Documento generado por SiniestroQR — www.siniestroqr.com.ar', {
    x: width / 2 - 150,
    y: 20,
    size: 8,
    font: helvetica,
    color: medGray,
  })

  // Valid stamp
  page.drawRectangle({
    x: width - 130,
    y: footerY - 5,
    width: 100,
    height: 30,
    color: green,
    borderColor: green,
    borderWidth: 1,
  })
  page.drawText('VALIDADO', {
    x: width - 110,
    y: footerY + 5,
    size: 12,
    font: helveticaBold,
    color: white,
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

export function calculateHash(data: object): string {
  const jsonStr = JSON.stringify(data, Object.keys(data).sort())
  return crypto.createHash('sha256').update(jsonStr).digest('hex')
}
