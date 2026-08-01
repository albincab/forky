import { useState, useEffect } from 'react'
import { getSession } from '../services/sessionService.js'
import RestaurantMap from '../components/RestaurantMap.jsx'

const BUDGET_ORDER = ['<15', '15-30', '30-50', '>50']

function getCuisineVotes(group) {
  const votes = {}
  group.forEach(p => (p.cuisines || []).forEach(c => { votes[c] = (votes[c] || 0) + 1 }))
  return votes
}

function getMaxBudgetIndex(group) {
  const indices = group.map(p => BUDGET_ORDER.indexOf(p.budget)).filter(i => i >= 0)
  return indices.length > 0 ? Math.min(...indices) : -1
}

function scoreRestaurant(restaurant, cuisineVotes, maxBudgetIndex) {
  let score = cuisineVotes[restaurant.cuisine] || 0
  if (restaurant.budget) {
    const idx = BUDGET_ORDER.indexOf(restaurant.budget)
    if (idx >= 0 && maxBudgetIndex >= 0 && idx <= maxBudgetIndex) score += 1
  }
  return score
}

/** Index of the restaurant that best respects the group's cuisine votes + budget.
 * Returns -1 (no highlight) when nothing scores above 0, or when several restaurants tie. */
export function findTopPickIndex(restaurants, group) {
  if (!restaurants || restaurants.length === 0) return -1
  const cuisineVotes   = getCuisineVotes(group)
  const maxBudgetIndex = getMaxBudgetIndex(group)
  const scores  = restaurants.map(r => scoreRestaurant(r, cuisineVotes, maxBudgetIndex))
  const maxScore = Math.max(...scores)
  if (maxScore <= 0) return -1
  const bestIndices = scores.reduce((acc, s, i) => (s === maxScore ? [...acc, i] : acc), [])
  return bestIndices.length === 1 ? bestIndices[0] : -1
}

// Single restaurant card — Affiche style
function RestoCard({ restaurant, index, isTop, t }) {
  const { name, cuisine, adresse, telephone, budget, note, pourquoi, aiPicked } = restaurant
  const num = String(index + 1).padStart(2, '0')

  // Search by name (+ address when known) rather than raw coordinates — a
  // coordinate pin has no name/phone/hours, while Google's own business
  // index can usually resolve "name + city" to the real listing.
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    adresse ? `${name} ${adresse} Saint-Étienne` : `${name} Saint-Étienne`
  )}`

  return (
    <div className={`resto ${isTop ? 'top' : ''}`}>
      {isTop && <div className="resto-stamp" aria-label={t.topPick}>✦ TOP PICK</div>}

      {/* Num + note */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span className="resto-num">{num}</span>
        {note && (
          <div style={{
            fontFamily: "'Boldonse', serif",
            fontSize: 18,
            color: isTop ? 'var(--yellow)' : 'var(--red)',
          }}>
            ★ {note}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="resto-name">
        {name}
        {aiPicked && <span aria-label={t.aiPicked} title={t.aiPicked}> ✨</span>}
      </div>

      {/* Meta */}
      <div className="resto-meta">
        {cuisine && <span>🍴 {cuisine}</span>}
        {cuisine && budget && <span>·</span>}
        {budget && <span>💶 {budget}</span>}
        <span>·</span>
        <a
          className="restaurant-address-link"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={adresse ? `Ouvrir ${adresse} dans Google Maps` : `Ouvrir ${name} dans Google Maps`}
        >
          📍 {adresse || 'Voir sur Google Maps'} ↗
        </a>
        {telephone && (
          <>
            <span>·</span>
            <a
              className="restaurant-address-link"
              href={`tel:${telephone.replace(/\s+/g, '')}`}
              aria-label={`Appeler ${name} au ${telephone}`}
            >
              📞 {telephone}
            </a>
          </>
        )}
      </div>

      {/* Why */}
      {pourquoi && <div className="resto-why">"{pourquoi}"</div>}
    </div>
  )
}

export default function ResultsScreen({ t, sessionCode, isOrganizer, onLeave, onBackToWaiting }) {
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
  const outsideGroup = participants.filter(p => p.mealMode === 'outside')
  const totalCount   = participants.length
  const hasAny       = results?.out?.length > 0
  const topPickIndex = findTopPickIndex(results?.out, outGroup)

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <button onClick={onLeave} aria-label={t.back}>← RETOUR</button>
        <span>★ RECOMMANDATIONS</span>
        <span>03 / 03</span>
      </div>

      {/* Header */}
      <div>
        <div className="eyebrow">— le choix de la sagesse —</div>
        <div className="display" style={{ fontSize: 36, marginTop: 4 }}>Trois adresses.</div>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: 'var(--mute)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>POUR {totalCount} GOURMAND{totalCount > 1 ? 'S' : ''}</span>
        <span>SAINT-ÉTIENNE</span>
      </div>

      {/* Group summary */}
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
        {outsideGroup.length > 0 && (
          <div className="results-group-row">
            <span className="results-group-icon">🚶</span>
            <div>
              <span className="results-group-label">De leur côté</span>
              <span className="results-group-names">{outsideGroup.map(p => p.name).join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {!hasAny && (
        <div className="waiting-banner">
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.noResults}</p>
        </div>
      )}

      {/* Map */}
      {results?.out?.length > 0 && <RestaurantMap restaurants={results.out} />}

      {/* Resto cards */}
      {results?.out?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results.out.map((r, i) => (
            <RestoCard key={i} restaurant={r} index={i} isTop={i === topPickIndex} t={t} />
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="btn-icon-row mt-auto">
        {isOrganizer && (
          <button
            className="iconbtn"
            onClick={onBackToWaiting}
            aria-label={t.backToWaiting || 'Retenter'}
          >
            🔄
          </button>
        )}
        <button
          className="iconbtn"
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}?code=${sessionCode}`
            navigator.clipboard?.writeText(url).catch(() => {})
          }}
        >
          📤 PARTAGER
        </button>
        <button
          className="iconbtn"
          style={{ background: 'var(--ink)', color: 'var(--bg)' }}
          onClick={onLeave}
          aria-label={t.newSession}
        >
          ✓ C'EST OK
        </button>
      </div>
    </div>
  )
}
