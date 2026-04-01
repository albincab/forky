import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  setSearching,
  setResults,
  leaveSession,
  deleteSession,
  subscribeToSession,
  unsubscribeFromSession,
} from '../services/sessionService.js'
import { getRecommendations } from '../services/claudeService.js'
import ParticipantCard from '../components/ParticipantCard.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

function getSessionUrl(code) {
  return `${window.location.origin}${window.location.pathname}?code=${code}`
}

// ─── Share panel ──────────────────────────────────────────────────────────────
function SharePanel({ code, t }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const url = getSessionUrl(code)

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareTeams() {
    const msg = t.teamsMsg.replace('{code}', code).replace('{url}', url)
    window.location.href = `msteams://l/chat/0/0?message=${encodeURIComponent(msg)}`
  }

  return (
    <>
      <div className="code-display">
        <div className="code-value" aria-label={`Code : ${code}`}>{code}</div>
        <p className="code-hint">{t.codeHint}</p>
        <button
          className="btn btn-cta btn-sm"
          onClick={() => copyText(code)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          {copied ? `✓ ${t.copied}` : `📋 ${t.copyCode}`}
        </button>
      </div>

      <div className="btn-icon-row">
        <button className="btn-icon" onClick={shareTeams}>💬 {t.shareTeams}</button>
        <button className="btn-icon" onClick={() => copyText(url)}>🔗 {t.copyLink}</button>
        <button className="btn-icon" onClick={() => setShowQR(true)}>⬜ {t.showQR}</button>
      </div>

      {showQR && <QRCodeModal url={url} t={t} onClose={() => setShowQR(false)} />}
    </>
  )
}

// ─── Group summary ────────────────────────────────────────────────────────────
function GroupSummary({ participants, t }) {
  const out     = participants.filter(p => p.mealMode === 'out').length
  const inplace = participants.filter(p => p.mealMode === 'inplace').length

  return (
    <div className="summary-bar" aria-live="polite">
      <span className="summary-item">🍽️ {out} {t.mealOut}</span>
      {inplace > 0 && (
        <>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="summary-item">🏠 {inplace} {t.mealInPlace}</span>
        </>
      )}
    </div>
  )
}

// ─── Main WaitingRoomScreen ───────────────────────────────────────────────────
export default function WaitingRoomScreen({
  t, lang, sessionCode, userId, isOrganizer, onLeave, onEditPrefs, onResultsReady,
}) {
  const [session,    setSession]    = useState(null)
  const [loadingOut, setLoadingOut] = useState(false)
  const [errorOut,   setErrorOut]   = useState('')
  const [deleting,   setDeleting]   = useState(false)

  const loadSession = useCallback(async () => {
    const s = await getSession(sessionCode)
    if (!s) return
    setSession(s)
    if (!isOrganizer) {
      const hasResults = s.results?.out?.length > 0
      if (hasResults) onResultsReady()
    }
  }, [sessionCode, isOrganizer, onResultsReady])

  useEffect(() => {
    loadSession()
    const channel = subscribeToSession(sessionCode, loadSession)
    return () => unsubscribeFromSession(channel)
  }, [loadSession, sessionCode])

  async function launchSearch() {
    if (!session) return
    setLoadingOut(true)
    setErrorOut('')
    await setSearching({ code: sessionCode, mode: 'out', value: true })
    const goingOut = session.participants.filter(p => p.mealMode === 'out')
    try {
      const results = await getRecommendations({ participants: goingOut, mode: 'out', lang })
      await setResults({ code: sessionCode, mode: 'out', results })
      onResultsReady()
    } catch (err) {
      await setSearching({ code: sessionCode, mode: 'out', value: false })
      setErrorOut(err.message === 'VITE_CLAUDE_API_KEY_MISSING' ? t.apiKeyMissing : t.claudeError)
    } finally {
      setLoadingOut(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(t.deleteConfirm)) return
    setDeleting(true)
    try {
      await deleteSession(sessionCode)
      onLeave()
    } catch {
      setDeleting(false)
    }
  }

  if (!session) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  const { participants } = session
  const hasOut        = participants.some(p => p.mealMode === 'out')
  const hasResults    = session.results?.out?.length > 0
  const searchStarted = session.searchedOut || session.searchingOut
  const organizerName = participants.find(p => p.isOrganizer)?.name || ''

  return (
    <div className="screen">
      <div className="section-header">
        <h1>{t.waitingRoomTitle}</h1>
        <button
          className="btn-ghost"
          onClick={() => { if (window.confirm(t.leaveConfirm)) onLeave() }}
          aria-label={t.leaveSession}
        >
          ✕
        </button>
      </div>

      {isOrganizer && <SharePanel code={sessionCode} t={t} />}

      <GroupSummary participants={participants} t={t} />

      <div className="flex-col" style={{ gap: 8 }} aria-live="polite">
        {participants.map(p => <ParticipantCard key={p.id} participant={p} t={t} />)}
      </div>

      {participants.length === 1 && isOrganizer && (
        <p className="text-center text-muted">{t.waitingEmpty}</p>
      )}

      {/* Participant actions */}
      {!isOrganizer && (
        <div className="waiting-banner">
          <p style={{ color: 'var(--brown)', fontWeight: 600 }}>
            {t.waitingParticipant.replace('{name}', organizerName)}
          </p>
          {!searchStarted && (
            <div className="btn-icon-row" style={{ marginTop: 12, justifyContent: 'center' }}>
              <button className="btn-icon" onClick={onEditPrefs}>✏️ {t.editPrefs}</button>
              <button
                className="btn-icon"
                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={async () => {
                  if (!window.confirm(t.leaveConfirm)) return
                  await leaveSession({ code: sessionCode, participantId: userId })
                  onLeave()
                }}
              >
                🚪 {t.leaveSession}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results CTA */}
      {hasResults && (
        <button className="btn btn-cta" onClick={onResultsReady}>
          🎉 {t.viewResults}
        </button>
      )}

      {/* Organizer actions */}
      {isOrganizer && !hasResults && (
        <div className="flex-col mt-auto" style={{ gap: 10 }}>
          {hasOut && (
            <>
              <button
                className="btn btn-primary"
                onClick={launchSearch}
                disabled={loadingOut || session.searchedOut}
              >
                {loadingOut
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {t.searching}</>
                  : session.searchedOut ? `✓ ${t.searchDone}` : t.launchSearchOut
                }
              </button>
              {errorOut && <span className="error-msg" role="alert">⚠ {errorOut}</span>}
            </>
          )}

          {!searchStarted && (
            <button
              className="btn-icon"
              style={{ color: 'var(--error)', borderColor: 'var(--error)', justifyContent: 'center' }}
              onClick={handleDelete}
              disabled={deleting}
            >
              🗑️ {t.deleteSession}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
