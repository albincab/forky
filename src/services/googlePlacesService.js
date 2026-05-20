// Google Places API (New) — alternative to Overpass/OSM
// Requires VITE_GOOGLE_PLACES_KEY in .env (Google Cloud Console, billing account needed)
//
// To activate: in WaitingRoomScreen.jsx replace
//   import { getRecommendations } from '../services/claudeService.js'
// with:
//   import { getRecommendations } from '../services/googlePlacesService.js'

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText'

const SAINT_ETIENNE = { latitude: 45.4397, longitude: 4.3872 }
const SEARCH_RADIUS_METERS = 2500

const BUDGET_ORDER = ['<15', '15-30', '30-50', '>50']

const BUDGET_TO_PRICE_LEVELS = {
  '<15':   ['PRICE_LEVEL_INEXPENSIVE'],
  '15-30': ['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE'],
  '30-50': ['PRICE_LEVEL_MODERATE', 'PRICE_LEVEL_EXPENSIVE'],
  '>50':   ['PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'],
}

const PRICE_LEVEL_LABELS = {
  PRICE_LEVEL_FREE:           '< 5€',
  PRICE_LEVEL_INEXPENSIVE:    '< 15€',
  PRICE_LEVEL_MODERATE:       '15–30€',
  PRICE_LEVEL_EXPENSIVE:      '30–50€',
  PRICE_LEVEL_VERY_EXPENSIVE: '> 50€',
}

const CUISINE_KEYWORDS = {
  'Française':    'cuisine française',
  'Italienne':    'restaurant italien',
  'Japonaise':    'restaurant japonais sushi',
  'Pizza':        'pizzeria',
  'Burger':       'burger',
  'Asiatique':    'restaurant asiatique',
  'Végétarienne': 'restaurant végétarien',
  'Brasserie':    'brasserie bistrot',
  'Libanaise':    'restaurant libanais',
  'Mexicaine':    'restaurant mexicain',
}

const FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.priceLevel',
  'places.primaryTypeDisplayName',
  'places.editorialSummary',
].join(',')

function getMostRestrictiveBudget(participants) {
  const budgets = participants.map(p => p.budget).filter(Boolean)
  if (budgets.length === 0) return '15-30'
  const minIdx = Math.min(...budgets.map(b => BUDGET_ORDER.indexOf(b)).filter(i => i >= 0))
  return BUDGET_ORDER[Math.max(0, minIdx)]
}

function getTopCuisines(participants) {
  const votes = {}
  participants.forEach(p => (p.cuisines || []).forEach(c => { votes[c] = (votes[c] || 0) + 1 }))
  return Object.entries(votes).sort((a, b) => b[1] - a[1]).map(([c]) => c)
}

function buildWhy(place, topCuisines) {
  if (place.editorialSummary?.text) return place.editorialSummary.text
  const parts = []
  if (place.rating >= 4.5) parts.push('Très bien noté')
  else if (place.rating >= 4.0) parts.push('Bien noté dans le quartier')
  if (topCuisines.length > 0) parts.push('Correspond aux envies du groupe')
  return parts.join(' · ') || 'Sélectionné pour ce midi à Saint-Étienne'
}

async function searchPlaces(apiKey, textQuery, priceLevels) {
  const body = {
    textQuery,
    includedType: 'restaurant',
    locationBias: {
      circle: { center: SAINT_ETIENNE, radius: SEARCH_RADIUS_METERS },
    },
    maxResultCount: 5,
  }
  if (priceLevels) body.priceLevels = priceLevels

  const response = await fetch(PLACES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.places || []
}

export async function getRecommendations({ participants, mode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_KEY_MISSING')

  const topCuisines = getTopCuisines(participants)
  const budgetKey   = getMostRestrictiveBudget(participants)
  const priceLevels = BUDGET_TO_PRICE_LEVELS[budgetKey]

  const cuisineKw = topCuisines.length > 0
    ? (CUISINE_KEYWORDS[topCuisines[0]] || topCuisines[0])
    : 'restaurant'
  const modeKw    = mode === 'takeout' ? 'livraison à emporter' : 'déjeuner midi'
  const textQuery = `${cuisineKw} ${modeKw} Saint-Étienne`

  // Try with price filter, fall back to no filter if empty
  let places = await searchPlaces(apiKey, textQuery, priceLevels)
  if (places.length === 0) places = await searchPlaces(apiKey, textQuery, null)
  if (places.length === 0) throw new Error('EMPTY_RESULTS')

  return places.slice(0, 3).map(p => ({
    name:     p.displayName?.text || 'Restaurant',
    cuisine:  p.primaryTypeDisplayName?.text || topCuisines[0] || 'Restaurant',
    adresse:  p.formattedAddress || '',
    budget:   PRICE_LEVEL_LABELS[p.priceLevel] || '',
    note:     p.rating ? `${p.rating}/5` : null,
    pourquoi: buildWhy(p, topCuisines),
  }))
}
