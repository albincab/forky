import { useState, useEffect } from 'react'
import { joinSession } from '../services/sessionService.js'
import CodeStrip from '../components/CodeStrip.jsx'

export default function JoinScreen({ t, initialCode, onBack, onJoined }) {
  const [name,    setName]    = useState('')
  const [code,    setCode]    = useState(initialCode || '')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialCode || code) return
    navigator.clipboard?.readText().then(text => {
      const trimmed = text.trim()
      if (/^[0-9]{4}$/.test(trimmed)) setCode(trimmed)
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError(t.nameRequired); return }
    if (!code.trim()) { setError(t.codeRequired); return }

    setLoading(true)
    try {
      const result = await joinSession({
        code: code.trim(),
        participantName: name.trim(),
      })

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
      {/* Masthead */}
      <div className="masthead">
        <button onClick={onBack} aria-label={t.back}>← RETOUR</button>
        <span>★ REJOINDRE</span>
        <span></span>
      </div>

      {/* Header */}
      <div>
        <div className="eyebrow">— rejoindre une table —</div>
        <div className="display" style={{ fontSize: 46, marginTop: 6 }}>
          <span>J'ai le</span>
          <span>Numéro.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Code strip + real input */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>4 chiffres</span>
            <span>↓ saisir</span>
          </div>
          {/* Visual strip */}
          <CodeStrip code={code} />
          {/* Real input — always visible below strip */}
          <div className="input-group" style={{ marginTop: 8 }}>
            <label htmlFor="join-code" className="input-label">{t.sessionCode}</label>
            <input
              id="join-code"
              className="input input-code"
              type="text"
              placeholder={t.codePlaceholder}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
              maxLength={4}
              inputMode="numeric"
              disabled={loading}
            />
          </div>
        </div>

        {/* Name input */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Ton prénom</div>
          <div className="input-affiche" style={{ boxShadow: 'none' }}>
            <span className="prefix">@</span>
            <input
              id="join-name"
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              maxLength={30}
              autoFocus
              disabled={loading}
              aria-label={t.yourName}
            />
          </div>
        </div>

        {error && <span className="error-msg" role="alert">⚠ {error}</span>}

        {/* Submit */}
        <div className="mt-auto">
          <button type="submit" className="btn btn-red" disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Connexion…</>
            ) : (
              <>
                <span>🎟️ {t.joinBtn}</span>
                <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
