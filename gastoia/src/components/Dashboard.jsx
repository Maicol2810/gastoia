import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

const COLORS = ['#1f7a5c', '#2fa07a', '#6fc2a3', '#e2572b', '#f0906e', '#334155', '#7c8698', '#c9d0d8', '#a3d9c5', '#8aa6bd']

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

function mesActual(fecha) {
  const hoy = new Date()
  const d = new Date(fecha + 'T00:00:00')
  return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()
}

function anioActual(fecha) {
  const hoy = new Date()
  const d = new Date(fecha + 'T00:00:00')
  return d.getFullYear() === hoy.getFullYear()
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Dashboard({ gastos, loading }) {
  const stats = useMemo(() => {
    const totalMes = gastos.filter((g) => mesActual(g.fecha)).reduce((s, g) => s + Number(g.valor), 0)
    const totalAnio = gastos.filter((g) => anioActual(g.fecha)).reduce((s, g) => s + Number(g.valor), 0)
    const cantidad = gastos.length

    const porCategoria = {}
    gastos.forEach((g) => {
      porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + Number(g.valor)
    })
    const dataCategoria = Object.entries(porCategoria)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const porMes = Array.from({ length: 12 }, (_, i) => ({ mes: MESES[i], total: 0 }))
    gastos.forEach((g) => {
      const d = new Date(g.fecha + 'T00:00:00')
      if (d.getFullYear() === new Date().getFullYear()) {
        porMes[d.getMonth()].total += Number(g.valor)
      }
    })

    return { totalMes, totalAnio, cantidad, dataCategoria, porMes }
  }, [gastos])

  return (
    <>
      <section className="kpi-grid">
        <div className="card kpi-card primary">
          <div className="kpi-label">Gastos del mes</div>
          <div className="kpi-value">{formatoCOP.format(stats.totalMes)}</div>
          <div className="kpi-sub">Acumulado del mes en curso</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Gastos del año</div>
          <div className="kpi-value">{formatoCOP.format(stats.totalAnio)}</div>
          <div className="kpi-sub">Acumulado {new Date().getFullYear()}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Cantidad de gastos</div>
          <div className="kpi-value">{stats.cantidad}</div>
          <div className="kpi-sub">Registros totales</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Promedio por registro</div>
          <div className="kpi-value">
            {formatoCOP.format(stats.cantidad ? stats.totalAnio / Math.max(1, gastos.filter((g) => anioActual(g.fecha)).length) : 0)}
          </div>
          <div className="kpi-sub">Sobre gastos del año</div>
        </div>
      </section>

      <section className="chart-grid">
        <div className="card chart-card">
          <div className="chart-title">Gastos por categoría</div>
          <div className="chart-sub">Distribución histórica de tus registros</div>
          {stats.dataCategoria.length === 0 ? (
            <div className="empty-state">{loading ? 'Cargando…' : 'Aún no hay gastos registrados.'}</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.dataCategoria}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {stats.dataCategoria.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatoCOP.format(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {stats.dataCategoria.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 16 }}>
              {stats.dataCategoria.map((c, i) => (
                <span key={c.name} style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: COLORS[i % COLORS.length],
                      marginRight: 6
                    }}
                  />
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card chart-card">
          <div className="chart-title">Gastos por mes</div>
          <div className="chart-sub">Total mensual — {new Date().getFullYear()}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.porMes} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} width={0} />
              <Tooltip formatter={(value) => formatoCOP.format(value)} />
              <Bar dataKey="total" fill="#1f7a5c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  )
}
