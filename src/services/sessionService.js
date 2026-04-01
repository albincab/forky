// Session storage service — all reads/writes to localStorage go through here

const SESSIONS_KEY = 'atable_sessions'
const PUBLIC_INDEX_KEY = 'atable_public_index'

// ─── Internal helpers ───────────────────────────────────────────────────────

function readSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeSessions(sessions) {
  // Passively remove sessions older than 24 hours to keep storage clean
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const cleaned = Object.fromEntries(
    Object.entries(sessions).filter(([, s]) => s.createdAt > cutoff)
  )
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(cleaned))
}

function readPublicIndex() {
  try {
    return JSON.parse(localStorage.getItem(PUBLIC_INDEX_KEY) || '[]')
  } catch {
    return []
  }
}

function writePublicIndex(list) {
  localStorage.setItem(PUBLIC_INDEX_KEY, JSON.stringify(list))
}

// ─── Code generation ─────────────────────────────────────────────────────────

/** Generates a 4-character session code (no ambiguous chars: 0, O, I, 1, l) */
export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─── Session CRUD ────────────────────────────────────────────────────────────

/**
 * Creates a new session.
 * @param {{ organizerName: string, type: 'public'|'private' }}
 * @returns {{ session, organizerId }}
 */
export function createSession({ organizerName, type }) {
  const sessions = readSessions()

  // Ensure code uniqueness
  let code = generateCode()
  while (sessions[code]) code = generateCode()

  const organizerId = crypto.randomUUID()

  const session = {
    code,
    type,
    organizerName,
    organizerId,
    createdAt: Date.now(),
    status: 'waiting', // 'waiting' | 'done'
    searchingOut: false,
    searchingTakeout: false,
    searchedOut: false,
    searchedTakeout: false,
    participants: [
      {
        id: organizerId,
        name: organizerName,
        isOrganizer: true,
        mealMode: null, // 'out' | 'homemade' | 'takeout'
        cuisines: [],
        budget: null,
        allergies: [],
        prefsComplete: false,
        joinedAt: Date.now(),
      },
    ],
    results: { out: null, takeout: null },
  }

  sessions[code] = session
  writeSessions(sessions)

  // Register in public index if public
  if (type === 'public') {
    const index = readPublicIndex()
    if (!index.includes(code)) {
      index.push(code)
      writePublicIndex(index)
    }
  }

  return { session, organizerId }
}

/**
 * Retrieves a session by code (case-insensitive).
 * @param {string} code
 * @returns {object|null}
 */
export function getSession(code) {
  if (!code) return null
  const sessions = readSessions()
  return sessions[code.toUpperCase()] || null
}

/**
 * Persists a full session object (used after in-place mutations).
 * @param {object} session
 */
export function saveSession(session) {
  const sessions = readSessions()
  sessions[session.code] = session
  writeSessions(sessions)
}

/**
 * Adds a participant to an existing session.
 * @param {{ code: string, participantName: string }}
 * @returns {{ session, participantId } | { error: string }}
 */
export function joinSession({ code, participantName }) {
  const upperCode = code.toUpperCase()
  const sessions = readSessions()
  const session = sessions[upperCode]

  if (!session) return { error: 'SESSION_NOT_FOUND' }
  if (session.status !== 'waiting') return { error: 'SESSION_CLOSED' }

  const participantId = crypto.randomUUID()
  session.participants.push({
    id: participantId,
    name: participantName,
    isOrganizer: false,
    mealMode: null,
    cuisines: [],
    budget: null,
    allergies: [],
    prefsComplete: false,
    joinedAt: Date.now(),
  })

  sessions[upperCode] = session
  writeSessions(sessions)

  return { session, participantId }
}

/**
 * Updates a participant's preferences and marks them as complete.
 * @param {{ code: string, participantId: string, prefs: object }}
 * @returns {object|null} Updated session
 */
export function updateParticipantPrefs({ code, participantId, prefs }) {
  const sessions = readSessions()
  const session = sessions[code]
  if (!session) return null

  const idx = session.participants.findIndex(p => p.id === participantId)
  if (idx === -1) return null

  session.participants[idx] = {
    ...session.participants[idx],
    ...prefs,
    prefsComplete: true,
  }

  sessions[code] = session
  writeSessions(sessions)
  return session
}

/**
 * Sets the searching flag for a given mode.
 * @param {{ code: string, mode: 'out'|'takeout', value: boolean }}
 */
export function setSearching({ code, mode, value }) {
  const sessions = readSessions()
  const session = sessions[code]
  if (!session) return

  if (mode === 'out') session.searchingOut = value
  if (mode === 'takeout') session.searchingTakeout = value

  sessions[code] = session
  writeSessions(sessions)
}

/**
 * Stores AI recommendation results for a given mode.
 * @param {{ code: string, mode: 'out'|'takeout', results: Array }}
 * @returns {object|null} Updated session
 */
export function setResults({ code, mode, results }) {
  const sessions = readSessions()
  const session = sessions[code]
  if (!session) return null

  session.results[mode] = results
  if (mode === 'out') { session.searchingOut = false; session.searchedOut = true }
  if (mode === 'takeout') { session.searchingTakeout = false; session.searchedTakeout = true }

  sessions[code] = session
  writeSessions(sessions)
  return session
}

/**
 * Returns all public sessions created today.
 * @returns {Array}
 */
export function getPublicSessions() {
  const index = readPublicIndex()
  const sessions = readSessions()
  const todayStr = new Date().toDateString()

  return index
    .map(code => sessions[code])
    .filter(s => s && s.status === 'waiting' && new Date(s.createdAt).toDateString() === todayStr)
}
