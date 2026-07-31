import { describe, it, expect } from 'vitest'
import { filterByCuisine, pickByCuisineQuota } from '../services/claudeService.js'

const pool = [
  { tags: { name: 'Le Petit Gaulois', cuisine: 'french' } },
  { tags: { name: 'Sushi Zen', cuisine: 'japanese' } },
  { tags: { name: 'Le Cèdre', cuisine: 'lebanese' } },
  { tags: { name: 'Burger House', cuisine: 'burger' } },
]

describe('filterByCuisine', () => {
  it('matches restaurants for a single voted cuisine', () => {
    const result = filterByCuisine(pool, ['Française'])
    expect(result.map(r => r.tags.name)).toEqual(['Le Petit Gaulois'])
  })

  it('matches restaurants across every voted cuisine when the group is split, not just the top one', () => {
    // 3 votes Française, 2 votes Japonaise — both should be represented, not just the winner
    const result = filterByCuisine(pool, ['Française', 'Japonaise'])
    expect(result.map(r => r.tags.name).sort()).toEqual(['Le Petit Gaulois', 'Sushi Zen'])
  })

  it('returns an empty array when no cuisine was voted', () => {
    expect(filterByCuisine(pool, [])).toEqual([])
  })
})

describe('pickByCuisineQuota', () => {
  const splitPool = [
    { tags: { name: 'Le Petit Gaulois', cuisine: 'french' } },
    { tags: { name: 'Chez Marcel', cuisine: 'french' } },
    { tags: { name: 'Sushi Zen', cuisine: 'japanese' } },
    { tags: { name: 'Ramen House', cuisine: 'japanese' } },
    { tags: { name: 'Burger House', cuisine: 'burger' } },
  ]

  it('splits picks proportionally when the group is divided (3 votes Française, 2 votes Japonaise → ~2/1)', () => {
    const picked = pickByCuisineQuota(splitPool, { 'Française': 3, 'Japonaise': 2 }, 3)
    const byCuisine = picked.reduce((acc, p) => {
      acc[p.tags.cuisine] = (acc[p.tags.cuisine] || 0) + 1
      return acc
    }, {})
    expect(picked).toHaveLength(3)
    expect(byCuisine.french).toBe(2)
    expect(byCuisine.japanese).toBe(1)
  })

  it('backfills from the rest of the pool when nobody voted for a cuisine', () => {
    const picked = pickByCuisineQuota(splitPool, {}, 3)
    expect(picked).toHaveLength(3)
  })

  it('backfills when a voted cuisine has fewer matches than its quota', () => {
    // Only 1 real Libanaise match available despite a majority vote — the remaining
    // slots should still be filled from the rest of the pool, not left empty.
    const poolWithOneMatch = [
      { tags: { name: 'Le Cèdre', cuisine: 'lebanese' } },
      { tags: { name: 'Burger House', cuisine: 'burger' } },
      { tags: { name: 'Sushi Zen', cuisine: 'japanese' } },
    ]
    const picked = pickByCuisineQuota(poolWithOneMatch, { 'Libanaise': 5 }, 3)
    expect(picked).toHaveLength(3)
  })
})
