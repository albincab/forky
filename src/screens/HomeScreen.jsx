import { useState, useEffect } from 'react'
import { getPublicSessions } from '../services/sessionService.js'
import PublicSessionsList from '../components/PublicSessionsList.jsx'

export default function HomeScreen({ t, onCreate, onJoin }) {
  const [publicSessions, setPublicSessions] = useState([])

  // Poll public sessions every 3 seconds
  useEffect(() => {
    function refresh() { setPublicSessions(getPublicSessions()) }
    refresh()
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="screen">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-logo">🍽️</div>
        <h1 className="home-app-name">À TABLE!</h1>
        <p className="home-tagline">{t.tagline}</p>
      </div>

      {/* Main CTAs */}
      <div className="flex-col">
        <button className="btn btn-primary" onClick={onCreate}>
          🚀 {t.ctaCreate}
        </button>
        <button className="btn btn-secondary" onClick={() => onJoin(null)}>
          🎟️ {t.ctaJoin}
        </button>
      </div>

      {/* Public sessions */}
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
    </div>
  )
}
