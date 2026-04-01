import { useState, useEffect } from 'react'
import { getSession } from '../services/sessionService.js'

function RestaurantCard({ restaurant, isTopPick, t }) {
  const { name, cuisine, adresse, budget, note, pourquoi } = restaurant

  return (
    <div className={`restaurant-card ${isTopPick ? 'top-pick' : ''}`}>
      {isTopPick && (
        <div className="top-pick-badge" aria-label={t.topPick}>
          ⭐ {t.topPick}
        </div>
      )}
      <div>
        <div className="restaurant-name">{name}</div>
        <div className="restaurant-meta">
          <span>🍴 {cuisine}</span>
          {note && <span className="restaurant-note">★ {note}</span>}
          {budget && <span>💶 {budget}</span>}
        </div>
      </div>
      {adresse && (
        <div className="restaurant-meta">
          <span>📍 {adresse}</span>
        </div>
      )}
      {pourquoi && <p className="restaurant-why">"{pourquoi}"</p>}
    </div>
  )
}

function ResultSection({ title, restaurants, t }) {
  if (!restaurants?.length) return null
  return (
    <div className="flex-col" style={{ gap: 12 }}>
      <h2>{title}</h2>
      {restaurants.map((r, i) => (
        <RestaurantCard key={i} restaurant={r} isTopPick={i === 0} t={t} />
      ))}
    </div>
  )
}

export default function ResultsScreen({ t, sessionCode, onLeave, onBackToWaiting }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    async function load() {
      const s = await getSession(sessionCode)
      if (s) setSession(s)
    }
    load()
  }, [sessionCode])

  if (!session) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  const { results, participants } = session
  const homemadeGroup = participants.filter(p => p.mealMode === 'homemade')
  const hasAny = results?.out?.length > 0 || results?.takeout?.length > 0

  return (
    <div className="screen">
      <div className="section-header">
        <h1>{t.resultsTitle}</h1>
        <button className="btn-ghost" onClick={onLeave}>✕</button>
      </div>

      {/* Gamelle gang */}
      {homemadeGroup.length > 0 && (
        <div className="summary-bar" style={{ justifyContent: 'center' }}>
          <span className="summary-item">
            🥡 {homemadeGroup.map(p => p.name).join(', ')} — {t.homemadeMsg}
          </span>
        </div>
      )}

      {!hasAny && (
        <div className="waiting-banner"><p>{t.noResults}</p></div>
      )}

      <ResultSection title={t.sectionOut}     restaurants={results?.out}     t={t} />

      {results?.out?.length > 0 && results?.takeout?.length > 0 && (
        <div className="divider" />
      )}

      <ResultSection title={t.sectionTakeout} restaurants={results?.takeout} t={t} />

      <div className="mt-auto flex-col">
        <button className="btn btn-secondary" onClick={onBackToWaiting}>
          ← {t.backToWaiting || 'Retour à la salle d\'attente'}
        </button>
        <button className="btn btn-ghost" onClick={onLeave}>
          🏠 {t.newSession}
        </button>
      </div>
    </div>
  )
}
