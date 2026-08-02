import { useState, useEffect } from 'react'
import {
  getSessionsHistory,
  getSession,
  leaveSession,
  deleteSession,
  removeFromHistory,
} from '../services/sessionService.js'
import AppLogo from '../components/AppLogo.jsx'
import { STORAGE_KEYS } from '../constants/storageKeys.js'

const MEAL_ICONS = { out: '🍽️', inplace: '🏠', outside: '🚶' }
const MEAL_LABEL_KEY = { out: 'mealOut', inplace: 'mealInPlace', outside: 'mealOutside' }
const MEAL_TAG_CLASS = { out: 'tag-out', inplace: 'tag-homemade', outside: 'tag-homemade' }

// A lunch not created today is considered archived — hidden by default
function isToday(timestamp) {
  return new Date(timestamp).toDateString() === new Date().toDateString()
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ session, participant, t }) {
  if (!isToday(session.createdAt)) {
    return <span className="tag tag-homemade">{t.statusArchived}</span>
  }
  if (!participant?.prefsComplete) {
    return <span className="tag tag-allergy">{t.statusPrefsNeeded}</span>
  }
  const hasResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0
  if (hasResults) {
    return <span className="tag tag-out">{t.statusResults}</span>
  }
  return <span className="tag tag-homemade">{t.statusWaiting}</span>
}

// ─── Single "my lunch" card ────────────────────────────────────────────────────
function LunchCard({ entry, t, onRejoin, onEdit, onCancel, onDelete }) {
  const { session, participant, isOrganizer } = entry
  const searchLaunched = session.searchedOut
  const hasResults = session.results?.out?.length > 0

  const outCount      = session.participants.filter(p => p.mealMode === 'out').length
  const inplaceCount  = session.participants.filter(p => p.mealMode === 'inplace').length
  const outsideCount  = session.participants.filter(p => p.mealMode === 'outside').length

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
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              📅 {formatDate(session.createdAt)}
            </span>
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
        {inplaceCount > 0 && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="summary-item" style={{ fontSize: '0.8rem' }}>🏠 {inplaceCount}</span>
          </>
        )}
        {outsideCount > 0 && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="summary-item" style={{ fontSize: '0.8rem' }}>🚶 {outsideCount}</span>
          </>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 4 }}>
          · {session.participants.length} pers.
        </span>
      </div>

      {/* Your preferences */}
      {participant?.prefsComplete && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {participant.mealMode && (
            <span className={`tag ${MEAL_TAG_CLASS[participant.mealMode] || 'tag-homemade'}`}>
              {MEAL_ICONS[participant.mealMode]} {t[MEAL_LABEL_KEY[participant.mealMode]] || participant.mealMode}
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
          {hasResults ? t.statusResults : `→ ${t.rejoin}`}
        </button>

        {!searchLaunched && (
          <button className="btn-icon" onClick={() => onEdit(entry)}>
            ✏️ {t.editPrefs}
          </button>
        )}

        {isOrganizer ? (
          <button
            className="btn-icon"
            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
            onClick={() => onDelete(entry)}
          >
            🗑️ {t.deleteSession}
          </button>
        ) : (
          !searchLaunched && (
            <button
              className="btn-icon"
              style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
              onClick={() => onCancel(entry)}
            >
              🚪 {t.cancelParticipation}
            </button>
          )
        )}
      </div>
    </div>
  )
}

// ─── Main HomeScreen ───────────────────────────────────────────────────────────
export default function HomeScreen({ t, onCreate, onJoin, onRejoin, onEdit, onGuide, onFeedback }) {
  const [showGuideHint] = useState(() => !localStorage.getItem(STORAGE_KEYS.GUIDE_SEEN))

  const [myEntries,  setMyEntries]  = useState([])
  const [myLoading,  setMyLoading]  = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  const activeToday = myEntries.find(e => isToday(e.session.createdAt))

  async function loadMine() {
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
    setMyEntries(resolved.filter(Boolean))
    setMyLoading(false)
  }

  useEffect(() => { loadMine() }, [])

  async function handleCancel(entry) {
    if (!window.confirm(t.cancelConfirm)) return
    await leaveSession({ code: entry.session.code, participantId: entry.participantId })
    removeFromHistory(entry.session.code)
    await loadMine()
  }

  async function handleDelete(entry) {
    if (!window.confirm(t.deleteConfirm)) return
    await deleteSession(entry.session.code)
    removeFromHistory(entry.session.code)
    await loadMine()
  }

  return (
    <div className="screen">

      {/* Logo lockup */}
      <AppLogo />

      {/* Manifeste */}
      <div style={{ fontSize: 17, lineHeight: 1.3, fontWeight: 500 }}>
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
          {t.taglineBadge}
        </span>
      </div>

      {/* First-visit nudge toward the Guide — gone for good once it's been visited */}
      {showGuideHint && (
        <button className="btn btn-cta" onClick={onGuide}>
          <span>❓ {t.guideHintCta}</span>
          <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
        </button>
      )}

      {/* CTAs — only one active table per day: hide Create/Join once today's table exists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeToday ? (
          <button className="btn btn-primary" onClick={() => onRejoin(activeToday)}>
            <span>🍽️ {t.rejoin}</span>
            <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onCreate}>
              <span>👑 {t.ctaCreate}</span>
              <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => onJoin(null)}>
              <span>🎟 {t.ctaJoin}</span>
              <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>↗</span>
            </button>
          </>
        )}
      </div>

      <hr className="rule-thick" />

      {/* "Les buffets" hidden entirely while the self-join edge case gets stabilized —
          only one section left, so this is a heading rather than a tab to switch. */}
      <div className="btn-icon selected" style={{ width: '100%', flex: 'none' }}>
        📋 {t.myLunches} ({myEntries.filter(e => isToday(e.session.createdAt)).length})
      </div>

      {(
        myLoading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p>{t.loadingMyLunches}</p>
          </div>
        ) : (
          (() => {
            const visibleEntries = myEntries.filter(e => showArchived || isToday(e.session.createdAt))
            const archivedCount = myEntries.length - myEntries.filter(e => isToday(e.session.createdAt)).length

            return (
              <>
                {archivedCount > 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={e => setShowArchived(e.target.checked)}
                    />
                    {t.showArchived} ({archivedCount})
                  </label>
                )}

                {visibleEntries.length === 0 ? (
                  <p className="eyebrow" style={{ textAlign: 'center', padding: '12px 0' }}>
                    {t.myLunchesEmpty}
                  </p>
                ) : (
                  <div className="flex-col" style={{ gap: 12 }}>
                    {visibleEntries.map(entry => (
                      <LunchCard
                        key={entry.session.code}
                        entry={entry}
                        t={t}
                        onRejoin={onRejoin}
                        onEdit={onEdit}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )
          })()
        )
      )}

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1.5px solid var(--ink)',
        paddingTop: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <button
            className="eyebrow"
            onClick={onGuide}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--red)' }}
          >
            ❓ {t.guideLink}
          </button>
          <button
            className="eyebrow"
            onClick={onFeedback}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--red)' }}
          >
            💬 {t.feedbackLink}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="mailto:albincab@gmail.com" className="eyebrow" style={{ textDecoration: 'none' }}>
            Albin Cabut
          </a>
          <span className="eyebrow">v{__APP_VERSION__}</span>
        </div>
      </div>
    </div>
  )
}
