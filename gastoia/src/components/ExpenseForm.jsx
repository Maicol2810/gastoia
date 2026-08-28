import { useState } from 'react'
import { CATEGORIAS, METODOS_PAGO } from '../supabaseClient'

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

const vacio = {
  descripcion: '',
  valor: '',
  categoria: CATEGORIAS[0],
  fecha: hoyISO(),
  metodo_pago: METODOS_PAGO[0],
  observaciones: ''
}

export default function ExpenseForm({ initialValue, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initialValue
      ? {
          descripcion: initialValue.descripcion,
          valor: String(initialValue.valor),
          categoria: initialValue.categoria,
          fecha: initialValue.fecha,
          metodo_pago: initialValue.metodo_pago || METODOS_PAGO[0],
          observaciones: initialValue.observaciones || ''
        }
      : vacio
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const validar = () => {
    if (!form.descripcion.trim()) return 'La descripción es obligatoria.'
    if (!form.valor || Number(form.valor) <= 0) return 'Ingresa un valor mayor a cero.'
    if (!form.categoria) return 'Selecciona una categoría.'
    if (!form.fecha) return 'Selecciona una fecha.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const mensaje = validar()
    if (mensaje) {
      setError(mensaje)
      return
    }
    setError(null)
    setGuardando(true)
    try {
      await onSubmit({
        descripcion: form.descripcion.trim(),
        valor: Number(form.valor),
        categoria: form.categoria,
        fecha: form.fecha,
        metodo_pago: form.metodo_pago,
        observaciones: form.observaciones.trim() || null
      })
      setForm(vacio)
    } catch (err) {
      setError(err.message || 'No se pudo guardar el gasto.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-title">{initialValue ? 'Editar gasto' : 'Registrar nuevo gasto'}</div>

      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="descripcion">Descripción</label>
          <input
            id="descripcion"
            type="text"
            placeholder="Ej: Mercado de la semana"
            value={form.descripcion}
            onChange={set('descripcion')}
          />
        </div>

        <div className="field">
          <label htmlFor="valor">Valor (COP)</label>
          <input
            id="valor"
            className="value-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.valor}
            onChange={set('valor')}
          />
        </div>

        <div className="field">
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" value={form.categoria} onChange={set('categoria')}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" type="date" value={form.fecha} onChange={set('fecha')} />
        </div>

        <div className="field">
          <label htmlFor="metodo_pago">Método de pago</label>
          <select id="metodo_pago" value={form.metodo_pago} onChange={set('metodo_pago')}>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="field span-3">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            placeholder="Notas adicionales (opcional)"
            value={form.observaciones}
            onChange={set('observaciones')}
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? 'Guardando…' : initialValue ? 'Guardar cambios' : 'Registrar gasto'}
        </button>
      </div>
    </form>
  )
}
