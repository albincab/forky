import { useState, useEffect, useRef } from 'react'
import { updateParticipantPrefs, getSession } from '../services/sessionService.js'

// Compute current step index 1-5 for progress bar
function computeStep(mealMode, moreThanOneHour, backBy14h, cuisines, budget, allergies) {
  if (!mealMode) return 0
  if (mealMode === 'inplace' || mealMode === 'outside') return 5 // all done — excluded from search
  if (!moreThanOneHour && !backBy14h) return 1
  if (cuisines.length === 0) return 2
  if (!budget) return 3
  if (allergies.length === 0) return 4
  return 5
}

export default function PreferencesScreen({ t, sessionCode, userId, onBack, onDone }) {
  const [mealMode,        setMealMode]        = useState(null)
  const [cuisines,        setCuisines]        = useState([])
  const [budget,          setBudget]          = useState(null)
  const [allergies,       setAllergies]       = useState([])
  const [moreThanOneHour, setMoreThanOneHour] = useState(true)
  const [backBy14h,       setBackBy14h]       = useState(false)
  const [error,           setError]           = useState('')
  const [saving,          setSaving]          = useState(false)
  const [loadingPrefs,    setLoadingPrefs]    = useState(true)

  const nextSectionRef = useRef(null)
  const prevMealMode   = useRef(null)

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
        setMoreThanOneHour(participant.moreThanOneHour || false)
        setBackBy14h(participant.backBy14h || false)
      }
      setLoadingPrefs(false)
    }
    loadExisting()
  }, [sessionCode, userId])

  // Auto-scroll when mode first selected
  useEffect(() => {
    if (mealMode && !prevMealMode.current) {
      setTimeout(() => nextSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
    prevMealMode.current = mealMode
  }, [mealMode])

  const isExcluded = mealMode === 'inplace' || mealMode === 'outside'

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
          cuisines:        isExcluded ? [] : cuisines,
          budget:          isExcluded ? null : budget,
          allergies:       isExcluded ? [] : allergies,
          moreThanOneHour: isExcluded ? false : moreThanOneHour,
          backBy14h:       isExcluded ? false : backBy14h,
        },
      })
      onDone()
    } catch {
      setError(t.prefsError)
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

  const currentStep = computeStep(mealMode, moreThanOneHour, backBy14h, cuisines, budget, allergies)

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <button onClick={onBack} aria-label={t.back} type="button">← RETOUR</button>
        <span>★ PRÉFÉRENCES</span>
        <span></span>
      </div>

      {/* Progress bar segmentée */}
      <div className="progress-bar" aria-label="Progression">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`progress-bar-seg ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming'}`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Mode de repas ──────────────────────────────────────────── */}
        <div className="flex-col" style={{ gap: 10 }}>
          <h2>{t.step1Label}</h2>
          {[
            { key: 'out',     icon: '🍽️', label: t.mealOut,     desc: t.mealOutDesc,     secondary: false },
            { key: 'inplace', icon: '🏠', label: t.mealInPlace,  desc: t.mealInPlaceDesc, secondary: true  },
            { key: 'outside', icon: '🚶', label: t.mealOutside,  desc: t.mealOutsideDesc, secondary: true  },
          ].map(o => (
            <button
              key={o.key}
              type="button"
              className={`meal-option ${o.secondary ? 'meal-option--secondary' : ''} ${mealMode === o.key ? 'selected' : ''}`}
              onClick={() => { setMealMode(o.key); setError('') }}
              aria-pressed={mealMode === o.key}
            >
              <span className="meal-icon" aria-hidden="true">{o.icon}</span>
              <span className="meal-info">
                <span className="meal-title">{o.label}</span>
                <span className="meal-desc">{o.desc}</span>
              </span>
              {mealMode === o.key && (
                <span aria-hidden="true" style={{
                  fontFamily: "'Boldonse', serif",
                  fontSize: 20,
                  color: 'var(--yellow)',
                }}>✓</span>
              )}
            </button>
          ))}
          {error && <span className="error-msg" role="alert">⚠ {error}</span>}
        </div>

        {/* ── Sections visibles uniquement si "Je sors manger" ─────── */}
        {!isExcluded && mealMode && (
          <>
            {/* Temps de pause */}
            <div className="flex-col" style={{ gap: 10 }} ref={nextSectionRef}>
              <h2>{t.lunchDurationLabel}</h2>
              <div className="flex-col" style={{ gap: 8 }}>
                {[
                  { state: moreThanOneHour, set: setMoreThanOneHour, icon: '🕐', label: t.moreThanOneHour },
                  { state: backBy14h,       set: setBackBy14h,       icon: '⏰', label: t.backBy14h },
                ].map(({ state, set, icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className={`pref-toggle ${state ? 'active' : ''}`}
                    onClick={() => set(v => !v)}
                    aria-pressed={state}
                  >
                    <span className="pref-toggle-icon" aria-hidden="true">{icon}</span>
                    <span className="pref-toggle-label">{label}</span>
                    <span className="pref-toggle-check" aria-hidden="true">✓</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisines */}
            <div className="flex-col pref-section--reveal" style={{ gap: 10 }}>
              <h2>{t.cuisineTitle}</h2>
              <p style={{ marginTop: -6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                {t.cuisineSubtitle}
              </p>
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
                    {cuisines.includes(c) && (
                      <span aria-hidden="true" style={{ fontFamily: "'Boldonse', serif", fontSize: 12, marginLeft: 2 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              {cuisines.length > 0 && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--mute)', textAlign: 'right' }}>
                  {cuisines.length} sélectionnée{cuisines.length > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="flex-col pref-section--reveal" style={{ gap: 10 }}>
              <h2>{t.budgetTitle}</h2>
              <div className="budget-row" role="group" aria-label={t.budgetTitle}>
                {Object.entries(t.budgetOptions).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`budget-pill ${budget === key ? 'selected' : ''}`}
                    onClick={() => setBudget(budget === key ? null : key)}
                    aria-pressed={budget === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="flex-col pref-section--reveal" style={{ gap: 10 }}>
              <h2>{t.allergyTitle}</h2>
              <div className="chip-grid" role="group" aria-label={t.allergyTitle}>
                {t.allergies.map(a => (
                  <button
                    key={a}
                    type="button"
                    className={`chip ${allergies.includes(a) ? 'selected-allergy' : ''}`}
                    onClick={() => toggleChip(allergies, setAllergies, a)}
                    aria-pressed={allergies.includes(a)}
                  >
                    <span aria-hidden="true">{t.allergyEmojis[a]}</span> {a}
                    {allergies.includes(a) && (
                      <span aria-hidden="true" style={{ fontFamily: "'Boldonse', serif", fontSize: 12, marginLeft: 2 }}>⚠</span>
                    )}
                  </button>
                ))}
              </div>
              {allergies.length === 0 && (
                <span className="pref-no-allergy">✓ {t.noAllergy}</span>
              )}
              {allergies.length > 0 && (
                <div style={{
                  border: '1.5px solid var(--ink)',
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  padding: '10px 14px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{allergies.length} contrainte{allergies.length > 1 ? 's' : ''} active{allergies.length > 1 ? 's' : ''}</span>
                  <span style={{ background: 'var(--yellow)', color: 'var(--ink)', padding: '2px 8px', fontWeight: 700 }}>
                    ★ OK
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Submit */}
        <button type="submit" className="btn btn-red" disabled={saving || !mealMode}>
          {saving ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> …</>
          ) : (
            <>
              <span>✅ {t.finish}</span>
              <span style={{ fontFamily: "'Boldonse', serif", fontSize: 22 }}>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
