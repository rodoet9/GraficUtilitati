import { useMemo, useState } from 'react'
import PaymentForm from './PaymentForm'
import { formatMoney, formatMonthLong } from '../utils'

export default function History({ types, payments, onUpdate, onDelete }) {
  const [year, setYear] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editing, setEditing] = useState(null)

  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types])

  const years = useMemo(
    () => [...new Set(payments.map((p) => p.month.slice(0, 4)))].sort().reverse(),
    [payments]
  )

  const groups = useMemo(() => {
    const filtered = payments.filter(
      (p) => (year === 'all' || p.month.startsWith(year)) && (typeFilter === 'all' || p.type === typeFilter)
    )
    const byMonth = new Map()
    for (const p of filtered) {
      if (!byMonth.has(p.month)) byMonth.set(p.month, [])
      byMonth.get(p.month).push(p)
    }
    return [...byMonth.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, items]) => ({
        month,
        items: items.sort((a, b) => (typeMap[a.type]?.name ?? '').localeCompare(typeMap[b.type]?.name ?? '', 'ro')),
        total: items.reduce((s, p) => s + p.amount, 0)
      }))
  }, [payments, year, typeFilter, typeMap])

  function confirmDelete(p) {
    if (window.confirm('Ștergi această plată?')) {
      onDelete(p.id)
      setEditing(null)
    }
  }

  return (
    <section>
      <h1>Istoric</h1>

      <div className="filters">
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="An">
          <option value="all">Toți anii</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Tip">
          <option value="all">Toate tipurile</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 && (
        <p className="empty">
          {payments.length === 0
            ? 'Nu ai adăugat nicio plată încă. Începe din tabul „Adaugă”.'
            : 'Nicio plată pentru filtrele alese.'}
        </p>
      )}

      {groups.map((g) => (
        <div className="card" key={g.month}>
          <div className="card-head">
            <strong>{formatMonthLong(g.month)}</strong>
            <span className="muted">{formatMoney(g.total)}</span>
          </div>
          <ul className="list">
            {g.items.map((p) => (
              <li key={p.id}>
                <button className="row" onClick={() => setEditing(p)}>
                  <span className="dot" style={{ background: typeMap[p.type]?.color }} />
                  <span className="row-name">{typeMap[p.type]?.name ?? 'Necunoscut'}</span>
                  <span className="row-amount">{formatMoney(p.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {editing && (
        <div className="overlay" onClick={() => setEditing(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>Editează plata</h2>
            <PaymentForm
              types={types}
              initial={editing}
              submitLabel="Salvează modificările"
              onSubmit={(values) => {
                onUpdate(editing.id, values)
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
              onDelete={() => confirmDelete(editing)}
            />
          </div>
        </div>
      )}
    </section>
  )
}
