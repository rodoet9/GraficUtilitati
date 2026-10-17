import { COLOR_PALETTE } from './utils'

const KEY = 'utilitati:v1'

export const DEFAULT_TYPES = [
  { id: 'electricitate', name: 'Electricitate', color: COLOR_PALETTE[0] },
  { id: 'gaze', name: 'Gaze', color: COLOR_PALETTE[1] },
  { id: 'apa', name: 'Apă', color: COLOR_PALETTE[2] },
  { id: 'caldura', name: 'Căldură', color: COLOR_PALETTE[3] },
  { id: 'internet', name: 'Internet / TV', color: COLOR_PALETTE[4] },
  { id: 'salubritate', name: 'Salubritate', color: COLOR_PALETTE[5] },
  { id: 'intretinere', name: 'Întreținere', color: COLOR_PALETTE[6] },
  { id: 'altele', name: 'Altele', color: COLOR_PALETTE[7] }
]

export function emptyState() {
  return { types: DEFAULT_TYPES, payments: [] }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    return normalize(JSON.parse(raw)) ?? emptyState()
  } catch {
    return emptyState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

// Validează și curăță datele (folosit și la import)
export function normalize(data) {
  if (!data || typeof data !== 'object') return null
  if (!Array.isArray(data.payments)) return null

  const types = Array.isArray(data.types) && data.types.length ? data.types : DEFAULT_TYPES
  const cleanTypes = types
    .filter((t) => t && typeof t.id === 'string' && typeof t.name === 'string')
    .map((t, i) => ({
      id: t.id,
      name: t.name,
      color: typeof t.color === 'string' ? t.color : COLOR_PALETTE[i % COLOR_PALETTE.length]
    }))
  const typeIds = new Set(cleanTypes.map((t) => t.id))

  const payments = data.payments
    .filter(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(p.month) &&
        typeof p.amount === 'number' &&
        Number.isFinite(p.amount) &&
        typeIds.has(p.type)
    )
    .map((p) => ({ id: p.id, month: p.month, amount: p.amount, type: p.type }))

  return { types: cleanTypes, payments }
}

export function exportJson(state) {
  return JSON.stringify(
    { app: 'utilitati', version: 1, exportedAt: new Date().toISOString(), ...state },
    null,
    2
  )
}
