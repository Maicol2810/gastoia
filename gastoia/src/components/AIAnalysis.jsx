import { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

function calcularEstadisticas(gastos) {
  if (gastos.length === 0) return null

  const porCategoria = {}
  let total = 0
  let mayor = gastos[0]

  gastos.forEach((g) => {
    const valor = Number(g.valor)
    total += valor
    porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + valor
    if (valor > Number(mayor.valor)) mayor = g
  })

  const categoriaTop = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0]

  return {
    total,
    categoriaTop: { nombre: categoriaTop[0], valor: categoriaTop[1] },
    gastoMayor: mayor,
    cantidad: gastos.length
  }
}

export default function AIAnalysis({ gastos }) {
  const [analizando, setAnalizando] = useState(false)
  const [recomendaciones, setRecomendaciones] = useState(null)
  const [error, setError] = useState(null)

  const stats = useMemo(() => calcularEstadisticas(gastos), [gastos])

  const analizar = async () => {
    if (!stats) return
    setAnalizando(true)
    setError(null)
    setRecomendaciones(null)
    try {
      // La Edge Function "analizar-gastos" recibe el resumen ya calculado
      // (no los gastos crudos) y usa un modelo de IA para redactar
      // recomendaciones de ahorro personalizadas. Ver supabase/functions/analizar-gastos.
      const { data, error: fnError } = await supabase.functions.invoke('analizar-gastos', {
        body: { stats }
      })
      if (fnError) throw fnError
      setRecomendaciones(data?.recomendaciones || 'No se recibió una respuesta de la IA.')
    } catch (err) {
      setError(
        'No se pudo contactar la función de IA. Verifica que la Edge Function "analizar-gastos" esté desplegada y configurada con tu clave del proveedor (ver README).'
      )
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setAnalizando(false)
    }
  }

  return (
    <div className="card ai-card">
      <div className="ai-card-head">
        <div className="ai-title">🧠 Analizar mis gastos</div>
        <button className="ai-btn" onClick={analizar} disabled={analizando || !stats}>
          {analizando ? 'Analizando…' : 'Analizar mis gastos'}
        </button>
      </div>

      {!stats && <p className="ai-body">Registra al menos un gasto para poder analizarlo.</p>}

      {stats && (
        <div className="ai-stats-row">
          <div className="ai-stat">
            <div className="ai-stat-label">Categoría con más gasto</div>
            <div className="ai-stat-value">
              {stats.categoriaTop.nombre} · {formatoCOP.format(stats.categoriaTop.valor)}
            </div>
          </div>
          <div className="ai-stat">
            <div className="ai-stat-label">Total gastado</div>
            <div className="ai-stat-value">{formatoCOP.format(stats.total)}</div>
          </div>
          <div className="ai-stat">
            <div className="ai-stat-label">Gasto más alto</div>
            <div className="ai-stat-value">
              {stats.gastoMayor.descripcion} · {formatoCOP.format(stats.gastoMayor.valor)}
            </div>
          </div>
        </div>
      )}

      {recomendaciones && (
        <div className="ai-body">
          <p style={{ marginTop: 16, fontWeight: 600, color: '#fff' }}>Recomendaciones</p>
          <p>{recomendaciones}</p>
        </div>
      )}

      {error && <p className="ai-error">{error}</p>}
    </div>
  )
}
