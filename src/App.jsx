import { useState, useEffect } from 'react'
import { detectLang, getTranslations } from './i18n/index.js'
import { getSession } from './services/sessionService.js'
import HomeScreen from './screens/HomeScreen.jsx'
import CreateScreen from './screens/CreateScreen.jsx'
import JoinScreen from './screens/JoinScreen.jsx'
import PreferencesScreen from './screens/PreferencesScreen.jsx'
import WaitingRoomScreen from './screens/WaitingRoomScreen.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'

const SCREENS = {
  HOME: 'home',
  CREATE: 'create',
  JOIN: 'join',
  PREFERENCES: 'preferences',
  WAITING: 'waiting',
  RESULTS: 'results',
}

/** Resolves the initial screen based on sessionStorage and session state */
function resolveInitialScreen() {
  const code = sessionStorage.getItem('atable_code')
  const uid  = sessionStorage.getItem('atable_uid')
  if (!code || !uid) return SCREENS.HOME

  const session = getSession(code)
  if (!session) {
    // Session expired or was never created — clear stored identity
    sessionStorage.removeItem('atable_code')
    sessionStorage.removeItem('atable_uid')
    sessionStorage.removeItem('atable_organizer')
    return SCREENS.HOME
  }

  const participant = session.participants.find(p => p.id === uid)
  if (!participant) return SCREENS.HOME
  if (!participant.prefsComplete) return SCREENS.PREFERENCES

  const hasResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0
  return hasResults ? SCREENS.RESULTS : SCREENS.WAITING
}

export default function App() {
  const [lang]  = useState(() => detectLang())
  const t = getTranslations(lang)

  const [screen, setScreen] = useState(resolveInitialScreen)

  // Current user identity (persisted in sessionStorage)
  const [sessionCode,  setSessionCode]  = useState(() => sessionStorage.getItem('atable_code')      || null)
  const [userId,       setUserId]       = useState(() => sessionStorage.getItem('atable_uid')       || null)
  const [isOrganizer,  setIsOrganizer]  = useState(() => sessionStorage.getItem('atable_organizer') === 'true')

  // Code pre-filled via URL ?code= param or public session click
  const [prefilledCode, setPrefilledCode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('code') || null
  })

  // If ?code= is in URL and no active session, navigate to Join
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlCode = params.get('code')
    if (urlCode && !sessionStorage.getItem('atable_code')) {
      setPrefilledCode(urlCode)
      setScreen(SCREENS.JOIN)
    }
  }, [])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function persistIdentity({ code, uid, organizer }) {
    sessionStorage.setItem('atable_code', code)
    sessionStorage.setItem('atable_uid', uid)
    sessionStorage.setItem('atable_organizer', String(organizer))
    setSessionCode(code)
    setUserId(uid)
    setIsOrganizer(organizer)
  }

  function handleCreated({ code, organizerId }) {
    persistIdentity({ code, uid: organizerId, organizer: true })
    setScreen(SCREENS.PREFERENCES)
  }

  function handleJoined({ code, participantId }) {
    persistIdentity({ code, uid: participantId, organizer: false })
    setScreen(SCREENS.PREFERENCES)
  }

  function handlePreferencesDone() {
    setScreen(SCREENS.WAITING)
  }

  function handleResultsReady() {
    setScreen(SCREENS.RESULTS)
  }

  function handleLeave() {
    sessionStorage.removeItem('atable_code')
    sessionStorage.removeItem('atable_uid')
    sessionStorage.removeItem('atable_organizer')
    setSessionCode(null)
    setUserId(null)
    setIsOrganizer(false)
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname)
    setScreen(SCREENS.HOME)
  }

  function goJoin(code) {
    if (code) setPrefilledCode(code)
    setScreen(SCREENS.JOIN)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {screen === SCREENS.HOME && (
        <HomeScreen
          t={t}
          onCreate={() => setScreen(SCREENS.CREATE)}
          onJoin={goJoin}
        />
      )}

      {screen === SCREENS.CREATE && (
        <CreateScreen
          t={t}
          onBack={() => setScreen(SCREENS.HOME)}
          onCreated={handleCreated}
        />
      )}

      {screen === SCREENS.JOIN && (
        <JoinScreen
          t={t}
          initialCode={prefilledCode}
          onBack={() => setScreen(SCREENS.HOME)}
          onJoined={handleJoined}
        />
      )}

      {screen === SCREENS.PREFERENCES && (
        <PreferencesScreen
          t={t}
          sessionCode={sessionCode}
          userId={userId}
          onDone={handlePreferencesDone}
        />
      )}

      {screen === SCREENS.WAITING && (
        <WaitingRoomScreen
          t={t}
          lang={lang}
          sessionCode={sessionCode}
          userId={userId}
          isOrganizer={isOrganizer}
          onLeave={handleLeave}
          onResultsReady={handleResultsReady}
        />
      )}

      {screen === SCREENS.RESULTS && (
        <ResultsScreen
          t={t}
          sessionCode={sessionCode}
          onLeave={handleLeave}
        />
      )}
    </div>
  )
}
