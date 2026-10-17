import { useState } from 'react'
import { currentMonth, parseAmount } from '../utils'

export default function PaymentForm({
  types,
  initial,
  submitLabel = 'Salvează',
  onSubmit,
  onCancel,
  onDelete
}) {
  const [month, setMonth] = useState(initial?.month ?? currentMonth())
  const [type, setType] = useState(initial?.type ?? types[0]?.id ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace('.', ',') : '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!month) return setError('Alege luna.')
    if (!type) return setError('Alege tipul utilității.')
    if (!Number.isFinite(value) || value <= 0) return setError('Introdu o sumă validă, mai mare decât 0.')
    setError('')
    onSubmit({ month, type, amount: Math.round(value * 100) / 100 })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Luna</span>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
      </label>

      <label className="field">
        <span>Tip utilitate</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Suma plătită (RON)</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="ex. 245,50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="submit" className="btn primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Anulează
          </button>
        )}
        {onDelete && (
          <button type="button" className="btn danger" onClick={onDelete}>
            Șterge
          </button>
        )}
      </div>
    </form>
  )
}
