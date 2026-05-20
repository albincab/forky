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
        <a
          className="restaurant-meta restaurant-address-link"
          href={`https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + adresse + ' Saint-Étienne')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ouvrir ${adresse} dans Google Maps`}
        >
          <span>📍 {adresse}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--honey)', marginLeft: 4 }}>↗</span>
        </a>
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
  const outGroup     = participants.filter(p => p.mealMode === 'out')
  const inplaceGroup = participants.filter(p => p.mealMode === 'inplace')
  const hasAny = results?.out?.length > 0

  return (
    <div className="screen">
      <div className="section-header">
        <h1>{t.resultsTitle}</h1>
        <button className="btn-ghost" onClick={onLeave}>✕</button>
      </div>

      {/* Résumé du groupe */}
      <div className="results-group-summary">
        {outGroup.length > 0 && (
          <div className="results-group-row">
            <span className="results-group-icon">🍽️</span>
            <div>
              <span className="results-group-label">Au restaurant</span>
              <span className="results-group-names">{outGroup.map(p => p.name).join(', ')}</span>
            </div>
          </div>
        )}
        {inplaceGroup.length > 0 && (
          <div className="results-group-row">
            <span className="results-group-icon">🏠</span>
            <div>
              <span className="results-group-label">Sur place</span>
              <span className="results-group-names">{inplaceGroup.map(p => p.name).join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {!hasAny && (
        <div className="waiting-banner"><p>{t.noResults}</p></div>
      )}

      <ResultSection title={t.sectionOut} restaurants={results?.out} t={t} />

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
