import { useState } from 'react'
import { joinSession } from '../services/sessionService.js'

export default function JoinScreen({ t, initialCode, onBack, onJoined }) {
  const [name,    setName]    = useState('')
  const [code,    setCode]    = useState(initialCode || '')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError(t.nameRequired); return }
    if (!code.trim()) { setError(t.codeRequired); return }

    setLoading(true)
    try {
      const result = await joinSession({ code: code.trim(), participantName: name.trim() })

      if (result.error === 'SESSION_NOT_FOUND') { setError(t.sessionNotFound); return }
      if (result.error === 'SESSION_CLOSED')    { setError(t.sessionClosed);   return }
      if (result.error)                         { setError(result.error);       return }

      onJoined({ code: result.session.code, participantId: result.participantId })
    } catch {
      setError(t.sessionNotFound)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div className="flex-row">
        <button className="btn-ghost" onClick={onBack} aria-label={t.back}>
          ← {t.back}
        </button>
      </div>

      <h1>{t.joinTitle}</h1>

      <form onSubmit={handleSubmit} className="flex-col" style={{ gap: 20 }}>
        <div className="input-group">
          <label htmlFor="join-name" className="input-label">{t.yourName}</label>
          <input
            id="join-name"
            className="input"
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            maxLength={30}
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="join-code" className="input-label">{t.sessionCode}</label>
          <input
            id="join-code"
            className="input input-code"
            type="text"
            placeholder={t.codePlaceholder}
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 4)); setError('') }}
            maxLength={4}
            inputMode="text"
            autoCapitalize="characters"
            disabled={loading}
          />
          {error && <span className="error-msg" role="alert">⚠ {error}</span>}
        </div>

        <div className="mt-auto">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Connexion…</>
              : `🎟️ ${t.joinBtn}`
            }
          </button>
        </div>
      </form>
    </div>
  )
}
