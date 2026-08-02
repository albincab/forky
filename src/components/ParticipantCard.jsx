// Affiche-style participant card — pcard grid pattern

const MEAL_ICONS = { out: '🍽️', inplace: '🏠', outside: '🚶', takeout: '📦' }

export default function ParticipantCard({ participant, t }) {
  const { name, isOrganizer, mealMode, cuisines, budget, allergies, moreThanOneHour, backBy14h, prefsComplete } = participant
  const initial = name.slice(0, 1).toUpperCase()

  const modeLabel = {
    out:     t.mealOut,
    inplace: t.mealInPlace,
    outside: t.mealOutside,
    takeout: t.mealTakeout,
  }[mealMode] || '…'

  const modeTagClass = {
    out:     'tag-out',
    inplace: 'tag-homemade',
    outside: 'tag-homemade',
    takeout: 'tag-takeout',
  }[mealMode] || 'tag-homemade'

  return (
    <div className="pcard">
      {/* Avatar */}
      <div className="avatar" aria-hidden="true">{initial}</div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div className="pname">
          {name}
          {isOrganizer && <span className="tag tag-organizer">★ Orga</span>}
        </div>
        <div className="ptags">
          {/* Meal mode */}
          {mealMode && (
            <span className={`tag ${modeTagClass}`} aria-label={modeLabel}>
              {MEAL_ICONS[mealMode]} {modeLabel}
            </span>
          )}
          {!prefsComplete && !mealMode && (
            <span className="tag tag-homemade">⏳ …</span>
          )}

          {/* Cuisines (max 3) */}
          {cuisines?.slice(0, 3).map(c => (
            <span key={c} className="tag tag-cuisine">{c}</span>
          ))}
          {cuisines?.length > 3 && (
            <span className="tag tag-cuisine">+{cuisines.length - 3}</span>
          )}

          {/* Budget */}
          {budget && mealMode !== 'inplace' && mealMode !== 'outside' && (
            <span className="tag tag-cuisine">{t.budgetOptions[budget]}</span>
          )}

          {/* Lunch duration constraints — moreThanOneHour defaults to true now, so only
              the exceptions (explicitly less than 1h, or must be back by 14h) are shown */}
          {mealMode === 'out' && prefsComplete && moreThanOneHour === false && (
            <span className="tag tag-allergy">⏱️ {t.lessThanOneHour}</span>
          )}
          {backBy14h && (
            <span className="tag tag-allergy">⏰ {t.backBy14h}</span>
          )}

          {/* Allergies (max 2) */}
          {allergies?.slice(0, 2).map(a => (
            <span key={a} className="tag tag-allergy">⚠ {a}</span>
          ))}
          {allergies?.length > 2 && (
            <span className="tag tag-allergy">+{allergies.length - 2}</span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className={`pstatus ${prefsComplete ? '' : 'wait'}`} aria-label={prefsComplete ? 'Prêt' : 'En attente'}>
        {prefsComplete ? '✓' : '…'}
      </div>
    </div>
  )
}
