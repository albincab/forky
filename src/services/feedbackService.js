// Feedback service — Supabase-backed bug reports / ideas, no auth
import { supabase } from './supabaseClient.js'

const SENT_KEY  = 'atable_feedback_sent'
const VOTED_KEY = 'atable_feedback_voted'
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000

const STATUS_ORDER = ['idea', 'planned', 'in_progress', 'shipped']

function normalize(message) {
  return message.trim().toLowerCase()
}

function getSentLog() {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) || '[]')
  } catch {
    return []
  }
}

function isDuplicate(message) {
  const norm = normalize(message)
  const now = Date.now()
  return getSentLog().some(e => e.message === norm && now - e.at < DUPLICATE_WINDOW_MS)
}

function rememberSent(message) {
  const log = getSentLog()
  log.push({ message: normalize(message), at: Date.now() })
  localStorage.setItem(SENT_KEY, JSON.stringify(log.slice(-20)))
}

/**
 * Submits a bug report or idea. Silently rejects near-duplicate messages
 * sent from this browser in the last 5 minutes instead of hitting Supabase.
 * @returns {{ error?: string }}
 */
export async function submitFeedback({ type, message, authorName }) {
  if (isDuplicate(message)) return { error: 'DUPLICATE' }

  const { error } = await supabase.from('feedback').insert({
    type,
    message:     message.trim(),
    author_name: authorName?.trim() || null,
  })
  if (error) return { error: error.message }

  rememberSent(message)
  return {}
}

function buildFeedback(row) {
  return {
    id:         row.id,
    type:       row.type,
    message:    row.message,
    authorName: row.author_name,
    status:     row.status,
    votes:      row.votes,
    createdAt:  new Date(row.created_at).getTime(),
  }
}

/** Returns all feedback, grouped by status (idea → planned → in_progress → shipped), votes descending within each group */
export async function listFeedback() {
  const { data } = await supabase.from('feedback').select('*')
  if (!data) return []

  return data.map(buildFeedback).sort((a, b) => {
    const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    return statusDiff !== 0 ? statusDiff : b.votes - a.votes
  })
}

function getVotedIds() {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) || '[]')
  } catch {
    return []
  }
}

/** Whether this browser has already voted for a given feedback entry */
export function hasVoted(id) {
  return getVotedIds().includes(id)
}

/**
 * Increments a feedback entry's vote count by 1. Prevents a basic double-vote
 * from the same browser via localStorage.
 * @returns {{ error?: string }}
 */
export async function voteFeedback(id) {
  if (hasVoted(id)) return { error: 'ALREADY_VOTED' }

  const { data } = await supabase.from('feedback').select('votes').eq('id', id).maybeSingle()
  if (!data) return { error: 'NOT_FOUND' }

  const { error } = await supabase.from('feedback').update({ votes: data.votes + 1 }).eq('id', id)
  if (error) return { error: error.message }

  const voted = getVotedIds()
  voted.push(id)
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted))
  return {}
}

/** Updates a feedback entry's status — called manually from a Claude Code session after a deploy, no dedicated UI */
export async function updateFeedbackStatus(id, status) {
  const { error } = await supabase.from('feedback').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}
