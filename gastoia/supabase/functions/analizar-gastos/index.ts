// Supabase Edge Function: analizar-gastos
// Recibe un resumen de los gastos del usuario (ya calculado en el frontend)
// y le pide a un modelo de IA (Google Gemini) que redacte recomendaciones
// de ahorro breves. La clave del proveedor de IA vive únicamente aquí
// (variable de entorno de la función), nunca en el frontend.
//
// Obtén tu clave gratis en: https://aistudio.google.com/apikey
//
// Despliegue:
//   supabase functions deploy analizar-gastos
//   supabase secrets set GEMINI_API_KEY=tu-clave-de-gemini
//
// Invocación desde el frontend: supabase.functions.invoke('analizar-gastos', { body: { stats } })

import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { stats } = await req.json()

    if (!stats) {
      return new Response(JSON.stringify({ error: 'Falta el resumen de gastos (stats).' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY no está configurada en los secrets de la función.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `Eres un asesor financiero personal breve y cercano. Con este resumen de gastos de un usuario:
- Categoría con más gasto: ${stats.categoriaTop.nombre} (${formatoCOP.format(stats.categoriaTop.valor)})
- Total gastado: ${formatoCOP.format(stats.total)}
- Gasto más alto: "${stats.gastoMayor.descripcion}" por ${formatoCOP.format(stats.gastoMayor.valor)}
- Cantidad de registros: ${stats.cantidad}

Escribe en español, en un solo párrafo de máximo 5 líneas, 2 o 3 recomendaciones sencillas y accionables para ahorrar, basadas específicamente en estos datos. No repitas las cifras que ya se muestran arriba, ve directo a las recomendaciones.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400 }
        })
      }
    )

    if (!response.ok) {
      const detalle = await response.text()
      throw new Error(`Error del proveedor de IA: ${detalle}`)
    }

    const data = await response.json()
    const recomendaciones =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No se generaron recomendaciones.'

    return new Response(JSON.stringify({ recomendaciones }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Error desconocido' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  }
})
