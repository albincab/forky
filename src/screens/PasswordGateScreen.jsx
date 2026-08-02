// Access gate shown before anything else in the app (see APP_PASSWORD in App.jsx).
// Presentation only — the password check itself lives in App.jsx, same separation
// as every other screen (this one just calls onSubmit with what was typed).
import { useState } from 'react'

export default function PasswordGateScreen({ error, onSubmit }) {
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(password)
  }

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 34 }}>À TABLE!</div>
        </div>

        <div className="input-affiche">
          <span className="prefix">🔒</span>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            aria-label="Mot de passe"
          />
        </div>

        {error && <span className="error-msg" role="alert">⚠ {error}</span>}

        <button type="submit" className="btn btn-red">
          <span>Entrer</span>
          <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
        </button>

        <a href="mailto:albincab@gmail.com" className="eyebrow" style={{ textAlign: 'center', textDecoration: 'none' }}>
          Pas d'accès ? Contacte albincab@gmail.com
        </a>
      </form>
    </div>
  )
}
