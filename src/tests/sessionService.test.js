import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateCode,
  createSession,
  getSession,
  joinSession,
  updateParticipantPrefs,
  setResults,
  setSearching,
  getPublicSessions,
  leaveSession,
  deleteSession,
  addToHistory,
  getSessionsHistory,
  removeFromHistory,
} from '../services/sessionService.js'

// ─── In-memory DB ─────────────────────────────────────────────────────────────
let db = { sessions: [], participants: [] }

function matchFilters(row, filters) {
  return Object.entries(filters).every(([k, v]) => row[k] === v)
}

// Default column values that Supabase would normally provide via schema defaults
const SESSION_DEFAULTS = {
  status: 'waiting',
  searching_out: false,
  searching_takeout: false,
  searched_out: false,
  searched_takeout: false,
  result_out: null,
  result_takeout: null,
}
const PARTICIPANT_DEFAULTS = {
  meal_mode: null,
  cuisines: [],
  budget: null,
  allergies: [],
  more_than_one_hour: false,
  back_by_14h: false,
  prefs_complete: false,
}

function withDefaults(table, row) {
  const now = new Date().toISOString()
  if (table === 'sessions')     return { created_at: now, ...SESSION_DEFAULTS,     ...row }
  if (table === 'participants') return { joined_at:  now, ...PARTICIPANT_DEFAULTS, ...row }
  return row
}

function makeQuery(table) {
  let _filters    = {}
  let _operation  = null
  let _insertRows = null
  let _updateData = null
  let _selectCols = '*'

  const q = {
    select: (cols = '*') => { _operation = 'select'; _selectCols = cols; return q },
    insert: (data)        => { _operation = 'insert'; _insertRows = Array.isArray(data) ? data : [data]; return q },
    update: (data)        => { _operation = 'update'; _updateData = data; return q },
    delete: ()            => { _operation = 'delete'; return q },
    eq:     (col, val)    => { _filters[col] = val; return q },
    order:  ()            => q,
    gte:    ()            => q,
    maybeSingle: () => {
      const rows = db[table].filter(r => matchFilters(r, _filters))
      return Promise.resolve({ data: rows[0] ?? null, error: null })
    },
    then: (resolve) => {
      const result = { data: null, error: null }
      if (_operation === 'insert') {
        const rows = _insertRows.map(r => withDefaults(table, r))
        db[table].push(...rows)
        result.data = rows
      } else if (_operation === 'update') {
        db[table] = db[table].map(r =>
          matchFilters(r, _filters) ? { ...r, ..._updateData } : r
        )
      } else if (_operation === 'delete') {
        db[table] = db[table].filter(r => !matchFilters(r, _filters))
      } else {
        // select — optionally join participants
        let rows = db[table].filter(r => matchFilters(r, _filters))
        if (_selectCols.includes('participants(*)')) {
          rows = rows.map(r => ({
            ...r,
            participants: db.participants.filter(p => p.session_code === r.code),
          }))
        }
        result.data = rows
      }
      resolve(result)
      return { catch: () => {} }
    },
  }
  return q
}

// Mock Supabase
vi.mock('../services/supabaseClient.js', () => ({
  supabase: {
    from:          table => makeQuery(table),
    channel:       ()    => ({ on: function() { return this }, subscribe: () => null }),
    removeChannel: ()    => {},
  },
}))

// ─── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    k      => store[k] ?? null,
    setItem:    (k, v) => { store[k] = String(v) },
    removeItem: k      => { delete store[k] },
    clear:      ()     => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// Mock crypto.randomUUID
let uuidCounter = 0
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => `uuid-${++uuidCounter}` },
  writable: true,
})

function resetDb() {
  db.sessions     = []
  db.participants = []
  uuidCounter     = 0
  localStorageMock.clear()
}

// ─── generateCode ─────────────────────────────────────────────────────────────
describe('generateCode', () => {
  it('generates a 4-character code', () => {
    expect(generateCode()).toHaveLength(4)
  })

  it('uses only allowed characters', () => {
    for (let i = 0; i < 50; i++) expect(generateCode()).toMatch(/^[A-Z2-9]{4}$/)
  })

  it('never contains ambiguous characters (0 O I 1 l)', () => {
    for (let i = 0; i < 100; i++) expect(generateCode()).not.toMatch(/[0OI1l]/)
  })

  it('generates reasonably unique codes', () => {
    const codes  = Array.from({ length: 200 }, generateCode)
    const unique = new Set(codes)
    expect(unique.size).toBeGreaterThan(190)
  })
})

// ─── createSession ────────────────────────────────────────────────────────────
describe('createSession', () => {
  beforeEach(resetDb)

  it('returns a session with the expected shape', async () => {
    const { session, organizerId } = await createSession({ organizerName: 'Alice', type: 'private' })
    expect(session.code).toHaveLength(4)
    expect(session.type).toBe('private')
    expect(session.organizerId).toBe(organizerId)
    expect(session.status).toBe('waiting')
    expect(session.searchingOut).toBe(false)
    expect(session.searchedOut).toBe(false)
    expect(session.results).toEqual({ out: null, takeout: null })
  })

  it('creates the organizer as first participant', async () => {
    const { session, organizerId } = await createSession({ organizerName: 'Alice', type: 'private' })
    const organizer = session.participants[0]
    expect(organizer.id).toBe(organizerId)
    expect(organizer.name).toBe('Alice')
    expect(organizer.isOrganizer).toBe(true)
    expect(organizer.prefsComplete).toBe(false)
    expect(organizer.mealMode).toBeNull()
  })

  it('persists session so getSession can retrieve it', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    const retrieved   = await getSession(session.code)
    expect(retrieved).not.toBeNull()
    expect(retrieved.organizerName).toBe('Alice')
  })
})

// ─── getSession ───────────────────────────────────────────────────────────────
describe('getSession', () => {
  beforeEach(resetDb)

  it('returns null for unknown code', async () => {
    expect(await getSession('XXXX')).toBeNull()
  })

  it('returns null for null/undefined input', async () => {
    expect(await getSession(null)).toBeNull()
  })

  it('is case-insensitive', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    const retrieved   = await getSession(session.code.toLowerCase())
    expect(retrieved?.code).toBe(session.code)
  })
})

// ─── joinSession ──────────────────────────────────────────────────────────────
describe('joinSession', () => {
  beforeEach(resetDb)

  it('adds a participant to an existing session', async () => {
    const { session }                     = await createSession({ organizerName: 'Alice', type: 'private' })
    const { session: updated, participantId } = await joinSession({ code: session.code, participantName: 'Bob' })

    expect(updated.participants).toHaveLength(2)
    const bob = updated.participants.find(p => p.id === participantId)
    expect(bob.name).toBe('Bob')
    expect(bob.isOrganizer).toBe(false)
    expect(bob.prefsComplete).toBe(false)
  })

  it('returns SESSION_NOT_FOUND for unknown code', async () => {
    const result = await joinSession({ code: 'ZZZZ', participantName: 'Eve' })
    expect(result.error).toBe('SESSION_NOT_FOUND')
  })

  it('is case-insensitive on code input', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    const result      = await joinSession({ code: session.code.toLowerCase(), participantName: 'Bob' })
    expect(result.error).toBeUndefined()
    expect(result.session.participants).toHaveLength(2)
  })

  it('allows multiple participants to join', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    await joinSession({ code: session.code, participantName: 'Bob' })
    await joinSession({ code: session.code, participantName: 'Carol' })
    const final = await getSession(session.code)
    expect(final.participants).toHaveLength(3)
  })
})

// ─── updateParticipantPrefs ───────────────────────────────────────────────────
describe('updateParticipantPrefs', () => {
  beforeEach(resetDb)

  it('updates prefs and marks prefsComplete', async () => {
    const { session, organizerId } = await createSession({ organizerName: 'Alice', type: 'private' })
    const prefs = {
      mealMode: 'out',
      cuisines: ['Française', 'Pizza'],
      budget: '15-30',
      allergies: [],
      moreThanOneHour: true,
      backBy14h: false,
    }

    await updateParticipantPrefs({ code: session.code, participantId: organizerId, prefs })
    const updated = await getSession(session.code)
    const alice   = updated.participants.find(p => p.id === organizerId)

    expect(alice.mealMode).toBe('out')
    expect(alice.cuisines).toContain('Française')
    expect(alice.budget).toBe('15-30')
    expect(alice.prefsComplete).toBe(true)
    expect(alice.moreThanOneHour).toBe(true)
    expect(alice.backBy14h).toBe(false)
  })

  it('preserves other participants when updating one', async () => {
    const { session, organizerId }        = await createSession({ organizerName: 'Alice', type: 'private' })
    const { participantId: bobId }        = await joinSession({ code: session.code, participantName: 'Bob' })

    await updateParticipantPrefs({ code: session.code, participantId: organizerId, prefs: { mealMode: 'out', cuisines: [], allergies: [] } })
    const updated = await getSession(session.code)
    const bob     = updated.participants.find(p => p.id === bobId)

    expect(bob.name).toBe('Bob')
    expect(bob.prefsComplete).toBe(false)
  })

  it('correctly saves inplace mode (no cuisines/budget)', async () => {
    const { session, organizerId } = await createSession({ organizerName: 'Alice', type: 'private' })
    await updateParticipantPrefs({
      code: session.code,
      participantId: organizerId,
      prefs: { mealMode: 'inplace', cuisines: [], budget: null, allergies: [] },
    })
    const updated = await getSession(session.code)
    const alice   = updated.participants.find(p => p.id === organizerId)
    expect(alice.mealMode).toBe('inplace')
    expect(alice.cuisines).toHaveLength(0)
    expect(alice.budget).toBeNull()
    expect(alice.prefsComplete).toBe(true)
  })
})

// ─── setSearching ─────────────────────────────────────────────────────────────
describe('setSearching', () => {
  beforeEach(resetDb)

  it('sets searchingOut to true', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    await setSearching({ code: session.code, mode: 'out', value: true })
    const updated = await getSession(session.code)
    expect(updated.searchingOut).toBe(true)
  })

  it('sets searchingOut back to false', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    await setSearching({ code: session.code, mode: 'out', value: true })
    await setSearching({ code: session.code, mode: 'out', value: false })
    const updated = await getSession(session.code)
    expect(updated.searchingOut).toBe(false)
  })
})

// ─── setResults ───────────────────────────────────────────────────────────────
describe('setResults', () => {
  beforeEach(resetDb)

  const mockRestaurants = [
    { name: 'Le Bistro',   cuisine: 'Française', adresse: '1 rue Gambetta', budget: '15–30€', note: '4.5', pourquoi: 'Parfait' },
    { name: 'Pizza Roma',  cuisine: 'Italienne', adresse: '3 rue Zola',     budget: '15–30€', note: '4.2', pourquoi: 'Bonne ambiance' },
    { name: 'Burger & Co', cuisine: 'Burger',    adresse: '5 place du Peuple', budget: '<15€', note: '4.0', pourquoi: 'Rapide' },
  ]

  it('stores results and marks searchedOut', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    await setResults({ code: session.code, mode: 'out', results: mockRestaurants })
    const updated = await getSession(session.code)
    expect(updated.results.out).toHaveLength(3)
    expect(updated.searchedOut).toBe(true)
    expect(updated.searchingOut).toBe(false)
  })

  it('first result in list is accessible', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    await setResults({ code: session.code, mode: 'out', results: mockRestaurants })
    const updated = await getSession(session.code)
    expect(updated.results.out[0].name).toBe('Le Bistro')
  })
})

// ─── leaveSession ─────────────────────────────────────────────────────────────
describe('leaveSession', () => {
  beforeEach(resetDb)

  it('removes participant from the session', async () => {
    const { session }              = await createSession({ organizerName: 'Alice', type: 'private' })
    const { participantId: bobId } = await joinSession({ code: session.code, participantName: 'Bob' })

    await leaveSession({ code: session.code, participantId: bobId })
    const updated = await getSession(session.code)
    expect(updated.participants.find(p => p.id === bobId)).toBeUndefined()
  })
})

// ─── deleteSession ────────────────────────────────────────────────────────────
describe('deleteSession', () => {
  beforeEach(resetDb)

  it('removes session and all participants', async () => {
    const { session } = await createSession({ organizerName: 'Alice', type: 'private' })
    await joinSession({ code: session.code, participantName: 'Bob' })

    await deleteSession(session.code)
    expect(await getSession(session.code)).toBeNull()
    expect(db.participants.filter(p => p.session_code === session.code)).toHaveLength(0)
  })
})

// ─── getPublicSessions ────────────────────────────────────────────────────────
describe('getPublicSessions', () => {
  beforeEach(resetDb)

  it('returns only public sessions', async () => {
    await createSession({ organizerName: 'Alice', type: 'public' })
    await createSession({ organizerName: 'Bob',   type: 'private' })
    const pub = await getPublicSessions()
    expect(pub.every(s => s.type === 'public')).toBe(true)
  })

  it('returns empty array when no public sessions', async () => {
    await createSession({ organizerName: 'Alice', type: 'private' })
    expect(await getPublicSessions()).toHaveLength(0)
  })
})

// ─── Session history (localStorage) ──────────────────────────────────────────
describe('session history', () => {
  beforeEach(() => localStorageMock.clear())

  it('addToHistory stores an entry', () => {
    addToHistory({ code: 'A3F2', participantId: 'uid-1', isOrganizer: true })
    expect(getSessionsHistory()).toHaveLength(1)
    expect(getSessionsHistory()[0].code).toBe('A3F2')
  })

  it('addToHistory deduplicates by code', () => {
    addToHistory({ code: 'A3F2', participantId: 'uid-1', isOrganizer: true })
    addToHistory({ code: 'A3F2', participantId: 'uid-1', isOrganizer: true })
    expect(getSessionsHistory()).toHaveLength(1)
  })

  it('removeFromHistory removes the entry', () => {
    addToHistory({ code: 'A3F2', participantId: 'uid-1', isOrganizer: true })
    removeFromHistory('A3F2')
    expect(getSessionsHistory()).toHaveLength(0)
  })

  it('caps history at 30 entries', () => {
    for (let i = 0; i < 35; i++) {
      addToHistory({ code: `X${String(i).padStart(3, '0')}`, participantId: 'u', isOrganizer: false })
    }
    expect(getSessionsHistory().length).toBeLessThanOrEqual(30)
  })
})
