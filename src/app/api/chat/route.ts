import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: `Sos el asistente virtual de SiniestroQR, una plataforma InsurTech argentina que digitaliza el intercambio de datos entre conductores tras un accidente de tránsito mediante códigos QR.

Ayudás a brokers y aseguradoras a:
- Gestionar vehículos y sus códigos QR
- Entender el estado de los siniestros (PENDIENTE, EN_PROCESO, PROCESADO, CERRADO)
- Navegar el panel de control
- Generar y compartir códigos QR para los vehículos
- Descargar PDFs de siniestros
- Responder preguntas sobre el flujo de carga de datos por conductores terceros

Respondé siempre en español rioplatense (Argentina), de forma concisa y útil. Si no sabés algo específico del caso del usuario, pedí más contexto.`,
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Error al procesar el mensaje' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
