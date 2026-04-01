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
} from '../services/sessionService.js'

// ─── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    key       => store[key] ?? null,
    setItem:    (key, val) => { store[key] = String(val) },
    removeItem: key       => { delete store[key] },
    clear:      ()        => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// Mock crypto.randomUUID (not available in jsdom by default)
let uuidCounter = 0
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => `uuid-${++uuidCounter}` },
  writable: true,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('generateCode', () => {
  it('generates a 4-character code', () => {
    expect(generateCode()).toHaveLength(4)
  })

  it('uses only uppercase alphanumeric characters', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).toMatch(/^[A-Z2-9]{4}$/)
    }
  })

  it('never contains ambiguous characters (0, O, I, 1, l)', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateCode()).not.toMatch(/[0O1Ilb]/)
    }
  })

  it('generates reasonably unique codes (< 5% duplicates in 200 calls)', () => {
    const codes = Array.from({ length: 200 }, generateCode)
    const unique = new Set(codes)
    expect(unique.size).toBeGreaterThan(190)
  })
})

describe('createSession', () => {
  beforeEach(() => {
    localStorageMock.clear()
    uuidCounter = 0
  })

  it('creates a session with the correct shape', () => {
    const { session, organizerId } = createSession({ organizerName: 'Alice', type: 'private' })

    expect(session.code).toHaveLength(4)
    expect(session.type).toBe('private')
    expect(session.organizerId).toBe(organizerId)
    expect(session.status).toBe('waiting')
    expect(session.searchingOut).toBe(false)
    expect(session.searchedOut).toBe(false)
    expect(session.results).toEqual({ out: null, takeout: null })
  })

  it('creates the organizer as the first participant', () => {
    const { session, organizerId } = createSession({ organizerName: 'Alice', type: 'private' })
    const organizer = session.participants[0]

    expect(organizer.id).toBe(organizerId)
    expect(organizer.name).toBe('Alice')
    expect(organizer.isOrganizer).toBe(true)
    expect(organizer.prefsComplete).toBe(false)
    expect(organizer.mealMode).toBeNull()
  })

  it('adds a public session to the public index', () => {
    const { session } = createSession({ organizerName: 'Bob', type: 'public' })
    const publicSessions = getPublicSessions()
    expect(publicSessions.some(s => s.code === session.code)).toBe(true)
  })

  it('does NOT add a private session to the public index', () => {
    const { session } = createSession({ organizerName: 'Charlie', type: 'private' })
    const publicSessions = getPublicSessions()
    expect(publicSessions.some(s => s.code === session.code)).toBe(false)
  })

  it('persists the session so getSession can retrieve it', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    const retrieved = getSession(session.code)
    expect(retrieved).not.toBeNull()
    expect(retrieved.organizerName).toBe('Alice')
  })
})

describe('getSession', () => {
  beforeEach(() => { localStorageMock.clear(); uuidCounter = 0 })

  it('returns null for a non-existent code', () => {
    expect(getSession('XXXX')).toBeNull()
  })

  it('is case-insensitive', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    const lower = getSession(session.code.toLowerCase())
    expect(lower).not.toBeNull()
    expect(lower.code).toBe(session.code)
  })
})

describe('joinSession', () => {
  beforeEach(() => { localStorageMock.clear(); uuidCounter = 0 })

  it('adds a participant to an existing session', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    const { session: updated, participantId } = joinSession({ code: session.code, participantName: 'Bob' })

    expect(updated.participants).toHaveLength(2)
    const bob = updated.participants.find(p => p.id === participantId)
    expect(bob.name).toBe('Bob')
    expect(bob.isOrganizer).toBe(false)
    expect(bob.prefsComplete).toBe(false)
  })

  it('returns SESSION_NOT_FOUND for an unknown code', () => {
    const result = joinSession({ code: 'ZZZZ', participantName: 'Eve' })
    expect(result.error).toBe('SESSION_NOT_FOUND')
  })

  it('is case-insensitive for the code input', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    const result = joinSession({ code: session.code.toLowerCase(), participantName: 'Bob' })
    expect(result.error).toBeUndefined()
    expect(result.session.participants).toHaveLength(2)
  })

  it('allows multiple participants to join', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    joinSession({ code: session.code, participantName: 'Bob' })
    joinSession({ code: session.code, participantName: 'Carol' })
    const final = getSession(session.code)
    expect(final.participants).toHaveLength(3)
  })
})

describe('updateParticipantPrefs', () => {
  beforeEach(() => { localStorageMock.clear(); uuidCounter = 0 })

  it('updates preferences and marks prefsComplete', () => {
    const { session, organizerId } = createSession({ organizerName: 'Alice', type: 'private' })
    const prefs = { mealMode: 'out', cuisines: ['Française', 'Pizza'], budget: '15-30', allergies: [] }

    const updated = updateParticipantPrefs({ code: session.code, participantId: organizerId, prefs })
    const alice = updated.participants.find(p => p.id === organizerId)

    expect(alice.mealMode).toBe('out')
    expect(alice.cuisines).toContain('Française')
    expect(alice.budget).toBe('15-30')
    expect(alice.prefsComplete).toBe(true)
  })

  it('returns null for a non-existent session', () => {
    const result = updateParticipantPrefs({ code: 'XXXX', participantId: 'uid', prefs: {} })
    expect(result).toBeNull()
  })

  it('preserves other participants when updating one', () => {
    const { session, organizerId } = createSession({ organizerName: 'Alice', type: 'private' })
    const { participantId: bobId } = joinSession({ code: session.code, participantName: 'Bob' })

    updateParticipantPrefs({ code: session.code, participantId: organizerId, prefs: { mealMode: 'out' } })
    const updated = getSession(session.code)
    const bob = updated.participants.find(p => p.id === bobId)

    expect(bob.name).toBe('Bob')
    expect(bob.prefsComplete).toBe(false)
  })
})

describe('setSearching', () => {
  beforeEach(() => { localStorageMock.clear(); uuidCounter = 0 })

  it('sets searchingOut flag', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    setSearching({ code: session.code, mode: 'out', value: true })
    const updated = getSession(session.code)
    expect(updated.searchingOut).toBe(true)
  })

  it('sets searchingTakeout flag', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    setSearching({ code: session.code, mode: 'takeout', value: true })
    const updated = getSession(session.code)
    expect(updated.searchingTakeout).toBe(true)
  })
})

describe('setResults', () => {
  beforeEach(() => { localStorageMock.clear(); uuidCounter = 0 })

  const mockRestaurants = [
    { name: 'Le Bistro', cuisine: 'Française', adresse: '1 rue Gambetta, Saint-Étienne', budget: '15–30€', note: '4.5/5', pourquoi: 'Parfait pour tous' },
    { name: 'Pizza Roma', cuisine: 'Italienne', adresse: '3 rue Émile Zola', budget: '15–30€', note: '4.2/5', pourquoi: 'Bonne ambiance' },
    { name: 'Burger & Co', cuisine: 'Burger', adresse: '5 place du Peuple', budget: '< 15€', note: '4.0/5', pourquoi: 'Rapide et bon' },
  ]

  it('stores restaurant results and marks searchedOut', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    const updated = setResults({ code: session.code, mode: 'out', results: mockRestaurants })

    expect(updated.results.out).toHaveLength(3)
    expect(updated.searchedOut).toBe(true)
    expect(updated.searchingOut).toBe(false)
  })

  it('stores takeout results and marks searchedTakeout', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    const updated = setResults({ code: session.code, mode: 'takeout', results: mockRestaurants })

    expect(updated.results.takeout).toHaveLength(3)
    expect(updated.searchedTakeout).toBe(true)
    expect(updated.searchingTakeout).toBe(false)
  })

  it('allows both out and takeout results independently', () => {
    const { session } = createSession({ organizerName: 'Alice', type: 'private' })
    setResults({ code: session.code, mode: 'out', results: mockRestaurants })
    setResults({ code: session.code, mode: 'takeout', results: mockRestaurants.slice(0, 2) })

    const final = getSession(session.code)
    expect(final.results.out).toHaveLength(3)
    expect(final.results.takeout).toHaveLength(2)
  })
})

describe('getPublicSessions', () => {
  beforeEach(() => { localStorageMock.clear(); uuidCounter = 0 })

  it('returns only public sessions', () => {
    createSession({ organizerName: 'Alice', type: 'public' })
    createSession({ organizerName: 'Bob',   type: 'private' })
    const pub = getPublicSessions()
    expect(pub.every(s => s.type === 'public')).toBe(true)
  })

  it('returns an empty array when no public sessions exist', () => {
    createSession({ organizerName: 'Alice', type: 'private' })
    expect(getPublicSessions()).toHaveLength(0)
  })
})
