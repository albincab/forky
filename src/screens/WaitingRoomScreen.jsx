import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  setSearching,
  setResults,
  leaveSession,
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
  const [copied,  setCopied]  = useState(false)
  const [showQR,  setShowQR]  = useState(false)
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
        <button className="btn-icon" onClick={shareTeams}>
          💬 {t.shareTeams}
        </button>
        <button className="btn-icon" onClick={() => copyText(url)}>
          🔗 {t.copyLink}
        </button>
        <button className="btn-icon" onClick={() => setShowQR(true)}>
          ⬜ {t.showQR}
        </button>
      </div>

      {showQR && <QRCodeModal url={url} t={t} onClose={() => setShowQR(false)} />}
    </>
  )
}

// ─── Group summary ────────────────────────────────────────────────────────────
function GroupSummary({ participants, t }) {
  const out      = participants.filter(p => p.mealMode === 'out').length
  const takeout  = participants.filter(p => p.mealMode === 'takeout').length
  const homemade = participants.filter(p => p.mealMode === 'homemade').length

  return (
    <div className="summary-bar" aria-live="polite">
      <span className="summary-item">🍽️ {out}</span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <span className="summary-item">📦 {takeout}</span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <span className="summary-item">🥡 {homemade}</span>
    </div>
  )
}

// ─── Main WaitingRoomScreen ───────────────────────────────────────────────────
export default function WaitingRoomScreen({
  t, lang, sessionCode, userId, isOrganizer, onLeave, onEditPrefs, onResultsReady,
}) {
  const [session,        setSession]        = useState(null)
  const [loadingOut,     setLoadingOut]     = useState(false)
  const [loadingTakeout, setLoadingTakeout] = useState(false)
  const [errorOut,       setErrorOut]       = useState('')
  const [errorTakeout,   setErrorTakeout]   = useState('')

  // ─── Load session + Supabase Realtime subscription ─────────────────────────
  const loadSession = useCallback(async () => {
    const s = await getSession(sessionCode)
    if (!s) return
    setSession(s)

    // Auto-navigate participants when results appear
    if (!isOrganizer) {
      const hasResults = s.results?.out?.length > 0 || s.results?.takeout?.length > 0
      if (hasResults) onResultsReady()
    }
  }, [sessionCode, isOrganizer, onResultsReady])

  useEffect(() => {
    loadSession()

    // Supabase Realtime — instant updates across all devices
    const channel = subscribeToSession(sessionCode, loadSession)

    return () => unsubscribeFromSession(channel)
  }, [loadSession, sessionCode])

  // ─── Search launch ──────────────────────────────────────────────────────────
  async function launchSearch(mode) {
    if (!session) return
    const setLoading = mode === 'out' ? setLoadingOut : setLoadingTakeout
    const setError   = mode === 'out' ? setErrorOut   : setErrorTakeout

    setLoading(true)
    setError('')

    // Mark as searching in DB → all participants see the loading state via Realtime
    await setSearching({ code: sessionCode, mode, value: true })

    const relevantParticipants = session.participants.filter(p => p.mealMode === mode)

    try {
      const results = await getRecommendations({ participants: relevantParticipants, mode, lang })
      // Store results in DB → all participants navigate to Results via Realtime
      await setResults({ code: sessionCode, mode, results })
      onResultsReady()
    } catch (err) {
      await setSearching({ code: sessionCode, mode, value: false })
      const msg = err.message === 'VITE_CLAUDE_API_KEY_MISSING'
        ? t.apiKeyMissing
        : t.claudeError
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  const { participants } = session
  const hasOut     = participants.some(p => p.mealMode === 'out')
  const hasTakeout = participants.some(p => p.mealMode === 'takeout')
  const hasAnyResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0
  const organizerName = participants.find(p => p.isOrganizer)?.name || ''

  return (
    <div className="screen">
      <div className="section-header">
        <h1>{t.waitingRoomTitle}</h1>
        <button
          className="btn-ghost"
          onClick={() => {
            if (window.confirm(t.leaveConfirm)) onLeave()
          }}
          aria-label={t.leaveSession}
        >
          ✕
        </button>
      </div>

      {/* Code + share (organizer only) */}
      {isOrganizer && <SharePanel code={sessionCode} t={t} />}

      {/* Group summary */}
      <GroupSummary participants={participants} t={t} />

      {/* Participants */}
      <div className="flex-col" style={{ gap: 8 }} aria-live="polite">
        {participants.map(p => (
          <ParticipantCard key={p.id} participant={p} t={t} />
        ))}
      </div>

      {/* Empty hint */}
      {participants.length === 1 && isOrganizer && (
        <p className="text-center text-muted">{t.waitingEmpty}</p>
      )}

      {/* Waiting message + actions for participants */}
      {!isOrganizer && (
        <div className="waiting-banner">
          <p style={{ color: 'var(--brown)', fontWeight: 600 }}>
            {t.waitingParticipant.replace('{name}', organizerName)}
          </p>
          {!session.searchedOut && !session.searchedTakeout && (
            <div className="btn-icon-row" style={{ marginTop: 12, justifyContent: 'center' }}>
              <button className="btn-icon" onClick={onEditPrefs}>
                ✏️ {t.editPrefs}
              </button>
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

      {/* Results ready */}
      {hasAnyResults && (
        <button className="btn btn-cta" onClick={onResultsReady}>
          🎉 {t.viewResults}
        </button>
      )}

      {/* Launch search buttons (organizer only) */}
      {isOrganizer && !hasAnyResults && (
        <div className="flex-col mt-auto">
          {hasOut && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => launchSearch('out')}
                disabled={loadingOut || session.searchedOut}
              >
                {loadingOut ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {t.searching}</>
                ) : session.searchedOut ? `✓ ${t.searchDone}` : t.launchSearchOut}
              </button>
              {errorOut && <span className="error-msg" role="alert">⚠ {errorOut}</span>}
            </>
          )}

          {hasTakeout && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => launchSearch('takeout')}
                disabled={loadingTakeout || session.searchedTakeout}
              >
                {loadingTakeout ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {t.searching}</>
                ) : session.searchedTakeout ? `✓ ${t.searchDone}` : t.launchSearchTakeout}
              </button>
              {errorTakeout && <span className="error-msg" role="alert">⚠ {errorTakeout}</span>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
