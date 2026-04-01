import { useState, useEffect } from 'react'
import { updateParticipantPrefs, getSession } from '../services/sessionService.js'

// ─── Step 1: Meal mode ────────────────────────────────────────────────────────
function StepMealMode({ t, value, onChange }) {
  const options = [
    { key: 'out',      icon: '🍽️', label: t.mealOut,      desc: t.mealOutDesc },
    { key: 'homemade', icon: '🥡', label: t.mealHomemade,  desc: t.mealHomemadeDesc },
    { key: 'takeout',  icon: '📦', label: t.mealTakeout,   desc: t.mealTakeoutDesc },
  ]

  return (
    <div className="flex-col" style={{ gap: 12 }}>
      <h2>{t.step1Label}</h2>
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          className={`meal-option ${value === o.key ? 'selected' : ''}`}
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
        >
          <span className="meal-icon" aria-hidden="true">{o.icon}</span>
          <span className="meal-info">
            <span className="meal-title">{o.label}</span>
            <span className="meal-desc">{o.desc}</span>
          </span>
          {value === o.key && <span aria-hidden="true">✓</span>}
        </button>
      ))}
    </div>
  )
}

// ─── Step 2: Cuisines ─────────────────────────────────────────────────────────
function StepCuisines({ t, value, onChange, mealMode }) {
  if (mealMode === 'homemade') {
    return (
      <div className="waiting-banner">
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥡</div>
        <h2>{t.mealHomemade}</h2>
        <p style={{ marginTop: 8 }}>{t.homemadeSkipMsg}</p>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div>
        <h2>{t.cuisineTitle}</h2>
        <p style={{ marginTop: 4 }}>{t.cuisineSubtitle}</p>
      </div>
      <div className="chip-grid" role="group" aria-label={t.cuisineTitle}>
        {t.cuisines.map(c => (
          <button
            key={c}
            type="button"
            className={`chip ${value.includes(c) ? 'selected' : ''}`}
            onClick={() => onChange(value.includes(c) ? value.filter(x => x !== c) : [...value, c])}
            aria-pressed={value.includes(c)}
          >
            <span aria-hidden="true">{t.cuisineEmojis[c]}</span> {c}
          </button>
        ))}
      </div>
      {value.length === 0 && (
        <p className="text-center text-muted" style={{ fontSize: '0.82rem' }}>
          {t.noCuisineSelected}
        </p>
      )}
    </div>
  )
}

// ─── Step 3: Budget ───────────────────────────────────────────────────────────
function StepBudget({ t, value, onChange, mealMode }) {
  if (mealMode === 'homemade') {
    return (
      <div className="waiting-banner">
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥡</div>
        <h2>{t.mealHomemade}</h2>
        <p style={{ marginTop: 8 }}>{t.homemadeSkipMsg}</p>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div>
        <h2>{t.budgetTitle}</h2>
        <p style={{ marginTop: 4 }}>{t.budgetSubtitle}</p>
      </div>
      <div className="budget-grid" role="group" aria-label={t.budgetTitle}>
        {Object.entries(t.budgetOptions).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`budget-option ${value === key ? 'selected' : ''}`}
            onClick={() => onChange(key)}
            aria-pressed={value === key}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 4: Allergies ────────────────────────────────────────────────────────
function StepAllergies({ t, value, onChange }) {
  return (
    <div className="flex-col">
      <div>
        <h2>{t.allergyTitle}</h2>
        <p style={{ marginTop: 4 }}>{t.allergySubtitle}</p>
      </div>
      <div className="chip-grid" role="group" aria-label={t.allergyTitle}>
        {t.allergies.map(a => (
          <button
            key={a}
            type="button"
            className={`chip ${value.includes(a) ? 'selected' : ''}`}
            onClick={() => onChange(value.includes(a) ? value.filter(x => x !== a) : [...value, a])}
            aria-pressed={value.includes(a)}
          >
            <span aria-hidden="true">{t.allergyEmojis[a]}</span> {a}
          </button>
        ))}
      </div>
      {value.length === 0 && (
        <p className="text-center text-muted" style={{ fontSize: '0.82rem' }}>
          {t.noAllergy}
        </p>
      )}
    </div>
  )
}

// ─── Stepper progress bar ─────────────────────────────────────────────────────
function StepperProgress({ totalSteps, currentIdx }) {
  return (
    <div
      className="stepper-bars"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentIdx + 1}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`stepper-bar ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}

const ALL_STEPS = ['meal', 'cuisines', 'budget', 'allergies']

// ─── Main PreferencesScreen ───────────────────────────────────────────────────
export default function PreferencesScreen({ t, sessionCode, userId, onBack, onDone }) {
  const [stepIdx,    setStepIdx]    = useState(0)
  const [mealMode,   setMealMode]   = useState(null)
  const [cuisines,   setCuisines]   = useState([])
  const [budget,     setBudget]     = useState(null)
  const [allergies,  setAllergies]  = useState([])
  const [error,      setError]      = useState('')
  const [saving,     setSaving]     = useState(false)
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

  const isHomemade  = mealMode === 'homemade'
  const isLastStep  = stepIdx === ALL_STEPS.length - 1

  // Homemade skips cuisines (1) and budget (2) directly
  function getNextIdx(current) {
    if (isHomemade && current === 0) return 3
    return current + 1
  }
  function getPrevIdx(current) {
    if (isHomemade && current === 3) return 0
    return current - 1
  }

  async function handleNext() {
    if (stepIdx === 0 && !mealMode) { setError(t.mealModeRequired); return }
    setError('')

    if (isLastStep) {
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
    } else {
      setStepIdx(getNextIdx(stepIdx))
    }
  }

  function handleBack() {
    setError('')
    if (stepIdx === 0) {
      // Step 1 : quitter les préférences → retour accueil
      onBack()
      return
    }
    setStepIdx(getPrevIdx(stepIdx))
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
      <div className="stepper-header" style={{ gap: 12 }}>
        <button
          className="stepper-back"
          onClick={handleBack}
          aria-label={t.back}
          type="button"
        >
          ←
        </button>
        <StepperProgress totalSteps={ALL_STEPS.length} currentIdx={stepIdx} />
      </div>

      <p className="stepper-label">
        {[t.step1Label, t.step2Label, t.step3Label, t.step4Label][stepIdx]}
        {' '}({stepIdx + 1} / {ALL_STEPS.length})
      </p>

      {stepIdx === 0 && (
        <StepMealMode t={t} value={mealMode} onChange={v => { setMealMode(v); setError('') }} />
      )}
      {stepIdx === 1 && (
        <StepCuisines t={t} value={cuisines} onChange={setCuisines} mealMode={mealMode} />
      )}
      {stepIdx === 2 && (
        <StepBudget t={t} value={budget} onChange={setBudget} mealMode={mealMode} />
      )}
      {stepIdx === 3 && (
        <StepAllergies t={t} value={allergies} onChange={setAllergies} />
      )}

      {error && <span className="error-msg" role="alert">⚠ {error}</span>}

      <div className="mt-auto">
        <button className="btn btn-primary" onClick={handleNext} disabled={saving}>
          {saving
            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> …</>
            : isLastStep ? `✅ ${t.finish}` : `${t.next} →`
          }
        </button>
      </div>
    </div>
  )
}
