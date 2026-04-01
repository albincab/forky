import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  setSearching,
  setResults,
} from '../services/sessionService.js'
import { getRecommendations } from '../services/claudeService.js'
import ParticipantCard from '../components/ParticipantCard.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

// Share URL for this session
function getSessionUrl(code) {
  return `${window.location.origin}${window.location.pathname}?code=${code}`
}

// ─── Share panel ──────────────────────────────────────────────────────────────
function SharePanel({ code, t }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const url = getSessionUrl(code)

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareTeams() {
    const msg = t.teamsMsg.replace('{code}', code).replace('{url}', url)
    const encoded = encodeURIComponent(msg)
    // Try Teams protocol; fallback is opening the encoded message
    window.location.href = `msteams://l/chat/0/0?message=${encoded}`
  }

  return (
    <>
      <div className="code-display">
        <div className="code-value" aria-label={`Code : ${code}`}>{code}</div>
        <p className="code-hint">{t.codeHint}</p>
        <button
          className="btn btn-cta btn-sm"
          onClick={copyCode}
          style={{ width: 'auto', minWidth: 160 }}
        >
          {copied ? `✓ ${t.copied}` : `📋 ${t.copyCode}`}
        </button>
      </div>

      <div className="btn-icon-row">
        <button className="btn-icon" onClick={shareTeams} title={t.shareTeams}>
          💬 {t.shareTeams}
        </button>
        <button className="btn-icon" onClick={copyLink} title={t.copyLink}>
          🔗 {t.copyLink}
        </button>
        <button className="btn-icon" onClick={() => setShowQR(true)} title={t.showQR}>
          ⬜ {t.showQR}
        </button>
      </div>

      {showQR && (
        <QRCodeModal url={url} t={t} onClose={() => setShowQR(false)} />
      )}
    </>
  )
}

// ─── Group summary ────────────────────────────────────────────────────────────
function GroupSummary({ participants, t }) {
  const out      = participants.filter(p => p.mealMode === 'out').length
  const takeout  = participants.filter(p => p.mealMode === 'takeout').length
  const homemade = participants.filter(p => p.mealMode === 'homemade').length

  const summary = t.groupSummary
    .replace('{out}', out)
    .replace('{takeout}', takeout)
    .replace('{homemade}', homemade)

  return (
    <div className="summary-bar" aria-live="polite">
      <span className="summary-item">🍽️ {out}</span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <span className="summary-item">📦 {takeout}</span>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <span className="summary-item">🥡 {homemade}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 4 }}>
        {summary}
      </span>
    </div>
  )
}

// ─── Main WaitingRoomScreen ───────────────────────────────────────────────────
export default function WaitingRoomScreen({
  t, lang, sessionCode, userId, isOrganizer, onLeave, onResultsReady,
}) {
  const [session, setSession]           = useState(null)
  const [loadingOut, setLoadingOut]     = useState(false)
  const [loadingTakeout, setLoadingTakeout] = useState(false)
  const [errorOut, setErrorOut]         = useState('')
  const [errorTakeout, setErrorTakeout] = useState('')

  // Poll localStorage every 3 seconds
  const refresh = useCallback(() => {
    const s = getSession(sessionCode)
    if (!s) return
    setSession(s)

    // Navigate participants to results when organizer has launched search
    if (!isOrganizer) {
      const hasResults = s.results?.out?.length > 0 || s.results?.takeout?.length > 0
      if (hasResults) onResultsReady()
    }
  }, [sessionCode, isOrganizer, onResultsReady])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 3000)
    // Also listen for cross-tab storage events
    window.addEventListener('storage', refresh)
    return () => { clearInterval(id); window.removeEventListener('storage', refresh) }
  }, [refresh])

  // ─── Search triggers ────────────────────────────────────────────────────────

  async function launchSearch(mode) {
    if (!session) return
    const setLoading = mode === 'out' ? setLoadingOut : setLoadingTakeout
    const setError   = mode === 'out' ? setErrorOut   : setErrorTakeout

    setLoading(true)
    setError('')
    setSearching({ code: sessionCode, mode, value: true })

    const relevantParticipants = session.participants.filter(p => p.mealMode === mode)

    try {
      const results = await getRecommendations({ participants: relevantParticipants, mode, lang })
      setResults({ code: sessionCode, mode, results })
      onResultsReady()
    } catch (err) {
      setSearching({ code: sessionCode, mode, value: false })
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
      <div className="screen">
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  const { participants } = session
  const hasOut     = participants.some(p => p.mealMode === 'out')
  const hasTakeout = participants.some(p => p.mealMode === 'takeout')
  const myParticipant = participants.find(p => p.id === userId)
  const organizerName = participants.find(p => p.isOrganizer)?.name || ''

  const hasAnyResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0

  return (
    <div className="screen">
      {/* Header */}
      <div className="section-header">
        <h1>{t.waitingRoomTitle}</h1>
        <button className="btn-ghost" onClick={onLeave} style={{ flexShrink: 0 }}>
          ✕
        </button>
      </div>

      {/* Session code + share (organizer only) */}
      {isOrganizer && (
        <SharePanel code={sessionCode} t={t} />
      )}

      {/* Group summary */}
      <GroupSummary participants={participants} t={t} />

      {/* Participants list */}
      <div className="flex-col" style={{ gap: 8 }} aria-live="polite" aria-label={t.participants}>
        {participants.map(p => (
          <ParticipantCard key={p.id} participant={p} t={t} />
        ))}
      </div>

      {/* Empty state */}
      {participants.length === 1 && isOrganizer && (
        <p className="text-center text-muted">{t.waitingEmpty}</p>
      )}

      {/* Waiting message for participants */}
      {!isOrganizer && (
        <div className="waiting-banner">
          <p style={{ color: 'var(--brown)', fontWeight: 600 }}>
            {t.waitingParticipant.replace('{name}', organizerName)}
          </p>
        </div>
      )}

      {/* Results ready — navigate */}
      {hasAnyResults && (
        <button className="btn btn-cta" onClick={onResultsReady}>
          🎉 {t.viewResults}
        </button>
      )}

      {/* Search launch buttons (organizer only) */}
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
                ) : session.searchedOut ? (
                  `✓ ${t.searchDone}`
                ) : (
                  t.launchSearchOut
                )}
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
                ) : session.searchedTakeout ? (
                  `✓ ${t.searchDone}`
                ) : (
                  t.launchSearchTakeout
                )}
              </button>
              {errorTakeout && <span className="error-msg" role="alert">⚠ {errorTakeout}</span>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
