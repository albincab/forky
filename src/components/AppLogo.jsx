// Affiche-style app logo lockup — bistro newspaper header
export default function AppLogo() {
  return (
    <div style={{
      border: '1.5px solid var(--ink)',
      background: 'var(--ink)',
      color: 'var(--bg)',
      padding: '18px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: '5px 5px 0 var(--red)',
    }}>
      {/* Fork mark + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="46" height="58" viewBox="0 0 46 58" fill="none" aria-hidden="true">
          <rect x="10" y="0"  width="5" height="20" fill="#FFC844" />
          <rect x="20" y="0"  width="5" height="20" fill="#FFC844" />
          <rect x="30" y="0"  width="5" height="20" fill="#FFC844" />
          <rect x="6"  y="18" width="33" height="8"  fill="#FFC844" />
          <rect x="19" y="22" width="7"  height="36" fill="#FFC844" />
        </svg>
        <div className="display" style={{ fontSize: 54, color: 'var(--bg)', flex: 1 }}>
          <span style={{ lineHeight: '1.5' }}>À</span>
          <span>Table!</span>
        </div>
      </div>

      {/* Footer tagline */}
      <div style={{
        borderTop: '1px dashed rgba(238,234,217,0.4)',
        paddingTop: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#C9C2A8',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>le journal du midi</span>
        <span>n°042</span>
      </div>
    </div>
  )
}
