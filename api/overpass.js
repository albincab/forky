// Vercel serverless function — proxies Overpass API requests server-side.
// Browser-to-Overpass calls are subject to CORS and to the public mirrors'
// habit of dropping CORS headers on non-200 responses (rate-limit/timeout),
// which surfaces as an opaque "CORS policy" error with no useful status code.
// Server-to-server calls aren't subject to CORS at all, so this proxy makes
// the mirror fallback reliable and gives the browser a same-origin response.

// overpass-api.de first: the only mirror that reliably accepts our requests
// (openstreetmap.fr returns 403 "white-listed usages only", kumi.systems is
// currently unreachable) — kept as fallbacks in case they recover.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
// Overpass' usage policy requires a descriptive User-Agent; requests without
// one are rejected (406/429) by all three mirrors.
const USER_AGENT = 'ATable/1.0 (+https://forky-seven.vercel.app; contact: albincab@gmail.com)'
// Kept low: 3 mirrors tried sequentially worst-case must stay under Vercel's
// default 10s serverless function duration limit (3 × 3s = 9s).
const OVERPASS_TIMEOUT_MS = 3000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { query } = req.body || {}
  if (!query) {
    res.status(400).json({ error: 'Missing query' })
    return
  }

  let lastError
  for (const url of OVERPASS_ENDPOINTS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      res.status(200).json(data)
      return
    } catch (err) {
      const reason = err.name === 'AbortError' ? `timeout after ${OVERPASS_TIMEOUT_MS}ms` : err.message
      console.warn(`Overpass ${url} failed:`, reason)
      lastError = err
    } finally {
      clearTimeout(timer)
    }
  }

  res.status(502).json({ error: lastError?.message || 'All Overpass mirrors failed' })
}
