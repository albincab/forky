// Restaurant search via OpenStreetMap Overpass API — free, no API key required

// kumi.systems is the primary mirror — overpass-api.de used as fallback
const OVERPASS_ENDPOINTS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
// Fallback: Rue Édouard Martel, Saint-Étienne (42100)
const FALLBACK_LOCATION = { lat: 45.4165, lon: 4.3808 }
const SEARCH_RADIUS = 1500 // metres

const OVERPASS_TIMEOUT_MS = 8000
const RECOMMENDATIONS_TIMEOUT_MS = 20000

// Map French cuisine names to OSM cuisine tag values (regex-compatible)
const CUISINE_OSM_TAGS = {
  'Française':    'french|brasserie|regional|traditional',
  'Italienne':    'italian',
  'Japonaise':    'japanese|sushi|ramen',
  'Pizza':        'pizza',
  'Burger':       'burger|american',
  'Asiatique':    'asian|chinese|thai|vietnamese|korean',
  'Végétarienne': 'vegetarian|vegan',
  'Brasserie':    'brasserie|french|regional|traditional',
  'Libanaise':    'lebanese|middle_eastern',
  'Mexicaine':    'mexican',
}

const OSM_CUISINE_TO_LABEL = {
  french: 'Française', brasserie: 'Brasserie', regional: 'Régionale',
  traditional: 'Traditionnelle', italian: 'Italienne', pizza: 'Pizza',
  japanese: 'Japonaise', sushi: 'Japonaise', ramen: 'Japonaise',
  burger: 'Burger', american: 'Américaine',
  asian: 'Asiatique', chinese: 'Chinoise', thai: 'Thaïlandaise',
  vietnamese: 'Vietnamienne', korean: 'Coréenne',
  vegetarian: 'Végétarienne', vegan: 'Végétalienne',
  lebanese: 'Libanaise', middle_eastern: 'Orientale',
  mexican: 'Mexicaine',
}

function getTopCuisines(participants) {
  const votes = {}
  participants.forEach(p => (p.cuisines || []).forEach(c => { votes[c] = (votes[c] || 0) + 1 }))
  return Object.entries(votes).sort((a, b) => b[1] - a[1]).map(([c]) => c)
}

function buildAddress(tags) {
  const num    = tags['addr:housenumber'] || ''
  const street = tags['addr:street'] || ''
  const area   = tags['addr:quarter'] || tags['addr:suburb'] || ''
  const line1  = num && street ? `${num} ${street}` : street
  return [line1, area].filter(Boolean).join(', ')
}

function getCuisineLabel(osmCuisine) {
  if (!osmCuisine) return 'Restaurant'
  const first = osmCuisine.split(/[;,]/)[0].trim().toLowerCase()
  return OSM_CUISINE_TO_LABEL[first] || osmCuisine.split(/[;,]/)[0].trim()
}

function buildWhy(tags, topCuisines) {
  const parts = []
  if (topCuisines.length > 0 && tags.cuisine) {
    const osmTag = tags.cuisine.toLowerCase()
    const matched = topCuisines.some(c => {
      const pattern = CUISINE_OSM_TAGS[c] || ''
      return pattern.split('|').some(t => osmTag.includes(t))
    })
    if (matched) parts.push('Correspond aux envies du groupe')
  }
  if (tags.opening_hours) parts.push('Horaires renseignés')
  if (tags.website || tags.contact?.website) parts.push('Site web disponible')
  return parts.join(' · ') || 'Sélectionné parmi les restaurants du quartier'
}

function buildQuery(cuisineTags, mode, location) {
  const cuisineFilter = cuisineTags ? `["cuisine"~"${cuisineTags}",i]` : ''
  const takeoutFilter = mode === 'takeout' ? '["takeaway"~"yes|only"]' : ''
  const { lat, lon } = location
  return `[out:json][timeout:25];
(
  node["amenity"="restaurant"]${cuisineFilter}${takeoutFilter}(around:${SEARCH_RADIUS},${lat},${lon});
  way["amenity"="restaurant"]${cuisineFilter}${takeoutFilter}(around:${SEARCH_RADIUS},${lat},${lon});
);
out body center;`
}

/** Requests browser geolocation — resolves to {lat,lon} or fallback coords */
function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(FALLBACK_LOCATION)
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      ()  => resolve(FALLBACK_LOCATION),
      { timeout: 5000, maximumAge: 60000 }
    )
  })
}

async function queryOverpass(query) {
  let lastError
  for (const url of OVERPASS_ENDPOINTS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return (data.elements || [])
        .filter(el => el.tags?.name)
        .map(el => ({ tags: el.tags, lat: el.center?.lat ?? el.lat, lon: el.center?.lon ?? el.lon }))
    } catch (err) {
      const reason = err.name === 'AbortError' ? `timeout after ${OVERPASS_TIMEOUT_MS}ms` : err.message
      console.warn(`Overpass ${url} failed:`, reason)
      lastError = err
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}

// Prefer entries with more OSM tags (richer data = more active listing)
function scoreElement({ tags }) {
  return Object.keys(tags).length
}

/**
 * Returns up to 3 real restaurants from OpenStreetMap for the given participants and mode.
 * Tries to match the group's top cuisine first, falls back to any restaurant nearby.
 * No API key required — completely free.
 *
 * @param {{ participants: Array, mode: 'out'|'takeout' }}
 * @returns {Promise<Array>}
 */
export async function getRecommendations(params) {
  return Promise.race([
    getRecommendationsInner(params),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('RECOMMENDATIONS_TIMEOUT')), RECOMMENDATIONS_TIMEOUT_MS)
    ),
  ])
}

async function getRecommendationsInner({ participants, mode }) {
  const topCuisines = getTopCuisines(participants)
  const location    = await getLocation()

  let places = []

  // 1. Try with cuisine filter for top voted preference
  if (topCuisines.length > 0) {
    const tags = CUISINE_OSM_TAGS[topCuisines[0]]
    places = await queryOverpass(buildQuery(tags, mode, location))
  }

  // 2. Fall back: no cuisine filter (keep mode filter)
  if (places.length < 3) {
    const broader = await queryOverpass(buildQuery(null, mode, location))
    const seen = new Set(places.map(p => p.tags.name))
    places = [...places, ...broader.filter(p => !seen.has(p.tags.name))]
  }

  // 3. Fall back: no cuisine, no mode filter
  if (places.length < 3) {
    const all = await queryOverpass(buildQuery(null, null, location))
    const seen = new Set(places.map(p => p.tags.name))
    places = [...places, ...all.filter(p => !seen.has(p.tags.name))]
  }

  if (places.length === 0) throw new Error('EMPTY_RESULTS')

  // Sort by richness of OSM data, then pick 3 with slight shuffle for variety
  places.sort((a, b) => scoreElement(b) - scoreElement(a))
  const top = places.slice(0, Math.min(10, places.length))
  const picked = top.sort(() => Math.random() - 0.5).slice(0, 3)

  return picked.map(({ tags, lat, lon }) => ({
    name:     tags.name,
    cuisine:  getCuisineLabel(tags.cuisine),
    adresse:  buildAddress(tags),
    budget:   null,
    note:     null,
    pourquoi: buildWhy(tags, topCuisines),
    lat,
    lon,
  }))
}
