import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PERIODS, formatMoney, formatMonthLong, formatMonthShort, getPeriodMonths } from '../utils'

function ChartTooltip({ active, payload, label, typeMap }) {
  if (!active || !payload || payload.length === 0) return null
  const rows = payload.filter((p) => p.value > 0).reverse()
  const total = rows.reduce((s, p) => s + p.value, 0)
  return (
    <div className="tooltip">
      <strong>{formatMonthLong(label)}</strong>
      {rows.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="dot" style={{ background: p.color }} />
          <span>{typeMap[p.dataKey]?.name}</span>
          <span>{formatMoney(p.value)}</span>
        </div>
      ))}
      <div className="tooltip-row total">
        <span>Total</span>
        <span>{formatMoney(total)}</span>
      </div>
    </div>
  )
}

export default function ChartView({ types, payments }) {
  const [period, setPeriod] = useState('6')
  const [typeFilter, setTypeFilter] = useState('all')

  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types])

  const { months, data, series, total, byType } = useMemo(() => {
    const months = getPeriodMonths(period, payments)
    const monthSet = new Set(months)
    const relevant = payments.filter(
      (p) => monthSet.has(p.month) && (typeFilter === 'all' || p.type === typeFilter)
    )

    const rows = new Map(months.map((m) => [m, { month: m }]))
    const totals = {}
    let total = 0
    for (const p of relevant) {
      const row = rows.get(p.month)
      row[p.type] = (row[p.type] ?? 0) + p.amount
      totals[p.type] = (totals[p.type] ?? 0) + p.amount
      total += p.amount
    }

    const series = types.filter((t) => totals[t.id] > 0)
    const byType = series
      .map((t) => ({ ...t, total: totals[t.id] }))
      .sort((a, b) => b.total - a.total)

    return { months, data: [...rows.values()], series, total, byType }
  }, [period, typeFilter, payments, types])

  const average = months.length ? total / months.length : 0
  const monthsWithData = data.filter((r) => series.some((s) => r[s.id] > 0)).length
  const chartWidth = Math.max(months.length * 46, 0)
  const scrollable = months.length > 7

  return (
    <section>
      <h1>Grafic</h1>

      <div className="chips" role="tablist" aria-label="Perioadă">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={period === p.id}
            className={`chip ${period === p.id ? 'active' : ''}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Tip utilitate">
          <option value="all">Toate utilitățile</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {payments.length === 0 ? (
        <p className="empty">Adaugă prima plată ca să vezi graficul.</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <span className="muted">Total perioadă</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            <div className="stat">
              <span className="muted">Medie / lună</span>
              <strong>{formatMoney(average)}</strong>
            </div>
          </div>

          <div className="card chart-card">
            <div className={scrollable ? 'chart-scroll' : ''}>
              <div style={scrollable ? { width: chartWidth } : undefined}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} width={52} tickFormatter={(v) => `${v}`} />
                    <Tooltip
                      content={<ChartTooltip typeMap={typeMap} />}
                      cursor={{ fill: 'rgba(15,118,110,0.08)' }}
                    />
                    {series.map((t) => (
                      <Bar key={t.id} dataKey={t.id} stackId="a" fill={t.color} isAnimationActive={false} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {scrollable && <p className="hint">Glisează lateral pentru toate lunile.</p>}
          </div>

          {byType.length > 0 && (
            <div className="card">
              <div className="card-head">
                <strong>Pe tipuri de utilități</strong>
                <span className="muted">{monthsWithData} luni cu plăți</span>
              </div>
              <ul className="list">
                {byType.map((t) => (
                  <li key={t.id} className="row static">
                    <span className="dot" style={{ background: t.color }} />
                    <span className="row-name">{t.name}</span>
                    <span className="row-amount">{formatMoney(t.total)}</span>
                    <span className="pct">{total > 0 ? Math.round((t.total / total) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
