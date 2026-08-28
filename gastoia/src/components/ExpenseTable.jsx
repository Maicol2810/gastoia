import { useMemo, useState } from 'react'
import { CATEGORIAS } from '../supabaseClient'

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

const formatoFecha = (fecha) =>
  new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

export default function ExpenseTable({ gastos, loading, onEditar, onEliminar }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [eliminandoId, setEliminandoId] = useState(null)

  const filtrados = useMemo(() => {
    return gastos.filter((g) => {
      if (categoria && g.categoria !== categoria) return false
      if (desde && g.fecha < desde) return false
      if (hasta && g.fecha > hasta) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const enDescripcion = g.descripcion?.toLowerCase().includes(q)
        const enObservaciones = g.observaciones?.toLowerCase().includes(q)
        if (!enDescripcion && !enObservaciones) return false
      }
      return true
    })
  }, [gastos, busqueda, categoria, desde, hasta])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.')) return
    setEliminandoId(id)
    try {
      await onEliminar(id)
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <div className="card table-card">
      <div className="table-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por descripción u observaciones…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} title="Desde" />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} title="Hasta" />
      </div>

      {loading ? (
        <div className="empty-state">Cargando gastos…</div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">No se encontraron gastos con esos filtros.</div>
      ) : (
        <>
          <table className="expenses">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Método de pago</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((g) => (
                <tr key={g.id}>
                  <td>{formatoFecha(g.fecha)}</td>
                  <td>
                    {g.descripcion}
                    {g.observaciones && <div className="muted-note">{g.observaciones}</div>}
                  </td>
                  <td>
                    <span className="pill">{g.categoria}</span>
                  </td>
                  <td>{g.metodo_pago || '—'}</td>
                  <td className="amount-cell" style={{ textAlign: 'right' }}>
                    {formatoCOP.format(g.valor)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => onEditar(g)}>
                        Editar
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleEliminar(g.id)}
                        disabled={eliminandoId === g.id}
                      >
                        {eliminandoId === g.id ? '…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted-note" style={{ padding: '10px 0 16px' }}>
            {filtrados.length} de {gastos.length} gastos mostrados
          </p>
        </>
      )}
    </div>
  )
}
