import { useState, useEffect } from 'react'
import {
  getSessionsHistory,
  getSession,
  leaveSession,
  removeFromHistory,
} from '../services/sessionService.js'

const MEAL_ICONS = { out: '🍽️', homemade: '🥡', takeout: '📦' }

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ session, participant, t }) {
  if (!participant?.prefsComplete) {
    return <span className="tag tag-allergy">{t.statusPrefsNeeded}</span>
  }
  const hasResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0
  if (hasResults) {
    return <span className="tag tag-out">{t.statusResults}</span>
  }
  return <span className="tag tag-homemade">{t.statusWaiting}</span>
}

// ─── Single session card ──────────────────────────────────────────────────────
function LunchCard({ entry, t, onRejoin, onEdit, onCancel }) {
  const { session, participant, isOrganizer } = entry
  const searchLaunched = session.searchedOut || session.searchedTakeout
  const hasResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0

  const outCount     = session.participants.filter(p => p.mealMode === 'out').length
  const takeoutCount = session.participants.filter(p => p.mealMode === 'takeout').length
  const homemadeCount = session.participants.filter(p => p.mealMode === 'homemade').length

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--honey)' }}>
              {session.code}
            </span>
            <span className="tag tag-homemade">
              {session.type === 'public' ? '🌍' : '🔒'} {session.type === 'public' ? 'Public' : 'Privé'}
            </span>
            {isOrganizer && (
              <span className="tag tag-organizer">👑 {t.youAreOrganizer}</span>
            )}
          </div>
          <p style={{ marginTop: 4, fontSize: '0.82rem' }}>
            {t.organizer || 'Organisateur'} : {session.organizerName}
          </p>
        </div>
        <StatusBadge session={session} participant={participant} t={t} />
      </div>

      {/* Group summary */}
      <div className="summary-bar" style={{ padding: '8px 12px' }}>
        <span className="summary-item" style={{ fontSize: '0.8rem' }}>🍽️ {outCount}</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span className="summary-item" style={{ fontSize: '0.8rem' }}>📦 {takeoutCount}</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span className="summary-item" style={{ fontSize: '0.8rem' }}>🥡 {homemadeCount}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 4 }}>
          · {session.participants.length} pers.
        </span>
      </div>

      {/* Your preferences */}
      {participant?.prefsComplete && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {participant.mealMode && (
            <span className={`tag ${participant.mealMode === 'out' ? 'tag-out' : participant.mealMode === 'takeout' ? 'tag-takeout' : 'tag-homemade'}`}>
              {MEAL_ICONS[participant.mealMode]} {t[participant.mealMode === 'out' ? 'mealOut' : participant.mealMode === 'takeout' ? 'mealTakeout' : 'mealHomemade']}
            </span>
          )}
          {participant.cuisines?.slice(0, 2).map(c => (
            <span key={c} className="tag tag-cuisine">{c}</span>
          ))}
          {participant.budget && (
            <span className="tag tag-cuisine">{t.budgetOptions[participant.budget]}</span>
          )}
          {participant.allergies?.slice(0, 2).map(a => (
            <span key={a} className="tag tag-allergy">{a}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onRejoin(entry)}
          style={{ flex: 1 }}
        >
          {hasResults ? `🎉 ${t.statusResults.replace('🎉 ', '')}` : `→ ${t.rejoin}`}
        </button>

        {!searchLaunched && (
          <>
            <button
              className="btn-icon"
              onClick={() => onEdit(entry)}
            >
              ✏️ {t.editPrefs}
            </button>

            {!isOrganizer && (
              <button
                className="btn-icon"
                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={() => onCancel(entry)}
              >
                🚪 {t.cancelParticipation}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main MyLunchesScreen ─────────────────────────────────────────────────────
export default function MyLunchesScreen({ t, onBack, onRejoin, onEdit }) {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)

  async function load() {
    const history = getSessionsHistory()
    const resolved = await Promise.all(
      history.map(async ({ code, participantId, isOrganizer }) => {
        const session = await getSession(code)
        if (!session) return null
        const participant = session.participants.find(p => p.id === participantId)
        if (!participant) return null
        return { session, participant, participantId, isOrganizer }
      })
    )
    setEntries(resolved.filter(Boolean))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCancel(entry) {
    if (!window.confirm(t.cancelConfirm)) return
    await leaveSession({ code: entry.session.code, participantId: entry.participantId })
    removeFromHistory(entry.session.code)
    await load()
  }

  return (
    <div className="screen">
      <div className="flex-row">
        <button className="btn-ghost" onClick={onBack} aria-label={t.back}>
          ← {t.back}
        </button>
      </div>

      <h1>{t.myLunchesTitle}</h1>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>{t.loadingMyLunches}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="waiting-banner">
          <p style={{ color: 'var(--brown)' }}>{t.myLunchesEmpty}</p>
        </div>
      ) : (
        <div className="flex-col" style={{ gap: 12 }}>
          {entries.map(entry => (
            <LunchCard
              key={entry.session.code}
              entry={entry}
              t={t}
              onRejoin={onRejoin}
              onEdit={onEdit}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
