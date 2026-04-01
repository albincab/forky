import { useState, useEffect } from 'react'
import { updateParticipantPrefs, getSession } from '../services/sessionService.js'

export default function PreferencesScreen({ t, sessionCode, userId, onBack, onDone }) {
  const [mealMode,     setMealMode]     = useState(null)
  const [cuisines,     setCuisines]     = useState([])
  const [budget,       setBudget]       = useState(null)
  const [allergies,    setAllergies]    = useState([])
  const [error,        setError]        = useState('')
  const [saving,       setSaving]       = useState(false)
  const [loadingPrefs, setLoadingPrefs] = useState(true)

  // Pre-load existing preferences (edit mode)
  useEffect(() => {
    async function loadExisting() {
      const session = await getSession(sessionCode)
      const participant = session?.participants.find(p => p.id === userId)
      if (participant?.prefsComplete) {
        setMealMode(participant.mealMode)
        setCuisines(participant.cuisines || [])
        setBudget(participant.budget)
        setAllergies(participant.allergies || [])
      }
      setLoadingPrefs(false)
    }
    loadExisting()
  }, [sessionCode, userId])

  const isHomemade = mealMode === 'homemade'

  function toggleChip(list, setList, value) {
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!mealMode) { setError(t.mealModeRequired); return }
    setError('')
    setSaving(true)
    try {
      await updateParticipantPrefs({
        code: sessionCode,
        participantId: userId,
        prefs: {
          mealMode,
          cuisines:  isHomemade ? [] : cuisines,
          budget:    isHomemade ? null : budget,
          allergies,
        },
      })
      onDone()
    } catch {
      setError(t.claudeError)
    } finally {
      setSaving(false)
    }
  }

  if (loadingPrefs) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="flex-row">
        <button className="btn-ghost" onClick={onBack} aria-label={t.back} type="button">
          ← {t.back}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── 1. Meal mode ─────────────────────────────────────────────────── */}
        <div className="flex-col" style={{ gap: 10 }}>
          <h2>{t.step1Label}</h2>
          {[
            { key: 'out',      icon: '🍽️', label: t.mealOut,      desc: t.mealOutDesc },
            { key: 'homemade', icon: '🥡', label: t.mealHomemade,  desc: t.mealHomemadeDesc },
            { key: 'takeout',  icon: '📦', label: t.mealTakeout,   desc: t.mealTakeoutDesc },
          ].map(o => (
            <button
              key={o.key}
              type="button"
              className={`meal-option ${mealMode === o.key ? 'selected' : ''}`}
              onClick={() => { setMealMode(o.key); setError('') }}
              aria-pressed={mealMode === o.key}
            >
              <span className="meal-icon" aria-hidden="true">{o.icon}</span>
              <span className="meal-info">
                <span className="meal-title">{o.label}</span>
                <span className="meal-desc">{o.desc}</span>
              </span>
              {mealMode === o.key && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>

        {/* ── 2. Cuisines (hidden if homemade) ─────────────────────────────── */}
        {!isHomemade && mealMode && (
          <div className="flex-col" style={{ gap: 10 }}>
            <h2>{t.cuisineTitle}</h2>
            <p style={{ marginTop: -4 }}>{t.cuisineSubtitle}</p>
            <div className="chip-grid" role="group" aria-label={t.cuisineTitle}>
              {t.cuisines.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${cuisines.includes(c) ? 'selected' : ''}`}
                  onClick={() => toggleChip(cuisines, setCuisines, c)}
                  aria-pressed={cuisines.includes(c)}
                >
                  <span aria-hidden="true">{t.cuisineEmojis[c]}</span> {c}
                </button>
              ))}
            </div>
            {cuisines.length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.82rem' }}>{t.noCuisineSelected}</p>
            )}
          </div>
        )}

        {/* ── 3. Budget (hidden if homemade) ───────────────────────────────── */}
        {!isHomemade && mealMode && (
          <div className="flex-col" style={{ gap: 10 }}>
            <h2>{t.budgetTitle}</h2>
            <div className="budget-grid" role="group" aria-label={t.budgetTitle}>
              {Object.entries(t.budgetOptions).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`budget-option ${budget === key ? 'selected' : ''}`}
                  onClick={() => setBudget(key)}
                  aria-pressed={budget === key}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Allergies (always shown) ───────────────────────────────────── */}
        {mealMode && (
          <div className="flex-col" style={{ gap: 10 }}>
            <h2>{t.allergyTitle}</h2>
            <div className="chip-grid" role="group" aria-label={t.allergyTitle}>
              {t.allergies.map(a => (
                <button
                  key={a}
                  type="button"
                  className={`chip ${allergies.includes(a) ? 'selected' : ''}`}
                  onClick={() => toggleChip(allergies, setAllergies, a)}
                  aria-pressed={allergies.includes(a)}
                >
                  <span aria-hidden="true">{t.allergyEmojis[a]}</span> {a}
                </button>
              ))}
            </div>
            {allergies.length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.82rem' }}>{t.noAllergy}</p>
            )}
          </div>
        )}

        {error && <span className="error-msg" role="alert">⚠ {error}</span>}

        <button type="submit" className="btn btn-primary" disabled={saving || !mealMode}>
          {saving
            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> …</>
            : `✅ ${t.finish}`
          }
        </button>
      </form>
    </div>
  )
}
