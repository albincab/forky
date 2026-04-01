// Session service — Supabase backend (multi-device real-time sync)
import { supabase } from './supabaseClient.js'

// ─── Code generation ──────────────────────────────────────────────────────────

/** Generates a 4-character session code (no ambiguous chars: 0, O, I, 1, l) */
export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─── Data mapping ─────────────────────────────────────────────────────────────

/** Maps a Supabase row + participants array → app session object */
function buildSession(row, participants = []) {
  return {
    code:             row.code,
    type:             row.type,
    organizerName:    row.organizer_name,
    organizerId:      row.organizer_id,
    createdAt:        new Date(row.created_at).getTime(),
    status:           row.status,
    searchingOut:     row.searching_out,
    searchingTakeout: row.searching_takeout,
    searchedOut:      row.searched_out,
    searchedTakeout:  row.searched_takeout,
    results: {
      out:    row.result_out    ?? null,
      takeout: row.result_takeout ?? null,
    },
    participants: participants.map(p => ({
      id:            p.id,
      name:          p.name,
      isOrganizer:   p.is_organizer,
      mealMode:      p.meal_mode   ?? null,
      cuisines:      p.cuisines    ?? [],
      budget:        p.budget      ?? null,
      allergies:     p.allergies   ?? [],
      prefsComplete: p.prefs_complete,
      joinedAt:      new Date(p.joined_at).getTime(),
    })),
  }
}

/** Fetches participants for a session (ordered by join time) */
async function fetchParticipants(code) {
  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('session_code', code)
    .order('joined_at', { ascending: true })
  return data ?? []
}

// ─── Session CRUD ─────────────────────────────────────────────────────────────

/**
 * Creates a new session with a unique 4-char code.
 * @returns {{ session, organizerId }}
 */
export async function createSession({ organizerName, type }) {
  // Find a unique code
  let code
  let isUnique = false
  while (!isUnique) {
    code = generateCode()
    const { data } = await supabase
      .from('sessions')
      .select('code')
      .eq('code', code)
      .maybeSingle()
    isUnique = !data
  }

  const organizerId = crypto.randomUUID()

  const { error: sErr } = await supabase.from('sessions').insert({
    code,
    type,
    organizer_name: organizerName,
    organizer_id:   organizerId,
  })
  if (sErr) throw new Error(sErr.message)

  const { error: pErr } = await supabase.from('participants').insert({
    id:           organizerId,
    session_code: code,
    name:         organizerName,
    is_organizer: true,
  })
  if (pErr) throw new Error(pErr.message)

  const session = await getSession(code)
  return { session, organizerId }
}

/**
 * Retrieves a session by code (case-insensitive).
 * @returns {object|null}
 */
export async function getSession(code) {
  if (!code) return null
  const upper = code.toUpperCase()

  const { data: row, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', upper)
    .maybeSingle()

  if (error || !row) return null

  const participants = await fetchParticipants(upper)
  return buildSession(row, participants)
}

/**
 * Adds a participant to a session.
 * @returns {{ session, participantId } | { error: string }}
 */
export async function joinSession({ code, participantName }) {
  const upper = code.toUpperCase()

  const { data: row } = await supabase
    .from('sessions')
    .select('status')
    .eq('code', upper)
    .maybeSingle()

  if (!row)               return { error: 'SESSION_NOT_FOUND' }
  if (row.status !== 'waiting') return { error: 'SESSION_CLOSED' }

  const participantId = crypto.randomUUID()

  const { error } = await supabase.from('participants').insert({
    id:           participantId,
    session_code: upper,
    name:         participantName,
    is_organizer: false,
  })
  if (error) return { error: error.message }

  const session = await getSession(upper)
  return { session, participantId }
}

/**
 * Updates a participant's preferences and marks them complete.
 */
export async function updateParticipantPrefs({ code, participantId, prefs }) {
  const { error } = await supabase
    .from('participants')
    .update({
      meal_mode:      prefs.mealMode   ?? null,
      cuisines:       prefs.cuisines   ?? [],
      budget:         prefs.budget     ?? null,
      allergies:      prefs.allergies  ?? [],
      prefs_complete: true,
    })
    .eq('id', participantId)
    .eq('session_code', code)

  if (error) throw new Error(error.message)
}

/**
 * Sets the searching flag for a given mode on the session.
 */
export async function setSearching({ code, mode, value }) {
  const col = mode === 'out' ? 'searching_out' : 'searching_takeout'
  await supabase.from('sessions').update({ [col]: value }).eq('code', code)
}

/**
 * Stores AI recommendation results and clears the searching flag.
 */
export async function setResults({ code, mode, results }) {
  const updates = mode === 'out'
    ? { result_out: results,    searching_out:    false, searched_out:    true }
    : { result_takeout: results, searching_takeout: false, searched_takeout: true }

  const { error } = await supabase.from('sessions').update(updates).eq('code', code)
  if (error) throw new Error(error.message)
}

/**
 * Returns all public sessions created today.
 */
export async function getPublicSessions() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: rows } = await supabase
    .from('sessions')
    .select('*, participants(*)')
    .eq('type', 'public')
    .eq('status', 'waiting')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })

  if (!rows) return []

  return rows.map(row => buildSession(row, row.participants ?? []))
}

// ─── Session history (localStorage) ──────────────────────────────────────────

const HISTORY_KEY = 'atable_history'

/** Reads the list of sessions the user has joined, stored locally */
export function getSessionsHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

/** Adds a session to the user's local history (no duplicates, max 30) */
export function addToHistory({ code, participantId, isOrganizer }) {
  const history = getSessionsHistory().filter(h => h.code !== code)
  history.unshift({ code, participantId, isOrganizer, joinedAt: Date.now() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)))
}

/** Removes a session from the local history */
export function removeFromHistory(code) {
  const history = getSessionsHistory().filter(h => h.code !== code)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

// ─── Leave session ────────────────────────────────────────────────────────────

/**
 * Removes a participant from a session.
 * The organizer cannot leave (they must close the session instead).
 */
export async function leaveSession({ code, participantId }) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)
    .eq('session_code', code)
    .eq('is_organizer', false) // safety: organizer cannot be deleted this way

  if (error) throw new Error(error.message)
}

/**
 * Returns the Supabase Realtime channel for a session.
 * Fires `onChange` whenever participants or the session row change.
 */
export function subscribeToSession(code, onChange) {
  const channel = supabase
    .channel(`session-${code}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `session_code=eq.${code}` },
      onChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sessions', filter: `code=eq.${code}` },
      onChange
    )
    .subscribe()

  return channel
}

/** Removes a Realtime channel subscription */
export function unsubscribeFromSession(channel) {
  if (channel) supabase.removeChannel(channel)
}
