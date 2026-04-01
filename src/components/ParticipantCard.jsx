// Displays a single participant with avatar, meal mode, tags

/** Deterministic avatar background color from name */
function nameToColor(name) {
  const palette = ['#D4820A', '#8B5E3C', '#C0612B', '#A0522D', '#6B4226', '#9B6B3A']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

const MEAL_ICONS = { out: '🍽️', homemade: '🥡', takeout: '📦' }

export default function ParticipantCard({ participant, t }) {
  const { name, isOrganizer, mealMode, cuisines, budget, allergies, prefsComplete } = participant
  const initials = name.slice(0, 2).toUpperCase()

  const modeLabel = {
    out:      t.mealOut,
    homemade: t.mealHomemade,
    takeout:  t.mealTakeout,
  }[mealMode] || '…'

  const modeTagClass = { out: 'tag-out', homemade: 'tag-homemade', takeout: 'tag-takeout' }[mealMode] || 'tag-homemade'

  return (
    <div className="participant-card">
      <div className="avatar" style={{ background: nameToColor(name) }} aria-hidden="true">
        {initials}
      </div>

      <div className="participant-info">
        <div className="participant-name">
          {name}
          {isOrganizer && <span className="tag tag-organizer">👑</span>}
        </div>

        <div className="participant-tags">
          {mealMode && (
            <span className={`tag ${modeTagClass}`} aria-label={modeLabel}>
              {MEAL_ICONS[mealMode]} {modeLabel}
            </span>
          )}

          {!prefsComplete && !mealMode && (
            <span className="tag tag-homemade">⏳ …</span>
          )}

          {/* Cuisine tags (max 3 visible) */}
          {cuisines?.slice(0, 3).map(c => (
            <span key={c} className="tag tag-cuisine">{c}</span>
          ))}
          {cuisines?.length > 3 && (
            <span className="tag tag-cuisine">+{cuisines.length - 3}</span>
          )}

          {/* Budget */}
          {budget && mealMode !== 'homemade' && (
            <span className="tag tag-cuisine">{t.budgetOptions[budget]}</span>
          )}

          {/* Allergy tags (max 2 visible) */}
          {allergies?.slice(0, 2).map(a => (
            <span key={a} className="tag tag-allergy">{a}</span>
          ))}
          {allergies?.length > 2 && (
            <span className="tag tag-allergy">+{allergies.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  )
}
