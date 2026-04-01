import { useState } from 'react'
import { createSession } from '../services/sessionService.js'

export default function CreateScreen({ t, onBack, onCreated }) {
  const [name, setName]   = useState('')
  const [type, setType]   = useState('private')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError(t.nameRequired); return }

    const { session, organizerId } = createSession({
      organizerName: name.trim(),
      type,
    })

    onCreated({ code: session.code, organizerId })
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="flex-row">
        <button className="btn-ghost" onClick={onBack} aria-label={t.back}>
          ← {t.back}
        </button>
      </div>

      <h1>{t.createTitle}</h1>

      <form onSubmit={handleSubmit} className="flex-col" style={{ gap: 20 }}>
        {/* Name input */}
        <div className="input-group">
          <label htmlFor="org-name" className="input-label">
            {t.yourName}
          </label>
          <input
            id="org-name"
            className="input"
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            maxLength={30}
            autoFocus
          />
          {error && <span className="error-msg" role="alert">⚠ {error}</span>}
        </div>

        {/* Session type */}
        <div className="flex-col" style={{ gap: 8 }}>
          <span className="input-label">{t.sessionType}</span>

          <button
            type="button"
            className={`type-option ${type === 'public' ? 'selected' : ''}`}
            onClick={() => setType('public')}
            aria-pressed={type === 'public'}
          >
            <span className="type-option-icon">🌍</span>
            <div className="type-option-text">
              <h3>{t.sessionPublic}</h3>
              <p>{t.sessionPublicDesc}</p>
            </div>
            {type === 'public' && <span aria-hidden="true">✓</span>}
          </button>

          <button
            type="button"
            className={`type-option ${type === 'private' ? 'selected' : ''}`}
            onClick={() => setType('private')}
            aria-pressed={type === 'private'}
          >
            <span className="type-option-icon">🔒</span>
            <div className="type-option-text">
              <h3>{t.sessionPrivate}</h3>
              <p>{t.sessionPrivateDesc}</p>
            </div>
            {type === 'private' && <span aria-hidden="true">✓</span>}
          </button>
        </div>

        <div className="mt-auto">
          <button type="submit" className="btn btn-primary">
            {t.createBtn}
          </button>
        </div>
      </form>
    </div>
  )
}
