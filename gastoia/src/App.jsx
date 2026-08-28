import { useMemo, useState } from 'react'
import { useExpenses } from './hooks/useExpenses'
import Dashboard from './components/Dashboard'
import ExpenseForm from './components/ExpenseForm'
import ExpenseTable from './components/ExpenseTable'
import AIAnalysis from './components/AIAnalysis'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'registrar', label: 'Registrar gasto' },
  { id: 'historial', label: 'Historial' }
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [editingGasto, setEditingGasto] = useState(null)
  const { gastos, loading, error, crearGasto, actualizarGasto, eliminarGasto } = useExpenses()

  const hoy = useMemo(
    () =>
      new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    []
  )

  const handleEditar = (gasto) => {
    setEditingGasto(gasto)
    setTab('registrar')
  }

  const handleGuardar = async (payload) => {
    if (editingGasto) {
      await actualizarGasto(editingGasto.id, payload)
      setEditingGasto(null)
    } else {
      await crearGasto(payload)
    }
    setTab('historial')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            Gasto<span>IA</span>
          </span>
          <span className="brand-tag">Control de gastos personaless</span>
        </div>
        <div className="header-date">{hoy}</div>
      </header>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => {
              if (t.id !== 'registrar') setEditingGasto(null)
              setTab(t.id)
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <p className="form-error">Error cargando datos: {error}</p>}

      {tab === 'dashboard' && (
        <>
          <Dashboard gastos={gastos} loading={loading} />
          <AIAnalysis gastos={gastos} />
        </>
      )}

      {tab === 'registrar' && (
        <ExpenseForm
          key={editingGasto ? editingGasto.id : 'nuevo'}
          initialValue={editingGasto}
          onCancel={() => {
            setEditingGasto(null)
            setTab('historial')
          }}
          onSubmit={handleGuardar}
        />
      )}

      {tab === 'historial' && (
        <ExpenseTable
          gastos={gastos}
          loading={loading}
          onEditar={handleEditar}
          onEliminar={eliminarGasto}
        />
      )}

      <footer className="app-footer">GastoIA — tus datos viven únicamente en tu proyecto de Supabase.</footer>
    </div>
  )
}
