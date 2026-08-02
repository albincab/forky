import { useState, useEffect } from 'react'
import { submitFeedback, listFeedback, voteFeedback, hasVoted } from '../services/feedbackService.js'

const STATUS_LABEL_KEY = {
  idea:        'feedbackStatusIdea',
  planned:     'feedbackStatusPlanned',
  in_progress: 'feedbackStatusInProgress',
  shipped:     'feedbackStatusShipped',
}

export default function FeedbackScreen({ t, onBack }) {
  const [type,        setType]        = useState('bug')
  const [message,     setMessage]     = useState('')
  const [authorName,  setAuthorName]  = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [votedIds,    setVotedIds]    = useState([])

  async function load() {
    const data = await listFeedback()
    setItems(data)
    setVotedIds(data.filter(f => hasVoted(f.id)).map(f => f.id))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    setConfirmation('')
    const result = await submitFeedback({ type, message, authorName })
    setSubmitting(false)
    if (result.error === 'DUPLICATE') {
      setConfirmation(t.feedbackDuplicate)
    } else if (result.error) {
      setConfirmation(t.feedbackError)
    } else {
      setConfirmation(t.feedbackThanks)
      setMessage('')
      setAuthorName('')
      load()
    }
  }

  async function handleVote(id) {
    setVotedIds(v => [...v, id])
    const result = await voteFeedback(id)
    if (result.error) setVotedIds(v => v.filter(x => x !== id))
    else load()
  }

  let lastStatus = null

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <button onClick={onBack} aria-label={t.back} type="button">← RETOUR</button>
        <span>★ {t.feedbackTitle.toUpperCase()}</span>
        <span></span>
      </div>

      <div>
        <div className="eyebrow">— vos retours comptent —</div>
        <h1 className="display" style={{ fontSize: 30, marginTop: 6 }}>{t.feedbackTitle}</h1>
        <p style={{ marginTop: 10 }}>{t.feedbackIntro}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-col" style={{ gap: 10 }}>
        <div className="btn-icon-row">
          <button
            type="button"
            className={`iconbtn ${type === 'bug' ? 'selected' : ''}`}
            onClick={() => setType('bug')}
            aria-pressed={type === 'bug'}
          >
            {t.feedbackTypeBug}
          </button>
          <button
            type="button"
            className={`iconbtn ${type === 'idea' ? 'selected' : ''}`}
            onClick={() => setType('idea')}
            aria-pressed={type === 'idea'}
          >
            {t.feedbackTypeIdea}
          </button>
        </div>

        <textarea
          className="input"
          rows={3}
          placeholder={type === 'bug' ? t.feedbackBugPlaceholder : t.feedbackIdeaPlaceholder}
          value={message}
          onChange={e => { setMessage(e.target.value); setConfirmation('') }}
          maxLength={500}
          aria-label={type === 'bug' ? t.feedbackTypeBug : t.feedbackTypeIdea}
        />

        <input
          className="input"
          type="text"
          placeholder={t.feedbackNamePlaceholder}
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          maxLength={30}
          aria-label={t.feedbackNamePlaceholder}
        />

        <button type="submit" className="btn btn-primary" disabled={submitting || !message.trim()}>
          {submitting ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {t.feedbackSending}</>
          ) : (
            <span>📤 {t.feedbackSend}</span>
          )}
        </button>

        {confirmation && <p className="eyebrow" role="status">{confirmation}</p>}
      </form>

      <hr className="rule-thick" />

      {/* List */}
      <div className="flex-col" style={{ gap: 10 }}>
        <h2>{t.feedbackListTitle}</h2>
        {items.length > 0 && (
          <p className="eyebrow" style={{ marginTop: -6 }}>{t.feedbackVoteHint}</p>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <p className="eyebrow" style={{ textAlign: 'center', padding: '12px 0' }}>{t.feedbackEmpty}</p>
        ) : (
          <div className="flex-col" style={{ gap: 8 }}>
            {items.map(f => {
              const showHeader = f.status !== lastStatus
              lastStatus = f.status
              const voted = votedIds.includes(f.id)

              return (
                <div key={f.id}>
                  {showHeader && (
                    <div className="eyebrow" style={{ marginTop: 10, marginBottom: 6 }}>
                      {t[STATUS_LABEL_KEY[f.status]]}
                    </div>
                  )}
                  <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span
                      aria-hidden="true"
                      style={{ fontSize: 18, color: f.type === 'bug' ? 'var(--red)' : 'var(--honey)' }}
                    >
                      {f.type === 'bug' ? '🐛' : '💡'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: 'var(--ink)' }}>{f.message}</p>
                      {f.authorName && (
                        <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>— {f.authorName}</span>
                      )}
                    </div>
                    <button
                      className="iconbtn"
                      style={{ flex: 'none', width: 'auto', padding: '8px 10px' }}
                      onClick={() => handleVote(f.id)}
                      disabled={voted}
                      aria-label={voted ? t.feedbackVotedAria : t.feedbackVoteAria}
                    >
                      👍 {f.votes}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
