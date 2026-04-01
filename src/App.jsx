import { useState, useEffect } from 'react'
import { detectLang, getTranslations } from './i18n/index.js'
import { getSession } from './services/sessionService.js'
import HomeScreen from './screens/HomeScreen.jsx'
import CreateScreen from './screens/CreateScreen.jsx'
import JoinScreen from './screens/JoinScreen.jsx'
import PreferencesScreen from './screens/PreferencesScreen.jsx'
import WaitingRoomScreen from './screens/WaitingRoomScreen.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'

export default function App() {
  const [lang] = useState(() => detectLang())
  const t = getTranslations(lang)

  // 'loading' while we check sessionStorage + Supabase on first mount
  const [screen, setScreen] = useState('loading')

  const [sessionCode,   setSessionCode]   = useState(null)
  const [userId,        setUserId]        = useState(null)
  const [isOrganizer,   setIsOrganizer]   = useState(false)
  const [prefilledCode, setPrefilledCode] = useState(null)

  // ─── Init: resolve screen from sessionStorage + Supabase ───────────────────
  useEffect(() => {
    async function init() {
      // Check for ?code= URL param first
      const params  = new URLSearchParams(window.location.search)
      const urlCode = params.get('code')

      const storedCode = sessionStorage.getItem('atable_code')
      const storedUid  = sessionStorage.getItem('atable_uid')

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
      setIsOrganizer(sessionStorage.getItem('atable_organizer') === 'true')

      if (!participant.prefsComplete) { setScreen('preferences'); return }

      const hasResults = session.results?.out?.length > 0 || session.results?.takeout?.length > 0
      setScreen(hasResults ? 'results' : 'waiting')
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function persistIdentity({ code, uid, organizer }) {
    sessionStorage.setItem('atable_code',      code)
    sessionStorage.setItem('atable_uid',       uid)
    sessionStorage.setItem('atable_organizer', String(organizer))
    setSessionCode(code)
    setUserId(uid)
    setIsOrganizer(organizer)
  }

  function clearIdentity() {
    sessionStorage.removeItem('atable_code')
    sessionStorage.removeItem('atable_uid')
    sessionStorage.removeItem('atable_organizer')
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

  function goJoin(code) {
    if (code) setPrefilledCode(code)
    setScreen('join')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

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
        <HomeScreen t={t} onCreate={() => setScreen('create')} onJoin={goJoin} />
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
          onDone={() => setScreen('waiting')}
        />
      )}

      {screen === 'waiting' && (
        <WaitingRoomScreen
          t={t}
          lang={lang}
          sessionCode={sessionCode}
          userId={userId}
          isOrganizer={isOrganizer}
          onLeave={handleLeave}
          onResultsReady={() => setScreen('results')}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen t={t} sessionCode={sessionCode} onLeave={handleLeave} />
      )}
    </div>
  )
}
