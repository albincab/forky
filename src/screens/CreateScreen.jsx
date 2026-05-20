import { useState } from 'react'
import { createSession } from '../services/sessionService.js'

export default function CreateScreen({ t, onBack, onCreated }) {
  const [name,    setName]    = useState('')
  const [type,    setType]    = useState('private')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError(t.nameRequired); return }

    setLoading(true)
    try {
      const { session, organizerId } = await createSession({
        organizerName: name.trim(),
        type,
      })
      onCreated({ code: session.code, organizerId })
    } catch {
      setError(t.claudeError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <button onClick={onBack} aria-label={t.back}>← RETOUR</button>
        <span>★ NOUVELLE SESSION</span>
        <span>01 / 02</span>
      </div>

      {/* Header */}
      <div>
        <div className="eyebrow">— étape 01 —</div>
        <div className="display" style={{ fontSize: 42, marginTop: 6 }}>
          <span>Je lance le</span>
          <span style={{ lineHeight: '1' }}>Déjeuner.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Name input */}
        <div className="input-group">
          <label htmlFor="org-name" className="input-label">{t.yourName}</label>
          <div className="input-affiche">
            <span className="prefix">★</span>
            <input
              id="org-name"
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
          {error && <span className="error-msg" role="alert">⚠ {error}</span>}
        </div>

        <hr className="rule-thick" />
        <div className="eyebrow">— type de session —</div>

        {/* Session type tiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              key: 'private',
              emoji: '🔒',
              title: t.sessionPrivate,
              desc: t.sessionPrivateDesc,
              badge: null,
            },
            {
              key: 'public',
              emoji: '🌐',
              title: t.sessionPublic,
              desc: t.sessionPublicDesc,
              badge: '★ OUVERT',
            },
          ].map(o => (
            <button
              key={o.key}
              type="button"
              style={{
                border: '1.5px solid var(--ink)',
                background: type === o.key ? 'var(--yellow)' : 'var(--bg)',
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                boxShadow: type === o.key ? '4px 4px 0 var(--ink)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                borderRadius: 0,
                transition: 'background 0.12s, box-shadow 0.12s',
              }}
              onClick={() => setType(o.key)}
              aria-pressed={type === o.key}
            >
              <div style={{ fontSize: 30, lineHeight: 1 }}>{o.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "'Boldonse', serif", fontSize: 20, textTransform: 'uppercase', lineHeight: 1.1, display: 'block' }}>
                  {o.title}
                </span>
                {o.badge && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background: 'var(--ink)',
                    color: 'var(--yellow)',
                    padding: '2px 7px',
                  }}>
                    {o.badge}
                  </span>
                )}
                <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 5, lineHeight: 1.4 }}>
                  {o.desc}
                </div>
              </div>
              {/* Checkbox */}
              <div style={{
                width: 22,
                height: 22,
                border: '1.5px solid var(--ink)',
                background: type === o.key ? 'var(--ink)' : 'transparent',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                marginTop: 2,
                color: type === o.key ? 'var(--yellow)' : 'transparent',
                fontFamily: "'Boldonse', serif",
                fontSize: 14,
                lineHeight: 1,
              }} aria-hidden="true">
                ✓
              </div>
            </button>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-auto">
          <button type="submit" className="btn btn-red" disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Création…</>
            ) : (
              <>
                <span>{t.createBtn}</span>
                <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
