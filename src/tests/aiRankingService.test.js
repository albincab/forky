import { describe, it, expect, afterEach, vi } from 'vitest'
import { buildAIPrompt, getGroqPicks, getGeminiPicks, getAIPicks } from '../services/aiRankingService.js'

// None of these tests ever call a real AI provider — fetch is always mocked below.

const candidates = [
  { tags: { name: 'Le Petit Gaulois', cuisine: 'french' }, lat: 45.4, lon: 4.4 },
  { tags: { name: 'Sushi Zen', cuisine: 'japanese' }, lat: 45.41, lon: 4.41 },
]

describe('buildAIPrompt', () => {
  it('lists every candidate by exact name', () => {
    const prompt = buildAIPrompt(candidates, [], [])
    expect(prompt).toContain('Le Petit Gaulois')
    expect(prompt).toContain('Sushi Zen')
  })

  it('includes the group\'s most restrictive budget', () => {
    const participants = [{ budget: '30-50' }, { budget: '<15' }, { budget: '15-30' }]
    const prompt = buildAIPrompt(candidates, participants, [])
    expect(prompt).toContain('<15')
  })

  it('includes the union of allergies without duplicates', () => {
    const participants = [
      { allergies: ['Gluten', 'Lactose'] },
      { allergies: ['Gluten'] },
    ]
    const prompt = buildAIPrompt(candidates, participants, [])
    const glutenMatches = prompt.match(/Gluten/g) || []
    expect(glutenMatches.length).toBe(1)
    expect(prompt).toContain('Lactose')
  })

  it('reports no allergy restriction when none are declared', () => {
    const prompt = buildAIPrompt(candidates, [{ allergies: [] }], [])
    expect(prompt).toContain('aucune')
  })

  it('instructs the model to only pick from the given list', () => {
    const prompt = buildAIPrompt(candidates, [], [])
    expect(prompt).toMatch(/UNIQUEMENT/)
  })
})

const threeCandidates = [
  ...candidates,
  { tags: { name: 'Burger House', cuisine: 'burger' }, lat: 45.42, lon: 4.42 },
]
const validPicks = [
  { name: 'Le Petit Gaulois', budget: '<15', pourquoi: 'Pas cher et français' },
  { name: 'Sushi Zen', budget: '15-30', pourquoi: 'Sushi frais' },
  { name: 'Burger House', budget: '<15', pourquoi: 'Rapide et bon' },
]

describe('getGroqPicks (active provider)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns null when no API key is configured (no network call)', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', '')
    global.fetch = vi.fn()
    const result = await getGroqPicks(candidates, [], [])
    expect(result).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('maps valid picks back to matching candidates, ignoring hallucinated names', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'test-key')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({
          picks: [
            { name: 'Le Petit Gaulois', budget: '<15', pourquoi: 'Pas cher et français' },
            { name: 'Restaurant Inventé', budget: '<15', pourquoi: 'hallucination' },
            { name: 'Sushi Zen', budget: '15-30', pourquoi: 'Sushi frais' },
          ],
        }) } }],
      }),
    })
    // Only 2 of 3 picks match real candidates — should fall back to null (< 3 valid matches)
    const result = await getGroqPicks(candidates, [], [])
    expect(result).toBeNull()
  })

  it('returns mapped picks when all 3 names match real candidates', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'test-key')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({ picks: validPicks }) } }] }),
    })
    const result = await getGroqPicks(threeCandidates, [], [])
    expect(result).toHaveLength(3)
    expect(result[0].restaurant.tags.name).toBe('Le Petit Gaulois')
    expect(result[0].budget).toBe('<15')
    expect(result[0].pourquoi).toBe('Pas cher et français')
  })

  it('returns null when the API responds with an error (e.g. rate limit)', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'test-key')
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    const result = await getGroqPicks(candidates, [], [])
    expect(result).toBeNull()
  })
})

describe('getGeminiPicks (dormant — kept working for reactivation)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns null when no API key is configured (no network call)', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')
    global.fetch = vi.fn()
    const result = await getGeminiPicks(candidates, [], [])
    expect(result).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns mapped picks when all 3 names match real candidates', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ picks: validPicks }) }] } }],
      }),
    })
    const result = await getGeminiPicks(threeCandidates, [], [])
    expect(result).toHaveLength(3)
    expect(result[0].restaurant.tags.name).toBe('Le Petit Gaulois')
  })

  it('returns null when the API responds with an error (e.g. quota exceeded)', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    const result = await getGeminiPicks(candidates, [], [])
    expect(result).toBeNull()
  })
})

describe('getAIPicks (entry point)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('delegates to the active provider (Groq)', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'test-key')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({ picks: validPicks }) } }] }),
    })
    const result = await getAIPicks(threeCandidates, [], [])
    expect(result).toHaveLength(3)
  })
})
