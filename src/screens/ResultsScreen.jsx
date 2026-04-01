import { useState, useEffect } from 'react'
import { getSession } from '../services/sessionService.js'

// ─── Single restaurant card ───────────────────────────────────────────────────
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
          {note && (
            <span className="restaurant-note" aria-label={`Note : ${note}`}>
              ★ {note}
            </span>
          )}
          {budget && <span>💶 {budget}</span>}
        </div>
      </div>

      {adresse && (
        <div className="restaurant-meta">
          <span aria-label={`Adresse : ${adresse}`}>📍 {adresse}</span>
        </div>
      )}

      {pourquoi && (
        <p className="restaurant-why">"{pourquoi}"</p>
      )}
    </div>
  )
}

// ─── Section (On sort / À emporter) ──────────────────────────────────────────
function ResultSection({ title, restaurants, t }) {
  if (!restaurants?.length) return null

  return (
    <div className="flex-col" style={{ gap: 12 }}>
      <h2>{title}</h2>
      {restaurants.map((r, i) => (
        <RestaurantCard
          key={i}
          restaurant={r}
          isTopPick={i === 0}
          t={t}
        />
      ))}
    </div>
  )
}

// ─── Main ResultsScreen ───────────────────────────────────────────────────────
export default function ResultsScreen({ t, sessionCode, onLeave }) {
  const [session, setSession] = useState(() => getSession(sessionCode))

  // Refresh on mount (in case results arrived after we navigated)
  useEffect(() => {
    const s = getSession(sessionCode)
    if (s) setSession(s)
  }, [sessionCode])

  if (!session) {
    return (
      <div className="screen">
        <p className="text-center text-muted">{t.noResults}</p>
        <button className="btn btn-primary" onClick={onLeave}>{t.newSession}</button>
      </div>
    )
  }

  const { results, participants } = session
  const outResults     = results?.out
  const takeoutResults = results?.takeout
  const hasAny = outResults?.length > 0 || takeoutResults?.length > 0

  // Who was in which group
  const outGroup     = participants.filter(p => p.mealMode === 'out')
  const takeoutGroup = participants.filter(p => p.mealMode === 'takeout')
  const homemadeGroup = participants.filter(p => p.mealMode === 'homemade')

  return (
    <div className="screen">
      {/* Header */}
      <div className="section-header">
        <h1>{t.resultsTitle}</h1>
        <button className="btn-ghost" onClick={onLeave} aria-label={t.newSession}>
          ✕
        </button>
      </div>

      {/* Homemade gang mention */}
      {homemadeGroup.length > 0 && (
        <div
          className="summary-bar"
          style={{ justifyContent: 'center', textAlign: 'center' }}
        >
          <span className="summary-item" style={{ flexWrap: 'wrap', gap: 6 }}>
            🥡 {homemadeGroup.map(p => p.name).join(', ')} — {t.homemadeMsg}
          </span>
        </div>
      )}

      {!hasAny && (
        <div className="waiting-banner">
          <p>{t.noResults}</p>
        </div>
      )}

      {/* Restaurant section */}
      {outResults?.length > 0 && (
        <ResultSection
          title={t.sectionOut}
          restaurants={outResults}
          t={t}
        />
      )}

      {/* Takeout section */}
      {takeoutResults?.length > 0 && (
        <>
          {outResults?.length > 0 && <div className="divider" />}
          <ResultSection
            title={t.sectionTakeout}
            restaurants={takeoutResults}
            t={t}
          />
        </>
      )}

      <div className="mt-auto">
        <button className="btn btn-secondary" onClick={onLeave}>
          🏠 {t.newSession}
        </button>
      </div>
    </div>
  )
}
