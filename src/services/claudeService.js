// Claude API integration — restaurant recommendation engine

const API_URL = 'https://api.anthropic.com/v1/messages'

// Model specified in the CDC — update if needed
const MODEL = 'claude-sonnet-4-20250514'

// Budget order from lowest to highest (for finding the most restrictive)
const BUDGET_ORDER = ['<15', '15-30', '30-50', '>50']

const BUDGET_LABELS_FR = { '<15': '< 15€', '15-30': '15–30€', '30-50': '30–50€', '>50': '+ 50€' }
const BUDGET_LABELS_EN = { '<15': '< €15', '15-30': '€15–30', '30-50': '€30–50', '>50': '€50+' }

/**
 * Builds the prompt sent to Claude.
 * Exported separately so it can be unit-tested without an API call.
 *
 * @param {{ participants: Array, mode: 'out'|'takeout', lang: 'fr'|'en' }}
 * @returns {string}
 */
export function buildPrompt({ participants, mode, lang }) {
  const n = participants.length
  const names = participants.map(p => p.name).join(', ')

  // Count cuisine votes
  const votes = {}
  participants.forEach(p =>
    (p.cuisines || []).forEach(c => { votes[c] = (votes[c] || 0) + 1 })
  )
  const cuisineStr = Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => `${c} (${v})`)
    .join(', ')

  // Collect all allergies (union — each one is imperative)
  const allAllergies = [...new Set(participants.flatMap(p => p.allergies || []))]

  // Find the most restrictive budget
  const budgets = participants.map(p => p.budget).filter(Boolean)
  const minIdx = budgets.length > 0
    ? Math.min(...budgets.map(b => BUDGET_ORDER.indexOf(b)).filter(i => i >= 0))
    : 1
  const budgetKey = BUDGET_ORDER[Math.max(0, minIdx)]

  const isTakeout = mode === 'takeout'

  if (lang === 'fr') {
    const allergyStr = allAllergies.length > 0 ? allAllergies.join(', ') : 'Aucune'
    const budgetStr = BUDGET_LABELS_FR[budgetKey]
    return `Restaurants réels à Saint-Étienne (France) pour ${n} personne${n > 1 ? 's' : ''} aujourd'hui midi.
Participants : ${names}
Envies de cuisines (votes cumulés) : ${cuisineStr || 'Pas de préférence particulière'}
Allergies / contraintes alimentaires : ${allergyStr} ← IMPÉRATIVES, aucun écart toléré
Budget maximum par personne : ${budgetStr}
${isTakeout ? 'Mode : UNIQUEMENT des restaurants proposant la commande à emporter ou la livraison.' : 'Mode : restaurants pour déjeuner sur place.'}

Propose exactement 3 restaurants RÉELS situés à Saint-Étienne qui conviennent à TOUS les participants.
Sois précis sur les adresses (rue + quartier). Le premier doit être ton meilleur choix global.

Réponds UNIQUEMENT avec du JSON valide, sans aucun texte avant ou après le tableau :
[{"name":"...","cuisine":"...","adresse":"...","budget":"...","note":"4.2/5","pourquoi":"..."}]`
  }

  const allergyStr = allAllergies.length > 0 ? allAllergies.join(', ') : 'None'
  const budgetStr = BUDGET_LABELS_EN[budgetKey]
  return `Real restaurants in Saint-Étienne, France for ${n} person${n > 1 ? 's' : ''} for lunch today.
Participants: ${names}
Cuisine preferences (votes): ${cuisineStr || 'No particular preference'}
Allergies / dietary restrictions: ${allergyStr} ← MANDATORY, no exceptions
Maximum budget per person: ${budgetStr}
${isTakeout ? 'Mode: ONLY restaurants offering takeout or delivery.' : 'Mode: restaurants for dining in.'}

Suggest exactly 3 REAL restaurants in Saint-Étienne that work for ALL participants.
Be specific about addresses (street + neighbourhood). The first should be your top overall pick.

Reply ONLY with valid JSON, no text before or after the array:
[{"name":"...","cuisine":"...","adresse":"...","budget":"...","note":"4.2/5","pourquoi":"..."}]`
}

/**
 * Fetches restaurant recommendations from Claude.
 * @param {{ participants: Array, mode: 'out'|'takeout', lang: 'fr'|'en' }}
 * @returns {Promise<Array>} Array of restaurant objects
 */
export async function getRecommendations({ participants, mode, lang }) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (!apiKey) {
    throw new Error('VITE_CLAUDE_API_KEY_MISSING')
  }

  const prompt = buildPrompt({ participants, mode, lang })

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(errBody.error?.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  // Extract JSON array from the response (Claude sometimes wraps in code fences)
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('PARSE_ERROR')

  const restaurants = JSON.parse(match[0])
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    throw new Error('EMPTY_RESULTS')
  }

  return restaurants.slice(0, 3)
}
