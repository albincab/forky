import { useState, useEffect } from 'react'
import { getPublicSessions } from '../services/sessionService.js'
import AppLogo from '../components/AppLogo.jsx'

export default function HomeScreen({ t, onCreate, onJoin, onMyLunches }) {
  const [publicSessions, setPublicSessions] = useState([])

  async function refresh() {
    const sessions = await getPublicSessions()
    setPublicSessions(sessions)
  }

  // Poll every 5 seconds for new public sessions
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="screen">

      {/* Logo lockup */}
      <AppLogo />

      {/* Manifeste */}
      <div style={{ fontSize: 17, lineHeight: 1.3, fontWeight: 500 }}>
        Fini les{' '}
        <span style={{
          background: 'var(--red)',
          color: '#FFF',
          fontFamily: "'Boldonse', serif",
          textTransform: 'uppercase',
          fontSize: 18,
          padding: '2px 8px',
          lineHeight: 1.2,
          display: 'inline-block',
        }}>
          « on mange où&nbsp;»
        </span>{' '}
        qui durent 20 min.
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary" onClick={onCreate}>
          <span>🚀 {t.ctaCreate}</span>
          <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
        </button>
        <button className="btn btn-secondary" onClick={() => onJoin(null)}>
          <span>🎟 {t.ctaJoin}</span>
          <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>↗</span>
        </button>
      </div>

      <hr className="rule-thick" />

      {/* Sessions header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="display" style={{ fontSize: 22 }}>Midi du jour</div>
        <span className="eyebrow">
          {publicSessions.length > 0
            ? `● ${publicSessions.length} session${publicSessions.length > 1 ? 's' : ''} live`
            : '○ aucune session'}
        </span>
      </div>

      {/* Public sessions as menu-rows */}
      {publicSessions.length > 0 ? (
        <div>
          {publicSessions.map((session, i) => {
            const cuisines = [...new Set(
              session.participants.flatMap(p => p.cuisines || [])
            )].slice(0, 3).join(' · ')

            return (
              <button
                key={session.code}
                className="menu-row"
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => onJoin(session.code)}
                aria-label={`Rejoindre le déjeuner de ${session.organizerName}`}
              >
                <span className="num">0{i + 1}</span>
                <div className="meta-block">
                  <span className="name">{session.organizerName}</span>
                  <span className="sub">
                    {session.participants.length} pers.{cuisines ? ` · ${cuisines}` : ''}
                  </span>
                </div>
                <span className="code-badge">#{session.code}</span>
                <span className="arrow">→</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="eyebrow" style={{ textAlign: 'center', padding: '12px 0' }}>
          {t.publicSessionsEmpty}
        </p>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1.5px solid var(--ink)',
        paddingTop: 10,
      }}>
        <span className="eyebrow">Sans compte · sans friction</span>
        <button className="btn-ghost" onClick={onMyLunches}>
          {t.myLunches}
        </button>
        <span className="eyebrow">v{__APP_VERSION__}</span>
      </div>
    </div>
  )
}
