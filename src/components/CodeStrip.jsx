// Affiche-style 4-cell code display
export default function CodeStrip({ code = '' }) {
  const cells = Array.from({ length: 4 }, (_, i) => code[i] || '')
  const firstEmpty = cells.findIndex(c => !c)

  return (
    <div className="code-strip">
      {cells.map((c, i) => (
        <span
          key={i}
          data-i={`0${i + 1}`}
          className={!c && i === firstEmpty ? 'active' : ''}
        >
          {c || '·'}
        </span>
      ))}
    </div>
  )
}
