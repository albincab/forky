import { useState, useEffect } from 'react'
import { getPublicSessions } from '../services/sessionService.js'
import PublicSessionsList from '../components/PublicSessionsList.jsx'

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
      <div className="home-hero">
        <div className="home-logo">🍽️</div>
        <h1 className="home-app-name">À TABLE!</h1>
        <p className="home-tagline">{t.tagline}</p>
      </div>

      <div className="flex-col">
        <button className="btn btn-primary" onClick={onCreate}>
          🚀 {t.ctaCreate}
        </button>
        <button className="btn btn-secondary" onClick={() => onJoin(null)}>
          🎟️ {t.ctaJoin}
        </button>
        <button className="btn btn-outline" onClick={onMyLunches}>
          📋 {t.myLunches}
        </button>
      </div>

      {publicSessions.length > 0 && (
        <>
          <div className="divider">{t.publicSessionsTitle}</div>
          <PublicSessionsList
            sessions={publicSessions}
            t={t}
            onJoinPublic={code => onJoin(code)}
          />
        </>
      )}

      <p className="text-center text-muted" style={{ fontSize: '0.72rem', marginTop: 'auto' }}>
        v{__APP_VERSION__}
      </p>
    </div>
  )
}
