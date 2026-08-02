// Internal, unlinked page — reachable only via the secret ?maintenance= URL param
// (see MAINTENANCE_TOKEN in App.jsx). Client-side maintenance tools to help
// unblock a user over the phone: clear stale local data, force a cache-free
// reload. No Supabase/server-side operations here — front-end only.
import { useState } from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys.js'

const ATABLE_KEYS = Object.values(STORAGE_KEYS)

function getSnapshot() {
  const snapshot = {}
  ATABLE_KEYS.forEach(key => { snapshot[key] = localStorage.getItem(key) })
  return snapshot
}

export default function MaintenanceScreen() {
  const [snapshot, setSnapshot] = useState(getSnapshot)
  const [message,  setMessage]  = useState('')

  function run(action, label) {
    action()
    setSnapshot(getSnapshot())
    setMessage(`✓ ${label}`)
  }

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <span></span>
        <span>★ MAINTENANCE</span>
        <span></span>
      </div>

      <div>
        <div className="eyebrow">— page interne, non référencée —</div>
        <h1 className="display" style={{ fontSize: 30, marginTop: 6 }}>Outils de maintenance</h1>
      </div>

      <hr className="rule-thick" />

      <div className="flex-col" style={{ gap: 10 }}>
        <button
          className="btn btn-secondary"
          onClick={() => run(() => {
            localStorage.removeItem(STORAGE_KEYS.CODE)
            localStorage.removeItem(STORAGE_KEYS.UID)
            localStorage.removeItem(STORAGE_KEYS.ORGANIZER)
          }, 'Identité locale effacée — déconnecté de la table active')}
        >
          🚪 Quitter la table active (identité locale)
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => run(() => localStorage.removeItem(STORAGE_KEYS.HISTORY), '"Mes tables" vidé')}
        >
          🗑️ Vider l'historique "Mes tables"
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => run(() => localStorage.removeItem(STORAGE_KEYS.GUIDE_SEEN), 'Invite du Guide réactivée')}
        >
          ❓ Réafficher l'invite du Guide à la prochaine visite
        </button>

        <button
          className="btn btn-red"
          onClick={() => run(() => ATABLE_KEYS.forEach(key => localStorage.removeItem(key)), 'Toutes les données locales supprimées')}
        >
          🧹 Tout vider (données locales de l'app)
        </button>

        <button
          className="btn btn-primary"
          onClick={() => { window.location.href = `${window.location.pathname}?_=${Date.now()}` }}
        >
          ♻️ Recharger la page sans cache
        </button>
      </div>

      {message && (
        <p className="eyebrow" style={{ color: 'var(--success)' }} role="status">{message}</p>
      )}

      <hr className="rule-thick" />

      <div className="flex-col" style={{ gap: 6 }}>
        <h2 style={{ fontSize: 14 }}>Diagnostic</h2>
        <pre style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          background: 'var(--sand)',
          border: '1.5px solid var(--ink)',
          padding: 10,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          margin: 0,
        }}>
{JSON.stringify(snapshot, null, 2)}
        </pre>
        <p className="eyebrow">v{__APP_VERSION__} · {navigator.userAgent}</p>
      </div>
    </div>
  )
}
