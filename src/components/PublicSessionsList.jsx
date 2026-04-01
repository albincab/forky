// List of today's public sessions on the home screen

export default function PublicSessionsList({ sessions, t, onJoinPublic }) {
  if (!sessions.length) {
    return <p className="text-center text-muted">{t.publicSessionsEmpty}</p>
  }

  return (
    <div className="flex-col">
      {sessions.map(session => {
        const cuisines = [...new Set(
          session.participants.flatMap(p => p.cuisines || [])
        )].slice(0, 3).join(' · ')

        return (
          <button
            key={session.code}
            className="public-session-item"
            onClick={() => onJoinPublic(session.code)}
            aria-label={`Rejoindre le déjeuner de ${session.organizerName}`}
          >
            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🍽️</span>
            <div className="public-session-meta">
              <div className="public-session-name">
                Déjeuner de {session.organizerName}
              </div>
              <div className="public-session-detail">
                {session.participants.length} participant{session.participants.length > 1 ? 's' : ''}
                {cuisines ? ` · ${cuisines}` : ''}
              </div>
            </div>
            <span style={{ color: 'var(--honey)', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>
              {t.publicJoin || 'Rejoindre'} →
            </span>
          </button>
        )
      })}
    </div>
  )
}
