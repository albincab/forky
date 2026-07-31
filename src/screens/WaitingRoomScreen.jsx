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
import CodeStrip from '../components/CodeStrip.jsx'

function getSessionUrl(code) {
  return `${window.location.origin}${window.location.pathname}?code=${code}`
}

// ─── Main WaitingRoomScreen ───────────────────────────────────────────────────
export default function WaitingRoomScreen({
  t, lang, sessionCode, userId, isOrganizer, autoRedirect = true, onLeave, onEditPrefs, onResultsReady,
}) {
  const [session,    setSession]    = useState(null)
  const [loadingOut, setLoadingOut] = useState(false)
  const [errorOut,   setErrorOut]   = useState('')
  const [deleting,   setDeleting]   = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [showQR,     setShowQR]     = useState(false)
  const [time,       setTime]       = useState(() =>
    new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
  )

  // Update clock every minute
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }))
    }, 60000)
    return () => clearInterval(id)
  }, [])

  const loadSession = useCallback(async () => {
    const s = await getSession(sessionCode)
    if (!s) return
    setSession(s)
    if (s.results?.out?.length > 0) {
      document.title = '🎉 Résultats disponibles — À TABLE!'
      if (!isOrganizer && autoRedirect) onResultsReady()
    }
  }, [sessionCode, isOrganizer, autoRedirect, onResultsReady])

  useEffect(() => {
    return () => { document.title = 'À TABLE!' }
  }, [])

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
    } catch {
      await setSearching({ code: sessionCode, mode: 'out', value: false })
      setErrorOut(t.claudeError)
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

  function copyCode() {
    const url = getSessionUrl(sessionCode)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareTeams() {
    const url = getSessionUrl(sessionCode)
    const msg = t.teamsMsg.replace('{code}', sessionCode).replace('{url}', url)
    window.location.href = `msteams://l/chat/0/0?message=${encodeURIComponent(msg)}`
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
  const prefsCount    = participants.filter(p => p.prefsComplete).length
  const prefsTotal    = participants.length
  const outCount      = participants.filter(p => p.mealMode === 'out').length
  const inplaceCount  = participants.filter(p => p.mealMode === 'inplace').length
  const outsideCount  = participants.filter(p => p.mealMode === 'outside').length

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <button onClick={() => { if (window.confirm(t.leaveConfirm)) onLeave() }} aria-label={t.leaveSession}>
          ← QUITTER
        </button>
        <span>● SALLE D'ATTENTE</span>
        <span>{time}</span>
      </div>

      {/* Header + stamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="display" style={{ fontSize: 34 }}>
          <span>Tour de</span>
          <span>table</span>
        </div>
        <span className={`stamp ${session.type === 'private' ? '' : ''}`}>
          {session.type === 'private' ? '🔒 Privé' : '★ Public · ouvert'}
        </span>
      </div>

      {/* Code de session */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Code de session</div>
        <CodeStrip code={sessionCode} />
      </div>

      {/* Action buttons */}
      <div className="btn-icon-row">
        <button className="iconbtn" onClick={copyCode} aria-label={t.copyCode}>
          {copied ? `✓ ${t.copied}` : `📋 COPIER`}
        </button>
        <button className="iconbtn" onClick={shareTeams} aria-label={t.shareTeams}>
          💬 TEAMS
        </button>
        <button className="iconbtn" onClick={() => setShowQR(true)} aria-label={t.showQR}>
          ⬜ QR
        </button>
      </div>

      {showQR && <QRCodeModal url={getSessionUrl(sessionCode)} t={t} onClose={() => setShowQR(false)} />}

      {/* Group pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} aria-live="polite">
        {outCount > 0 && (
          <div className="group-pill">
            <b>{outCount}</b>
            <span>🍽️ sortent</span>
          </div>
        )}
        {inplaceCount > 0 && (
          <div className="group-pill">
            <b>{inplaceCount}</b>
            <span>🏠 gamelle</span>
          </div>
        )}
        {outsideCount > 0 && (
          <div className="group-pill">
            <b>{outsideCount}</b>
            <span>🚶 de leur côté</span>
          </div>
        )}
      </div>

      <hr className="rule-thick" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="eyebrow">— participants —</div>
        <span className="eyebrow" style={{ color: 'var(--red)' }}>{prefsCount}/{prefsTotal} prêt</span>
      </div>

      {/* Participant list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} aria-live="polite">
        {participants.map(p => <ParticipantCard key={p.id} participant={p} t={t} />)}
      </div>

      {participants.length === 1 && isOrganizer && (
        <p className="text-center text-muted" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
          {t.waitingEmpty}
        </p>
      )}

      {/* Participant banner */}
      {!isOrganizer && (
        <div className="waiting-banner">
          <p style={{ fontWeight: 600, fontSize: 13 }}>
            {t.waitingParticipant.replace('{name}', organizerName)}
          </p>
          {!searchStarted && (
            <div className="btn-icon-row" style={{ marginTop: 10 }}>
              <button className="iconbtn" onClick={onEditPrefs} aria-label={t.editPrefs}>
                ✏️ {t.editPrefs}
              </button>
              <button
                className="iconbtn"
                style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
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
          <span>🎉 {t.viewResults}</span>
          <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
        </button>
      )}

      {/* Organizer CTA */}
      {isOrganizer && !hasResults && (
        <div className="flex-col mt-auto" style={{ gap: 10 }}>
          {hasOut && (
            <>
              <button
                className="btn btn-red"
                onClick={launchSearch}
                disabled={loadingOut || session.searchedOut}
              >
                {loadingOut ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {t.searching}</>
                ) : session.searchedOut ? (
                  <span>✓ {t.searchDone}</span>
                ) : (
                  <span>{t.launchSearchOut}</span>
                )}
                {!loadingOut && !session.searchedOut && (
                  <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
                )}
              </button>
              {errorOut && <span className="error-msg" role="alert">⚠ {errorOut}</span>}
            </>
          )}

          {!searchStarted && (
            <button
              className="iconbtn"
              style={{ color: 'var(--red)', borderColor: 'var(--red)', flex: 'none', width: '100%' }}
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
