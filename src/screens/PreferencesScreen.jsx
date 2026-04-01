import { useState } from 'react'
import { updateParticipantPrefs } from '../services/sessionService.js'

// ─── Step 1: Meal mode ────────────────────────────────────────────────────────
function StepMealMode({ t, value, onChange }) {
  const options = [
    { key: 'out',      icon: '🍽️', label: t.mealOut,      desc: t.mealOutDesc },
    { key: 'homemade', icon: '🥡', label: t.mealHomemade,  desc: t.mealHomemadeDesc },
    { key: 'takeout',  icon: '📦', label: t.mealTakeout,   desc: t.mealTakeoutDesc },
  ]

  return (
    <div className="flex-col" style={{ gap: 12 }}>
      <div>
        <h2>{t.step1Label}</h2>
      </div>
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
      <div className="waiting-banner" style={{ marginTop: 8 }}>
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
      <div className="waiting-banner" style={{ marginTop: 8 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥡</div>
        <h2>{t.mealHomemade}</h2>
        <p style={{ marginTop: 8 }}>{t.homemadeSkipMsg}</p>
      </div>
    )
  }

  const budgets = Object.entries(t.budgetOptions)

  return (
    <div className="flex-col">
      <div>
        <h2>{t.budgetTitle}</h2>
        <p style={{ marginTop: 4 }}>{t.budgetSubtitle}</p>
      </div>
      <div className="budget-grid" role="group" aria-label={t.budgetTitle}>
        {budgets.map(([key, label]) => (
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
function StepperProgress({ steps, currentIdx }) {
  return (
    <div className="stepper-bars" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={currentIdx + 1}>
      {steps.map((_, i) => (
        <div
          key={i}
          className={`stepper-bar ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}

// ─── Main PreferencesScreen ───────────────────────────────────────────────────
export default function PreferencesScreen({ t, sessionCode, userId, onDone }) {
  const [stepIdx, setStepIdx]     = useState(0)
  const [mealMode, setMealMode]   = useState(null)
  const [cuisines, setCuisines]   = useState([])
  const [budget, setBudget]       = useState(null)
  const [allergies, setAllergies] = useState([])
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)

  // Dynamic steps: skip cuisine & budget for "homemade"
  // Each step: { key, label }
  const ALL_STEPS = [
    { key: 'meal',     label: t.step1Label },
    { key: 'cuisines', label: t.step2Label },
    { key: 'budget',   label: t.step3Label },
    { key: 'allergies',label: t.step4Label },
  ]

  // For homemade, steps 2 and 3 are still shown but with a skip message
  // Navigation: homemade skips directly from step 1 → step 4
  const isHomemade = mealMode === 'homemade'

  function getNextIdx(current) {
    if (isHomemade && current === 0) return 3 // Jump to allergies
    return current + 1
  }

  function getPrevIdx(current) {
    if (isHomemade && current === 3) return 0 // Jump back to meal mode
    return current - 1
  }

  const isLastStep = stepIdx === ALL_STEPS.length - 1

  function handleNext() {
    if (stepIdx === 0 && !mealMode) {
      setError(t.mealModeRequired)
      return
    }
    setError('')
    if (isLastStep) {
      handleSubmit()
    } else {
      setStepIdx(getNextIdx(stepIdx))
    }
  }

  function handleBack() {
    if (stepIdx === 0) return
    setError('')
    setStepIdx(getPrevIdx(stepIdx))
  }

  async function handleSubmit() {
    setSaving(true)
    const prefs = {
      mealMode,
      cuisines:  mealMode === 'homemade' ? [] : cuisines,
      budget:    mealMode === 'homemade' ? null : budget,
      allergies,
    }
    updateParticipantPrefs({ code: sessionCode, participantId: userId, prefs })
    setSaving(false)
    onDone()
  }

  // Visual step dots always show all 4 (greyed for skipped in homemade)
  // Active index: map logical stepIdx to visual
  const visualActiveIdx = stepIdx

  return (
    <div className="screen">
      {/* Stepper header */}
      <div className="stepper-header" style={{ gap: 12 }}>
        {stepIdx > 0 && (
          <button
            className="stepper-back"
            onClick={handleBack}
            aria-label={t.back}
            type="button"
          >
            ←
          </button>
        )}
        <StepperProgress steps={ALL_STEPS} currentIdx={visualActiveIdx} />
      </div>

      <p className="stepper-label">
        {ALL_STEPS[stepIdx].label} ({stepIdx + 1} / {ALL_STEPS.length})
      </p>

      {/* Step content */}
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

      {/* Navigation */}
      <div className="mt-auto">
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={saving}
        >
          {saving ? '…' : isLastStep ? `✅ ${t.finish}` : `${t.next} →`}
        </button>
      </div>
    </div>
  )
}
