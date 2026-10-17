import { useRef, useState } from 'react'
import { COLOR_PALETTE, makeId } from '../utils'
import { exportJson, normalize } from '../storage'

export default function Settings({ state, onAddType, onRenameType, onDeleteType, onReplaceAll }) {
  const [newName, setNewName] = useState('')
  const [message, setMessage] = useState('')
  const fileRef = useRef(null)

  const usage = {}
  for (const p of state.payments) usage[p.type] = (usage[p.type] ?? 0) + 1

  function addType(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (state.types.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setMessage('Există deja un tip cu acest nume.')
      return
    }
    onAddType({ id: makeId(), name, color: COLOR_PALETTE[state.types.length % COLOR_PALETTE.length] })
    setNewName('')
    setMessage('')
  }

  function rename(t) {
    const name = window.prompt('Nume nou:', t.name)
    if (name && name.trim()) onRenameType(t.id, name.trim())
  }

  function remove(t) {
    if (usage[t.id]) {
      setMessage(`„${t.name}” are ${usage[t.id]} plăți și nu poate fi șters. Șterge sau mută mai întâi plățile.`)
      return
    }
    if (window.confirm(`Ștergi tipul „${t.name}”?`)) {
      onDeleteType(t.id)
      setMessage('')
    }
  }

  async function exportData() {
    const json = exportJson(state)
    const date = new Date().toISOString().slice(0, 10)
    const fileName = `utilitati-backup-${date}.json`
    const file = new File([json], fileName, { type: 'application/json' })

    // Pe iPhone, foaia de partajare permite salvarea în Fișiere / AirDrop / Mail
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Backup utilități' })
        setMessage('Backup exportat.')
        return
      } catch (err) {
        if (err && err.name === 'AbortError') return
      }
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    setMessage('Backup descărcat.')
  }

  async function copyData() {
    try {
      await navigator.clipboard.writeText(exportJson(state))
      setMessage('Datele au fost copiate în clipboard.')
    } catch {
      setMessage('Nu am putut copia. Folosește butonul „Exportă backup”.')
    }
  }

  function importFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = normalize(JSON.parse(String(reader.result)))
        if (!data) throw new Error('format')
        const ok = window.confirm(
          `Fișierul conține ${data.payments.length} plăți. Datele actuale (${state.payments.length} plăți) vor fi înlocuite. Continui?`
        )
        if (ok) {
          onReplaceAll(data)
          setMessage('Datele au fost importate.')
        }
      } catch {
        setMessage('Fișier invalid. Alege un backup exportat din această aplicație.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <section>
      <h1>Setări</h1>

      <div className="card">
        <div className="card-head">
          <strong>Tipuri de utilități</strong>
        </div>
        <ul className="list">
          {state.types.map((t) => (
            <li key={t.id} className="row static">
              <span className="dot" style={{ background: t.color }} />
              <span className="row-name">
                {t.name} <span className="muted small">({usage[t.id] ?? 0})</span>
              </span>
              <button className="link" onClick={() => rename(t)}>
                Redenumește
              </button>
              <button className="link danger-text" onClick={() => remove(t)}>
                Șterge
              </button>
            </li>
          ))}
        </ul>
        <form className="inline-form" onSubmit={addType}>
          <input
            type="text"
            placeholder="Tip nou (ex. Parcare)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn primary">
            Adaugă
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-head">
          <strong>Backup</strong>
        </div>
        <p className="muted small">
          Datele sunt păstrate doar pe acest telefon. Exportă periodic un backup, mai ales înainte să ștergi aplicația
          sau să schimbi telefonul.
        </p>
        <div className="actions">
          <button className="btn primary" onClick={exportData}>
            Exportă backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importă backup
          </button>
          <button className="btn" onClick={copyData}>
            Copiază date
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
      </div>

      {message && <p className="notice">{message}</p>}
    </section>
  )
}
