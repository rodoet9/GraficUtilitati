export const MONTHS_SHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec']
export const MONTHS_FULL = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'
]

const pad = (n) => String(n).padStart(2, '0')

export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export function monthRange(from, to) {
  const out = []
  let cur = from
  let guard = 0
  while (cur <= to && guard < 600) {
    out.push(cur)
    cur = addMonths(cur, 1)
    guard++
  }
  return out
}

export function formatMonthShort(ym) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS_SHORT[m - 1]} ${String(y).slice(2)}`
}

export function formatMonthLong(ym) {
  const [y, m] = ym.split('-').map(Number)
  const name = MONTHS_FULL[m - 1]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`
}

const moneyFmt = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'RON',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function formatMoney(n) {
  return moneyFmt.format(n || 0)
}

// Acceptă "123,45", "123.45", "1 234,5"
export function parseAmount(value) {
  const cleaned = String(value).trim().replace(/\s/g, '').replace(',', '.')
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const PERIODS = [
  { id: '3', label: '3 luni' },
  { id: '6', label: '6 luni' },
  { id: '12', label: '12 luni' },
  { id: 'year', label: 'Anul curent' },
  { id: 'all', label: 'Tot' }
]

// Returnează lista de luni (YYYY-MM) pentru perioada aleasă
export function getPeriodMonths(periodId, payments) {
  const now = currentMonth()
  let to = now
  for (const p of payments) if (p.month > to) to = p.month

  if (periodId === 'year') {
    const year = now.slice(0, 4)
    return monthRange(`${year}-01`, `${year}-12`)
  }
  if (periodId === 'all') {
    if (payments.length === 0) return [now]
    let from = payments[0].month
    for (const p of payments) if (p.month < from) from = p.month
    return monthRange(from, to)
  }
  const n = Number(periodId)
  return monthRange(addMonths(now, -(n - 1)), now)
}

// Culori pentru tipuri noi create de utilizator
export const COLOR_PALETTE = [
  '#eab308', '#ef4444', '#0ea5e9', '#8b5cf6', '#14b8a6',
  '#64748b', '#84cc16', '#ec4899', '#f97316', '#06b6d4',
  '#a16207', '#6366f1'
]
