import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeModal({ url, t, onClose }) {
  // The QR itself carries the full URL (incl. ?pwd=) — no need to expose the
  // password in plain text on screen too.
  const displayUrl = url.replace(/([?&])pwd=[^&]*&?/, '$1').replace(/[?&]$/, '')

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.qrTitle}
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{t.qrTitle}</h2>

        <QRCodeSVG
          value={url}
          size={220}
          bgColor="var(--cream)"
          fgColor="var(--brown)"
          level="M"
          aria-label={`QR code pour rejoindre la table : ${url}`}
        />

        <p
          className="text-center text-muted"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            width: '100%',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
            margin: 0,
          }}
        >
          {displayUrl}
        </p>

        <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ width: 'auto' }}>
          ✕ Fermer
        </button>
      </div>
    </div>
  )
}
