import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  submitFeedback,
  listFeedback,
  voteFeedback,
  hasVoted,
} from '../services/feedbackService.js'

// ─── In-memory feedback table ───────────────────────────────────────────────
let db = []
let idCounter = 0

function matchFilters(row, filters) {
  return Object.entries(filters).every(([k, v]) => row[k] === v)
}

function makeQuery() {
  let _operation   = null
  let _filters     = {}
  let _insertRows  = null
  let _updateData  = null

  const q = {
    select: () => { _operation = 'select'; return q },
    insert: data => { _operation = 'insert'; _insertRows = Array.isArray(data) ? data : [data]; return q },
    update: data => { _operation = 'update'; _updateData = data; return q },
    eq:     (col, val) => { _filters[col] = val; return q },
    maybeSingle: () => {
      const rows = db.filter(r => matchFilters(r, _filters))
      return Promise.resolve({ data: rows[0] ?? null, error: null })
    },
    then: resolve => {
      const result = { data: null, error: null }
      if (_operation === 'insert') {
        const rows = _insertRows.map(r => ({
          id:          `feedback-${++idCounter}`,
          status:      'idea',
          votes:       0,
          author_name: null,
          created_at:  new Date().toISOString(),
          ...r,
        }))
        db.push(...rows)
        result.data = rows
      } else if (_operation === 'update') {
        db = db.map(r => (matchFilters(r, _filters) ? { ...r, ..._updateData } : r))
      } else {
        result.data = db.filter(r => matchFilters(r, _filters))
      }
      resolve(result)
      return { catch: () => {} }
    },
  }
  return q
}

vi.mock('../services/supabaseClient.js', () => ({
  supabase: { from: () => makeQuery() },
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

function resetDb() {
  db = []
  idCounter = 0
  localStorageMock.clear()
}

// ─── submitFeedback ─────────────────────────────────────────────────────────
describe('submitFeedback', () => {
  beforeEach(resetDb)

  it('inserts a new feedback entry', async () => {
    const result = await submitFeedback({ type: 'bug', message: 'Le bouton casse', authorName: 'Alice' })
    expect(result.error).toBeUndefined()
    expect(db).toHaveLength(1)
    expect(db[0].type).toBe('bug')
    expect(db[0].message).toBe('Le bouton casse')
    expect(db[0].author_name).toBe('Alice')
  })

  it('rejects a near-duplicate message sent within 5 minutes', async () => {
    await submitFeedback({ type: 'idea', message: 'Ajouter un mode sombre' })
    const result = await submitFeedback({ type: 'idea', message: '  Ajouter un mode sombre  ' })
    expect(result.error).toBe('DUPLICATE')
    expect(db).toHaveLength(1)
  })

  it('is case/whitespace insensitive for duplicate detection', async () => {
    await submitFeedback({ type: 'idea', message: 'Mode Sombre' })
    const result = await submitFeedback({ type: 'idea', message: 'mode sombre' })
    expect(result.error).toBe('DUPLICATE')
  })

  it('allows a genuinely different message through', async () => {
    await submitFeedback({ type: 'idea', message: 'Premiere idee' })
    const result = await submitFeedback({ type: 'idea', message: 'Deuxieme idee' })
    expect(result.error).toBeUndefined()
    expect(db).toHaveLength(2)
  })
})

// ─── listFeedback ───────────────────────────────────────────────────────────
describe('listFeedback', () => {
  beforeEach(resetDb)

  it('sorts by status (idea → planned → in_progress → shipped) then votes descending', async () => {
    db.push(
      { id: 'a', type: 'idea', message: 'A', status: 'shipped', votes: 5, author_name: null, created_at: new Date().toISOString() },
      { id: 'b', type: 'bug',  message: 'B', status: 'idea',    votes: 1, author_name: null, created_at: new Date().toISOString() },
      { id: 'c', type: 'idea', message: 'C', status: 'idea',    votes: 9, author_name: null, created_at: new Date().toISOString() },
      { id: 'd', type: 'bug',  message: 'D', status: 'planned', votes: 3, author_name: null, created_at: new Date().toISOString() },
    )
    const result = await listFeedback()
    expect(result.map(f => f.id)).toEqual(['c', 'b', 'd', 'a'])
  })

  it('returns an empty array when there is nothing', async () => {
    expect(await listFeedback()).toEqual([])
  })
})

// ─── voteFeedback / hasVoted ────────────────────────────────────────────────
describe('voteFeedback', () => {
  beforeEach(resetDb)

  it('increments votes and remembers the vote locally', async () => {
    db.push({ id: 'x', type: 'idea', message: 'X', status: 'idea', votes: 2, author_name: null, created_at: new Date().toISOString() })
    expect(hasVoted('x')).toBe(false)

    const result = await voteFeedback('x')
    expect(result.error).toBeUndefined()
    expect(db.find(r => r.id === 'x').votes).toBe(3)
    expect(hasVoted('x')).toBe(true)
  })

  it('prevents a second vote from the same browser', async () => {
    db.push({ id: 'y', type: 'idea', message: 'Y', status: 'idea', votes: 0, author_name: null, created_at: new Date().toISOString() })
    await voteFeedback('y')
    const result = await voteFeedback('y')
    expect(result.error).toBe('ALREADY_VOTED')
    expect(db.find(r => r.id === 'y').votes).toBe(1)
  })
})
