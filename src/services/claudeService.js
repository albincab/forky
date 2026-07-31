// Restaurant search via OpenStreetMap Overpass API — free, no API key required
// Requests go through /api/overpass.js (Vercel serverless proxy): calling the
// Overpass mirrors directly from the browser is unreliable because they drop
// CORS headers on non-200 responses (rate-limit/timeout), which the browser
// then reports as an opaque CORS error. A server-side proxy sidesteps CORS
// entirely and keeps the multi-mirror fallback working.
//
// Even proxied, Overpass is a free, best-effort, rate-limited public API with
// no SLA — calling it live on every search is inherently unreliable. Results
// are cached in Supabase per ~5km area (`restaurants_cache`) so a search only
// needs Overpass to be up the first time a given area is searched; every
// later search in that area reads the cache and never depends on Overpass.
import { supabase } from './supabaseClient.js'

// Fallback: Rue Édouard Martel, Saint-Étienne (42100)
const FALLBACK_LOCATION = { lat: 45.4165, lon: 4.3808 }
const SEARCH_RADIUS = 5000 // metres — wide, since the pool is cached rather than re-fetched per search

const OVERPASS_PROXY_TIMEOUT_MS = 12000
const RECOMMENDATIONS_TIMEOUT_MS = 30000
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days — restaurants near an office barely change

// Optional AI ranking (budget + allergies) via Gemini Flash — free tier, no credit card required.
// Silently skipped if VITE_GEMINI_API_KEY is unset, and silently falls back to the algorithmic
// selection below on any error (quota exceeded, timeout, network) — never surfaced to the user.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const GEMINI_TIMEOUT_MS = 8000
const GEMINI_CANDIDATE_LIMIT = 30
const BUDGET_ORDER = ['<15', '15-30', '30-50', '>50']

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
  'Orientale':    'middle_eastern|turkish',
}

const OSM_CUISINE_TO_LABEL = {
  french: 'Française', brasserie: 'Brasserie', regional: 'Régionale',
  traditional: 'Traditionnelle', italian: 'Italienne', pizza: 'Pizza',
  japanese: 'Japonaise', sushi: 'Japonaise', ramen: 'Japonaise',
  burger: 'Burger', american: 'Américaine',
  asian: 'Asiatique', chinese: 'Chinoise', thai: 'Thaïlandaise',
  vietnamese: 'Vietnamienne', korean: 'Coréenne',
  vegetarian: 'Végétarienne', vegan: 'Végétalienne',
  lebanese: 'Libanaise', middle_eastern: 'Orientale', turkish: 'Orientale',
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

function buildPhone(tags) {
  return tags.phone || tags['contact:phone'] || null
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

function buildQuery(location) {
  const { lat, lon } = location
  return `[out:json][timeout:25];
(
  node["amenity"="restaurant"](around:${SEARCH_RADIUS},${lat},${lon});
  way["amenity"="restaurant"](around:${SEARCH_RADIUS},${lat},${lon});
);
out body center;`
}

/** Rounds a location to a ~5km grid cell used as the cache key */
function toBucket({ lat, lon }) {
  return { lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10 }
}

async function getCachedPool(bucket) {
  const { data } = await supabase
    .from('restaurants_cache')
    .select('restaurants, fetched_at')
    .eq('lat_bucket', bucket.lat)
    .eq('lon_bucket', bucket.lon)
    .maybeSingle()
  return data
}

async function saveCachedPool(bucket, restaurants) {
  await supabase.from('restaurants_cache').upsert({
    lat_bucket: bucket.lat,
    lon_bucket: bucket.lon,
    restaurants,
    fetched_at: new Date().toISOString(),
  })
}

function filterByMode(pool, mode) {
  if (mode !== 'takeout') return pool
  return pool.filter(p => /yes|only/i.test(p.tags.takeaway || ''))
}

function filterByCuisine(pool, topCuisines) {
  const pattern = topCuisines.length > 0 ? CUISINE_OSM_TAGS[topCuisines[0]] : null
  if (!pattern) return []
  const regex = new RegExp(pattern, 'i')
  return pool.filter(p => p.tags.cuisine && regex.test(p.tags.cuisine))
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
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OVERPASS_PROXY_TIMEOUT_MS)
  try {
    const response = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${response.status}`)
    }
    const data = await response.json()
    return (data.elements || [])
      .filter(el => el.tags?.name)
      .map(el => ({ tags: el.tags, lat: el.center?.lat ?? el.lat, lon: el.center?.lon ?? el.lon }))
  } finally {
    clearTimeout(timer)
  }
}

// Prefer entries with more OSM tags (richer data = more active listing)
function scoreElement({ tags }) {
  return Object.keys(tags).length
}

function getMostRestrictiveBudget(participants) {
  const budgets = participants.map(p => p.budget).filter(Boolean)
  if (budgets.length === 0) return null
  const minIdx = Math.min(...budgets.map(b => BUDGET_ORDER.indexOf(b)).filter(i => i >= 0))
  return BUDGET_ORDER[Math.max(0, minIdx)]
}

function getAllergies(participants) {
  return [...new Set(participants.flatMap(p => p.allergies || []))]
}

/** Builds the Gemini prompt asking it to pick 3 restaurants from a fixed candidate list. */
export function buildGeminiPrompt(candidates, participants, topCuisines) {
  const budget    = getMostRestrictiveBudget(participants)
  const allergies = getAllergies(participants)

  const list = candidates
    .map((c, i) => `${i + 1}. ${c.tags.name} — cuisine: ${c.tags.cuisine || 'non renseignée'}`)
    .join('\n')

  return `Tu aides un groupe de collègues à choisir un restaurant pour déjeuner.
Budget maximum du groupe : ${budget || 'non précisé'}.
Allergies/régimes à respecter impérativement : ${allergies.length > 0 ? allergies.join(', ') : 'aucune'}.
Cuisines préférées du groupe : ${topCuisines.length > 0 ? topCuisines.join(', ') : 'aucune préférence'}.

Voici la liste des restaurants disponibles (choisis UNIQUEMENT parmi cette liste, n'invente jamais un nom qui n'y figure pas) :
${list}

Choisis les 3 meilleurs restaurants de cette liste pour ce groupe, en tenant compte du budget et des allergies.
Réponds uniquement en JSON avec cette forme exacte, sans texte autour :
{"picks": [{"name": "nom exact copié depuis la liste", "budget": "<15|15-30|30-50|>50", "pourquoi": "courte explication en français"}]}`
}

/**
 * Asks Gemini to pick 3 restaurants from `pool` accounting for budget and allergies.
 * Returns null (never throws) if the API key is missing, the request fails/times out,
 * or Gemini's picks don't match real names in `pool` — callers fall back to the
 * algorithmic selection in that case.
 */
export async function getGeminiPicks(pool, participants, topCuisines) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return null

  const candidates = [...pool]
    .sort((a, b) => scoreElement(b) - scoreElement(a))
    .slice(0, GEMINI_CANDIDATE_LIMIT)
  if (candidates.length === 0) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)
  let data
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildGeminiPrompt(candidates, participants, topCuisines) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      // Free tier, best-effort: a 429 (quota exceeded) is an expected outcome, not a bug
      console.warn(`Gemini unavailable (HTTP ${response.status}), falling back to standard selection`)
      return null
    }
    data = await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return null

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (!Array.isArray(parsed?.picks)) return null

  const matched = parsed.picks
    .map(pick => {
      const restaurant = candidates.find(c => c.tags.name === pick.name)
      return restaurant ? { restaurant, budget: pick.budget || null, pourquoi: pick.pourquoi || '' } : null
    })
    .filter(Boolean)
    .slice(0, 3)

  if (matched.length < 3) return null

  return matched.map(({ restaurant, budget, pourquoi }) => ({
    name:      restaurant.tags.name,
    cuisine:   getCuisineLabel(restaurant.tags.cuisine),
    adresse:   buildAddress(restaurant.tags),
    telephone: buildPhone(restaurant.tags),
    budget,
    note:      null,
    pourquoi,
    lat:       restaurant.lat,
    lon:       restaurant.lon,
    aiPicked:  true,
  }))
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
  const location     = await getLocation()
  const bucket        = toBucket(location)

  const cached  = await getCachedPool(bucket)
  const isFresh = !!cached && (Date.now() - new Date(cached.fetched_at).getTime()) < CACHE_TTL_MS

  let pool
  if (isFresh) {
    pool = cached.restaurants
  } else {
    try {
      pool = await queryOverpass(buildQuery(location))
      await saveCachedPool(bucket, pool)
    } catch (err) {
      // Overpass is a free, best-effort API — prefer a stale cache over a hard failure
      if (cached) pool = cached.restaurants
      else throw err
    }
  }

  const modeFiltered = filterByMode(pool, mode)

  const geminiPicks = await getGeminiPicks(modeFiltered, participants, topCuisines)
  if (geminiPicks) return geminiPicks

  // Prefer the group's top cuisine, fall back to the full (mode-filtered) pool
  const cuisineMatched = filterByCuisine(modeFiltered, topCuisines)
  const places = cuisineMatched.length >= 3 ? cuisineMatched : modeFiltered.length >= 3 ? modeFiltered : pool

  if (places.length === 0) throw new Error('EMPTY_RESULTS')

  // Sort by richness of OSM data, then pick 3 with slight shuffle for variety
  places.sort((a, b) => scoreElement(b) - scoreElement(a))
  const top = places.slice(0, Math.min(10, places.length))
  const picked = top.sort(() => Math.random() - 0.5).slice(0, 3)

  return picked.map(({ tags, lat, lon }) => ({
    name:      tags.name,
    cuisine:   getCuisineLabel(tags.cuisine),
    adresse:   buildAddress(tags),
    telephone: buildPhone(tags),
    budget:    null,
    note:      null,
    pourquoi:  buildWhy(tags, topCuisines),
    lat,
    lon,
  }))
}
