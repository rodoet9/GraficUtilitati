import { useCallback, useEffect, useState } from 'react'
import PaymentForm from './components/PaymentForm'
import History from './components/History'
import ChartView from './components/ChartView'
import Settings from './components/Settings'
import { loadState, saveState } from './storage'
import { formatMoney, formatMonthLong, makeId } from './utils'

const TABS = [
  { id: 'add', label: 'Adaugă', icon: '＋' },
  { id: 'history', label: 'Istoric', icon: '☰' },
  { id: 'chart', label: 'Grafic', icon: '▥' },
  { id: 'settings', label: 'Setări', icon: '⚙' }
]

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('add')
  const [saved, setSaved] = useState(null)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    saveState(state)
  }, [state])

  // Cere browserului să nu șteargă datele (util pe iOS)
  useEffect(() => {
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {})
  }, [])

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(null), 3500)
    return () => clearTimeout(t)
  }, [saved])

  const addPayment = useCallback((values) => {
    setState((s) => ({ ...s, payments: [...s.payments, { id: makeId(), ...values }] }))
    setSaved(values)
    setFormKey((k) => k + 1)
  }, [])

  const updatePayment = useCallback((id, values) => {
    setState((s) => ({ ...s, payments: s.payments.map((p) => (p.id === id ? { ...p, ...values } : p)) }))
  }, [])

  const deletePayment = useCallback((id) => {
    setState((s) => ({ ...s, payments: s.payments.filter((p) => p.id !== id) }))
  }, [])

  const addType = useCallback((type) => setState((s) => ({ ...s, types: [...s.types, type] })), [])
  const renameType = useCallback(
    (id, name) => setState((s) => ({ ...s, types: s.types.map((t) => (t.id === id ? { ...t, name } : t)) })),
    []
  )
  const deleteType = useCallback(
    (id) => setState((s) => ({ ...s, types: s.types.filter((t) => t.id !== id) })),
    []
  )
  const replaceAll = useCallback((data) => setState(data), [])

  const typeName = (id) => state.types.find((t) => t.id === id)?.name ?? ''

  return (
    <div className="app">
      <main className="content">
        {tab === 'add' && (
          <section>
            <h1>Adaugă plată</h1>
            <div className="card">
              <PaymentForm key={formKey} types={state.types} onSubmit={addPayment} />
            </div>
            {saved && (
              <p className="notice success" role="status">
                Salvat: {typeName(saved.type)}, {formatMonthLong(saved.month)}, {formatMoney(saved.amount)}
              </p>
            )}
          </section>
        )}

        {tab === 'history' && (
          <History
            types={state.types}
            payments={state.payments}
            onUpdate={updatePayment}
            onDelete={deletePayment}
          />
        )}

        {tab === 'chart' && <ChartView types={state.types} payments={state.payments} />}

        {tab === 'settings' && (
          <Settings
            state={state}
            onAddType={addType}
            onRenameType={renameType}
            onDeleteType={deleteType}
            onReplaceAll={replaceAll}
          />
        )}
      </main>

      <nav className="tabbar" aria-label="Navigare">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="tab-icon" aria-hidden="true">
              {t.icon}
            </span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
