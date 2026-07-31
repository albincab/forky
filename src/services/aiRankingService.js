// Optional AI ranking (budget + allergies) applied to the OSM restaurant pool — free tier,
// no credit card. Provider-specific calls are isolated here so the active provider can be
// swapped in one place (see getAIPicks at the bottom) without touching claudeService.js.
//
// Every getXPicks() is silent on failure — returns null (never throws) if the API key is
// missing, the request fails/times out, or the picks don't match real candidate names.
// Callers fall back to the algorithmic selection in that case.

const BUDGET_ORDER = ['<15', '15-30', '30-50', '>50']
const CANDIDATE_LIMIT = 30
const AI_TIMEOUT_MS = 8000

// Prefer entries with more OSM tags (richer data = more active listing)
function scoreCandidate({ tags }) {
  return Object.keys(tags).length
}

function pickCandidates(pool) {
  return [...pool].sort((a, b) => scoreCandidate(b) - scoreCandidate(a)).slice(0, CANDIDATE_LIMIT)
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

/** Builds the prompt asking the AI to pick 3 restaurants from a fixed candidate list. Provider-agnostic. */
export function buildAIPrompt(candidates, participants, topCuisines) {
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

/** Matches the AI's picks back to real candidates by exact name — drops any hallucinated name. */
function matchPicks(picks, candidates) {
  if (!Array.isArray(picks)) return null
  const matched = picks
    .map(pick => {
      const restaurant = candidates.find(c => c.tags.name === pick.name)
      return restaurant ? { restaurant, budget: pick.budget || null, pourquoi: pick.pourquoi || '' } : null
    })
    .filter(Boolean)
    .slice(0, 3)
  return matched.length === 3 ? matched : null
}

// ─── Gemini Flash — dormant ─────────────────────────────────────────────────────
// Google's ToS require "Paid Services" for any app serving EEA/UK/Switzerland users —
// the free API tier returns 429 (limit: 0) for every request from France, regardless
// of the API key or project used. Kept working and ready to reactivate in getAIPicks
// below if that restriction is ever lifted or a paid plan is set up.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function getGeminiPicks(pool, participants, topCuisines) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return null

  const candidates = pickCandidates(pool)
  if (candidates.length === 0) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  let data
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildAIPrompt(candidates, participants, topCuisines) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
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
  return matchPicks(parsed?.picks, candidates)
}

// ─── Groq (Llama 3.3 70B) — active provider ─────────────────────────────────────
// Free tier, no credit card, no EEA restriction like Gemini's.
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function getGroqPicks(pool, participants, topCuisines) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) return null

  const candidates = pickCandidates(pool)
  if (candidates.length === 0) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  let data
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: buildAIPrompt(candidates, participants, topCuisines) }],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      console.warn(`Groq unavailable (HTTP ${response.status}), falling back to standard selection`)
      return null
    }
    data = await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }

  const text = data?.choices?.[0]?.message?.content
  if (!text) return null

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  return matchPicks(parsed?.picks, candidates)
}

/**
 * Active entry point used by claudeService.js. Swap the returned call to reactivate
 * Gemini instead of Groq — everything else (prompt, matching, fallback) is shared.
 */
export function getAIPicks(pool, participants, topCuisines) {
  return getGroqPicks(pool, participants, topCuisines)
  // return getGeminiPicks(pool, participants, topCuisines)
}
