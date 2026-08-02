import { useState, useEffect } from 'react'
import { detectLang, getTranslations } from './i18n/index.js'
import { getSession, addToHistory, resetResults } from './services/sessionService.js'
import HomeScreen from './screens/HomeScreen.jsx'
import CreateScreen from './screens/CreateScreen.jsx'
import JoinScreen from './screens/JoinScreen.jsx'
import PreferencesScreen from './screens/PreferencesScreen.jsx'
import WaitingRoomScreen from './screens/WaitingRoomScreen.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'
import GuideScreen from './screens/GuideScreen.jsx'
import FeedbackScreen from './screens/FeedbackScreen.jsx'
import MaintenanceScreen from './screens/MaintenanceScreen.jsx'
import PasswordGateScreen from './screens/PasswordGateScreen.jsx'
import { STORAGE_KEYS } from './constants/storageKeys.js'
import { APP_PASSWORD } from './constants/appPassword.js'

// Unlisted maintenance page — reachable only via ?maintenance=<this token>, never linked
// in the UI. Client-side only (see MaintenanceScreen.jsx). Not real security: this
// constant ships in the public JS bundle like every other value in this prototype
// (same trade-off already accepted for the exposed API keys) — treat the URL as a
// shared secret to hand out carefully, not as an access-controlled admin panel.
const MAINTENANCE_TOKEN = 'atable-secours-2026'

export default function App() {
  const [lang] = useState(() => detectLang())
  const t = getTranslations(lang)

  // Also unlocks from a QR code / shared link carrying ?pwd=<password> (e.g. combined
  // with ?code=XXXX to join a table straight away) — no manual typing needed.
  const [unlocked,  setUnlocked]  = useState(() => {
    if (localStorage.getItem(STORAGE_KEYS.UNLOCKED) === 'true') return true
    const urlPassword = new URLSearchParams(window.location.search).get('pwd')
    if (urlPassword === APP_PASSWORD) {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true')
      return true
    }
    return false
  })
  const [gateError, setGateError] = useState('')

  // Strip ?pwd= from the visible URL/history once read, whether or not it matched —
  // keeps any other param (e.g. ?code=XXXX) intact for the init effect below.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('pwd')) return
    params.delete('pwd')
    const query = params.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  }, [])

  // 'loading' while we check localStorage + Supabase on first mount
  const [screen, setScreen] = useState('loading')

  const [sessionCode,   setSessionCode]   = useState(null)
  const [userId,        setUserId]        = useState(null)
  const [isOrganizer,   setIsOrganizer]   = useState(false)
  const [prefilledCode, setPrefilledCode] = useState(null)
  // Where to go after completing/editing preferences: 'waiting' | 'home'
  const [afterPrefs,       setAfterPrefs]       = useState('waiting')
  // Prevents auto-redirect to results when user explicitly navigates back from results screen
  const [cameFromResults,  setCameFromResults]  = useState(false)

  // ─── Init: resolve screen from localStorage + Supabase ─────────────────────
  // localStorage (not sessionStorage) → persists after closing the browser tab
  useEffect(() => {
    if (!unlocked) return // stay on the password gate — nothing below runs until unlocked

    async function init() {
      // Check for ?code= or ?guide= URL param first
      const params  = new URLSearchParams(window.location.search)
      const urlCode = params.get('code')

      // Unlisted maintenance page — bypasses session restore entirely
      if (params.get('maintenance') === MAINTENANCE_TOKEN) {
        setScreen('maintenance')
        return
      }

      // Shareable direct link to the guide — bypasses session restore entirely
      if (params.has('guide')) {
        setScreen('guide')
        return
      }
      if (params.has('feedback')) {
        setScreen('feedback')
        return
      }

      const storedCode = localStorage.getItem(STORAGE_KEYS.CODE)
      const storedUid  = localStorage.getItem(STORAGE_KEYS.UID)

      // If URL has a code and no active session → go to Join
      if (urlCode && !storedCode) {
        setPrefilledCode(urlCode)
        setScreen('join')
        return
      }

      // No stored session → home
      if (!storedCode || !storedUid) {
        setScreen('home')
        return
      }

      // Check if the stored session still exists in Supabase
      const session = await getSession(storedCode)
      if (!session) {
        clearIdentity()
        setScreen('home')
        return
      }

      const participant = session.participants.find(p => p.id === storedUid)
      if (!participant) {
        clearIdentity()
        setScreen('home')
        return
      }

      // Restore identity state
      setSessionCode(storedCode)
      setUserId(storedUid)
      setIsOrganizer(localStorage.getItem(STORAGE_KEYS.ORGANIZER) === 'true')

      if (!participant.prefsComplete) { setScreen('preferences'); return }

      const hasResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0
      setScreen(hasResults ? 'results' : 'waiting')
    }

    init()
  }, [unlocked]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function persistIdentity({ code, uid, organizer }) {
    localStorage.setItem(STORAGE_KEYS.CODE,      code)
    localStorage.setItem(STORAGE_KEYS.UID,       uid)
    localStorage.setItem(STORAGE_KEYS.ORGANIZER, String(organizer))
    addToHistory({ code, participantId: uid, isOrganizer: organizer })
    setSessionCode(code)
    setUserId(uid)
    setIsOrganizer(organizer)
  }

  function clearIdentity() {
    localStorage.removeItem(STORAGE_KEYS.CODE)
    localStorage.removeItem(STORAGE_KEYS.UID)
    localStorage.removeItem(STORAGE_KEYS.ORGANIZER)
    setSessionCode(null)
    setUserId(null)
    setIsOrganizer(false)
  }

  // ─── Navigation handlers ─────────────────────────────────────────────────────

  function handleCreated({ code, organizerId }) {
    persistIdentity({ code, uid: organizerId, organizer: true })
    setScreen('preferences')
  }

  function handleJoined({ code, participantId }) {
    persistIdentity({ code, uid: participantId, organizer: false })
    setScreen('preferences')
  }

  function handleLeave() {
    clearIdentity()
    window.history.replaceState({}, '', window.location.pathname)
    setScreen('home')
  }

  // Rejoin a session from the "Mes déjeuners" tab (switch active session)
  async function handleRejoinFromHistory(entry) {
    persistIdentity({
      code:      entry.session.code,
      uid:       entry.participantId,
      organizer: entry.isOrganizer,
    })
    const hasResults = entry.session.results?.out?.length > 0 || entry.session.results?.takeout?.length > 0
    setScreen(hasResults ? 'results' : 'waiting')
  }

  // Edit prefs from the "Mes déjeuners" tab — return to Home after done
  function handleEditFromHistory(entry) {
    persistIdentity({
      code:      entry.session.code,
      uid:       entry.participantId,
      organizer: entry.isOrganizer,
    })
    setAfterPrefs('home')
    setScreen('preferences')
  }

  function goJoin(code) {
    if (code) setPrefilledCode(code)
    setScreen('join')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (!unlocked) {
    return (
      <div className="app">
        <PasswordGateScreen
          error={gateError}
          onSubmit={password => {
            if (password === APP_PASSWORD) {
              localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true')
              setGateError('')
              setUnlocked(true)
            } else {
              setGateError('Mot de passe incorrect.')
            }
          }}
        />
      </div>
    )
  }

  if (screen === 'loading') {
    return (
      <div className="app">
        <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          t={t}
          onCreate={() => setScreen('create')}
          onJoin={goJoin}
          onRejoin={handleRejoinFromHistory}
          onEdit={handleEditFromHistory}
          onGuide={() => {
            window.history.replaceState({}, '', `${window.location.pathname}?guide=1`)
            setScreen('guide')
          }}
          onFeedback={() => {
            window.history.replaceState({}, '', `${window.location.pathname}?feedback=1`)
            setScreen('feedback')
          }}
        />
      )}

      {screen === 'maintenance' && <MaintenanceScreen />}

      {screen === 'guide' && (
        <GuideScreen
          t={t}
          onBack={() => {
            window.history.replaceState({}, '', window.location.pathname)
            setScreen('home')
          }}
        />
      )}

      {screen === 'feedback' && (
        <FeedbackScreen
          t={t}
          onBack={() => {
            window.history.replaceState({}, '', window.location.pathname)
            setScreen('home')
          }}
        />
      )}

      {screen === 'create' && (
        <CreateScreen t={t} onBack={() => setScreen('home')} onCreated={handleCreated} />
      )}

      {screen === 'join' && (
        <JoinScreen
          t={t}
          initialCode={prefilledCode}
          onBack={() => setScreen('home')}
          onJoined={handleJoined}
        />
      )}

      {screen === 'preferences' && (
        <PreferencesScreen
          t={t}
          sessionCode={sessionCode}
          userId={userId}
          onBack={() => {
            if (afterPrefs === 'home') { setAfterPrefs('waiting'); setScreen('home') }
            else handleLeave()
          }}
          onDone={() => {
            const dest = afterPrefs
            setAfterPrefs('waiting')
            setScreen(dest)
          }}
        />
      )}

      {screen === 'waiting' && (
        <WaitingRoomScreen
          t={t}
          lang={lang}
          sessionCode={sessionCode}
          userId={userId}
          isOrganizer={isOrganizer}
          autoRedirect={!cameFromResults}
          onLeave={handleLeave}
          onEditPrefs={() => setScreen('preferences')}
          onResultsReady={() => { setCameFromResults(false); setScreen('results') }}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          t={t}
          sessionCode={sessionCode}
          isOrganizer={isOrganizer}
          onLeave={handleLeave}
          onBackToWaiting={async () => {
            if (isOrganizer) await resetResults({ code: sessionCode }).catch(() => {})
            setCameFromResults(true)
            setScreen('waiting')
          }}
        />
      )}
    </div>
  )
}
