import { describe, it, expect } from 'vitest'
import { findTopPickIndex } from '../screens/ResultsScreen.jsx'

describe('findTopPickIndex', () => {
  it('highlights the restaurant matching the most-voted cuisine', () => {
    const group = [{ cuisines: ['Française'] }, { cuisines: ['Française'] }, { cuisines: ['Japonaise'] }]
    const restaurants = [
      { cuisine: 'Japonaise', budget: null },
      { cuisine: 'Française', budget: null },
    ]
    expect(findTopPickIndex(restaurants, group)).toBe(1)
  })

  it('adds a point when the restaurant respects the group\'s most restrictive budget', () => {
    const group = [{ cuisines: ['Française'], budget: '<15' }]
    const restaurants = [
      { cuisine: 'Française', budget: '<15' }, // matches both cuisine and budget: score 2
      { cuisine: 'Burger', budget: '<15' },    // matches budget only: score 1
    ]
    expect(findTopPickIndex(restaurants, group)).toBe(0)
  })

  it('returns -1 when no restaurant matches any criterion', () => {
    const group = [{ cuisines: ['Française'], budget: '<15' }]
    const restaurants = [
      { cuisine: 'Japonaise', budget: '>50' },
      { cuisine: 'Burger', budget: '>50' },
    ]
    expect(findTopPickIndex(restaurants, group)).toBe(-1)
  })

  it('returns -1 on a tie between two equally-scored restaurants', () => {
    const group = [{ cuisines: ['Française'] }]
    const restaurants = [
      { cuisine: 'Française', budget: null },
      { cuisine: 'Française', budget: null },
    ]
    expect(findTopPickIndex(restaurants, group)).toBe(-1)
  })

  it('returns -1 for an empty restaurant list', () => {
    expect(findTopPickIndex([], [{ cuisines: ['Française'] }])).toBe(-1)
  })
})
